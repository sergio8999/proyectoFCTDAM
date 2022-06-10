import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Client } from 'src/app/interfaces/Client.interface';
import { ClientService } from 'src/app/services/client.service';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from 'src/app/services/db.service';
import { Network } from '@capacitor/network';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-modal-add-client',
  templateUrl: './modal-add-client.page.html',
  styleUrls: ['./modal-add-client.page.scss'],
})
export class ModalAddClientPage implements OnInit {

  @Input() client: Client;
  @Input() edit: boolean;

  dataForm: FormGroup;
  existClient: boolean;
  status: boolean;

  constructor(private modalCtrl: ModalController,
    private clientService: ClientService,
    private translate: TranslateService,
    private db: DbService,
    private utilService: UtilsService) { }

  ngOnInit() {
    // Datos del formulario
    this.dataForm = new FormGroup({
      dni: new FormControl(this.edit ? this.client.dni : '', [Validators.required, Validators.pattern(this.utilService.expresionRegularDni)]),
      name: new FormControl(this.edit ? this.client.name : '', Validators.required),
      surname: new FormControl(this.edit ? this.client.surname : '', Validators.required),
      tel: new FormControl(this.edit ? this.client.tel : '', [Validators.required, Validators.minLength(9)]),
      email: new FormControl(this.edit ? this.client.email : '', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)])
    });

    //Chequea la conexión
    this.checkConexion();
  }

  // Cierra el modal
  async closeModal() {
    const modal = await this.modalCtrl.getTop();
    if (modal)
      await modal.dismiss(null);
  }

  // Dependiendo del estado de la conexión llama un método u otro para añadir el cliente
  addClient() {
    this.status ? this.addClientNetwork() : this.addClientOffline();
  }

  // Comprueba si existe el dni antes de insertarlo a la base de datos de firebase
  addClientNetwork() {
    // Con esta variable se asegura que solo entra una vez
    let agregado = false;
    let dni : string= this.dataForm.get('dni').value;
    this.clientService.getClientByDni(dni.toUpperCase()).subscribe(client => {
      if (client.length == 0 && !agregado) {
        agregado = true;
        this.addClientBD();
      } else if (!agregado) {
        this.utilService.presentToast(this.translate.instant('comun.existDni'));
      }
    });
  }

  // Comprueba si existe el dni antes de insertarlo a la base de datos de local
  addClientOffline() {
    let dni: string = this.dataForm.get('dni').value
    this.db.getClientDni(dni.toUpperCase()).then( data => {;
      if (data == null) {
        this.addClientBD();
      } else {
        this.utilService.presentToast(this.translate.instant('comun.existDni'));
      }
    })
  }

  // Añade el cliente a la base de datos de firebase y local, mostrando el correspondiente mensaje
  addClientBD() {
    let dni: string = this.dataForm.get('dni').value;
    const client = this.clientService.addClient({
      dni: dni.toUpperCase(),
      name: this.dataForm.get('name').value,
      surname: this.dataForm.get('surname').value,
      email: this.dataForm.get('email').value,
      tel: this.dataForm.get('tel').value,
      fullName: `${this.dataForm.get('name').value} ${this.dataForm.get('surname').value}`
    });

    this.db.addClient(
      dni.toUpperCase(),
      `${this.dataForm.get('name').value} ${this.dataForm.get('surname').value}`,
      this.dataForm.get('email').value,
      this.dataForm.get('name').value,
      this.dataForm.get('tel').value,
      this.dataForm.get('surname').value).then((res) => {
      });

    if (typeof (client) == 'object') {
      this.utilService.presentToast(this.translate.instant('clients.confirmAddClient'));

      this.closeModal();
    } else {
      this.utilService.presentToast(this.translate.instant('clients.errorAddClient'));
    }
  }

  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión
  checkConexion() {
    Network.getStatus().then(status => status.connected ? this.status = true : this.status = false);

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  // Dependiendo del estado de la conexión llama un método u otro para actualizar el cliente
  update() {
    this.status ? this.updateClientNetwork() : this.updateClientOffline();
  }

  // Realiza las comprobaciones mediante firebas si hay conexión y llama al método de actualizar cliente
  updateClientNetwork() {
    let clients;
    let dni: string = this.dataForm.get('dni').value;
    this.clientService.getClientByDni(dni.toUpperCase()).subscribe(client => clients = client);
    setTimeout(() => {
      this.updateClient(clients);
    }, 400);
  }

  // Realiza las comprobaciones mediante la base de datos local si hay conexión y llama al método de actualizar cliente
  updateClientOffline() {
    let clients = [];
    let dni: string = this.dataForm.get('dni').value;
    this.db.getClientDni(dni.toUpperCase()).then(client => {
      if (client != null && this.client.dni != dni.toUpperCase()) {
        clients.push(client);
      }
    })
    setTimeout(() => {
      this.updateClient(clients);
    }, 400);
  }

  /*
    Método para actualizar el cliente, realiza las siguientes comprobaciones:
    - Comprueba si los campos de dni son igaules para actazliar sus datos
    - Si cambiarel dni, comprueba antes si ya existe. En caso de existir muestra un toast y no deja insertarlo
    . Si el nuevo dni no existe en la base de datos lo actualiza.
  */
  updateClient(clients: Client[]) {
    let client;
    let dniClient: string = this.dataForm.get('dni').value;
    dniClient = dniClient.toUpperCase(); 
    if (this.client.dni == dniClient) {
      client = this.clientService.updateClient({
        dni: dniClient,
        name: this.dataForm.get('name').value,
        surname: this.dataForm.get('surname').value,
        email: this.dataForm.get('email').value,
        tel: this.dataForm.get('tel').value,
        fullName: `${this.dataForm.get('name').value} ${this.dataForm.get('surname').value}`
      });

      this.db.updateClient(
        this.client.dni,
        dniClient,
        `${this.dataForm.get('name').value} ${this.dataForm.get('surname').value}`,
        this.dataForm.get('email').value,
        this.dataForm.get('name').value,
        this.dataForm.get('tel').value,
        this.dataForm.get('surname').value).then((res) => {
        });

      if (typeof (client) == 'object') {
        this.utilService.presentToast(this.translate.instant('clients.confirmUpdateClient'));
        this.closeModal();

      } else {
        this.utilService.presentToast(this.translate.instant('clients.errorUpdateClient'));
      }
    } else if (clients.length == 0) {
      client = this.clientService.updateClientDni(this.client, {
        dni: dniClient,
        name: this.dataForm.get('name').value,
        surname: this.dataForm.get('surname').value,
        email: this.dataForm.get('email').value,
        tel: this.dataForm.get('tel').value,
        fullName: `${this.dataForm.get('name').value} ${this.dataForm.get('surname').value}`
      });

      this.db.updateClient(
        this.client.dni,
        dniClient,
        `${this.dataForm.get('name').value} ${this.dataForm.get('surname').value}`,
        this.dataForm.get('email').value,
        this.dataForm.get('name').value,
        this.dataForm.get('tel').value,
        this.dataForm.get('surname').value).then((res) => {
        });

      if (typeof (client) == 'object') {
        this.utilService.presentToast(this.translate.instant('clients.confirmUpdateClient'));
        this.closeModal();

      } else {
        this.utilService.presentToast(this.translate.instant('clients.errorUpdateClient'));
      }
    } else {
      this.utilService.presentToast(this.translate.instant('comun.existDni'));
    }
  }

}
