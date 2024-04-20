import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContentService } from '../../../services/content.service';

@Component({
  selector: 'app-manually-add',
  templateUrl: './manually-add.component.html',
  styleUrls: ['./manually-add.component.scss'],
})
export class ManuallyAddComponent {
  header = ['No.', 'Number', 'Var 1', 'Var 2', 'Var 3', 'Add/Remove'];
  dtkey: {
    number: number | '';
    var1: string;
    var2: string;
    var3: string;
  }[] = [
    {
      number: '',
      var1: '',
      var2: '',
      var3: '',
    },
  ];

  constructor(private contentServ: ContentService, private dialog: MatDialog) {}
  addData() {
    this.dtkey.push({
      number: '' as any,
      var1: '',
      var2: '',
      var3: '',
    });
  }
  dltData(index: number) {
    if (this.dtkey.length <= 1) {
      this.addData();
    }
    if (this.dtkey.length > 1) {
      this.dtkey.splice(index, 1);
    }
  }

  validationForNumber(event: KeyboardEvent) {
    const isNumber = event.key;
    if (isNumber === 'Backspace') {
      return;
    }
    if (isNumber === 'Tab') {
      return;
    }
    if (typeof isNumber !== 'undefined' && isNaN(+isNumber)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  addDataToTable() {
    const temp = this.dtkey.filter(
      (a) => a.number.toString().length > 0 && a.number !== ''
    );
    this.contentServ.AddData(temp);
    this.dtkey = [
      {
        number: '',
        var1: '',
        var2: '',
        var3: '',
      },
    ];
    this.dialog.closeAll();
  }
}
