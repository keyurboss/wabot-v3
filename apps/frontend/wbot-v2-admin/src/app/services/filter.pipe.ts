import { Pipe, PipeTransform } from '@angular/core';
import { UserInterface } from './home.service';
interface combined extends UserInterface {
  cid?: string;
}
@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(inputs: combined[] | null, searchString: string): combined[] {
    if (inputs === null) {
      return [];
    }
    if (inputs.length === 0 || searchString === '') {
      return inputs.length === 0 ? [] : inputs;
    }
    searchString = searchString.toString().toLocaleLowerCase();
    const filteredUsers: any[] = [];
    for (const u of inputs) {
      if (typeof u.name === 'undefined') {
        continue;
      }
      if (u.name.toLocaleLowerCase().includes(searchString)) {
        filteredUsers.push(u);
      } else if (
        u.number.toString().toLocaleLowerCase().includes(searchString)
      ) {
        filteredUsers.push(u);
      } else if (u.type.toLocaleLowerCase().includes(searchString)) {
        filteredUsers.push(u);
      } else if (u.status.toLocaleLowerCase().includes(searchString)) {
        filteredUsers.push(u);
      }
    }
    return filteredUsers;
  }
}
