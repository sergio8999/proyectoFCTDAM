import { Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';



@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit, DoCheck {

  title = 'Dashboard'
  constructor(private menu: MenuController, private routes: Router) { }

  // Cuando hay cambios en el tabs, asigna a title el nombre del componente en la vista
  ngDoCheck(): void {
    if (this.routes.url == '/tabs/tab5/home-dashboard')
      this.title = 'Dashboard'
  }


  ngOnInit() {

  }

  // Abre el menú desplegable
  openFirst() {
    this.menu.isOpen().then(state => {
      if (state) {
        this.menu.close('first');
      } else {
        this.menu.open('first');
      }
    })
  }

  // Cierra el menú
  openEnd() {
    this.menu.open('end');
  }
}
