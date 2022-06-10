import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchText'
})
export class SearchTextPipe implements PipeTransform {

  // Pasando un array, un texto, y el nombre de la columna de la tabla, devuelve un array con los campos que se encuentren en el texto
  transform(array: any[], text: string = '', column: string = 'fullName'): any[] {
    
    if( text === '' ){
      return array;
    };

    if( !text ) {
      return array;
    };

    text = text.toLowerCase();
    return array.filter( item => item[column].toLowerCase().includes( text ));
  }
}
