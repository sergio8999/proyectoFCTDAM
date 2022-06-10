import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaterialDashboardPageRoutingModule } from './material-dashboard-routing.module';

import { MaterialDashboardPage } from './material-dashboard.page';
import { SearchTextPipe } from 'src/app/pipes/search-text.pipe';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialDashboardPageRoutingModule,
    PipesModule,
    TranslateModule
  ],
  declarations: [
    MaterialDashboardPage
  ]
})
export class MaterialDashboardPageModule {}
