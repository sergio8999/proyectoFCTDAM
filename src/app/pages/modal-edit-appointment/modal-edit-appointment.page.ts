import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Network } from '@capacitor/network';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Appointment } from 'src/app/interfaces/Appointmen.interface';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ClientService } from 'src/app/services/client.service';
import { DbService } from 'src/app/services/db.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-modal-edit-appointment',
  templateUrl: './modal-edit-appointment.page.html',
  styleUrls: ['./modal-edit-appointment.page.scss'],
})
export class ModalEditAppointmentPage implements OnInit {

  // Información que trae desde el otro componente
  @Input() daySelected: string;
  @Input() appointment: Appointment;
  @Input() appointments;
  @Input() language;

  dataForm: FormGroup;
  hours = [];
  dateValue;
  client;
  minDate: string = new Date().toISOString();
  nextYear = new Date().setFullYear(new Date().getFullYear() + 1);
  maxDate: string = new Date(this.nextYear).toISOString();
  status: boolean;
  appointmentInput: Appointment;

  constructor(private modalCtrl: ModalController,
    private appointmentService: AppointmentService,
    private translate: TranslateService,
    private db: DbService,
    private utilService: UtilsService) { }

  ngOnInit() {
    // Marca el calendario en el dia de la cita
    
    this.dateValue = this.daySelected;

    // Carga las horas de ese dia
    this.loadHour();

    // Datos del formulario
    this.dataForm = new FormGroup({
      description: new FormControl(this.appointment.description, Validators.required),
      hour: new FormControl(this.appointment.hour, Validators.required),
    });


    // Chequea la conexión
    this.checkConexion();
  }

  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión y carga los clientes segun el estado de la conexión
  checkConexion() {
    Network.getStatus().then(status => {
      status.connected ? this.status = true : this.status = false;
     // this.loadClient();
    });

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
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

  // Método para desactivar los  ¡sábados y domingos del calendario
  isDateEnabled(dateIsoString) {
    const date = new Date(dateIsoString);
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
      // Disables Saturday and Sunday
      return false;
    }
    return true;
  }

  // Actualiza la cita en Firebas y la base de datos
  editAppointment() {
    const appointment = {
      dniClient: this.appointment.dniClient,
      description: this.dataForm.get('description').value,
      day: this.dateValue,
      hour: this.dataForm.get('hour').value,
      name: this.appointment.name,
      surname: this.appointment.surname
    };

    let message;
    // Si son iguales solo actualiza descripcion y sino actualiza todo
    if(this.appointment.day == this.dateValue && this.appointment.hour == this.dataForm.get('hour').value){
      message = this.appointmentService.updateAppointmentDescription(this.appointment, this.dataForm.get('description').value)
    }else{
     message = this.appointmentService.updateAppointment(this.appointment, appointment);
    }
    this.db.updateAppointment(
      this.appointment.day,
      this.appointment.hour,
      appointment.day,
      appointment.hour,
      appointment.name,
      appointment.surname,
      appointment.description,
      appointment.dniClient).then((res) => {
      });

      
    if (message == undefined) {
      this.utilService.presentToast(this.translate.instant('appointments.confirmUpdateAppointment'));
      this.closeModal();
    } else {
      this.utilService.presentToast(this.translate.instant('appointments.errorUpdateMaterial'));
      this.closeModal();
    }
  }

  /*
      Cuando se realiza un cambio de fecha en el calendario, obtiene las citas de ese dia 
      y habilita o deshabilita las correspondientes horas
  */
  changeDay(day) {
    this.dataForm.get('hour').setValue('');
    this.dateValue = day;
    this.appointmentService.getAppointment(this.dateValue).subscribe(data => {
      this.appointments = data;
      this.loadHour();
    });

    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db.fetchAppointments().subscribe(item => {
          if (!this.status)
            this.appointments = item.filter(appointments => appointments.day == this.dateValue);
            this.loadHour();
        })
      }
    });
  }

  // Devuelve true si la hora del select es mayor que la actual para poder ser seleccionam em caso contrario la deshabilita
  checkInHour(time: string) {
    return moment(`${this.daySelected} ${time}`, "DD/MM/YYYY HH:mm").format('x') > moment().format('x')
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
        disabled: this.checkHour('19:00',).length == 0 && this.checkInHour('19:00') ? false : true
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
