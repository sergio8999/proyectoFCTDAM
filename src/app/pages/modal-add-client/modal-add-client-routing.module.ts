import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalAddClientPage } from './modal-add-client.page';

const routes: Routes = [
  {
    path: '',
    component: ModalAddClientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalAddClientPageRoutingModule {}
