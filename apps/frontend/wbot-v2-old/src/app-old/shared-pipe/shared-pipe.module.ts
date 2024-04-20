import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculateDaysPipe } from './calculate-days.pipe';
import { FilterPipe } from './filter.pipe';
import { UrlCheckerPipe } from './url-checker.pipe';
import { VariableCheckerPipe } from './variable-checker.pipe';

const pipes = [
  CalculateDaysPipe,
  FilterPipe,
  UrlCheckerPipe,
  VariableCheckerPipe,
];
@NgModule({
  declarations: pipes,
  imports: [CommonModule],
  exports: pipes,
})
export class SharedPipeModule {}
