import { Component, OnInit, ViewChild } from '@angular/core';
import { Network } from '@capacitor/network';
import { AlertController, IonList } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Material } from 'src/app/interfaces/Material.interface';
import { DbService } from 'src/app/services/db.service';
import { MaterialService } from 'src/app/services/material.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-material-dashboard',
  templateUrl: './material-dashboard.page.html',
  styleUrls: ['./material-dashboard.page.scss'],
})
export class MaterialDashboardPage implements OnInit {

  @ViewChild(IonList) ionList: IonList;

  text: string = '';
  materials: any[] = [];
  status: boolean;
  materialsFirebase;
  materialsDB;

  constructor(
    private materialService: MaterialService,
    public alertController: AlertController,
    public translate: TranslateService,
    private db: DbService,
    private utilService: UtilsService) { }

  ngOnInit() {
    this.checkConexion();
  }

  // Detecta el cambio de valor en el input
  onSearchChange(evento: any) {
    this.text = evento.detail.value;
  }


  // Comprueba la conexión actual, deja escuchando los cambios de dicha conexión y carga los materiales segun el estado de la conexión
  checkConexion() {
    Network.getStatus().then(status => {
      status.connected ? this.status = true : this.status = false;
      this.loadMaterials();
    });

    Network.addListener('networkStatusChange', status => status.connected ? this.status = true : this.status = false);
  }

  // Carga los materiales de la base de datos y de la base de datos local
  loadMaterials() {
    this.materialService.getMaterials().subscribe(materials => {
      if (this.status)
        this.materials = materials;
    });

    this.db.fetchhMaterials().subscribe(item => {
      if (!this.status)
        setTimeout(() => {
          this.materials = item;
        }, 200);
    })
  }

  /*
    Crea y muestra un alert dialog, utilizado tanto para editar como crear el material.
    Para editar rellena los campos con los valores del material. 
    Tanto para añadir como para actualizar comprueba que el nombre del material no se encuentra en la base de datos.
  */
  async presentAlertPrompt(material?: Material) {
    console.log(material);
    this.ionList.closeSlidingItems();
    const alert = await this.alertController.create({
      backdropDismiss: false,
      cssClass: 'my-custom-class',
      header: material == undefined ? this.translate.instant('materials.addMaterial') : this.translate.instant('materials.updateMaterial'),
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: this.translate.instant('comun.name'),
          value: material == undefined ? '' : material.name
        },
        {
          name: 'stock',
          placeholder: 'stock',
          type: 'number',
          min: 0,
          value: material == undefined ? '' : material.stock
        },
      ],
      buttons: [
        {
          text: this.translate.instant('comun.cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: this.translate.instant('comun.confirm'),
          // Comprueba lso datos para añadir o actualizar los materiales
          handler: (data: any) => {
            let nameMaterial: string = data.name;
            nameMaterial = this.utilService.toCapitalize(nameMaterial);
            if ((nameMaterial != '' && data.stock != '')) {
              if (this.isInt(data.stock) && data.stock) {
                if (data.stock >= 0) {
                  if (material == undefined && this.checkName(nameMaterial).length == 0) {
                    this.addMaterialsDB(nameMaterial, parseInt(data.stock));
                    this.addMaterial(nameMaterial, parseInt(data.stock));
                  } else if (material != undefined && material.name == nameMaterial) {
                    this.updateMaterialsDB(material.name, nameMaterial, parseInt(data.stock));
                    const materialUpdateStock = this.materialService.updateMaterialStock(parseInt(data.stock), material.id);
                    this.utilService.presentToast(this.translate.instant('materials.confirmUpdateMaterial'));
                  } else if (this.checkName(nameMaterial).length == 0) {
                    this.updateMaterialsDB(material.name, nameMaterial, parseInt(data.stock));
                    this.updateMaterial(material, parseInt(data.stock), nameMaterial);
                  } else {
                    this.utilService.presentToast(this.translate.instant('materials.exist'));
                    return false;
                  }
                } else {
                  this.utilService.presentToast(this.translate.instant('materials.positiveNumber'));
                  return false;
                }
              } else {
                this.utilService.presentToast(this.translate.instant('materials.numInt'));
                return false;
              }
            } else {
              this.utilService.presentToast(this.translate.instant('comun.emptyInput'));
              return false;
            }

          }
        }
      ]
    });

    await alert.present();
  }

  // Muestra el modal para confirmar la eliminación del material
  delete(material: Material) {
    this.presentAlertMultipleButtons(material);
  }

  // Añade el material a la base de datos local
  addMaterialsDB(name, stock) {
    this.db.addMaterial(name, stock).then((res) => {
    });
  }

  // Actualiza el material en la base de datos local
  updateMaterialsDB(idName, name, stock) {
    this.db.updateMaterial(idName, name, stock).then((res) => {
    })
  }

  // Borra el material de la base de datos local
  deleteMaterialDB(name) {
    this.db.deleteMaterial(name).then((res) => {
    })
  }

  // Alert dialog donde pide la confirmación para borrar el material. En caso de ser ok, borra el material avisando con un toast
  async presentAlertMultipleButtons(material: Material) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: material.name,
      subHeader: `stock: ${material.stock}`,
      message: this.translate.instant('materials.delete'),
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.deleteMaterialDB(material.name);
            const message = this.materialService.deleteMaterial(material);
            if (typeof (message) == 'object') {
              this.utilService.presentToast(this.translate.instant('materials.confirmDelete'));
            } else {
              this.utilService.presentToast(this.translate.instant('materials.errorDelete'));
            }
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'rojo',
          handler: () => {
            this.ionList.closeSlidingItems();
          }
        }
      ]
    });

    await alert.present();
  }

  // Añadir material a base de datos firebase, mostrando mensaje
  addMaterial(name: string, stock: number) {
    const material = this.materialService.addMaterial({
      name: name,
      stock: stock
    });
    if (typeof (material) == 'object') {
      this.utilService.presentToast(this.translate.instant('materials.confirmAddMaterial'));
    } else {
      this.utilService.presentToast(this.translate.instant('materials.errorAddMaterial'));
    }
  }

  // Actualizar material a base de datos firebase, mostrando mensaje
  updateMaterial(materialUpdate: Material, stock: number, name: string) {
    const material = this.materialService.updateMaterialId(materialUpdate, stock, name);
    if (material == undefined) {
      this.utilService.presentToast(this.translate.instant('materials.confirmUpdateMaterial'));
    } else {
      this.utilService.presentToast(this.translate.instant('materials.errorUpdateMaterial'));
    }
  }

  // Comprueba si el nombre existe ya en el array de matriales
  checkName(name: string) {
    return this.materials.filter(material => material.name == name);
  }

  // comprueba si el numero es entero, devolviendo true o false
  isInt(number: number) {
    return number % 1 == 0;
  }

}
