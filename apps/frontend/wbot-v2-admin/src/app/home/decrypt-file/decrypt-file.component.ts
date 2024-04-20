import { Component } from '@angular/core';
import { FirebaseFunctionsService } from '@wbotv2/services';
import { utils, writeFile } from 'xlsx';
import { HomeService } from '../../services/home.service';
@Component({
  selector: 'wbot-v2-nx-decrypt-file',
  templateUrl: './decrypt-file.component.html',
  styleUrls: ['./decrypt-file.component.scss'],
})
export class DecryptFileComponent {
  filePath = '';
  constructor(private fireFuncServ: FirebaseFunctionsService) {}
  str2ab(str: string) {
    const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  async convertFile() {
    const r: HTMLInputElement & {
      files: File[];
    } = document.getElementById('finp') as any;
    if (
      r.files?.length !== 0 &&
      r.files[0] !== null &&
      typeof r.files[0] !== 'undefined'
    ) {
      const Wbot = r.files[0];
      const T = await Wbot.text();
      const decryptedData = JSON.parse(
        await this.fireFuncServ.CallFunctions('DecryptFileFunc', T)
      );
      this.createExcel(decryptedData.number);
    }
  }

  async createExcel(tableData: any) {
    const wb = utils.book_new();
    wb.SheetNames.push('Sheet1');
    const xSheet = utils.json_to_sheet(tableData, {
      skipHeader: true,
    });
    wb.Sheets['Sheet1'] = xSheet;
    try {
      writeFile(wb, 'Decry.xlsx');
      HomeService.swal.fire('File saved', '', 'success');
    } catch (e) {
      console.log(e);
      HomeService.swal.fire('Error', 'check log', 'error');
    }
  }
}
