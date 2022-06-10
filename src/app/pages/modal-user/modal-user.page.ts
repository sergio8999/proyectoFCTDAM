import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Network } from '@capacitor/network';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/User.interface';
import { DbService } from 'src/app/services/db.service';
import { UserService } from 'src/app/services/user.service';
import { Storage } from '@ionic/storage-angular';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-modal-user',
  templateUrl: './modal-user.page.html',
  styleUrls: ['./modal-user.page.scss'],
})
export class ModalUserPage implements OnInit {

  // Información que trae desde el otro componente
  @Input() user: User;

  dataForm: FormGroup;
  rol: string;
  status: boolean;
  userStorage: User;

  constructor(
    private modalCtrl: ModalController,
    private userService: UserService,
    public translate: TranslateService,
    private db: DbService,
    private storage: Storage,
    private utilService: UtilsService) { }


  async ngOnInit() {

    //Datops del formulario
    this.dataForm = new FormGroup({
      dni: new FormControl(this.user.dni, [Validators.required, Validators.pattern(this.utilService.expresionRegularDni)]),
      name: new FormControl(this.user.name, Validators.required)
    });

    // Storage local donde carga si el usuario tenia una sesión activa, teniendo la información de dicho usuario
    this.userStorage = await this.storage.get('user');

    // Asignación del rol del usuario
    this.rol = this.user.rol;

    // Chequea la conexión
    this.checkConexion();
  }

  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión y carga los clientes segun el estado de la conexión
  checkConexion() {
    Network.getStatus().then(status => status.connected ? this.status = true : this.status = false);

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  // Dependiendo del estado de la conexion, comprueba los datos mediantre Firebase o local
  update() {
    this.status ? this.updateUserNetwork() : this.updateUserOffline();
  }

  // Comprobar suario/empleado si hay dni mediante Firebase
  updateUserNetwork() {
    let users;
    let dni: string = this.dataForm.get('dni').value;
    this.userService.getUserByDni(dni.toUpperCase()).subscribe(user => {
      users = user
    });
    setTimeout(() => {
      this.updateUser(users);
    }, 400);
  }

  // Comprobar usuario/empleado mediante la base de datos local
  updateUserOffline() {
    let users = [];
    let dni: string = this.dataForm.get('dni').value;
    this.db.getUserDni(dni.toUpperCase()).then(user => {
      if (user != null && dni != user.dni) {
        this.utilService.presentToast(this.translate.instant(this.translate.instant('employee.exist')));
      } else {
        this.updateUser(users)
      }
    })
  }

  // Método para actualizar la información del usuario/ empleado en Firebase y local
  updateUser(users) {
    let dniUser:string = this.dataForm.get('dni').value;
    dniUser = dniUser.toUpperCase();
    // Comprueba si es el mismo o no existe, para actualizar sus datos
    if (users.length == 0 || this.user.dni == dniUser) {
      let user
      if(this.user.dni == dniUser){
        user = this.userService.updateNameRol(this.user.dni, this.dataForm.get('name').value, this.rol);
      }else{
        user  = this.userService.updateUser(this.user, {
          dni: dniUser,
          name: this.dataForm.get('name').value,
          email: this.user.email,
          rol: this.rol,
          avatar: this.user.avatar,
          password: this.user.password,
          help: this.user.help
        });
      }

      this.db.updateUser(
        this.user.dni, {
        dni: dniUser,
        name: this.dataForm.get('name').value,
        email: this.user.email,
        rol: this.rol,
        avatar: this.user.avatar,
        password: this.user.password,
        help: this.user.help
      }).then((res) => {
      });

      if (typeof (user) == 'object') {
        this.utilService.presentToast(this.translate.instant('dashboard.confirmUpdateEmployee'));
        this.closeModal();

      } else {
        this.utilService.presentToast(this.translate.instant('dashboard.errorUpdateEmployee'));
      }
    } else {
      this.utilService.presentToast(this.translate.instant('comun.existDni'));
    }
  }

  // Cierra el modal
  async closeModal() {
    const modal = await this.modalCtrl.getTop();
    if (modal)
      this.modalCtrl.dismiss(null);
  }

}
