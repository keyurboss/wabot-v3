import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textSearchFromJsonArray',
})
export class TextSearchFromJsonArrayPipe implements PipeTransform {
  transform(value: any[], search_key: string, search_text = ''): any[] {
    if (typeof search_text === 'undefined' || search_text === '') {
      return value;
    }
    search_text = search_text.toLowerCase();
    return value.filter((a, i) => {
      if (typeof a.index === 'undefined') {
        a.index = i;
      }
      return a[search_key].toString().toLowerCase().includes(search_text);
    });
  }
}
