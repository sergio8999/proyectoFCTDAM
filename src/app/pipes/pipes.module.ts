import { NgModule } from '@angular/core';

import { SortAppointmentPipe } from './sort-appointment.pipe';
import { SearchTextPipe } from './search-text.pipe';



@NgModule({
  declarations: [
    SortAppointmentPipe,
    SearchTextPipe
  ],
  exports: [
    SortAppointmentPipe,
    SearchTextPipe
  ]
})
export class PipesModule { }
