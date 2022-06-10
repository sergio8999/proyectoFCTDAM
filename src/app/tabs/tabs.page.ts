import { Component, OnInit, Renderer2 } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  loading: HTMLIonLoadingElement;

  rol:string = 'empleado';

  // Visualiza 3,5 tabs en la parte inferior
  avatarSlide = {
    slidesPerView: 3.5
  };

  constructor( private storage: Storage,
               private renderer: Renderer2,
               private translate: TranslateService,
             ) {
  }
  async ngOnInit(): Promise<void> {

    // Carga el idioma por defecto = español
    this.translate.setDefaultLang('es');

    // Vrea el storage
    await this.storage.create();

    // Obtiene los datos del storage
    const mode = await this.storage.get('color-theme');
    const language = await this.storage.get('language');
    const user = await this.storage.get('user');

    // Si hay idioma en el stoage lo pone y sino por defecto toma español
    language == null ? this.translate.use('es') : this.translate.use(language);
    this.rol = user.rol;

    // Si exite modo en el storage lo asigna sino por decto es light
    if( mode != null){
      mode == 'dark' ? this.renderer.setAttribute(document.body,'color-theme', 'dark') : this.renderer.setAttribute(document.body,'color-theme', 'light');
    }else{
      this.storage.set('color-theme', 'light')
    }

  } 

}
