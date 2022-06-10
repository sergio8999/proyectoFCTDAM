import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import * as CryptoJs from 'crypto-js'
import { DbService } from 'src/app/services/db.service';
import { Network } from '@capacitor/network';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-form-register',
  templateUrl: './form-register.component.html',
  styleUrls: ['./form-register.component.scss'],
})
export class FormRegisterComponent implements OnInit {


  dataForm: FormGroup;
  rol: string = 'empleado';
  typePassword1 = 'password';
  hidePassword1 = true;
  typePassword2 = 'password';
  hidePassword2 = true;
  icon1 = 'eye-off-outline';
  icon2 = 'eye-off-outline';
  avatar: string;
  secretKey = 'test';
  status: boolean;

  constructor(
    private userService: UserService,
    private db: DbService,
    private modalCtrl: ModalController,
    private utilService: UtilsService) { }


  ngOnInit() {
    
    // Avatar por defecto
    this.avatar = 'av-1.png';

    // Datos recogidos del formulario, con las validaciones correspondientes
    this.dataForm = new FormGroup({
      dni: new FormControl('', [Validators.required, Validators.pattern(this.utilService.expresionRegularDni)]),
      name: new FormControl('', Validators.required),
      help: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)]),
      password1: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password2: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
    // Comprueba la conexión y activa la escuha de dicha conexión.
    this.checkConexion();
  }

  // Pasando como parámetro un string, encripta la contraseña para ser guardada en la base de datos.
  encrypt(password) {
    let data = CryptoJs.AES.encrypt(password, this.secretKey).toString();
    return data;
  }

  // Comprueba la conexión actual y deja escuchando los cambios de dicha conexión
  checkConexion() {
    Network.getStatus().then(status => status.connected ? this.status = true : this.status = false);

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  // Segun el estado de la conexión llama al metodo para la comprobación de datos. Mediante Firebase si esta online o local si esta offline.
  register() {
    this.status ? this.registerNewtwork() : this.registerOffline();
  }

  // Cierra el modal.
  closeModal() {
    this.modalCtrl.dismiss();
  }

  /*
    Metodo para el registro si el estado de la conexión es offline.Comprobando lo siguiente:
    - Si los dos input de contraseña son iguales.
    - Si el email no existe en la base de datos.
    - Si el dni no existe en la base de datos.
    En caso de estar todo correcto registra al usuario/empleado en la base de datos
  */
  registerOffline() {
    if (this.dataForm.get('password1').value == this.dataForm.get('password2').value) {
      this.db.dbState().subscribe((res) => {
        if (res) {
          let email: string = this.dataForm.get('email').value;
          this.db.getUserEmail(email.toLowerCase()).then(data => {
            if (data != null) {
              this.utilService.presentToast('El email ya existe');
            } else {
              let dni: string = this.dataForm.get('dni').value;
              this.db.getUserDni(dni.toUpperCase()).then( userDni => {
                if (userDni != null) {
                  this.utilService.presentToast('El DNi ya existe')
                }else {
                  const userAdd = {
                    name: this.dataForm.get('name').value,
                    email: email.toLowerCase(),
                    rol: this.rol,
                    dni: dni.toUpperCase(),
                    avatar: this.avatar,
                    password: this.encrypt(this.dataForm.get('password1').value),
                    help: this.dataForm.get('help').value
                  };
  
                  const user = this.userService.addUser(userAdd);
                  this.db.addUser(userAdd.name, userAdd.dni, userAdd.email, userAdd.password, userAdd.help, userAdd.rol, userAdd.avatar);
                  if (typeof (user) == 'object') {
  
                    this.utilService.presentToast('Empleado registrado');
                    this.closeModal();
                  } else {
                    this.utilService.presentToast(user);
                  }
                }
              })
            }
          });
        }
      })

    } else {
      this.utilService.presentToast('Las contraseñas no coinciden');
    }
  }

  /*
    Metodo para el registro si el estado de la conexión es online( firebase ).Comprobando lo siguiente:
    - Si los dos input de contraseña son iguales.
    - Si el email no existe en la base de datos.
    - Si el dni no existe en la base de datos.
    En caso de estar todo correcto registra al usuario/empleado en la base de datos
  */
  registerNewtwork() {
    if (this.dataForm.get('password1').value == this.dataForm.get('password2').value) {
      // En caso de que se pueda repetir, nos aseguramos de que se ha comprobado.
      let comprobadoEmail = false;
      let comprobadoDni = false;
      let email: string = this.dataForm.get('email').value;
      this.userService.getUserByEmail(email.toLowerCase()).subscribe(data => {
        if (!comprobadoEmail) {
          if (data.length > 0) {
            this.utilService.presentToast('El email ya existe')
          } else {
            let dni: string = this.dataForm.get('dni').value;
            this.userService.getUserByDni(dni.toUpperCase()).subscribe(user => {
              if (!comprobadoDni) {
                if (user.length > 0) {
                  this.utilService.presentToast('El DNi ya existe')
                } else {
                  const userAdd = {
                    name: this.dataForm.get('name').value,
                    email: email.toLowerCase(),
                    rol: this.rol,
                    dni: dni.toUpperCase(),
                    avatar: this.avatar,
                    password: this.encrypt(this.dataForm.get('password1').value),
                    help: this.dataForm.get('help').value
                  };

                  const user = this.userService.addUser(userAdd);
                  this.db.addUser(userAdd.name, userAdd.dni, userAdd.email, userAdd.password, userAdd.help, userAdd.rol, userAdd.avatar);
                  if (typeof (user) == 'object') {
                    this.utilService.presentToast('Empleado registrado');
                    this.closeModal();
                  } else {
                    this.utilService.presentToast(user);
                  }
                }
                comprobadoDni = true;
              }
            }
            )
          }
          comprobadoEmail = true;
        }
      })
    } else {
      this.utilService.presentToast('Las contraseñas no coinciden');
    }
  }

  /*
      Si se pulsa sobre el icono de ver la contraseña, muestra el icono correspondiente y el tipo de texto, de dicho input. 
      Al volver a pulsarlo se vuelce a cambiar.
   */
  showPassword(password: string) {
    if (password == 'password1') {
      this.hidePassword1 = !this.hidePassword1;
      if (this.hidePassword1) {
        this.typePassword1 = 'password';
        this.icon1 = 'eye-off-outline';
      } else {
        this.typePassword1 = 'text';
        this.icon1 = 'eye-outline';
      }
    } else {
      this.hidePassword2 = !this.hidePassword2;
      if (this.hidePassword2) {
        this.typePassword2 = 'password';
        this.icon2 = 'eye-off-outline';
      } else {
        this.typePassword2 = 'text';
        this.icon2 = 'eye-outline';
      }
    }
  }
}