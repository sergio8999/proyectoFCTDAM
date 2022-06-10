import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, doc, Firestore, getDocs, setDoc, updateDoc } from '@angular/fire/firestore';
import { Appointment } from '../interfaces/Appointmen.interface';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor( private ags: AngularFirestore, private firestore: Firestore ) { }

  // Obtiene todas las citas por búsqueda de un dia. Observable
  getAppointment(day: string ) {
    return this.ags.collection('appointments', ref => ref.where('day', '==', day)).valueChanges({ idField: 'id' });
  }

  // Obtiene todas las citas
  getAppointments( ) {
    return getDocs(collection( this.firestore,'appointments'));
  }

  // Añadir cita, asignandole el dia y la hora como id
   async addAppointment( appointment: Appointment){
     try{
      const appointments = doc(this.firestore,`appointments/${appointment.day.replaceAll('/', '-') + appointment.hour}`);
      await setDoc(appointments, appointment);
       return appointments;
     }catch(e){
       return e.code;
     }     
  }

  // Borrar cita pasando cmo parametro un objeto de cita
  deleteAppointment( appointment: Appointment) {
    try{
      return this.ags.collection('appointments').doc(`${appointment.day.replaceAll('/', '-') + appointment.hour}`).delete();
    }catch(e) {
      return e.code;
    }
  }

  // Actualizar cita, asigna una nueva cita correspondiente al nuevo id y borrando la anterior
  updateAppointment( oldAppointment: Appointment , appointment: Appointment ){
    try{
      this.addAppointment(appointment);
      this.deleteAppointment(oldAppointment);
    }catch(e) {
      return e.code;
    }
  }
  
  updateAppointmentDescription(appointment: Appointment, description: string) {
    try {
      return this.ags.collection('appointment').doc(`${appointment.day.replaceAll('/', '-') + appointment.hour}`).update({
        description: description
      });
    } catch (e) {
      return e.code;
    }
  }
}
