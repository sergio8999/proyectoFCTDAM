import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAddClientPageRoutingModule } from './modal-add-client-routing.module';

import { ModalAddClientPage } from './modal-add-client.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalAddClientPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [ModalAddClientPage]
})
export class ModalAddClientPageModule {}
