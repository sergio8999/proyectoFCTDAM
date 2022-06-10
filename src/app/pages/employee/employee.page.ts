import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonList, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/User.interface';
import { UserService } from 'src/app/services/user.service';
import { ModalUserPage } from '../modal-user/modal-user.page';
import { Storage } from '@ionic/storage-angular';
import { DbService } from 'src/app/services/db.service';
import { Network } from '@capacitor/network';
import { FormRegisterComponent } from 'src/app/components/form-register/form-register.component';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.page.html',
  styleUrls: ['./employee.page.scss'],
})
export class EmployeePage implements OnInit {

  @ViewChild(IonList) ionList: IonList;

  users: any[] = [];
  text: string = '';
  user;
  status: boolean; 

  constructor(private modalCtrl: ModalController,
    private userService: UserService,
    public alertController: AlertController,
    private translate: TranslateService,
    private storage: Storage,
    private db: DbService,
    private utilService: UtilsService ) { }

  async ngOnInit() {
    this.user = await this.storage.get('user');
   this.checkConexion();
  }

  // Método para sabel el estado de la conexión y estar escuchando si cambia dicho estado
  checkConexion() {
    Network.getStatus().then(status => {
      status.connected ? this.status = true : this.status = false ;
      this.loadUser();
    });

    Network.addListener( 'networkStatusChange', status =>  status.connected ? this.status = true : this.status = false );
  }

  // Obtiene los usuarios/empleados de firebase y la base de datos local
  loadUser() {
    this.userService.getUsers().subscribe(users =>{
      if(this.status)
        this.users = users 
      });
    this.db.dbState().subscribe((res) => {
      if (res) {
        this.db.fetchUsers().subscribe( item => {
          if( !this.status )
            this.users = item 
        })}});
  }

  // Crea el modal con el componente del registro
  async showrModalRegister(){
    const modal = await this.modalCtrl.create({
      component: FormRegisterComponent,
      componentProps: {
      }
    });
    await modal.present();
  }

  // Detecta el cambio de valor en el input
  onSearchChange(evento: any) {
    this.text = evento.detail.value;
  }

  // Cierra el slide y llama al metodo para mostrar el modal, pasando por parametros los usuarios y el usuario actual
  edit(users: User) {
    this.ionList.closeSlidingItems();
    this.showrModal(users);
  }

  // Método que llama al alert para preguntar si desea borrar el usuario/ empleado. En caso de que el empleado sea el mismo que el actual, no permite borrarlo
  delete(users: User) {
    if (this.user.email == users.email) {
      this.utilService.presentToast(this.translate.instant('employee.no_delete'));
    } else {
      this.presentAlertMultipleButtons(users);
    }
  }

  // Crea y muestra el modal de la pagina para crear usuarios
  async showrModal(user: User) {
    const modal = await this.modalCtrl.create({
      component: ModalUserPage,
      componentProps: {
        user: user
      }
    });
    await modal.present();
  }

  // Muestra una alerta para confirmar si desea borrar el empleado/ usuario, pasando por parámetro el usuario a borrar.
  async presentAlertMultipleButtons(user: User) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: user.name,
      subHeader: `DNI: ${user.dni}`,
      message: this.translate.instant('employee.delete'),
      buttons: [
        {
          text: this.translate.instant('comun.confirm'),
          handler: () => {
            const message = this.userService.deleteUser(user);
            this.db.deleteUser(user.dni);
            this.utilService.presentToast(this.translate.instant('employee.confirm_delete'));
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

  // Traduce para mostrar en la vista la palabra "empleado" a "employee" según el idioma actual
  writeRol(rol: string) {
    let employee;
    if (rol == 'empleado') {
      this.translate.currentLang == 'es' ? employee = 'empleado' : employee = 'employee';
      return employee;
    }
    return 'admin';
  }

}
