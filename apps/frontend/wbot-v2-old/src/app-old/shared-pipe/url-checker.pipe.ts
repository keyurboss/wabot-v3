/* eslint-disable no-useless-escape */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urlChecker',
})
export class UrlCheckerPipe implements PipeTransform {
  transform(value: any): boolean {
    const regExp = new RegExp(
      /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)/
    );
    if (regExp.test(value)) {
      return true;
    }
    return false;
  }
}
