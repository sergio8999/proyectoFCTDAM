import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAddAppointmentPageRoutingModule } from './modal-add-appointment-routing.module';

import { ModalAddAppointmentPage } from './modal-add-appointment.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalAddAppointmentPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [ModalAddAppointmentPage]
})
export class ModalAddAppointmentPageModule {}
