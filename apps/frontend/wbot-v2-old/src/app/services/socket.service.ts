import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FirebaseRealtimeDatabaseService } from '@wbotv2/services';
import { BehaviorSubject, firstValueFrom, filter, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ElectronNativeService } from './Electron.Native.service';
import { VannilaService } from './vannila.service';
// const ChannaleToSendToWhatsapp = 'to_whatsapp_web';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  WAccountNames: string[] = [];
  private _WhatsappStatus = {
    active: false,
    logged_in: false,
  };
  private _WAStatusObservable = new BehaviorSubject(this._WhatsappStatus);
  private _WAAccountNamesObservable = new BehaviorSubject(this.WAccountNames);
  private _DataFromEhatsappSubject = new Subject<{
    channel: string;
    data: any;
  }>();
  public get DataFromEhatsappSubject() {
    return this._DataFromEhatsappSubject.asObservable();
  }
  public get WhatsappStatus() {
    return this._WhatsappStatus;
  }
  private set WhatsappStatus(value: { active: boolean; logged_in: boolean }) {
    this._WhatsappStatus = value;
    this._WAStatusObservable.next(value);
  }
  public get WAStatusObservable() {
    return this._WAStatusObservable.asObservable();
  }
  public get WAAccountNamesObservable() {
    return this._WAAccountNamesObservable;
  }
  constructor(
    private http: HttpClient,
    private firedb: FirebaseRealtimeDatabaseService,
    private elec: ElectronNativeService,
  ) {
    const A = localStorage.getItem('wa_accounts');
    if (A !== null) {
      this.WAccountNames = JSON.parse(A);
      this._WAAccountNamesObservable.next(this.WAccountNames);
    }
    this.Init();
    this.DataFromEhatsappSubject.subscribe(console.log);
    this.IPCCommunication();
  }
  private async IPCCommunication() {
    this.elec.ExposedApi.onIpcRender('whatsapp-start', () => {
      this.WhatsappStatus = {
        active: true,
        logged_in: this._WhatsappStatus.logged_in,
      };
    });
    this.elec.ExposedApi.onIpcRender('whatsapp-close', () => {
      this.WhatsappStatus = {
        active: false,
        logged_in: false,
      };
    });
    this.elec.ExposedApi.onIpcRender(
      'from_whatsapp_web',
      (data: { extra: any; type: 'loggin-status' }) => {
        if (data.type === 'loggin-status') {
          if (this._WhatsappStatus.logged_in !== data.extra) {
            this.WhatsappStatus = {
              logged_in: data.extra,
              active: this._WhatsappStatus.active,
            };
            if (data.extra === true) {
              console.log(data);
            }
          }
        }
      },
    );
    this.elec.ExposedApi.onIpcRender('whatsapp_data', (...data) => {
      this._DataFromEhatsappSubject.next({
        channel: data[0],
        data: data[1],
      });
    });
  }
  private async Init() {
    if (environment.production) {
      this.EvalWAPI();
    } else {
      await firstValueFrom(
        this.http.get(location.origin + '/assets/wapi/wapi.js', {
          responseType: 'text',
        }),
      ).then((a) => localStorage.setItem('wapi_script', a));
      this.EmitWAPIScript();
    }
  }
  private EmitWAPIScript() {
    if (localStorage.getItem('wapi_script') === null) {
      VannilaService.swal.fire('Script Not Loaded', '', 'error');
      return;
    }
    this.elec.SendToIpcMain('eval', localStorage.getItem('wapi_script'));
  }
  private async readAndStoreWAPI() {
    let localWapi: any;
    const SnapShot = await this.firedb.ReadOnceFromDatabase('wapiv3', []);
    if (SnapShot.exists()) {
      localWapi = SnapShot.val();
      await this.elec.ExposedApi.InvokeIpcRender(
        'axios_get',
        localWapi.wapi_url,
      ).then((a) => localStorage.setItem('wapi_script', a));
      this.EmitWAPIScript();
      localStorage.setItem('wapi', JSON.stringify(localWapi));
    } else {
      //TODO: Handle error
    }
    return localWapi;
  }
  private async EvalWAPI() {
    const a = localStorage.getItem('wapi_script');
    if (typeof a === 'undefined' || a === 'undefined' || !!a || a === null) {
      localStorage.removeItem('wapi');
      localStorage.removeItem('wapi_script');
    }
    let localWapi: any = localStorage.getItem('wapi');
    if (localWapi === null) {
      localWapi = this.readAndStoreWAPI();
    } else {
      localWapi = JSON.parse(localWapi);
      this.firedb.AddValueListner(
        'wapiv3',
        ['last_updated_at'],
        async (timeSnapShot) => {
          if (timeSnapShot.exists()) {
            if (localWapi.last_updated_at !== timeSnapShot.val()) {
              localWapi = await this.readAndStoreWAPI();
            } else {
              this.EmitWAPIScript();
            }
          }
        },
      );
    }
  }
  StartWhatsapp(
    Extar: {
      sessionString?: string;
      saveSession: boolean;
      closeExisting: boolean;
      savePrevious?: boolean;
      destroyPreviousSession?: boolean;
      destroyDefaultSession?: boolean;
    } = {
      closeExisting: true,
      saveSession: false,
      savePrevious: false,
      destroyPreviousSession: false,
      destroyDefaultSession: true,
    },
  ) {
    debugger;
    this.elec.ExposedApi.sendIpcRender('message', {
      type: 'start-whatsapp',
      extra: Extar,
    });
  }

  UpdateAccountName(d: string) {
    if (this.WAccountNames.includes(d)) {
      return;
    }
    this.WAccountNames.push(d);
    localStorage.setItem('wa_accounts', JSON.stringify(this.WAccountNames));
    this.WAAccountNamesObservable.next(this.WAccountNames);
  }
  RemoveAccountName(d: string) {
    const a = this.WAccountNames.indexOf(d);
    if (a > -1) {
      this.WAccountNames.splice(a, 1);
      this.elec.ExposedApi.sendIpcRender('message', {
        type: 'destroy-session',
        extra: d,
      });
      localStorage.setItem('wa_accounts', JSON.stringify(this.WAccountNames));
      this.WAAccountNamesObservable.next(this.WAccountNames);
    }
  }

  getFromWapi(functionName = 'getAllGroups', ...values: any) {
    this.elec.ExposedApi.sendIpcRender('getFromWapi', functionName, ...values);
    return this.DataFromEhatsappSubject.pipe(
      filter((a) => a.channel === functionName),
    );
  }
  emitPaymentResponseAbort(data: any) {
    this.elec.ExposedApi.sendIpcRender(
      'payment_response_abort_from_browser',
      data,
    );
  }
}
