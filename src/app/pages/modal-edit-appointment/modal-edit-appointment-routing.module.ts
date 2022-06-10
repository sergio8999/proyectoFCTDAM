import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalEditAppointmentPage } from './modal-edit-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: ModalEditAppointmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalEditAppointmentPageRoutingModule {}
