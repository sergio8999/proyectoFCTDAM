import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Tab5Page } from './tab5.page';

const routes: Routes = [
  {
    path: '',
    component: Tab5Page,
    children: [
      {
        path: '',
        redirectTo:'home-dashboard',
        pathMatch: 'full'
      },
      {
        path: 'employee',
        loadChildren: () => import('../pages/employee/employee.module').then(m => m.EmployeePageModule)
      },
      {
        path: 'material-dashboard',
        loadChildren: () => import('../pages/material-dashboard/material-dashboard.module').then( m => m.MaterialDashboardPageModule)
      },
      {
        path: 'home-dashboard',
        loadChildren: () => import('../pages/home-dashboard/home-dashboard.module').then( m => m.HomeDashboardPageModule)
      }
    
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Tab5PageRoutingModule { }
