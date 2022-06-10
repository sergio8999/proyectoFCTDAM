import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalUserPage } from './modal-user.page';

const routes: Routes = [
  {
    path: '',
    component: ModalUserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalUserPageRoutingModule {}
