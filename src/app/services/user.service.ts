import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, doc, Firestore, getDocs, setDoc } from '@angular/fire/firestore';
import { User } from '../interfaces/User.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private ags: AngularFirestore, private firestore: Firestore) { }

  // Añadir usuario/empleado
  async addUser(user) {
    try {
      const users = doc(this.firestore, `users/${user.dni}`);
      await setDoc(users, user);
      return users;
    } catch (e) {
      return e.code;
    }
  }

  // Obtener todos los usuarios. Observable
  getUsers() {
    return this.ags.collection('users').valueChanges({ idField: 'id' });
  }

  // Obtener todos los usuarios
  queryGetUser() {
    const datos = getDocs(collection(this.firestore, 'users'));
    return datos;
  }

  // Obtener usuario por id. Observable
  getUser(id: string) {
    return this.ags.collection('users').doc(id).valueChanges({ idField: 'id' });
  }

  // Actualizar usuario, añade y elimina ya que el dni es la id
  async updateUser(oldUser: User, user: User) {
    try {
      this.addUser(user);
      this.deleteUser(oldUser);
    } catch (e) {
      return e.code;
    }
  }

  // Actualizar avatar
  updateAvatar(uid: string, avatar: string) {
    try {
      return this.ags.collection('users').doc(uid).update({ avatar: avatar });
    } catch (e) {
      return e.code;
    }
  }

  // Actualizar nombre y rol
  updateNameRol(uid: string, name: string, rol: string) {
    try {
      return this.ags.collection('users').doc(uid).update({ rol: rol, name: name });
    } catch (e) {
      return e.code;
    }
  }

  // Borrar usuario
  deleteUser(user: User) {
    try {
      return this.ags.collection('users').doc(user.dni).delete();
    } catch (e) {
      return e.code;
    }
  }

  // Obtener usuario por dni. Observable
  getUserByDni(dni: string) {
    return this.ags.collection('users', ref => ref.where('dni', '==', dni)).valueChanges({ idField: 'id' });
  }

  // Obtener usuario por email. Observable
  getUserByEmail(email: string) {
    return this.ags.collection('users', ref => ref.where('email', '==', email)).valueChanges({ idField: 'id' });
  }
}
