import { Injectable, signal } from '@angular/core';
import {
  FirebaseAuthService,
  FirebaseFunctionsService,
} from '@wbotv2/services';
import { BehaviorSubject, filter, firstValueFrom, Subscription } from 'rxjs';
import { BasicService } from './basic.service';
import { BlacklistService } from './blacklist.service';
import { ElectronNativeService } from './Electron.Native.service';
import {
  ContentData,
  ExtaList,
  ImportedDataInTable,
  IncomingInquiriesInterface,
  InquiriesInterface,
} from './interfaces';
import { MimeTypes } from './Mime.Details';
import { UserService } from './user.service';
import { VannilaService } from './vannila.service';
@Injectable({
  providedIn: 'root',
})
export class ContentService {
  activeTabIndex!: number;
  tableKeys: string[] = [
    'number',
    'var1',
    'var2',
    'var3',
    'var4',
    'var5',
    'var6',
  ];
  table: any[] = [];
  genealWhastappLoaing: boolean;
  data: ContentData = {
    extraList: signal([]),
    tabsData: signal([]),
  };
  maxMessageMediaLength!: number;
  maxContactSendLength!: number;
  inquiry_table_header = ['Type', 'Status', 'Details', 'Reply', 'Delete'];
  inquiry_table_body: InquiriesInterface[] = [];
  subscrip!: {
    type: string;
    price: string;
    li: string[];
  }[];
  private _userTypeObserv = new BehaviorSubject<'free' | 'plus' | 'premium'>(
    'free',
  );
  public get UserTypeObserv() {
    return this._userTypeObserv.asObservable();
  }
  public get UserTypeObserValue() {
    return this._userTypeObserv.getValue();
  }
  private _dataObserv = new BehaviorSubject<any[]>([]);
  public get DataObserv() {
    return this._dataObserv.asObservable();
  }
  s: Subscription[] = [];
  constructor(
    private basicServ: BasicService,
    public blackServ: BlacklistService,
    private Elec: ElectronNativeService,
    public userServ: UserService,
    private fireAuth: FirebaseAuthService,
    private firebasefun: FirebaseFunctionsService,
  ) {
    this.genealWhastappLoaing = false;
    this.addTabs();
    this.activeTabIndex = 0;
    this.s.push(
      userServ.UserDataBhevaior.asObservable().subscribe((a) => {
        if (a === null) {
          return;
        }
        this._userTypeObserv.next(a.type);
        this.setTodayMessageLimit();
        this.maxMessageMediaLength = this.UserTypeObserValue === 'free' ? 2 : 5;
      }),
    );

    this.s.push(
      Elec.FileOpenedWithSubject.subscribe((a) => {
        if (a !== null) {
          this.AfterFilePathRecived(a).then((DataFromFile) => {
            this.AddData(DataFromFile.table);
            this.data.tabsData.update(() => DataFromFile.messages);
            this.data.extraList.update((a) => {
              a.push(...DataFromFile.extraFiles);
              return a;
            });
          });
        }
      }),
    );
    this.getSubscriptionDetails();
    firstValueFrom(
      this.userServ.UserDataBhevaior.pipe(filter((a) => a !== null)),
    ).then(() => {
      this.getInquiriesFromDb();
    });
  }
  checkAndSetVariable() {
    let hasVariable = false;
    this.data.tabsData().forEach((a) => {
      a.variable = this.basicServ.VariableCheckerPipeInstance.transform(a.msg);
      if (a.variable === true) {
        hasVariable = true;
      }
    });
    return hasVariable;
  }
  addTabs() {
    if (typeof this.maxMessageMediaLength === 'number') {
      if (this.data.tabsData().length >= this.maxMessageMediaLength) {
        VannilaService.swal.fire(
          'Info',
          `You can only add ${this.maxMessageMediaLength} messages.`,
          'info',
        );
        return;
      }
    }
    if (
      this.data.tabsData().length === 0 ||
      this.data.tabsData().length < this.maxMessageMediaLength
    ) {
      this.data.tabsData.update((s) => {
        s.push({
          contentType: 'msg',
          msg: '',
          previewlink: false,
          variable: false,
        });
        return s;
      });
    }
    this.activeTabIndex = this.data.tabsData().length - 1;
  }
  setActiveTab(i: number) {
    this.activeTabIndex = i;
  }
  closeTab(ind: number) {
    this.data.tabsData.update((a) => {
      a.splice(ind, 1);
      return a;
    });

    this.activeTabIndex = this.data.tabsData().length - 1;
    if (this.data.tabsData().length === 0) {
      this.addTabs();
    }
  }
  removeDuplicates() {
    const arry_final: any = {};
    this.table.forEach((a) => {
      if (arry_final[a.number]) {
        Object.keys(arry_final[a.number]).forEach((c) => {
          arry_final[a.number][c] =
            arry_final[a.number][c] !== '' ? arry_final[a.number][c] : a[c];
        });
      } else {
        arry_final[a.number] = a;
      }
    });
    const result: any[] = [];
    for (const i in arry_final) {
      result.push(arry_final[i]);
    }
    const diff = this.table.length - result.length;
    if (diff > 0) {
      return VannilaService.swal
        .fire({
          icon: 'warning',
          title: 'Are you sure?',
          text: `You want remove total ${diff} duplicate contacts ?`,
          showCancelButton: true,
          confirmButtonText: 'Yes, Remove it!',
          cancelButtonColor: '#d33',
        })
        .then((a) => {
          if (a.value === true) {
            VannilaService.swal.fire(
              'Success',
              `Total ${diff} duplicates removed.`,
              'success',
            );
            this.UpdateData(result);
          }
        });
    } else {
      return VannilaService.swal.fire(
        'Success',
        `Total ${diff} duplicates removed.`,
        'success',
      );
    }
  }
  RemoveBlackList() {
    const blacklistedNumbers = this.blackServ.listNum;
    const newNum: any[] = this.table.filter((a) => {
      return !(
        blacklistedNumbers.includes(+a.number) ||
        blacklistedNumbers.includes(a.number.toString())
      );
    });
    this.UpdateData(newNum);
  }
  async importCsvElectron(): Promise<undefined | any> {
    const result = await this.basicServ.openFile({
      properties: ['openFile'],
      title: 'Import File',
      filters: [
        {
          name: 'csv,txt,xls,wbot',
          extensions: ['csv', 'txt', 'wbot', 'xlsx', 'xls'],
        },
      ],
    });
    if (result.canceled === true) {
      const resulttttt = await VannilaService.swal.fire({
        title: 'No File Selected',
        text: 'Do you want to select again?',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'NO',
        showConfirmButton: true,
        confirmButtonText: 'YES',
      });
      if (resulttttt.isConfirmed) {
        return this.importCsvElectron();
      }
      return;
    } else {
      const FilePath = result.filePaths[0];
      return this.AfterFilePathRecived(FilePath);
    }
  }
  async AfterFilePathRecived(FilePath: string) {
    const fileExtension = this.Elec.getFileExtension(FilePath);
    if (['.xlsx', '.csv', '.xls', '.txt'].includes(fileExtension)) {
      const FileString = this.Elec.ReadFile(FilePath, 'base64');
      const WorkSBook = this.Elec.ReadExcelFileFromString(FileString, {
        type: 'base64',
      });
      let AA1 = this.Elec.GetXlsxUtils().sheet_to_json<ImportedDataInTable>(
        WorkSBook.Sheets[WorkSBook.SheetNames[0]],
        {
          header: ['number', 'var1', 'var2', 'var3', 'var4', 'var5', 'var6'],
          blankrows: false,
          raw: true,
          rawNumbers: true,
        },
      );
      AA1 = AA1.filter((a) => {
        if (typeof a.number === 'undefined') {
          return false;
        }
        a.number = +a.number.toString().replace(/\D/gm, '');
        return !isNaN(a.number) && a.number.toString().length > 7;
      });
      AA1.forEach((a) => {
        a.number = Number(a.number.toString());
      });
      this.AddData(AA1);
    } else if (fileExtension === '.wbot') {
      const FileString = this.Elec.ReadFile(FilePath).toString();
      try {
        return JSON.parse(await this.Elec.decryptData(FileString));
      } catch {
        VannilaService.swal.fire({
          title: 'Unable to read file',
          text: 'File might be corrupted',
          icon: 'warning',
        });
      }
    } else {
      VannilaService.swal.fire({
        title: 'Unable to read file',
        text: 'This type of file cannot be imported',
        icon: 'warning',
      });
    }
  }
  UpdateData(tableData: any[]) {
    this.table = tableData;
    this._dataObserv.next(tableData);
  }
  AddData(tableData: any[]) {
    if (
      this.UserTypeObserValue !== 'premium' &&
      this.maxContactSendLength - tableData.length < 0
    ) {
      const dailyLimit = this.UserTypeObserValue === 'free' ? 50 : 1000;
      VannilaService.swal.fire(
        'Error',
        `You can only send messages to ${this.maxContactSendLength} contacts today.\nYour daily limit is ${dailyLimit}.`,
        'error',
      );
    } else {
      this.table = this.table.concat(tableData);
      this._dataObserv.next(this.table);
    }
  }
  async AddCountryCode() {
    const value = await VannilaService.swal.fire<number>({
      title: 'Enter country code:',
      text: 'Only digits allowed',
      input: 'number',
      showCancelButton: true,
    });
    if (
      value.isDismissed ||
      value.value === null ||
      !value.value?.toString().match(/^[0-9]+$/g)
    ) {
      VannilaService.swal
        .fire({
          title: 'Country code not inserted',
          text: 'Do you want to insert again?',
          icon: 'warning',
          showCancelButton: true,
          cancelButtonText: 'NO',
          showConfirmButton: true,
          confirmButtonText: 'YES',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.AddCountryCode();
          }
        });
    } else if (value.isConfirmed) {
      this.table.forEach((a) => {
        a.number = value.value + a.number;
      });
      this.UpdateData(this.table);
    }
    return this.table;
  }
  clearWholeTable() {
    this.UpdateData([]);
  }
  async exportCsvElectron() {
    const result = await this.basicServ.saveFile({
      properties: ['createDirectory', 'showOverwriteConfirmation'],
      title: 'Export File',
      filters: [
        {
          name: 'wbot',
          extensions: ['wbot'],
        },
      ],
    });
    if (result.canceled === true) {
      VannilaService.swal
        .fire({
          title: 'File not saved',
          text: 'Do you want to save the file?',
          icon: 'warning',
          showCancelButton: true,
          cancelButtonText: 'NO',
          showConfirmButton: true,
          confirmButtonText: 'YES',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.exportCsvElectron();
          }
        });
    } else {
      const dataToStore = {
        table: this.table,
        messages: this.data.tabsData(),
        extraFiles: this.data.extraList(),
      };
      const write = await this.Elec.encryptData(JSON.stringify(dataToStore));
      if (result.filePath != undefined) {
        if (result.filePath?.indexOf('.wbot') != result.filePath?.length - 6) {
          result.filePath = result.filePath.slice(
            0,
            result.filePath.indexOf('.wbot'),
          );
        }
      }
      const exet = this.Elec.getFileExtension(
        result.filePath as string,
      ).toLowerCase();
      result.filePath =
        exet === 'wbot' ? result.filePath : result.filePath + '.wbot';
      const a = await this.Elec.writeFileWithPromise(
        result.filePath as string,
        write,
      );
      if (a) {
        VannilaService.swal.fire('File saved');
      } else {
        VannilaService.swal.fire('Error: file not saved');
      }
    }
  }
  async importExtra(type: string) {
    if (this.UserTypeObserValue !== 'premium') {
      if (this.data.extraList().length >= this.maxMessageMediaLength) {
        VannilaService.swal.fire(
          'Info',
          `You can only add ${this.maxMessageMediaLength} media.`,
          'info',
        );
        return;
      }
    }
    let f!: { name: string; extensions: string[] }[];
    if (type === 'images') {
      f = [
        {
          name: 'images',
          extensions: ['jpeg', 'jpg', 'png', 'gif', 'tiff', 'raw', 'webp'],
        },
      ];
    } else if (type === 'music') {
      f = [
        {
          name: 'music',
          extensions: [
            'm4a',
            'flac',
            'mp3',
            'wav',
            'wma',
            'aac',
            'ogg',
            '3gp',
            'mpeg',
          ],
        },
      ];
    } else if (type === 'videos') {
      f = [
        {
          name: 'videos',
          extensions: ['avi', 'wmv', 'flv', 'mov', 'mp4', 'mkv'],
        },
      ];
    } else if (type === 'documents') {
      f = [
        {
          name: 'documents',
          extensions: [
            'doc',
            'docx',
            'xls',
            'xlsx',
            'csv',
            'html',
            'htm',
            'odt',
            'rtf',
            'txt',
          ],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ];
    } else if (type === 'pdf') {
      f = [
        {
          name: 'pdf',
          extensions: ['pdf'],
        },
      ];
    } else if (type === 'ppt') {
      f = [
        {
          name: 'ppt',
          extensions: ['ppt', 'pptx'],
        },
      ];
    } else {
      throw new Error('Type not recognized');
    }
    const result = await this.basicServ.openFile({
      properties: ['openFile'],
      title: 'Import File',
      filters: f,
    });
    if (result.canceled) {
      const resulttttt = await VannilaService.swal.fire({
        title: 'No File Selected',
        text: 'Do you want to select again?',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'NO',
        showConfirmButton: true,
        confirmButtonText: 'YES',
      });
      if (resulttttt.isConfirmed) {
        this.importExtra(type);
      }
    } else {
      const FilePath = result.filePaths[0];
      const fileExtension = this.Elec.getFileExtension(FilePath).toLowerCase();
      const base64File = this.Elec.ReadFile(FilePath, 'base64');
      const fileSize =
        this.Elec.getFileSizeBytesFrombase64(base64File) / (1024 * 1024);
      if (type === 'videos' || type === 'images') {
        if (fileSize >= 16) {
          VannilaService.swal.fire(
            'Warning',
            `Video or Image should be less than 16MB. Current file size:${fileSize.toFixed(
              2,
            )}`,
            'warning',
          );
          return;
        }
      } else {
        if (fileSize >= 100) {
          VannilaService.swal.fire(
            'Warning',
            `File should be less than 100MB. Current file size:${fileSize.toFixed(
              2,
            )}`,
            'warning',
          );
          return;
        }
      }
      let mime = MimeTypes[fileExtension.replace('.', '')];
      if (!mime) {
        mime = 'text/' + fileExtension.replace('.', '');
      }
      const temp: ExtaList = {
        contentType: 'file',
        name: this.Elec.getBaseName(FilePath, fileExtension),
        ext: fileExtension,
        type: type,
        path: FilePath,
        index: this.data.extraList().length,
        base64: 'data:' + mime + ';base64,' + base64File,
      };
      temp.hash = this.Elec.generateHashSha1(temp.base64);
      this.data.extraList.update((a) => {
        a.push(temp);
        return a;
      });
    }
  }
  async addDescription(fileBase64: string) {
    const a = this.data.extraList().find((a) => a.base64 === fileBase64);
    if (typeof a === 'undefined') {
      return;
    }
    const index = this.data.extraList().indexOf(a);
    const res = await VannilaService.swal.fire({
      input: 'textarea',
      inputPlaceholder: 'Enter description for this image..',
      title: 'Image Description',
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Done',
      backdrop: true,
      inputValue:
        typeof this.data.extraList()[index].description === 'undefined'
          ? ''
          : this.data.extraList()[index].description,
    });
    if (res.isConfirmed === true) {
      this.data.extraList()[index].description = res.value;
    }
  }
  async setTodayMessageLimit(con?: number) {
    if (this.UserTypeObserValue === 'premium') {
      localStorage.removeItem('messageLimit');
      return;
    }
    let msgLimitInLocal: any = localStorage.getItem('messageLimit');
    const d = new Date();
    const newDate = d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
    const limitToSet = this.UserTypeObserValue === 'free' ? 50 : 1000;
    if (msgLimitInLocal === null || msgLimitInLocal === 'null') {
      msgLimitInLocal = this.setNewMessageLimit(newDate, limitToSet);
      this.maxContactSendLength = limitToSet;
    } else {
      msgLimitInLocal = JSON.parse(msgLimitInLocal);
      if (
        newDate !== msgLimitInLocal.date ||
        msgLimitInLocal.type !== this.UserTypeObserValue
      ) {
        msgLimitInLocal = this.setNewMessageLimit(newDate, limitToSet);
        this.maxContactSendLength = limitToSet;
      } else {
        this.maxContactSendLength = msgLimitInLocal.limit;
      }
    }
    if (typeof con === 'number' && con > 0) {
      if (this.maxContactSendLength - con < 0) {
        VannilaService.swal.fire(
          'Error',
          `You can only send messages to ${this.maxContactSendLength} contacts today.`,
          'error',
        );
      } else {
        this.maxContactSendLength -= con;
        this.setNewMessageLimit(newDate, this.maxContactSendLength);
      }
    }
  }
  setNewMessageLimit(newDate: string, limitToSet: number) {
    const x = {
      date: newDate,
      limit: limitToSet,
      type: this.UserTypeObserValue,
    };
    localStorage.setItem('messageLimit', JSON.stringify(x));
    return x;
  }
  async getSubscriptionDetails() {
    const p = this.firebasefun.CallFunctions(
      'SucscriptionPackageDetailsFunc',
      'subscription_details',
    );
    p.then((v) => {
      this.subscrip = v;
    });
    p.catch(() => {
      VannilaService.swal.fire(
        'Error',
        'Something went wrong while fetching subscription details',
        'error',
      );
    });
  }
  async getInquiriesFromDb() {
    const p: { success: number; data: any } =
      await this.firebasefun.CallFunctions('newManageInquiryFunc', {
        type: 'get_my_inquiries',
        ref_code: this.userServ.UserDataBhevaior.getValue().ref_no,
        id: this.fireAuth.uid,
      });
    if (p.success !== 1 || (p.success === 1 && p.data === null)) {
      return;
    }
    const inq_json: { [key: string]: IncomingInquiriesInterface } = p.data;
    this.inquiry_table_body = [];
    if (typeof inq_json === 'undefined' || inq_json === null) {
      return;
    }
    Object.keys(inq_json).forEach((key) => {
      const i: IncomingInquiriesInterface = inq_json[key];
      this.inquiry_table_body.push({
        description: i.description,
        inq_id: key,
        inquiry_type: i.inquiry_type,
        status: i.status,
        subject: i.subject,
        uid: i.uid,
        reply_from_admin: i.reply_from_admin,
      });
    });
  }
}
