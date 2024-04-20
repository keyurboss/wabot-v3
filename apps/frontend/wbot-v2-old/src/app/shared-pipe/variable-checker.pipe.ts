import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'variableChecker',
})
export class VariableCheckerPipe implements PipeTransform {
  transform(value: string): boolean {
    const regExp = new RegExp(/({{var[123456]}})/, 'gm');
    if (regExp.test(value)) {
      return true;
    }
    return false;
  }
}
