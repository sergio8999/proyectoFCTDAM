import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import * as CryptoJs from 'crypto-js'
import { Storage } from '@ionic/storage-angular';
import { DbService } from 'src/app/services/db.service';
import { UtilsService } from 'src/app/services/utils.service';



@Component({
  selector: 'app-form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.scss'],
})
export class FormLoginComponent implements OnInit {


  dataForm: FormGroup;
  user;
  typePassword = 'password';
  hidePassword = true;
  icon = 'eye-off-outline';
  secretKey = 'test';

  constructor(
    private router: Router,
    public alertController: AlertController,
    private storage: Storage,
    private db: DbService,
    private utilService: UtilsService
  ) { }

  async ngOnInit() {
    
    //Datos del formulario
    this.dataForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    // En caso de existir en el storage un usuario, redirige a la vista principal, saltandose el login.
    if (await this.storage.get('user')) {
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    }
  };

  // Pasando como parámetro un string, encripta la contraseña para ser guardada en la base de datos.
  encrypt(password) {
    let data = CryptoJs.AES.encrypt(password, this.secretKey).toString();
    return data;
  }

  // Pasando como parámetro un string, desencripta la contraseña.
  decrypt(password) {
    let bytes = CryptoJs.AES.decrypt(password, this.secretKey);
    return bytes.toString(CryptoJs.enc.Utf8);
  }

  /* Comprueba de la base local el usuario y contraseña. Para lacomprobación realiza lo siguiente:
    - Si el email existe.
    - Si la contraseña es la misma de la base de datos.
  */
  login() {
    this.db.dbState().subscribe((res) => {
      if (res) {
        let email:string = this.dataForm.get('email').value;
        this.db.getUserEmail(email.toLowerCase()).then(async data => {
          if (data == null) {
            this.utilService.presentToast('El email no existe');
          } else {
            if (this.decrypt(data.password) == this.dataForm.get('password').value) {
              await this.storage.set('user', data);
              this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
            } else {
              this.utilService.presentToast('Contraseña incorrecta');
            }
          }
        });
      }
    })
  }

  /*
    Si se pulsa sobre el icono de ver la contraseña, muestra el icono correspondiente y el tipo de texto. 
    Al volver a pulsarlo se vuelce a cambiar.
  */
  showPassword() {
    this.hidePassword = !this.hidePassword;
    if (this.hidePassword) {
      this.typePassword = 'password';
      this.icon = 'eye-off-outline';
    } else {
      this.typePassword = 'text';
      this.icon = 'eye-outline';
    }
  }

  /*
    Muestra un alert para el recxcuerdo de la contraseña. Contiene el input del email y de la clave de recuerdo.
    Comprueba s i existe el email, en caso de existir comprueba la claver de recuerdo. Y si todo es correcto muestra un alert con la contraseña
    desencriptada de la base de datos.
  */
  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      cssClass: 'my-custom-class',
      header: 'Resetear contraseña',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: ''
        },
        {
          name: 'help',
          type: 'text',
          placeholder: 'Respuesta de seguridad',
          value: ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: 'Confirmnar',
          handler: async (data: any) => {
            if (data.email != '' && data.help != '') {
              let email: string =data.email;
              const user = await this.db.getUserEmail(email.toLowerCase());
              if (user == null) {
                this.utilService.presentToast('No existe el email');
                return false;
              } else if (user.help != data.help) {
                this.utilService.presentToast('Respuesta incorrecta');
                return false;
              } else {
                this.utilService.presentAlert(this.decrypt(user.password));
              }
            } else {
              this.utilService.presentToast('Debe rellenar todos los campos');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
