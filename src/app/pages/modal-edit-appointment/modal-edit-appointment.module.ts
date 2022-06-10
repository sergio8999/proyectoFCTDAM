import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalEditAppointmentPageRoutingModule } from './modal-edit-appointment-routing.module';

import { ModalEditAppointmentPage } from './modal-edit-appointment.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalEditAppointmentPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [ModalEditAppointmentPage]
})
export class ModalEditAppointmentPageModule {}
