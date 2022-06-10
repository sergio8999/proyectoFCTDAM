import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSlides } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { AppointmentService } from 'src/app/services/appointment.service';
import { ClientService } from 'src/app/services/client.service';
import { DbService } from 'src/app/services/db.service';
import { MaterialService } from 'src/app/services/material.service';
import { UserService } from 'src/app/services/user.service';
import { Network } from '@capacitor/network';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from 'src/app/services/utils.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {


  constructor(
    public alertController: AlertController,
    private storage: Storage,
    private appoitmentService: AppointmentService,
    private db: DbService,
    private clientService: ClientService,
    private materialService: MaterialService,
    private userService: UserService,
    private translate: TranslateService,
    private utilService: UtilsService
  ) { }

  ngOnInit() {

    // Crea el storage
    this.storage.create();
    /*
      Al abrir el login comprueba si hay conexión, si hay descarga los datos de firebas, sino continua con la base de datos local. Lo realiza de cada tabla de la 
      base de datos
    */
    Network.getStatus().then(status => {
      if (status.connected) {
        this.db.dbState().subscribe((res) => {
          if (res) {
            this.db.deleteAllAppointment();
            this.db.deleteAllClient();
            this.db.deleteAllMaterial();
            this.db.deleteAllUser();
          }
        });

        const appointments = this.appoitmentService.getAppointments();
        appointments.then(appointment => {
          appointment.forEach(data => {
            const appointment = data.data()
            this.db.addAppointment(appointment.day, appointment.hour, appointment.name, appointment.surname, appointment.description, appointment.dniClient);
          })
        })

        const clients = this.clientService.queryGetclients();
        clients.then(client => {
          client.forEach(data => {
            const client = data.data();
            this.db.addClient(client.dni, client.fullName, client.email, client.name, client.tel, client.surname);
          })
        });

        const materials = this.materialService.queryGetMaterials();
        materials.then(material => {
          material.forEach(data => {
            const material = data.data();
            this.db.addMaterial(material.name, material.stock);
          })
        });

        const users = this.userService.queryGetUser();
        users.then(user => {
          user.forEach(data => {
            const user = data.data();
            this.db.addUser(user.name, user.dni, user.email, user.password, user.help, user.rol, user.avatar);
          })
        })
      }
    });

    // Cuando se realiza un cambio en la conexión muestra un mensaje para notificarlo al usuario
    Network.addListener('networkStatusChange', status => status.connected ? this.utilService.presentToast(this.translate.instant('comun.network_connected')) : this.utilService.presentToast(this.translate.instant('comun.network_disconnected')));
  };
}
