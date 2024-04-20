import {
  CdkDragDrop,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  Observable,
  Subject,
} from 'rxjs';
import { ContentService } from '../../../services/content.service';
import { ElectronNativeService } from '../../../services/Electron.Native.service';
import { FirebaseAnalyticsService } from '../../../services/firebase-analytics.service';
import { ObsServiceService } from '../../../services/obs-service.service';
import { SocketService } from '../../../services/socket.service';
import { SoftwareSettingsService } from '../../../services/software-settings.service';
import { VannilaService } from '../../../services/vannila.service';
import { WhatsappClass } from '../../../services/whatsappClass';
import { AccountListComponent } from '../account-list/account-list.component';
import { BlackListComponent } from '../black-list/black-list.component';
import { ImportCheckboxComponent } from '../import-checkbox/import-checkbox.component';
import { ManageAccountsComponent } from '../manage-accounts/manage-accounts.component';
import { ManuallyAddComponent } from '../manually-add/manually-add.component';
import { MessagesReportComponent } from '../messages-report/messages-report.component';
import { RemoveNumbersPopComponent } from '../remove-numbers-pop/remove-numbers-pop.component';
import { SotfwareSettingComponent } from '../sotfware-setting/sotfware-setting.component';
interface VirtualScroll extends CdkVirtualScrollViewport {
  RefFunc: (offset: number, to?: 'to-start' | 'to-end') => void;
}

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentComponent implements AfterViewInit, OnDestroy {
  tdata: Observable<any[]> = this.contentServ.DataObserv;
  vars = ['var1', 'var2', 'var3', 'var4', 'var5', 'var6'];
  tableheader = [
    'Rmv',
    'No.',
    'Number',
    'var1',
    'var2',
    'var3',
    'var4',
    'var5',
    'var6',
  ];
  tableheader2 = ['File Name', 'Type', 'Preview', 'Rmv', ''];
  tabledata2 = this.contentServ.data.extraList;
  MainTablesearchText = '';
  offset = 0;
  isWhatsappActive = this.sockServer.WAStatusObservable;

  @ViewChild('VirtualScrollEle') VirtualScollEle!: VirtualScroll;

  constructor(
    public contentServ: ContentService,
    private cha: ChangeDetectorRef,
    private dialog: MatDialog,
    private obs: ObsServiceService,
    private elec: ElectronNativeService,
    private softwareSett: SoftwareSettingsService,
    private sockServer: SocketService,
    private zone: NgZone,
    private route: Router,
    private fireAnalyticsServ: FirebaseAnalyticsService,
  ) {
    // this.tdata = this.contentServ.DataObserv;
  }
  ngOnDestroy(): void {
    this.contentServ.s.forEach((a) => {
      a.unsubscribe();
    });
  }
  ngAfterViewInit(): void {
    this.VirtualScollEle.RefFunc =
      this.VirtualScollEle.setRenderedContentOffset;
    this.VirtualScollEle.setRenderedContentOffset = (a: number) => {
      if (this.offset !== -1 * a) {
        this.offset = -1 * a;
        this.cha.detectChanges();
      }
      this.VirtualScollEle.RefFunc(a);
    };
  }

  async openStartSending() {
    if (
      this.contentServ.table.length === 0 ||
      (this.contentServ.data.tabsData()[0].msg === '' &&
        this.contentServ.data.extraList().length === 0)
    ) {
      VannilaService.swal.fire({
        title: 'Cannot Send Message',
        text: 'Please make sure that you have fetched contacts and have some message or media to send.',
        icon: 'warning',
      });
      return;
    }

    if (
      this.contentServ.UserTypeObserValue !== 'premium' &&
      this.contentServ.maxContactSendLength - this.contentServ.table.length < 0
    ) {
      const dailyLimit =
        this.contentServ.UserTypeObserValue === 'free' ? 50 : 1000;
      VannilaService.swal.fire(
        'Error',
        `You can only send messages to ${this.contentServ.maxContactSendLength} contacts today.\nYour daily limit is ${dailyLimit}.`,
        'error',
      );
      return;
    }
    const temp = await this.openWhatsappWindow(true);
    if (temp === null) {
      return;
    }
    await firstValueFrom(
      this.isWhatsappActive.pipe(
        filter((a) => a.active === true && a.logged_in === true),
      ),
    );
    const successFaileSubject = new Subject<any>();
    const TotalNumberOfMessageSend = new Subject();
    const SendingStaus = new BehaviorSubject<boolean>(true);
    const FinishedStatus = new BehaviorSubject<boolean>(false);
    const waClass = new WhatsappClass(
      this.contentServ,
      this.sockServer,
      this.softwareSett,
      this.elec,
      this.contentServ.blackServ,
      this.obs,
    );
    firstValueFrom(
      this.dialog
        .open(MessagesReportComponent, {
          data: {
            TotalSentMsg: TotalNumberOfMessageSend,
            successFailedCount: successFaileSubject,
            canStop: SendingStaus,
            finishStatus: FinishedStatus,
          },
          autoFocus: false,
          hasBackdrop: true,
          position: {
            right: '1vh',
            top: '1vh',
          },
          disableClose: true,
        })
        .afterClosed(),
    ).then(() => {
      waClass.CloseSession();
    });
    this.zone.runOutsideAngular(() => {
      waClass
        .sendMessage(
          successFaileSubject,
          TotalNumberOfMessageSend,
          SendingStaus,
          1,
        )
        .then(() => {
          VannilaService.swal.fire(
            'Finished',
            'All Messages has been send..!!',
            'success',
          );
          FinishedStatus.next(true);
        });
    });
  }
  async openGrabComponent() {
    this.obs.LoaderSubject.next(true);
    const a = await this.openWhatsappWindow();
    if (a === null) {
      return;
    }
    this.obs.LoaderSubject.next(true);

    await firstValueFrom(
      this.isWhatsappActive.pipe(
        filter((a) => a.active === true && a.logged_in === true),
      ),
    );
    setTimeout(() => {
      this.elec.SendToIpcMain('focus');
    }, 100);
    this.route.navigate(['/grab']);
    this.obs.LoaderSubject.next(false);
  }

  openManageAccounts() {
    this.dialog.open(ManageAccountsComponent);
  }

  async openWhatsappWindow(ignore_focus = false) {
    this.obs.LoaderSubject.next(true);
    if (this.sockServer.WhatsappStatus.active && ignore_focus === false) {
      this.sockServer.StartWhatsapp({
        closeExisting: false,
        destroyPreviousSession: false,
        saveSession: false,
      });
      this.obs.LoaderSubject.next(false);
      return;
    }
    const choice = await this.callAccountListComponent();
    if (
      typeof choice === 'undefined' ||
      choice === null ||
      choice.c === 'null' ||
      !choice
    ) {
      this.obs.LoaderSubject.next(false);
      return null;
    } else if (choice.c === 'new') {
      this.sockServer.StartWhatsapp({
        closeExisting: true,
        saveSession: false,
        destroyDefaultSession: this.softwareSett.uSettings.autoLogout,
      });
    } else if (choice.c === 'old' && choice.accChoice !== 'null') {
      this.sockServer.StartWhatsapp({
        sessionString: choice.accChoice,
        saveSession: true,
        closeExisting: true,
      });
    }
    await firstValueFrom(
      this.isWhatsappActive.pipe(
        filter((a) => a.active === true && a.logged_in === true),
      ),
    );
    this.obs.LoaderSubject.next(false);
    this.cha.detectChanges();
    return;
  }
  CloseWhatsappWebWindows(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.elec.CloseWhatsappWebWindow();
  }

  importNumberMenually() {
    this.dialog.open(ManuallyAddComponent);
  }

  expoerCsv() {
    if (
      this.contentServ.table.length === 0 &&
      this.contentServ.data.tabsData().every((a) => a.msg === '') &&
      this.contentServ.data.extraList.length === 0
    ) {
      VannilaService.swal.fire('Nothing to export', '', 'warning');
      return;
    }
    this.contentServ.exportCsvElectron();
  }

  clearTable() {
    this.contentServ.clearWholeTable();
  }

  async importCsvElectron() {
    this.obs.LoaderSubject.next(true);
    const DataFromFile = await this.contentServ.importCsvElectron();
    this.obs.LoaderSubject.next(false);
    if (typeof DataFromFile === 'object') {
      const selections: { c: boolean; m: boolean; e: boolean } =
        await firstValueFrom(
          this.dialog
            .open(ImportCheckboxComponent, {
              height: '50vh',
              closeOnNavigation: false,
              disableClose: true,
              data: { c: false, m: false, e: false },
            })
            .afterClosed(),
        );
      if (selections.c === true) {
        this.contentServ.AddData(DataFromFile.table);
      }
      if (selections.m === true) {
        this.contentServ.data.tabsData.set(DataFromFile.messages);
      }
      if (selections.e === true) {
        this.contentServ.data.extraList.update((d) => {
          d.push(...DataFromFile.extraFiles);
          return d;
        });
      }
      this.cha.detectChanges();
    }
  }

  async importExtra(type: string) {
    await this.contentServ.importExtra(type);
    this.cha.detectChanges();
  }

  filtterBlacklist() {
    this.contentServ.RemoveBlackList();
    this.cha.detectChanges();
  }

  async removeDuplicates() {
    await this.contentServ.removeDuplicates();
    this.cha.detectChanges();
  }
  RemoveNumbersPopup() {
    this.dialog.open(RemoveNumbersPopComponent);
  }
  async AddCountryCode() {
    await this.contentServ.AddCountryCode();
    this.cha.detectChanges();
  }
  insertExtra(x: string, a: HTMLTextAreaElement) {
    const startPosition = a.selectionStart;
    const EndtPosition = a.selectionEnd;
    const TT = this.contentServ.data.tabsData();
    const msg = TT[this.contentServ.activeTabIndex].msg;
    if (['*', '_', '~'].includes(x)) {
      TT[this.contentServ.activeTabIndex].msg = [
        msg.slice(0, startPosition),
        x,
        msg.slice(startPosition, EndtPosition) +
          x +
          msg.slice(EndtPosition, msg.length),
      ].join('');
    } else {
      x = '{{' + x + '}}';
      TT[this.contentServ.activeTabIndex].msg =
        msg.substring(0, startPosition) +
        x +
        msg.substring(EndtPosition, msg.length);
    }
    setTimeout(() => {
      if (['*', '_', '~'].includes(x)) {
        a.selectionStart = startPosition + 1;
        a.selectionEnd = EndtPosition + 1;
      } else {
        a.selectionStart = startPosition;
        a.selectionEnd = startPosition + x.length;
      }
      a.focus();
    });
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.contentServ.data.tabsData(),
      event.previousIndex,
      event.currentIndex,
    );
    this.contentServ.activeTabIndex = event.currentIndex;
  }
  d(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tabledata2(), event.previousIndex, event.currentIndex);
  }
  OpenBlackList() {
    this.dialog.open(BlackListComponent, {
      height: '90vh',
    });
  }
  OpenSettings() {
    this.dialog.open(SotfwareSettingComponent, {
      height: '93vh',
      hasBackdrop: false,
    });
  }
  // private SetDataLength() {
  //   this.VirtualScollEle.setTotalContentSize(this.contentServ.table.length);
  // }
  RemoveMultimedia(index: number) {
    this.tabledata2.update((d) => {
      d.splice(index, 1);
      return d;
    });
    this.cha.detectChanges();
  }
  RemoveElementFromIndex(index: number) {
    this.contentServ.table.splice(index, 1);
    this.contentServ.table.forEach((a, i) => (a.index = i));
    this.contentServ.UpdateData(this.contentServ.table);
    this.MainTablesearchText = this.MainTablesearchText + ' ';
    setTimeout(() => {
      this.MainTablesearchText = this.MainTablesearchText.trim();
      this.cha.detectChanges();
    });
    this.cha.detectChanges();
  }

  allclear() {
    this.tabledata2.update(() => []);
  }

  async callAccountListComponent() {
    const disableOld = this.sockServer.WAccountNames.length > 0 ? false : true;
    const disableUnsaved = this.sockServer.WhatsappStatus.active ? false : true;
    const choice: {
      c: string;
      disableOpt: { old: boolean; unsaved: boolean };
      accChoice: string;
    } = await firstValueFrom(
      this.dialog
        .open(AccountListComponent, {
          height: '50vh',
          data: {
            c: 'null',
            disableOpt: { old: disableOld, unsaved: disableUnsaved },
            accChoice: 'null',
          },
        })
        .afterClosed(),
    );
    return choice;
  }
}
