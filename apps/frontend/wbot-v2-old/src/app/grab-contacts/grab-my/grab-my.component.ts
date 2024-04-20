import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { BasicService } from '../../services/basic.service';
import {
  contactListType,
  GrabGroupsContactsService,
} from '../../services/grab-groups-contacts.service';
import { BlacklistService } from '../../services/blacklist.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { VannilaService } from '../../services/vannila.service';
import { ElectronNativeService } from '../../services/Electron.Native.service';
import { ContentService } from '../../services/content.service';

// import { con } from '../contacts';
interface VirtualScroll extends CdkVirtualScrollViewport {
  RefFunc: (offset: number, to?: 'to-start' | 'to-end') => void;
}
@Component({
  selector: 'app-grab-my',
  templateUrl: './grab-my.component.html',
  styleUrls: ['./grab-my.component.scss'],
})
export class GrabMyComponent {
  isFetchContacts = false;
  // selectedOption = (<HTMLSelectElement>document.getElementById('srchDrop')).value;
  selectedOption = 'startswith';
  myContacts: contactListType[] = [];
  titles = ['Number', 'Name', 'Add to Blacklist'];
  conLen = 0;
  blacklistedNumbers!: Observable<any[]>;
  filteredString = '';
  replaceString = '';
  allSelected = false;
  offset = 0;
  private FilterPipeObj: any;
  @ViewChild('virtualScrollRef') VirtualScollEle!: VirtualScroll;
  constructor(
    private cha: ChangeDetectorRef,
    private basic: BasicService,
    private grabServ: GrabGroupsContactsService,
    private blackServ: BlacklistService,
    private elec: ElectronNativeService,
    private contServ: ContentService
  ) {
    this.FilterPipeObj = basic.FilterPipeInstance;
    this.blacklistedNumbers = blackServ.BlackListObser;
  }
  private AddVirtualRef() {
    this.VirtualScollEle.RefFunc =
      this.VirtualScollEle.setRenderedContentOffset;
    this.VirtualScollEle.setRenderedContentOffset = (a: number) => {
      if (this.offset !== -1 * a) {
        this.offset = -1 * a;
      }
      this.VirtualScollEle.RefFunc(a);
      this.cha.detectChanges();
    };
  }
  clearContacts() {
    this.isFetchContacts = false;
    this.myContacts = [];
    this.selectedOption = 'startswith';
    this.conLen = 0;
    this.filteredString = '';
    this.replaceString = '';
    this.allSelected = false;
  }
  async fetchCon() {
    this.myContacts = await this.grabServ.getMyContacts();
    if (this.myContacts.length > 0) {
      this.isFetchContacts = true;
      this.conLen = this.myContacts.length;
      setTimeout(() => this.AddVirtualRef());
    }
    const bNum: string[] = [];
    await firstValueFrom(
      this.blacklistedNumbers.pipe(
        map((a) => {
          a.forEach((c) => {
            bNum.push(c.toString());
          });
        })
      )
    );
    this.myContacts.forEach((c) => {
      if (bNum.includes(c.contact.toString())) {
        c.blacklisted = true;
      }
    });
  }
  onBlacklistClick(id: number) {
    this.myContacts[id]['blacklisted'] = !this.myContacts[id]['blacklisted'];
    if (this.myContacts[id]['blacklisted'] === true) {
      this.blackServ.addNumber(this.myContacts[id]['contact'], true);
    } else {
      this.blackServ.DeleteNumber(this.myContacts[id]['contact'], true);
    }
  }
  selectAllClick() {
    this.allSelected = !this.allSelected;

    const FilterdContcts: any[] = this.FilterPipeObj.transform(
      this.myContacts,
      this.filteredString,
      this.selectedOption
    );
    FilterdContcts.forEach((a) => (a.selected = this.allSelected));
  }
  onSlct(a: string) {
    this.selectedOption = a;
  }
  replaceOnSave(rplc: string) {
    const FilterdContcts: any[] = this.FilterPipeObj.transform(
      this.myContacts,
      this.filteredString,
      this.selectedOption
    );
    if (this.selectedOption == 'startswith') {
      this.filteredString = '^' + this.filteredString;
    }
    if (this.selectedOption == 'endswith') {
      this.filteredString = this.filteredString + '$';
    }
    const regExp = new RegExp(this.filteredString, 'i');
    for (const c of FilterdContcts) {
      if (c.selected == true) {
        c.name = c.name.replace(regExp, rplc);
      }
    }
  }
  async saveTo(savetype: 'file' | 'table') {
    if (this.replaceString.length > 0) {
      this.replaceOnSave(this.replaceString);
      this.replaceString = '';
      this.filteredString = '';
    }
    const arrayToWrite = this.myContacts.filter((a) => a.selected === true);
    if (arrayToWrite.length === 0) {
      const tmpTitle = 'No data to add to ' + savetype;
      VannilaService.swal.fire(tmpTitle, '', 'warning');
      return;
    }
    let path = '';
    if (savetype === 'file') {
      const result = await this.basic.saveFile({
        properties: [
          'createDirectory',
          'showOverwriteConfirmation',
          'dontAddToRecent',
        ],
        title: 'Export File as xlsx',
        filters: [
          {
            name: 'Excel Sheet',
            extensions: ['xlsx', 'xls'],
          },
        ],
      });
      if (result.canceled === true || typeof result.filePath === 'undefined') {
        return VannilaService.swal
          .fire({
            title: 'File not saved',
            text: 'Do you want to save the file?',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'NO',
            showConfirmButton: true,
            confirmButtonText: 'YES',
          })
          .then((result: { isConfirmed: any }) => {
            if (result.isConfirmed) {
              this.saveTo(savetype);
            }
          });
      }
      path = result.filePath;
    }
    if (savetype === 'file') {
      const wb = this.elec.GetXlsxUtils().book_new();
      wb.SheetNames.push('Sheet1');
      const xSheet = this.elec
        .GetXlsxUtils()
        .aoa_to_sheet(arrayToWrite.map((a) => [a.contact, a.name]));
      wb.Sheets['Sheet1'] = xSheet;
      this.elec.WriteXLSX(wb, path, {
        type: 'base64',
        bookType: 'xlsx',
      });
      VannilaService.swal.fire('File saved', '', 'success');
    } else if (savetype === 'table') {
      this.contServ.AddData(
        arrayToWrite.map((a) => {
          return { number: a.contact, var1: a.name };
        })
      );
      VannilaService.swal.fire('Contacts added to table', '', 'success');
    }
  }
}
