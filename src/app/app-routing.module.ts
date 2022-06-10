import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'modal-add-appointment',
    loadChildren: () => import('./pages/modal-add-appointment/modal-add-appointment.module').then( m => m.ModalAddAppointmentPageModule)
  },
  {
    path: 'modal-edit-appointment',
    loadChildren: () => import('./pages/modal-edit-appointment/modal-edit-appointment.module').then( m => m.ModalEditAppointmentPageModule)
  },
  {
    path: 'modal-add-client',
    loadChildren: () => import('./pages/modal-add-client/modal-add-client.module').then( m => m.ModalAddClientPageModule)
  }
 
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
