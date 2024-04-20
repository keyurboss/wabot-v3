import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateDays',
})
export class CalculateDaysPipe implements PipeTransform {
  transform(value: number): number {
    // return null;
    return Math.floor((value - Date.now()) / 86400000);
  }
}
