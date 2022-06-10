import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalUserPageRoutingModule } from './modal-user-routing.module';

import { ModalUserPage } from './modal-user.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalUserPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [ModalUserPage]
})
export class ModalUserPageModule {}
