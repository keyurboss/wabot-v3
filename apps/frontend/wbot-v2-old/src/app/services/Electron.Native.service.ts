import { Injectable } from '@angular/core';
import {
  FirebaseAuthService,
  FirebaseRealtimeDatabaseService,
} from '@wbotv2/services';
import { BehaviorSubject } from 'rxjs';
import { WorkBook, ParsingOptions, XLSX$Utils, WritingOptions } from 'xlsx';
import { environment } from '../../environments/environment';

const WbotSplitString = '@@WABOT@@';
export interface ExposedApiInterface {
  onIpcRender: (chanel: string, cb: (...params: any) => void) => void;
  sendIpcRender: (chanel: string, ...data: any) => void;
  InvokeIpcRender: (chanel: string, data?: any) => Promise<any>;
  AddIpcListner: (chanel: string, callback: (...args: any) => void) => void;
  NodeVar: () => {
    Args: string[];
    DirName: string;
    CWD: string;
    Xlsx_Utils: XLSX$Utils;
  };
  JoinPath: (pathss: string[]) => string;
  ReadFile: (path: string, encoding?: string) => string;
  ReadExcelFileFromString: (
    base64String: string,
    op: ParsingOptions
  ) => WorkBook;
  ReadExcelFileFromPath: (path: string, op: ParsingOptions) => WorkBook;
  GetExtensionOfFile: (filePath: string) => string;
  GetMAchineId: () => Promise<string>;
  WriteXLSX: (
    wb: WorkBook,
    file: string,
    writeOpts: WritingOptions
  ) => Promise<any>;
  createCip: (
    algo: string,
    key: string,
    iv: string,
    data: string,
    input_encoding: 'utf8',
    output_encoding: 'base64'
  ) => string;
  createDecip: (
    algo: string,
    key: string,
    iv: string,
    data: string,
    input_encoding: 'base64',
    output_encoding: 'utf8'
  ) => string;
  GetEnv: () => {
    [key: string]: string;
  };
  FileExist: (path: string) => boolean;
  GetArgs: () => string[];
  writeFile: (path: string, data: string) => any;
  randomBytes: (length: number) => string;
  generateHash: (data: string, key: string) => string;
  generateHashSha1: (data: string) => string;
  getBaseName: (path: string, ext: string) => string;
  CloseWindowOnStart: () => void;
  getFileSizeInBytes: (filepath: string) => number;
}
declare const ExposedApi: ExposedApiInterface;
@Injectable({
  providedIn: 'root',
})
export class ElectronNativeService {
  isElectronAndExposed = false;
  FileOpenedWithSubject = new BehaviorSubject<string>(null as any);
  ExposedApi!: ExposedApiInterface;
  private PendingPromises: {
    [id: string]: (...a: any) => void;
  } = {};
  constructor(
    private firedb: FirebaseRealtimeDatabaseService,
    private firebaseAuth: FirebaseAuthService
  ) {
    if (typeof ExposedApi === 'object') {
      this.isElectronAndExposed = true;
      ExposedApi.AddIpcListner(
        'resolved_promises',
        (event: any, return_id: string, extara_data: any) => {
          if (typeof this.PendingPromises[return_id] !== 'undefined') {
            this.PendingPromises[return_id](extara_data);
          }
        }
      );

      if (environment.production) {
        this.CloseWhatsappWebWindow();
      }
      try {
        this.Init();
      } catch (error) {
        console.log(error);
      }
    }
  }
  async Init() {
    if (typeof ExposedApi.InvokeIpcRender === 'undefined') {
      return;
    }
    this.ExposedApi = ExposedApi;
    setTimeout(async () => {
      try {
        const args = await ExposedApi.InvokeIpcRender('process_args');
        if (Array.isArray(args) && args.length >= 2) {
          let fp = '';
          for (const tempfp of args) {
            if (
              typeof tempfp === 'string' &&
              tempfp.includes('.wbot') &&
              ExposedApi.FileExist(tempfp)
            ) {
              fp = tempfp;
              break;
            }
          }
          fp !== '' && this.FileOpenedWithSubject.next(fp);
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
  joinPaths(s: string[]) {
    if (typeof ExposedApi === 'object') {
      return ExposedApi.JoinPath(s);
    }
    return '';
  }
  CloseWhatsappWebWindow() {
    ExposedApi.sendIpcRender('CloseOtherWindow');
  }
  SendToIpcMain(chanel: string, ...data: any) {
    if (this.isElectronAndExposed) {
      ExposedApi.sendIpcRender(chanel, ...data);
    }
  }
  ComputerId() {
    return ExposedApi.GetMAchineId();
  }
  ReadFile(path: string, encode?: string): string {
    return ExposedApi.ReadFile(path, encode);
  }
  GetXlsxUtils() {
    return ExposedApi.NodeVar().Xlsx_Utils;
  }
  OpenDialog(option: OpenDialogOptions): Promise<OpenDialogReturnValue> {
    return new Promise((res, rej) => {
      if (this.isElectronAndExposed) {
        const id = Date.now().toString();
        this.PendingPromises[id] = res;
        ExposedApi.sendIpcRender('FileDialog', {
          return_id: id,
          options: option,
          type: 'open',
        });
      } else {
        rej();
      }
    });
  }
  SaveDialog(option: SaveDialogOptions): Promise<SaveDialogReturnValue> {
    return new Promise((res, rej) => {
      if (this.isElectronAndExposed) {
        const id = Date.now().toString();
        this.PendingPromises[id] = res;
        ExposedApi.sendIpcRender('FileDialog', {
          return_id: id,
          options: option,
          type: 'save',
        });
      } else {
        rej();
      }
    });
  }
  ReadExcelFileFromString(Base64String: string, op: ParsingOptions): WorkBook {
    return ExposedApi.ReadExcelFileFromString(Base64String, op);
  }
  ReadExcelFileFromPath(path: string, op: ParsingOptions): WorkBook {
    return ExposedApi.ReadExcelFileFromPath(path, op);
  }
  getFileExtension(path: string) {
    return ExposedApi.GetExtensionOfFile(path);
  }
  WriteXLSX(wb: WorkBook, file: string, writeOpts: WritingOptions) {
    return ExposedApi.WriteXLSX(wb, file, writeOpts);
  }
  async encryptData(dta: string) {
    const k = await this.getKeyOfUser();
    const enc = ExposedApi.createCip(
      'aes-256-cbc',
      k.key,
      k.iv,
      dta,
      'utf8',
      'base64'
    );
    return enc + WbotSplitString + this.generateHash(enc, k.key);
  }
  async decryptData(dta: string) {
    const k = await this.getKeyOfUser();
    const recievedFileHash = dta.split(WbotSplitString);
    const generatedDataHash = this.generateHash(recievedFileHash[0], k.key);
    if (recievedFileHash[1] !== generatedDataHash) {
      throw new Error('File Corrupted');
    } else {
      const decryptedData = ExposedApi.createDecip(
        'aes-256-cbc',
        k.key,
        k.iv,
        recievedFileHash[0],
        'base64',
        'utf8'
      );
      return decryptedData;
    }
  }
  async getKeyOfUser(): Promise<{
    key: string;
    iv: string;
  }> {
    let enckey: any = localStorage.getItem('enckey');
    if (enckey === null) {
      const keySnapShot = await this.firedb.ReadOnceFromDatabase('enckey', [
        this.firebaseAuth.uid,
      ]);
      if (keySnapShot.exists() === false) {
        const keys = {
          key: ExposedApi.randomBytes(16),
          iv: ExposedApi.randomBytes(8),
        };

        this.firedb.SetDataToDatabase(['enckey', this.firebaseAuth.uid], keys);
        enckey = keys;
      } else {
        enckey = keySnapShot.val();
      }
      localStorage.setItem('enckey', JSON.stringify(enckey));
    } else {
      enckey = JSON.parse(enckey);
    }
    return enckey;
  }
  GetRandomBytes(len: number): string {
    return ExposedApi.randomBytes(len);
  }
  writeFileWithPromise(path: string, data: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        ExposedApi.writeFile(path, data);
        resolve(true);
      } catch (error) {
        resolve(false);
      }
    });
  }
  generateHash(data: string, key: string) {
    return ExposedApi.generateHash(data, key);
  }
  generateHashSha1(data: string) {
    return ExposedApi.generateHashSha1(data);
  }
  getBaseName(path: string, ext: string) {
    return ExposedApi.getBaseName(path, ext);
  }
  getFileSizeInBytes(filepath: string) {
    return ExposedApi.getFileSizeInBytes(filepath);
  }
  getFileSizeBytesFrombase64(base64: string): number {
    return base64.length * (3 / 4) - 1;
  }
}

interface FileFilter {
  // Docs: https://electronjs.org/docs/api/structures/file-filter
  extensions: string[];
  name: string;
}
export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  /**
   * Custom label for the confirmation button, when left empty the default label will
   * be used.
   */
  buttonLabel?: string;
  filters?: FileFilter[];
  /**
   * Contains which features the dialog should use. The following values are
   * supported:
   */
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
  >;
  /**
   * Message to display above input boxes.
   *
   * @platform darwin
   */
  message?: string;
  /**
   * Create security scoped bookmarks when packaged for the Mac App Store.
   *
   * @platform darwin,mas
   */
  securityScopedBookmarks?: boolean;
}
export interface OpenDialogReturnValue {
  /**
   * whether or not the dialog was canceled.
   */
  canceled: boolean;
  /**
   * An array of file paths chosen by the user. If the dialog is cancelled this will
   * be an empty array.
   */
  filePaths: string[];
  /**
   * An array matching the `filePaths` array of base64 encoded strings which contains
   * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
   * this to be populated. (For return values, see table here.)
   *
   * @platform darwin,mas
   */
  bookmarks?: string[];
}
export interface SaveDialogOptions {
  /**
   * The dialog title. Cannot be displayed on some _Linux_ desktop environments.
   */
  title?: string;
  /**
   * Absolute directory path, absolute file path, or file name to use by default.
   */
  defaultPath?: string;
  /**
   * Custom label for the confirmation button, when left empty the default label will
   * be used.
   */
  buttonLabel?: string;
  filters?: FileFilter[];
  /**
   * Message to display above text fields.
   *
   * @platform darwin
   */
  message?: string;
  /**
   * Custom label for the text displayed in front of the filename text field.
   *
   * @platform darwin
   */
  nameFieldLabel?: string;
  /**
   * Show the tags input box, defaults to `true`.
   *
   * @platform darwin
   */
  showsTagField?: boolean;
  properties?: Array<
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'treatPackageAsDirectory'
    | 'showOverwriteConfirmation'
    | 'dontAddToRecent'
  >;
  /**
   * Create a security scoped bookmark when packaged for the Mac App Store. If this
   * option is enabled and the file doesn't already exist a blank file will be
   * created at the chosen path.
   *
   * @platform darwin,mas
   */
  securityScopedBookmarks?: boolean;
}

interface SaveDialogReturnValue {
  /**
   * whether or not the dialog was canceled.
   */
  canceled: boolean;
  /**
   * If the dialog is canceled, this will be `undefined`.
   */
  filePath?: string;
  /**
   * Base64 encoded string which contains the security scoped bookmark data for the
   * saved file. `securityScopedBookmarks` must be enabled for this to be present.
   * (For return values, see table here.)
   *
   * @platform darwin,mas
   */
  bookmark?: string;
}
