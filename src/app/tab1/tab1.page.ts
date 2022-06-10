import { Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, IonList, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Appointment } from '../interfaces/Appointmen.interface';
import { ModalAddAppointmentPage } from '../pages/modal-add-appointment/modal-add-appointment.page';
import { ModalEditAppointmentPage } from '../pages/modal-edit-appointment/modal-edit-appointment.page';
import { AppointmentService } from '../services/appointment.service';
import { DbService } from '../services/db.service';

import { Network } from '@capacitor/network';
import { UtilsService } from '../services/utils.service';
import { Material } from '../models/material';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, DoCheck {

  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  @ViewChild(IonList) ionList: IonList;


  showAppointment: boolean = false;
  daySelected: string = moment().locale('es').toISOString();
  minDate: string = moment().locale('es').toISOString();
  maxDate: string = moment().add(1, 'year').toISOString();

  disabledDay: boolean = false;
  language: string = 'es';
  dayString: string;
  itemsBd = [];

  appointments = [];
  clients = [];
  status: boolean;
  material: Appointment []

  constructor(private appointmentService: AppointmentService,
    public alertController: AlertController,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private db: DbService,
    private utilService: UtilsService
  ) {

  }

  // En este estado cada vez que cambia se comprueba el idioma y dependiendo de cual sea, cambia el idioma de dicho elemento
  ngDoCheck(): void {
    this.language = this.translate.currentLang;
    this.dayString = this.translate.currentLang == undefined ? this.showDate(this.daySelected, 'es') : this.showDate(this.daySelected, this.translate.currentLang);

  }
  ngOnInit() {
    // Chequea la conexión
    this.checkConexion();

    // Asigna a la variable los dias deshabilitados
    this.disabledDay = this.disabledAdd();
  }

  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión 
  checkConexion() {
    Network.getStatus().then(status => status.connected ? this.status = true : this.status = false);

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  // Actualiza el calendario. Si se actiba el toggle de ver citas, desactiva el boton de añadir y pueden ser visibles las citas anteriores.
  updateCalendar() {
    if (this.showAppointment) {
      this.minDate = moment().subtract(1, 'year').toISOString();
    } else {
      this.minDate = moment().locale('es').toISOString();
      this.datetime.reset(moment().locale('es').toISOString());
    }
  }

  // Deshabilita los sabados y domingos
  isDateEnabled(dateIsoString) {
    const date = new Date(dateIsoString);
    if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
      // Disables Saturday and Sunday
      return false;
    }
    return true;
  }

  // Cuando cambia el dia, compruebna el estado de la conexion para cargar de Firebase o local. 
  changeDay() {
    if (this.status) {
      this.appointmentService.getAppointment(moment(this.daySelected).locale('es').format('L')).subscribe(data => {
        if (this.status)
          this.appointments = data
      });
    } else {
      this.db.dbState().subscribe((res) => {
        if (res) {
          this.db.fetchAppointments().subscribe(item => {
            if (!this.status)
              this.appointments = item.filter(appointments => appointments.day == moment(this.daySelected).locale('es').format('L'));
          })
        }
      });
    }
    this.disabledDay = this.disabledAdd();
  }

  // Devuelve la fecha en el formato que sea el tipo de lenguaje
  showDate(date: string, language: string) {
    return moment(date).locale(language).format('dddd [, ] DD MMMM [ de ] YYYY');
  }

  // Deshabilita los sabados y domingos del calendario
  disabledAdd() {
    return moment(this.daySelected).get('day') == 0 || moment(this.daySelected).get('day') == 6;
  }

  // Muestra un alert para confirmar el borrado de la cita
  delete(appointment: Appointment) {
    this.presentAlertMultipleButtons(appointment);
  }

  // Borra la cita de la base de datos local
  deleteAppointmentDB(day, hour) {
    this.db.deleteAppointment(day, hour).then((res) => {
    })
  }

  // Crea un modal. Pasandole como parametros true( significa que es editar ) y los datos de la cita
  edit(appointment: Appointment) {
    this.ionList.closeSlidingItems();
    this.showrModal(true, appointment);
  }

  // Muestra el alert donde al dar ok eliminamos la cita seleccionada
  async presentAlertMultipleButtons(appointment: Appointment) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: `${appointment.name} ${appointment.surname}`,
      subHeader: `${appointment.day} ${appointment.hour}`,
      message: this.translate.instant('appointments.delete'),
      buttons: [
        {
          text: this.translate.instant('comun.confirm'),
          handler: () => {
            const message = this.appointmentService.deleteAppointment(appointment);
            this.deleteAppointmentDB(appointment.day, appointment.hour);
            if (typeof (message) == 'object') {
              this.utilService.presentToast(this.translate.instant('appointments.confirm_delete'));
            } else {
              this.utilService.presentToast(this.translate.instant('appointments.errorAddAppointment'));
            }
          }
        },
        {
          text: this.translate.instant('comun.cancel'),
          role: 'cancel',
          cssClass: 'rojo',
          handler: () => {
            this.ionList.closeSlidingItems();
          }
        }
      ]
    });

    await alert.present();
  }

  /*
    Crea el modal, y dependiendo si es para actualizar o añadir llama a un modal diferente.
    Al cerrar el modal obtiene los valores de la cita actualizada
  */
  async showrModal(edit: boolean, appointment?: Appointment) {
    const modal = await this.modalCtrl.create({
      component: edit ? ModalEditAppointmentPage : ModalAddAppointmentPage,
      componentProps: {
        appointments: this.appointments,
        daySelected: moment(this.daySelected).locale('es').format('L'),
        appointment: appointment,
        language: this.language
      }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data.dateValue != undefined) {
      this.daySelected = moment(data.dateValue, "DD/MM/YYYY").toISOString();
      this.changeDay();
    }
  }

}
