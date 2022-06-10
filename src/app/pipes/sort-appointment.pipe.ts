import { Pipe, PipeTransform } from '@angular/core';
import { Appointment } from '../interfaces/Appointmen.interface';

@Pipe({
  name: 'sortAppointment'
})
export class SortAppointmentPipe implements PipeTransform {

  // Pasandole como parametro un array de citas, devuelve las citas ordenadas por horas
  transform( appointments: Appointment[] ): Appointment[] {
    
    return appointments.sort(function compare(a ,b) {
      return a['hour'] < b['hour'] ? -1 : a['hour'] > b['hour'] ? 1: 0;
    }); 
  }

}
