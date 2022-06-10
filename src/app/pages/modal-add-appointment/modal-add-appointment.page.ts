import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Network } from '@capacitor/network';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Appointment } from 'src/app/interfaces/Appointmen.interface';
import { Client } from 'src/app/interfaces/Client.interface';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ClientService } from 'src/app/services/client.service';
import { DbService } from 'src/app/services/db.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-modal-add-appointment',
  templateUrl: './modal-add-appointment.page.html',
  styleUrls: ['./modal-add-appointment.page.scss'],
})
export class ModalAddAppointmentPage implements OnInit {

  @Input() appointments: Appointment[];
  @Input() daySelected: string;

  dataForm: FormGroup;
  hours = [];
  clients = [];
  dateValue;
  client;
  status: boolean;


  constructor(private clientService: ClientService,
    private modalCtrl: ModalController,
    private appointmentService: AppointmentService,
    private translate: TranslateService,
    private db: DbService,
    private utilService: UtilsService) {
  }

  ngOnInit() {
    // Datos del formulario
    this.dataForm = new FormGroup({
      description: new FormControl('', Validators.required),
      client: new FormControl('', Validators.required),
      hour: new FormControl('', Validators.required),
    });

    // Carga las horas de ese dia
    this.loadHour();

    // Checkea conexión
    this.checkConexion();
  }

  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión y carga los clientes segun el estado de la conexión
  checkConexion() {
    Network.getStatus().then(status => {
      status.connected ? this.status = true : this.status = false;
      this.loadClients();
    });

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  // Carga los clientes de la base de datos
  loadClients() {
    this.clientService.getClients().subscribe(data => {
      if (this.status)
        this.clients = data
    });

    this.db.dbState().subscribe((res) => {
      if (res)
        this.db.fetchClients().subscribe(item => {
          if (!this.status)
            this.clients = item
        })
    });
  }

  // Método para añadir las citas a la base de datos local y firebase, añadiendo todos los datos correspondientes y mostrando toas
  addAppointment() {
    const client: Client = this.dataForm.get('client').value;
    const appointment = this.appointmentService.addAppointment({
      dniClient: client.dni,
      day: this.daySelected,
      hour: this.dataForm.get('hour').value,
      description: this.dataForm.get('description').value,
      name: client.name,
      surname: client.surname
    });
    this.db.addAppointment(this.daySelected,
      this.dataForm.get('hour').value,
      client.name,
      client.surname,
      this.dataForm.get('description').value,
      client.dni).then((res) => {
      });
    if (typeof (appointment) == 'object') {
      this.utilService.presentToast(this.translate.instant('appointments.confirmAddAppointment'));
      this.closeModal();
    } else {
      this.utilService.presentToast(this.translate.instant('appointments.errorAddAppointment'));
    }
  }

  // comprueba si la hora pasada se encuentra ya reservada
  checkHour(time: string) {
    return this.appointments.filter(data => data.hour == time);
  }

  // Cierra el modal devolviendo el dato de dateValue.
  closeModal() {
    this.modalCtrl.dismiss({
      dateValue: this.dateValue,
    });
  }

  // Devuelve el dia formateado  // Devuelve true si la hora del select es mayor que la actual para poder ser seleccionam em caso contrario la deshabilita
  checkInHour(time: string) {
    return moment(`${this.daySelected} ${time}`, "DD/MM/YYYY HH:mm").format('x') > moment().format('x');
  }

  /*
    Array que contiene las horas del dia, mediante el metodo que contiene disabled, 
    se chequea si estan disponibles o no, devolviendo tre o false
  */
  loadHour() {
    this.hours = [
      {
        hour: '10:00',
        disabled: this.checkHour('10:00').length == 0 && this.checkInHour('10:00') ? false : true
      },
      {
        hour: '11:00',
        disabled: this.checkHour('11:00').length == 0 && this.checkInHour('11:00') ? false : true
      },
      {
        hour: '12:00',
        disabled: this.checkHour('12:00').length == 0 && this.checkInHour('12:00') ? false : true
      },
      {
        hour: '13:00',
        disabled: this.checkHour('13:00').length == 0 && this.checkInHour('13:00') ? false : true
      },
      {
        hour: '17:00',
        disabled: this.checkHour('17:00').length == 0 && this.checkInHour('17:00') ? false : true
      },
      {
        hour: '18:00',
        disabled: this.checkHour('18:00').length == 0 && this.checkInHour('18:00') ? false : true
      },
      {
        hour: '19:00',
        disabled: this.checkHour('19:00').length == 0 && this.checkInHour('19:00') ? false : true
      },
      {
        hour: '20:00',
        disabled: this.checkHour('20:00').length == 0 && this.checkInHour('20:00') ? false : true
      }
    ]
  }

  // Da formato a la fecha, devolviendo el valor
  formatDate(date) {
    return moment(date).locale('es').format('L');
  }

}
