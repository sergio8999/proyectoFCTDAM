import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-avatar-selector',
  templateUrl: './avatar-selector.component.html',
  styleUrls: ['./avatar-selector.component.scss'],
})
export class AvatarSelectorComponent implements OnInit {

  @Output() avatarSel = new EventEmitter<string>();
  @Input() avatarActual = 'av-1.png';

  // Array con todas los avatar, y la variable seeccionado a false, para asi saber cual esta seleccionado.
  avatars = [
    {
      img: 'av-1.png',
      seleccionado: true
    },
    {
      img: 'av-2.png',
      seleccionado: false
    },
    {
      img: 'av-3.png',
      seleccionado: false
    },
    {
      img: 'av-4.png',
      seleccionado: false
    },
    {
      img: 'av-5.png',
      seleccionado: false
    },
    {
      img: 'av-6.png',
      seleccionado: false
    },
    {
      img: 'av-7.png',
      seleccionado: false
    },
    {
      img: 'av-8.png',
      seleccionado: false
    },
  ];

  avatarSlide = {
    slidesPerView: 3.5
  };

  constructor() { }

  ngOnInit() {

    // Recorre los avartar poniendolos todos a false
    this.avatars.forEach(avatar => avatar.seleccionado = false);

    // En caso de corresponter el avatar seleccionado con la imagen, pone a true el correspondiente avatar.
    for (const avatar of this.avatars) {
      if (avatar.img === this.avatarActual) {
        avatar.seleccionado = true;
        break;
      }
    }
  }

  // Al seleccionar el avatar, pone a todos falsos, el que esta marcado a true y manda la imagen al oro componente.
  seleccionarAvatar(avatar) {
    this.avatars.forEach(av => av.seleccionado = false);
    avatar.seleccionado = true;

    this.avatarSel.emit(avatar.img);
  }

}
