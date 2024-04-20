import { Pipe, PipeTransform } from '@angular/core';
import { UserInterface } from './home.service';

@Pipe({
  name: 'sortArray',
})
export class SortArrayPipe implements PipeTransform {
  transform(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any[],
    key_name: string,
    direction: 'asc' | 'desc' = 'asc'
  ): UserInterface[] {
    switch (key_name) {
      case 'Name':
        key_name = 'name';
        break;
      case 'Number':
        key_name = 'number';
        break;
      case 'Type':
        key_name = 'type';
        break;
      case 'Created On':
        key_name = 'created_at';
        break;
      case 'Expires On':
        key_name = 'expire_at';
        break;
      case 'Status':
        key_name = 'status';
        break;
      default:
        return value;
    }
    if (direction === 'asc') {
      if (['name', 'type', 'status'].includes(key_name)) {
        return value.sort((a, b) =>
          a[key_name].toLowerCase() > b[key_name].toLowerCase() ? 1 : -1
        );
        // return value.sort((a,b)=> a[key_name.localeCompare(b[key_name],'en',{caseFirst:'false'})])
      }
      return value.sort((a, b) => a[key_name] - b[key_name]);
    } else {
      if (['name', 'type', 'status'].includes(key_name)) {
        return value.sort((a, b) =>
          a[key_name].toLowerCase() < b[key_name].toLowerCase() ? 1 : -1
        );
        // return value.sort((a,b)=> b[key_name.localeCompare(a[key_name],'en',{caseFirst:'false'})])
      }
      return value.sort((a, b) => b[key_name] - a[key_name]);
    }
  }
}
