import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentService } from '../../../services/content.service';
import { VannilaService } from '../../../services/vannila.service';

@Component({
  selector: 'app-remove-numbers-pop',
  templateUrl: './remove-numbers-pop.component.html',
  styleUrls: ['./remove-numbers-pop.component.scss'],
})
export class RemoveNumbersPopComponent {
  From = 0;
  To = 0;
  constructor(
    private cont: ContentService,
    private dialogRef: MatDialogRef<any>
  ) {}
  RemoveNumbers() {
    if (
      !this.From ||
      this.From === null ||
      typeof this.From === 'undefined' ||
      !this.To ||
      this.To === null ||
      typeof this.To === 'undefined' ||
      this.From > this.To
    ) {
      VannilaService.swal.fire('Error', 'Please Enter Valid Range', 'error');
      return;
    }
    const table = JSON.parse(JSON.stringify(this.cont.table));
    table.splice(this.From - 1, this.To - this.From + 1);
    this.cont.UpdateData(table);
    this.dialogRef.close();
  }
}
