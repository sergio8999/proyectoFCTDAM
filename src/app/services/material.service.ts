import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, doc, Firestore, getDocs, setDoc } from '@angular/fire/firestore';
import { Material } from '../interfaces/Material.interface';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {

  constructor(private ags: AngularFirestore, private firestore: Firestore) { }

  // Obtener todos los materiales. Observable
  getMaterials() {
    return this.ags.collection('materials').valueChanges({ idField: 'id' });
  }

  // Obtener lista materiales
  queryGetMaterials() {
    return getDocs(collection(this.firestore, 'materials'));
  }

  // Actualizar material
  updateMaterial(name: string, stock: number, id: string) {
    try {
      return this.ags.collection('materials').doc(id).update({ name: name, stock: stock });
    } catch (e) {
      return e.code;
    }
  }

  // Actualizar stock material 
  updateMaterialStock(stock: number, id: string) {
    try {
      return this.ags.collection('materials').doc(id).update({ stock: stock });
    } catch (e) {
      return e.code;
    }
  }

  // Actualizar material, añade y borra la anterior, ya que uso su nombre como id
  updateMaterialId(oldMaterial: Material, stock: number, name: string) {
    try {
      const material = this.addMaterial({ name: name, stock: stock });
      this.deleteMaterial(oldMaterial);
      return material;
    } catch (e) {
      return e.code;
    }
  }

  // Añadir material
  async addMaterial(material: Material) {
    try {
      const materials = doc(this.firestore, `materials/${material.name.replaceAll('/', '-')}`);
      await setDoc(materials, material);
      return materials;
    } catch (e) {
      return e.code;
    }
  }

  // Borrar material
  deleteMaterial(material: Material) {
    try {
      return this.ags.collection('materials').doc(material.id).delete();
    } catch (e) {
      return e.code;
    }
  }
}
