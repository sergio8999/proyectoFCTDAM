import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../interfaces/User.interface';
import { DbService } from '../services/db.service';
import { UserService } from '../services/user.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  user: User;
  selected = false;
  changeAvatar: boolean = false;
  avatar: string;
  language: string = 'es';

  constructor(
    private router: Router,
    public toastController: ToastController,
    private storage: Storage,
    private renderer: Renderer2,
    private userService: UserService,
    private translate: TranslateService,
    private utilService: UtilsService,
    private db: DbService) { }


  async ngOnInit(): Promise<void> {

    // Obtiene del storage el idioma elegido
    const language = await this.storage.get('language');

    // Si no hay idioma guardado, se selecciona español
    language == null ? this.language == 'es' : this.language = language;

    // Obtiene del storage el modo de vista del usuario
    const mode = await this.storage.get('color-theme');

    // Si el modo es oscuro ( dark ) la variable selected es true
    if (mode == 'dark') {
      this.selected = true;
    }

    // Obtengo el usuario guardado en el storage
    this.user = await this.storage.get('user');

    // Asigno a la variable avatar el del usuario
    this.avatar = this.user.avatar;
  }

  // Metodo para salir el usuario/ empleado y borrar las preferencias del storage
  logout() {
    this.router.navigateByUrl('', { replaceUrl: true });
    this.renderer.setAttribute(document.body, 'color-theme', 'light');
    this.utilService.presentToast('Cerrada sesión correctamente');
    this.storage.remove('language');
    this.storage.remove('user');
  }

  // Cambia la vista segun el modo seleccionado y lo guarda en el storage
  changeMode(event) {
    if (event.detail.checked) {
      this.renderer.setAttribute(document.body, 'color-theme', 'dark');
      this.storage.set('color-theme', 'dark');
    } else {
      this.renderer.setAttribute(document.body, 'color-theme', 'light');
      this.storage.set('color-theme', 'light');
    }
  }

  // Actualiza el avatar del usuario en Firebase y la base de datos local
  async updateAvatar() {
    const user = this.userService.updateAvatar(this.user.dni, this.avatar);
    this.db.updateAvatarUser(this.user.dni, this.avatar);
    if (typeof (user) == 'object') {
      this.utilService.presentToast('Actualizado avatar');
      const changeUserAvatar: User = {
        id: this.user.id,
        name: this.user.name,
        email: this.user.email,
        rol: this.user.rol,
        dni:this.user.dni,
        avatar: this.avatar,
        password: this.user.password,
        help: this.user.help
      }
      await this.storage.set('user', changeUserAvatar);
      this.user = changeUserAvatar;
    } else {
      this.utilService.presentToast('Error al actualizar avatar');
    }
    this.changeAvatar = false;
  }

  // Al presionar cancelar asigna el avatar que tenia el usuario
  cancelUpdate() {
    this.avatar = this.user.avatar;
    this.changeAvatar = false;
  }

  // Actualiza el idioma elegido y lo guarda en el storage
  updateLanguage() {
    this.translate.use(this.language);
    this.storage.set('language', this.language);
  }

}
