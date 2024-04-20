import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-import-checkbox',
  templateUrl: './import-checkbox.component.html',
  styleUrls: ['./import-checkbox.component.scss'],
})
export class ImportCheckboxComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { c: boolean; m: boolean; e: boolean }
  ) {}
}
