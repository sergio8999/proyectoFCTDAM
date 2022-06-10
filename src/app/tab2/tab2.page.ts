import { Component, OnInit, ViewChild } from '@angular/core';
import { Network } from '@capacitor/network';
import { AlertController, IonList, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Client } from '../interfaces/Client.interface';
import { ModalAddClientPage } from '../pages/modal-add-client/modal-add-client.page';
import { ClientService } from '../services/client.service';
import { DbService } from '../services/db.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  @ViewChild(IonList) ionList: IonList;

  clients: any[] = [];
  text: string = '';
  status: boolean;

  constructor(
    private clientService: ClientService,
    private modalCtrl: ModalController,
    public alertController: AlertController,
    private translate: TranslateService,
    private db: DbService,
    private utilService: UtilsService) { }

  ngOnInit(): void {

    // Chequea la conexión
    this.checkConexion();
  }

  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión y carga los clientes
  checkConexion() {
    Network.getStatus().then(status => {
      status.connected ? this.status = true : this.status = false;
      this.loadClients();
    });

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  // Carga los datos de Firebase o de la base de datos local según el estado de la conexión
  loadClients() {
    this.clientService.getClients().subscribe(clients => {
      if (this.status)
        this.clients = clients
    });
      this.db.fetchClients().subscribe(item => {
        if (!this.status)
          this.clients = item;
      })
  }

  // Detecta el cambio de valor en el input
  onSearchChange(evento: any) {
    this.text = evento.detail.value;
  }

  // Cierra el slide y abre el modal, pasando true ( significando que es para editar ) y le pasa el cliente
  edit(client: Client) {
    this.ionList.closeSlidingItems();
    this.showrModal(true, client);
  }

  // Muestra el alert para confirmar el borrado del cliente
  delete(client: Client) {
    this.presentAlertMultipleButtons(client);
  }

  // Borra el cliente de la base de datos local mediante dni
  deleteClientDB(dni) {
    this.db.deleteClient(dni).then((res) => {
    })
  }

  // LLama al componente añadir cliente para que se visualize, pasandole por parametro si es true o false edit y el cliente
  async showrModal(edit: boolean, client?: Client) {
    const modal = await this.modalCtrl.create({
      component: ModalAddClientPage,
      componentProps: {
        client: client,
        edit: edit
      }
    });
    await modal.present();
  }

  // Alert que al confirmar borra el cliente de Firebase y de la base de datos local
  async presentAlertMultipleButtons(client: Client) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: client.fullName,
      subHeader: `DNI: ${client.dni}`,
      message: this.translate.instant('clients.delete'),
      buttons: [
        {
          text: this.translate.instant('comun.confirm'),
          handler: () => {
            this.deleteClientDB(client.dni);
            const message = this.clientService.deleteClient(client);

            if (typeof (message) == 'object') {
              this.utilService.presentToast(this.translate.instant('clients.confirm_delete'));
            } else {
              this.utilService.presentToast(this.translate.instant('clients.errorAddClient'));
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

  // Cierra el modal
  async closeModal() {
    const modal = await this.modalCtrl.getTop();
    if (modal)
      await modal.dismiss();
  }

}
