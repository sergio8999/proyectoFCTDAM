import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarSelectorComponent } from './avatar-selector/avatar-selector.component';
import { FormRegisterComponent } from './form-register/form-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormLoginComponent } from './form-login/form-login.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    AvatarSelectorComponent,
    FormRegisterComponent,
    FormLoginComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule
  ],
  exports: [
    AvatarSelectorComponent,
    FormRegisterComponent,
    FormLoginComponent,
   ]
  
})
export class ComponentsModule { }
