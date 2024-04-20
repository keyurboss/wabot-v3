/* eslint-disable no-useless-escape */
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  Subject,
  Subscription,
} from 'rxjs';
import { BlacklistService } from './blacklist.service';
import { ContentService } from './content.service';
import { ElectronNativeService } from './Electron.Native.service';
import { MsgTabs } from './interfaces';
import { ObsServiceService } from './obs-service.service';
import { SocketService } from './socket.service';
import { SoftwareSettingsService } from './software-settings.service';
@Injectable({
  providedIn: 'root',
})
export class WhatsappClass {
  subRef: Subscription[] = [];
  numbers!: {
    number: string;
    var1: string;
    var2: string;
    var3: string;
    var4: string;
    var5: string;
    var6: string;
  }[];
  canForward!: boolean;
  currentSendingCount = 0;
  index = 0;
  imageHasDescription = false;
  private ReqIDS: string[] = [];
  private _IsSessionClosed = false;
  public get IsSessionClosed() {
    return this._IsSessionClosed;
  }
  public set IsSessionClosed(value) {
    this._IsSessionClosed = value;
  }
  variableRegEx = [
    {
      name: 'var1',
      regex: /{{var1}}/gim,
    },
    {
      name: 'var2',
      regex: /{{var2}}/gim,
    },
    {
      name: 'var3',
      regex: /{{var3}}/gim,
    },
    {
      name: 'var4',
      regex: /{{var4}}/gim,
    },
    {
      name: 'var5',
      regex: /{{var5}}/gim,
    },
    {
      name: 'var6',
      regex: /{{var6}}/gim,
    },
  ];
  constructor(
    private contServ: ContentService,
    private sockServ: SocketService,
    private softwareSettings: SoftwareSettingsService,
    private electronNative: ElectronNativeService,
    private blackServ: BlacklistService,
    private obs: ObsServiceService
  ) {}
  CloseSession(): void {
    this.IsSessionClosed = true;
    setTimeout(() => {
      this.obs.LoaderSubject.next(false);
      this.subRef.forEach((s) => s.unsubscribe());
    }, 2000);
  }
  sendMessage(
    succesFailedsNumberSubject: Subject<{
      number: any;
      status: boolean;
      reason: string;
    }>,
    TotalNumberOfMessageSend: Subject<any>,
    SendingStatus: BehaviorSubject<boolean>,
    totalSimulNumbersCount = 1
  ) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve) => {
      this.obs.LoaderSubject.next(true);
      this.sockServ.getFromWapi('wapi_status');
      await firstValueFrom(
        this.sockServ.DataFromEhatsappSubject.pipe(
          filter((a) => a.channel === 'wapi_status')
        )
      );
      this.sockServ.getFromWapi('clearPreparedFiles');
      await firstValueFrom(
        this.sockServ.DataFromEhatsappSubject.pipe(
          filter((a) => a.channel === 'clearPreparedFiles')
        )
      );
      this.subRef.push(
        this.sockServ.DataFromEhatsappSubject.pipe(
          filter((a) => a.channel === 'messageRecived')
        ).subscribe((a) => {
          TotalNumberOfMessageSend.next(a.data);
        })
      );
      this.index = 0;
      this.currentSendingCount = 0;
      this.numbers = JSON.parse(JSON.stringify(this.contServ.table));
      const blacklistedNumbers = this.blackServ.listNum;
      this.numbers = this.numbers.filter((a) => {
        if (
          blacklistedNumbers.includes(+a.number) ||
          blacklistedNumbers.includes(a.number.toString())
        ) {
          succesFailedsNumberSubject.next({
            number: a.number,
            status: false,
            reason: 'Blacklisted Number',
          });
          return false;
        } else {
          return true;
        }
      });
      this.canForward =
        !this.contServ.checkAndSetVariable() ||
        this.contServ.data.tabsData().every((a) => a.msg === '');
      this.contServ.data.extraList().forEach((a) => {
        if (
          a.type === 'images' &&
          typeof a.description !== 'undefined' &&
          a.description !== ''
        ) {
          this.imageHasDescription = true;
        }
        if (typeof a.hash === 'undefined') {
          a.hash = this.electronNative.generateHashSha1(a.base64);
        }
      });
      const Messages = JSON.parse(
        JSON.stringify(
          this.contServ.data.tabsData().filter((a) => a.msg.trim().length > 0)
        )
      );
      const FilesData = this.contServ.data.extraList();
      const NumberSendStatus = this.sockServ.DataFromEhatsappSubject.pipe(
        filter((a) => {
          if (a.channel !== 'SendNumberStatus') {
            return false;
          }
          if (a.data && a.data.reqid) {
            this.sockServ.getFromWapi('reqidrecived', a.data.reqid);
            if (this.ReqIDS.indexOf(a.data.reqid) > -1) {
              return false;
            } else {
              this.ReqIDS.push(a.data.reqid);
            }
          }
          return true;
        }),
        map((a) => {
          if (a.data && a.data.number) {
            if (typeof a.data.number === 'string') {
              a.data.number = +a.data.number.replace(/\D/, '');
            }
          }
          return a.data;
        })
      );
      let LastMEssageSendTime = Date.now();
      const SecondsToDelayAfterChat =
        this.softwareSettings.uSettings.individual_interval * 1000;
      let removeTillIndex = -1;
      for (const num of this.numbers) {
        const res = await this.CheckNumberExists(
          num.number.toString() + '@c.us'
        );
        if (res) {
          break;
        } else {
          succesFailedsNumberSubject.next({
            number: num.number,
            status: false,
            reason: 'Number does not exist',
          });
          removeTillIndex++;
        }
      }
      this.numbers.splice(0, removeTillIndex + 1);
      if (this.numbers.length === 0) {
        this.CloseSession();
        resolve();
        return;
      }
      if (this.canForward === true && this.imageHasDescription === false) {
        const Content = [...Messages, ...FilesData];
        this.SendMessages(this.numbers[0].number, Content, false, true);
        const statusReason: {
          status: boolean;
          reason: string;
        } = await firstValueFrom(NumberSendStatus);
        if (statusReason.status === false) {
          succesFailedsNumberSubject.next({
            number: this.numbers[0].number,
            status: false,
            reason: statusReason.reason,
          });
          throw new Error('Something went wrong');
        } else {
          succesFailedsNumberSubject.next({
            number: this.numbers[0].number,
            status: true,
            reason: '',
          });
        }
        if (this.IsSessionClosed === true) {
          this.CloseSession();
          resolve();
          return;
        }
        if (this.numbers.length === 1) {
          this.CloseSession();
          resolve();
          return;
        }
        const SendNext = async () => {
          this.currentSendingCount++;
          const CurrentIndex = ++this.index;
          if (CurrentIndex === this.numbers.length) {
            if (this.currentSendingCount === 0) {
              resolve();
              this.CloseSession();
            }
            return;
          }
          let delay =
            Date.now() - LastMEssageSendTime < SecondsToDelayAfterChat
              ? SecondsToDelayAfterChat - (Date.now() - LastMEssageSendTime)
              : 0;
          if (
            this.softwareSettings.uSettings.batch_interval &&
            this.softwareSettings.uSettings.batch_interval.is_active
          ) {
            if (
              CurrentIndex %
                +this.softwareSettings.uSettings.batch_interval.batch_count ===
              0
            ) {
              delay =
                delay +
                +this.softwareSettings.uSettings.batch_interval.batch_interval *
                  1000;
            }
          }
          setTimeout(() => {
            LastMEssageSendTime = Date.now();
            this.SendMessages(
              this.numbers[CurrentIndex].number,
              this.softwareSettings.uSettings.ignoreForwardStrategy === false
                ? []
                : Content,
              !this.softwareSettings.uSettings.ignoreForwardStrategy,
              false
            );
          }, delay);
        };
        this.subRef.push(
          NumberSendStatus.subscribe((a) => {
            succesFailedsNumberSubject.next(a);
            this.currentSendingCount--;
            if (this.index + 1 === this.numbers.length) {
              if (this.currentSendingCount === 0) {
                resolve();
                this.CloseSession();
              }
              return;
            }
            if (SendingStatus.value === true) {
              SendNext();
            }
          })
        );
        this.subRef.push(
          SendingStatus.subscribe((a) => {
            if (a === true) {
              while (
                this.currentSendingCount < totalSimulNumbersCount &&
                this.index + 1 < this.numbers.length
              ) {
                SendNext();
              }
            }
          })
        );
      } else {
        const tempMsg = JSON.parse(JSON.stringify(Messages));
        const imagesWithDescription = FilesData.filter(
          (a) =>
            typeof a.description !== 'undefined' && a.description.trim() !== ''
        );
        const imagesWithoutDescription =
          imagesWithDescription.length > 0
            ? FilesData.filter((a) => !imagesWithDescription.includes(a))
            : FilesData;
        this.SendMessages(
          this.numbers[0].number,
          this.generateCustomMessage(this.numbers[0], tempMsg),
          false,
          false
        );
        const statusReason: {
          status: boolean;
        } = await firstValueFrom(NumberSendStatus);
        if (statusReason.status === false) {
          throw new Error('Something went wrong');
        }
        if (imagesWithDescription.length > 0) {
          this.SendMessages(
            this.numbers[0].number,
            imagesWithDescription,
            false,
            false
          );
          await firstValueFrom(NumberSendStatus);
        }
        this.SendMessages(
          this.numbers[0].number,
          imagesWithoutDescription,
          false,
          true
        );
        await firstValueFrom(NumberSendStatus);
        succesFailedsNumberSubject.next({
          number: this.numbers[0].number,
          status: true,
          reason: '',
        });
        if (this.IsSessionClosed === true) {
          this.CloseSession();
          resolve();
          return;
        }
        if (this.numbers.length === 1) {
          this.CloseSession();
          resolve();
          return;
        }
        const SendNext = async () => {
          const tempMsg = JSON.parse(JSON.stringify(Messages));
          this.currentSendingCount++;
          const CurrentIndex = ++this.index;
          if (CurrentIndex === this.numbers.length) {
            if (this.currentSendingCount === 0) {
              resolve();
              this.CloseSession();
            }
            return;
          }
          let delay =
            Date.now() - LastMEssageSendTime < SecondsToDelayAfterChat
              ? SecondsToDelayAfterChat - (Date.now() - LastMEssageSendTime)
              : 0;
          if (
            this.softwareSettings.uSettings.batch_interval &&
            this.softwareSettings.uSettings.batch_interval.is_active
          ) {
            if (
              CurrentIndex %
                +this.softwareSettings.uSettings.batch_interval.batch_count ===
              0
            ) {
              delay =
                delay +
                +this.softwareSettings.uSettings.batch_interval.batch_interval *
                  1000;
            }
          }
          setTimeout(() => {
            LastMEssageSendTime = Date.now();
            let content: any[] =
              this.canForward === false
                ? this.generateCustomMessage(
                    this.numbers[CurrentIndex],
                    tempMsg
                  )
                : tempMsg;
            if (this.softwareSettings.uSettings.ignoreForwardStrategy) {
              content = content.concat(FilesData);
            } else if (imagesWithDescription.length > 0) {
              content = content.concat(imagesWithDescription);
            }
            this.SendMessages(
              this.numbers[CurrentIndex].number,
              content,
              !this.softwareSettings.uSettings.ignoreForwardStrategy,
              false
            );
          }, delay);
        };
        this.subRef.push(
          NumberSendStatus.subscribe((a) => {
            succesFailedsNumberSubject.next(a);
            this.currentSendingCount--;
            if (this.index + 1 === this.numbers.length) {
              if (this.currentSendingCount === 0) {
                resolve();
                this.CloseSession();
              }
              return;
            }
            if (SendingStatus.value === true) {
              SendNext();
            }
          })
        );
        this.subRef.push(
          SendingStatus.subscribe((a) => {
            if (a === true) {
              while (
                this.currentSendingCount < totalSimulNumbersCount &&
                this.index + 1 < this.numbers.length
              ) {
                SendNext();
              }
            }
          })
        );
      }
    });
  }
  SendMessages(
    number: string,
    messages: any[],
    sendForword: boolean,
    storeid: boolean
  ) {
    const reqid = this.electronNative.GetRandomBytes(15);
    return this.sockServ.getFromWapi(
      'sendContent',
      number,
      messages,
      sendForword,
      storeid,
      reqid
    );
  }
  async CheckNumberExists(number: string): Promise<any> {
    const a = await firstValueFrom(
      this.sockServ.getFromWapi('existingNumbers', number)
    );
    return a.data;
  }
  findLinkInMsg(msg: string) {
    return msg.match(
      /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)/
    );
  }
  generateCustomMessage(numberList: any, orgtdata: MsgTabs[]) {
    return orgtdata.map((a1) => {
      let a = a1.msg;
      this.variableRegEx.forEach((val1) => {
        if (typeof numberList[val1.name] !== 'undefined') {
          a = a.replace(val1.regex, numberList[val1.name]).trim();
        }
      });
      a1.msg = a;
      return a1;
    });
  }
}

// const a =
//   /<meta name=\"title\" content=\"([^<]*)\"([^<]*)>|<meta content=\"([^<]*)\"([^<]*)[\s]*name=\"title\">/;
