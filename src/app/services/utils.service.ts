import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  expresionRegularDni = /^\d{8}[a-zA-Z]$/;

  constructor(private toastController: ToastController,
    private alertController: AlertController) { }

  // Crear toast
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500
    });
    toast.present();
  }

  // Crear alert
  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      backdropDismiss: false,
      cssClass: 'my-custom-class',
      header: 'Contraseña recuperada',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  toCapitalize( str: string){
    return str.length>0 ? str[0].toUpperCase() + str.slice(1).toLowerCase() : '';
  }

}
