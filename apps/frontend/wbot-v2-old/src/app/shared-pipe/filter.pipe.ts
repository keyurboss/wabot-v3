import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value: any, filteredString: string, selectedOption: string) {
    if (value.length === 0 || filteredString === '') {
      return value.length === 0 ? [] : value;
    }
    const myCon: string[] = [];
    if (selectedOption == 'sgroup') {
      const regExp = new RegExp(filteredString);
      for (const con of value) {
        if (regExp.test(con)) {
          myCon.push(con);
        }
      }
      return myCon;
    } else if (selectedOption == 'search') {
      for (const con of value) {
        if (
          con.name
            .toLocaleLowerCase()
            .includes(filteredString.toLocaleLowerCase())
        ) {
          myCon.push(con);
        }
      }
    } else if (selectedOption == 'startswith') {
      for (const con of value) {
        if (
          con.name
            .toLocaleLowerCase()
            .startsWith(filteredString.toLocaleLowerCase())
        ) {
          myCon.push(con);
        }
      }
    } else if (selectedOption == 'endswith') {
      for (const con of value) {
        if (
          con.name
            .toLocaleLowerCase()
            .endsWith(filteredString.toLocaleLowerCase())
        ) {
          myCon.push(con);
        }
      }
    } else if (selectedOption == 'regexPipe') {
      try {
        const regExp = new RegExp(filteredString, 'i');
        for (const con of value) {
          if (regExp.test(con.name)) {
            myCon.push(con);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    return myCon;
  }
}
