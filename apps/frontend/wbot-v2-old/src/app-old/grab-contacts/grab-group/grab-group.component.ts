import { Component } from '@angular/core';
import { BasicService } from '../../services/basic.service';
import { ContentService } from '../../services/content.service';
import { ElectronNativeService } from '../../services/Electron.Native.service';
import {
  GrabGroupsContactsService,
  groupListType,
} from '../../services/grab-groups-contacts.service';
import { ObsServiceService } from '../../services/obs-service.service';
import { VannilaService } from '../../services/vannila.service';
// import { groups } from '../groups';

@Component({
  selector: 'app-grab-group',
  templateUrl: './grab-group.component.html',
  styleUrls: ['./grab-group.component.scss'],
})
export class GrabGroupComponent {
  groups: groupListType[] = [];
  allSelected = false;
  searchString = '';
  isFetchGroups = false;
  selectedGroupsCount = 0;
  selectedContactsCount = 0;
  fetchedGroupsAndContacts: {
    [key: string]: number[];
  } = {};
  radioSlct = 'single';
  private FilterPipeObj: any;

  constructor(
    private basic: BasicService,
    private grabService: GrabGroupsContactsService,
    private elec: ElectronNativeService,
    private obs: ObsServiceService,
    private contServ: ContentService
  ) {
    this.FilterPipeObj = basic.FilterPipeInstance;
    this.grabService.getAllGroups().then((a) => (this.groups = a));
  }
  fetchGroups() {
    this.selectedContactsCount = 0;
    const a = this.groups.filter((a) => a.selected).map((a) => a.id);
    this.isFetchGroups = true;
    this.grabService
      .getParticipantsFromSelectedGroups(a)
      .then((result: any) => {
        this.fetchedGroupsAndContacts = result;
        for (const x in result) {
          this.selectedContactsCount += result[x].length;
        }
      });
  }

  selectAllClick() {
    const FilterdContcts: any[] = this.FilterPipeObj.transform(
      this.groups,
      this.searchString,
      'search'
    );
    this.allSelected = !this.allSelected;
    FilterdContcts.forEach((a) => {
      a.selected = this.allSelected;
    });
    this.selectedGroupsCount = this.groups.filter((a) => a.selected).length;
  }
  singleSelectClick() {
    setTimeout(() => {
      this.selectedGroupsCount = this.groups.filter((a) => a.selected).length;
    });
  }
  async saveContacts(slct = 'table' || 'single' || 'multiple') {
    if (slct === 'single' || slct === 'table') {
      let filepath = '';
      if (slct === 'single') {
        const result = await this.basic.saveFile({
          properties: [
            'createDirectory',
            'showOverwriteConfirmation',
            'dontAddToRecent',
          ],
          title: 'Export File as Xlsx',
          filters: [
            {
              name: 'Excel Sheet',
              extensions: ['xlsx', 'xls'],
            },
          ],
        });
        if (
          result.canceled === true ||
          typeof result.filePath === 'undefined'
        ) {
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
                this.saveContacts(slct);
              }
            });
        }
        filepath = result.filePath;
      }
      let arrayToWrite: any[] = [];
      for (const x in this.fetchedGroupsAndContacts) {
        arrayToWrite = arrayToWrite.concat(this.fetchedGroupsAndContacts[x]);
      }
      arrayToWrite = [...new Set(arrayToWrite)];
      if (slct === 'table') {
        arrayToWrite = arrayToWrite.map((a) => {
          return { number: a };
        });
        this.contServ.AddData(arrayToWrite);
        VannilaService.swal.fire('Contacts added to table', '', 'success');
      }
      if (slct === 'single') {
        arrayToWrite = arrayToWrite.map((a) => [a]);
        this.obs.LoaderSubject.next(true);
        await this.SaveExcelSheet(arrayToWrite, filepath);
        this.obs.LoaderSubject.next(false);
        VannilaService.swal.fire('File saved', '', 'success');
      }
    } else if (slct === 'multiple') {
      const result = await this.elec.OpenDialog({
        title: 'Select Folder',
        properties: ['openDirectory', 'createDirectory', 'dontAddToRecent'],
      });
      if (
        typeof result.filePaths === 'undefined' ||
        result.canceled === true ||
        result.filePaths.length === 0
      ) {
        return;
      }
      const folderpath = result.filePaths[0];
      this.obs.LoaderSubject.next(true);
      try {
        for (const group of this.groups) {
          if (group.selected === false) {
            continue;
          }
          const numbers = this.fetchedGroupsAndContacts[group.id];
          if (
            typeof numbers === 'undefined' ||
            Array.isArray(numbers) === false
          ) {
            continue;
          }
          const path = this.elec.joinPaths([
            folderpath,
            `${group.name.replace(/\W/gim, '')}.xlsx`,
          ]);
          await this.SaveExcelSheet(
            numbers.map((a) => [a]),
            path
          );
        }
        VannilaService.swal.fire('File saved', '', 'success');
      } catch (error) {
        console.log(error);
      }
      this.obs.LoaderSubject.next(false);
    }
  }
  private async SaveExcelSheet(data: any[][], filepath: string) {
    const wb = this.elec.GetXlsxUtils().book_new();
    wb.SheetNames.push('Sheet1');
    const xSheet = this.elec.GetXlsxUtils().aoa_to_sheet(data);
    wb.Sheets['Sheet1'] = xSheet;
    return this.elec.WriteXLSX(wb, filepath, {
      type: 'base64',
      bookType: 'xlsx',
    });
  }
}
