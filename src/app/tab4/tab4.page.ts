import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Network } from '@capacitor/network';
import { DbService } from '../services/db.service';
import { MaterialService } from '../services/material.service';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {


  dataForm: FormGroup;
  materialsFirebase: any[] = [];
  materialsBD: any[] = [];
  disabledUpdate: boolean = true;
  materialsDb: any[] = []
  status: boolean;

  constructor(private materialService: MaterialService,
    private db: DbService,
    private utilService: UtilsService) { }

  ngOnInit() {

    //Dats formulario
    this.dataForm = new FormGroup({
      'materials': new FormArray([
      ]),
    });

    // Chequea conexión
    this.checkConexion();
  }

  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión y carga los maateriales
  checkConexion() {
    Network.getStatus().then(status => {
      status.connected ? this.status = true : this.status = false;
      this.loadMaterials();
    });

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  /*
   Carga los maateriales según el estado de Firebase o local. 
   Borra el array e inserta los item de materiales.
   Siendo el array dinámico dependiendo de los materiales del array
  */
  loadMaterials() {
    this.materialService.getMaterials().subscribe(async materials => {
      if (this.status) {
        (<FormArray>this.dataForm.controls['materials']).clear();
        this.materialsDb = materials;
        for (let material of materials) {
          this.addMaterial();
        }
      }
    });

    this.db.fetchhMaterials().subscribe(item => {
      if (!this.status) {
        (<FormArray>this.dataForm.controls['materials']).clear();

        this.materialsDb = item;
        for (let material of this.materialsDb) {
          this.addMaterial();
        }
      }
    })

  }

  // Obtiene los materiales del array del FORM
  get materials(): FormArray {
    return this.dataForm.get('materials') as FormArray;
  }

  // Actualiza el material de Firebase y de la local, restando el stock menos los usados, actualizando las base de datos
  updateMaterial() {
    try {
      for (let i = 0; i < this.materialsDb.length; i++) {
        this.dataForm.get('materials').value[i];
        if (this.materialsDb[i].stock != 0 && this.dataForm.get('materials').value[i] != 0) {
          const stock = this.materialsDb[i].stock - this.dataForm.get('materials').value[i];
          this.materialService.updateMaterial(this.materialsDb[i].name, stock, this.materialsDb[i].name);
          this.db.updateMaterial(this.materialsDb[i].name, this.materialsDb[i].name, stock)
        }
      }
      (<FormArray>this.dataForm.controls['materials']).clear();
      for (let material of this.materialsDb) {
        this.addMaterial();
      }
      this.utilService.presentToast('Materiales actualizados');

    } catch (e) {
      this.utilService.presentToast('Error al actualizar materiales');
    }

  }

  // Método para comprobar si hay materiales para quitar, de esta forma se deshabilita el botón de actualizar
  checkUpdates() {
    let empty = true;
    for (let i = 0; i < this.dataForm.get('materials').value.length; i++) {
      if (this.dataForm.get('materials').value[i] != 0) {
        empty = false;
      }
    }
    this.disabledUpdate = empty;
  }

  // Al realizar un cambio en el select, comprueba si es mayor de 0 para habilitar llamando al metodo o dehabilitarlo
  onChange(event) {
    if (event.detail.value == 0) {
      this.checkUpdates();
    } else {
      this.disabledUpdate = false;
    }
  }

  // Rellena los select desde 0 hasta el numero de stock de cada material
  fillArray(stocks) {
    let array = [];
    for (let i = 1; i <= parseInt(stocks); i++) {
      array.push(i);
    }
    return array;
  }

  // Añade un nuevo control al formulario, este método es llamado por cada material del array
  addMaterial() {
    (<FormArray>this.dataForm.controls['materials']).push(
      new FormControl('0', Validators.required)
    )
  }
}
