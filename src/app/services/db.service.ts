import { Injectable } from '@angular/core';

import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { User } from '../models/user';
import { Material } from '../models/material';
import { Client } from '../models/client';
import { Appointment } from '../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private storage: SQLiteObject;
  userList = new BehaviorSubject([]);
  materialList = new BehaviorSubject([]);
  clientList = new BehaviorSubject([]);
  appointmentList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
  ) {

    // Inicio bd
    this.platform.ready().then(() => {
      const conn = this.sqlite.create({
        name: 'fisioterapia_db.db',
        location: 'default'
      })
      if (conn == null) throw Error('Failed to create database connection')
      conn.then((db: SQLiteObject) => {
        this.storage = db;
        this.getFakeData();
      });

    });
  }

  // Estado bd
  dbState() {
    return this.isDbReady.asObservable();
  }

  // Obtener todos los usuarios
  fetchUsers(): Observable<User[]> {
    return this.userList.asObservable();
  }

  // Obtiene todos los datos, incluyendo si se hace un insert en el documento
  getFakeData() {
    this.httpClient.get(
      'assets/dump.sql',
      { responseType: 'text' }
    ).subscribe(data => {
      this.sqlPorter.importSqlToDb(this.storage, data)
        .then(_ => {
          this.getUsers();
          this.getMaterials();
          this.getClients();
          this.getAppointments();
          this.isDbReady.next(true);
        })
        .catch(error => console.error(error));
    });
  }

  // USER

  // Obtiene todos los usuarios/empleados
  async getUsers() {
    const res = await this.storage.executeSql('SELECT * FROM users', []);
    let items: User[] = [];
    if (res.rows.length > 0) {
      for (var i = 0; i < res.rows.length; i++) {
        items.push({
          name: res.rows.item(i).name_user,
          dni: res.rows.item(i).dni,
          email: res.rows.item(i).email,
          password: res.rows.item(i).password_user,
          help: res.rows.item(i).help,
          rol: res.rows.item(i).rol,
          avatar: res.rows.item(i).avatar
        });
      }
    }
    this.userList.next(items);
  }

  // Añade un usuario
  async addUser(name_user, dni, email, password_user, help, rol, avatar) {
    let data = [dni, email, name_user, password_user, help, rol, avatar];
    const res = await this.storage.executeSql('INSERT INTO users (dni, email, name_user, password_user, help, rol, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)', data);
    this.getUsers();
  }

  // Obiente un usuario mediante dni
  getUserDni(dni): Promise<User> {
    return this.storage.executeSql('SELECT * FROM users WHERE dni = ?', [dni]).then(res => {
      if (res.rows.length == 0) {
        return null;
      } else {
        return {
          name: res.rows.item(0).name_user,
          dni: res.rows.item(0).dni,
          email: res.rows.item(0).email,
          password: res.rows.item(0).password_user,
          help: res.rows.item(0).help,
          rol: res.rows.item(0).rol,
          avatar: res.rows.item(0).avatar
        }
      }
    });
  }

  // Obtiene usuario/empleado mediante email
  getUserEmail(email): Promise<User> {
    return this.storage.executeSql('SELECT * FROM users WHERE email = ?', [email]).then(res => {
      if (res.rows.length == 0) {
        return null;
      } else {
        return {
          name: res.rows.item(0).name_user,
          dni: res.rows.item(0).dni,
          email: res.rows.item(0).email,
          password: res.rows.item(0).password_user,
          help: res.rows.item(0).help,
          rol: res.rows.item(0).rol,
          avatar: res.rows.item(0).avatar
        }
      }
    });
  }

  // Actualizar usuario mediante su dni
  updateUser(dni, user: User) {
    let data = [user.name, user.dni, user.rol];
    return this.storage.executeSql(`UPDATE users SET name_user = ?, dni = ?, rol = ? WHERE dni = '${dni}'`, data)
      .then(data => {
        this.getUsers();
      })
  }

  updateAvatarUser( dni, avatar) {
    let data = [ avatar ];
    return this.storage.executeSql(`UPDATE users SET avatar = ? WHERE dni = ${dni}`, data)
      .then(data => {
      })
  }

  // Borrar usuario mediante dni
  deleteUser(dni) {
    return this.storage.executeSql('DELETE FROM users WHERE dni = ?', [dni])
      .then(_ => {
        this.getUsers();
      });
  }

  // Borrar todos los usuarios
  deleteAllUser() {
    return this.storage.executeSql('delete FROM users', [])
      .then(_ => {
        this.getUsers();
      });
  }

  // MATERIALES

  // Obtiene todos los materiales como observable
  fetchhMaterials(): Observable<Material[]> {
    return this.materialList.asObservable();
  }

  // Obtener todos los materiales
  async getMaterials() {
    const res = await this.storage.executeSql('SELECT * FROM materials', []);
    let items: Material[] = [];
    if (res.rows.length > 0) {
      for (var i = 0; i < res.rows.length; i++) {
        items.push({
          id: res.rows.item(i).id,
          name: res.rows.item(i).name_material,
          stock: res.rows.item(i).stock
        });
      }
    }
    this.materialList.next(items);
  }

  // Añadir material
  async addMaterial(name_material, stock) {
    let data = [name_material, stock];
    const res = await this.storage.executeSql('INSERT INTO materials (name_material, stock) VALUES (?, ?)', data);
    this.getMaterials();
  }

  // Obtener material mediante su nombre
  getMaterial(name): Promise<Material> {
    return this.storage.executeSql('SELECT * FROM materials WHERE name_material = ?', [name]).then(res => {
      if (res.rows.length == 0) {
        return null;
      } else {
        return {
          id: res.rows.item(0).id,
          name: res.rows.item(0).name_material,
          stock: res.rows.item(0).stock
        }
      }
    });
  }

  // Actualizar material
  updateMaterial(id_name, name_material, stock) {
    let data = [name_material, stock];
    return this.storage.executeSql(`UPDATE materials SET name_material = ?, stock = ? WHERE name_material = '${id_name}'`, data)
      .then(data => {
        this.getMaterials();
      })
  }
  // Borrar material mediante nombre
  deleteMaterial(name_material) {
    return this.storage.executeSql('DELETE FROM materials WHERE name_material = ?', [name_material])
      .then(_ => {
        this.getMaterials();
      });
  }

  // Borrar todos los materiales
  deleteAllMaterial() {
    return this.storage.executeSql('delete FROM materials', [])
      .then(_ => {
        this.getMaterials();
      });
  }

  // Clientes

  // Obtener todos los clientes mediante observable
  fetchClients(): Observable<Material[]> {
    return this.clientList.asObservable();
  }

  // Obtener clientes
  async getClients() {
    const res = await this.storage.executeSql('SELECT * FROM clients', []);
    let items: Client[] = [];
    if (res.rows.length > 0) {
      for (var i = 0; i < res.rows.length; i++) {
        items.push({
          dni: res.rows.item(i).dni,
          fullName: res.rows.item(i).fullName,
          email: res.rows.item(i).email,
          name: res.rows.item(i).name_client,
          tel: res.rows.item(0).tel,
          surname: res.rows.item(i).surname,
        });
      }
    }
    this.clientList.next(items);
  }

  // Añadir cliente
  async addClient(dni, fullName, email, name, tel, surname) {
    let data = [dni, fullName, email, name, tel, surname];
    const res = await this.storage.executeSql('INSERT INTO clients (dni, fullName, email, name_client, tel, surname) VALUES (?, ?, ?, ?, ?, ?)', data);
    this.getClients();
  }

  // Obtner cliente por dni
  getClientDni(dni): Promise<Client> {
    return this.storage.executeSql('SELECT * FROM clients WHERE dni = ?', [dni]).then(res => {
      if (res.rows.length == 0) {
        return null;
      } else {
        return {
          dni: res.rows.item(0).dni,
          fullName: res.rows.item(0).fullName,
          email: res.rows.item(0).email,
          name: res.rows.item(0).name_client,
          tel: res.rows.item(0).tel,
          surname: res.rows.item(0).surname,
        }
      }
    });
  }

  // Actualizar cliente
  updateClient(dni_id, dni, fullName, email, name, tel, surname) {
    let data = [dni, fullName, email, name, tel, surname];
    return this.storage.executeSql(`UPDATE clients SET dni = ?, fullName = ?, email = ?,  name_client = ?, tel = ?, surname = ? WHERE dni = '${dni_id}'`, data)
      .then(data => {
        this.getClients();
      })
  }

  // Borrar cliente por dni
  deleteClient(dni) {
    return this.storage.executeSql('DELETE FROM clients WHERE dni = ?', [dni])
      .then(_ => {
        this.getClients();
      });
  }

  // Borrar todos los clientes
  deleteAllClient() {
    return this.storage.executeSql('delete FROM clients', [])
      .then(_ => {
        this.getClients();
      });
  }

  // CITAS

  // Obtener las citas. Observable
  fetchAppointments(): Observable<Appointment[]> {
    return this.appointmentList.asObservable();
  }

  // Obtener citas
  async getAppointments() {
    const res = await this.storage.executeSql('SELECT * FROM appointments', []);
    let items: Appointment[] = [];
    if (res.rows.length > 0) {
      for (var i = 0; i < res.rows.length; i++) {
        items.push({
          id: res.rows.item(i).id,
          day: res.rows.item(i).day_appointments,
          hour: res.rows.item(i).hour,
          name: res.rows.item(i).name_appointments,
          surname: res.rows.item(i).surname,
          description: res.rows.item(i).description_appointment,
          dniClient: res.rows.item(i).dni_cliente,
        });
      }
    }
    this.appointmentList.next(items);
  }

  // Añaduir cita
  async addAppointment(day, hour, name, surname, description, dniCliente) {
    let data = [day, hour, name, surname, description, dniCliente];
    const res = await this.storage.executeSql('INSERT INTO appointments (day_appointments, hour, name_appointments, surname, description_appointment, dni_cliente) VALUES (?, ?, ?, ?, ?, ?)', data);
    this.getAppointments();
  }

  // Obtener cita mediante dia
  async getAppointmentsDay(day) {
    const res = await this.storage.executeSql('SELECT * FROM appointments WHERE day_appointments = ?', [day]);
    let items: Appointment[] = [];
    if (res.rows.length > 0) {
      for (var i = 0; i < res.rows.length; i++) {
        items.push({
          id: res.rows.item(i).id,
          day: res.rows.item(i).day_appointments,
          hour: res.rows.item(i).hour,
          name: res.rows.item(i).name_appointments,
          surname: res.rows.item(i).surname,
          description: res.rows.item(i).description_appointment,
          dniClient: res.rows.item(i).dni_cliente,
        });
      }
    }
    return items;
  }

  // Obtener cita mediante dia y hora
  getAppointment(day, hour): Promise<Appointment> {
    return this.storage.executeSql('SELECT * FROM appointments WHERE day_appointments = ? and hour= ?', [day, hour]).then(res => {
      if (res.rows.length == 0) {
        return null;
      } else {
        return {
          id: res.rows.item(0).id,
          day: res.rows.item(0).day_appointments,
          hour: res.rows.item(0).hour,
          name: res.rows.item(0).name_appointments,
          surname: res.rows.item(0).surname,
          description: res.rows.item(0).description_appointment,
          dniClient: res.rows.item(0).dni_cliente,
        }
      }
    });
  }

  // Actualizar cita
  updateAppointment(day_id, hour_id, day, hour, name, surname, description, dniCliente) {
    let data = [day, hour, name, surname, description, dniCliente];
    return this.storage.executeSql(`UPDATE appointments SET day_appointments = ?, hour = ?, name_appointments = ?,  surname = ?,  description_appointment = ?, dni_cliente = ? WHERE day_appointments = '${day_id}' and hour = '${hour_id}'`, data)
      .then(data => {
        this.getAppointments();
      })
  }

  // Borra cita
  deleteAppointment(day, hour) {
    return this.storage.executeSql('DELETE FROM appointments WHERE day_appointments = ? and hour = ?', [day, hour])
      .then(_ => {
        this.getAppointments();
      });
  }

  // Borrar todas las citas
  deleteAllAppointment() {
    return this.storage.executeSql('delete FROM appointments', [])
      .then(_ => {
        this.getAppointments();
      });
  }
}
