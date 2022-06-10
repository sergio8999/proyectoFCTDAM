import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, doc, Firestore, getDocs, setDoc } from '@angular/fire/firestore';
import { Client } from '../interfaces/Client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private ags: AngularFirestore, private firestore: Firestore) { }

  // Obtiene todos los clientes. Observable
  getClients() {
    return this.ags.collection('clients').valueChanges({ idField: 'id' });
  }

  // Obtiene los clientes mediante su id. Observable
  getClient(id: string) {
    return this.ags.collection('clients').doc(id).valueChanges();
  }

  // Consulta para obtener los clientes
  queryGetclients() {
    const datos = getDocs(collection(this.firestore, 'clients'));
    return datos;
  }

  // Añadir cliente, pasando el objeto cliente. Guardando como id su dni
  async addClient(client: Client) {
    try {
      const clients = doc(this.firestore, `clients/${client.dni}`);
      await setDoc(clients, client);
      return clients;
    } catch (e) {
      console.log(e);
      return e.code;
    }
  }

  // Actualizar cliente, pasando un objeto cliente
  updateClient(client: Client) {
    try {
      return this.ags.collection('clients').doc(client.dni).update({
        email: client.email,
        fullName: client.fullName,
        name: client.name,
        surname: client.surname,
        tel: client.tel
      });
    } catch (e) {
      return e.code;
    }
  }

  // Aztualizar cliente, añadiendo uno nuevo y borrando el anterior ( se realiz por si cambia su id principal, ya que es el dni)
  updateClientDni(oldClient: Client, client: Client) {
    try {
      const clientUpdate = this.addClient(client);
      this.deleteClient(oldClient);
      return clientUpdate;
    } catch (e) {
      return e.code;
    }
  }

  // Borrado de cliente pasando cliente como objetp
  deleteClient(client: Client) {
    try {
      
      return this.ags.collection('clients').doc(client.dni).delete();
    } catch (e) {
      return e.code;
    }
  }

  // Obtener cliente mediante dni. Observable
  getClientByDni(dni: string) {
    return this.ags.collection('clients', ref => ref.where('dni', '==', dni)).valueChanges({ idField: 'id' });
  }

}
