import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAddAppointmentPage } from './modal-add-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAddAppointmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAddAppointmentPageRoutingModule {}
