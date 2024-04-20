import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { BasicService } from '../../../services/basic.service';
import { ContentService } from '../../../services/content.service';
import { ElectronNativeService } from '../../../services/Electron.Native.service';
import { ObsServiceService } from '../../../services/obs-service.service';
import { SoftwareSettingsService } from '../../../services/software-settings.service';
import { VannilaService } from '../../../services/vannila.service';

@Component({
  selector: 'app-messages-report',
  templateUrl: './messages-report.component.html',
  styleUrls: ['./messages-report.component.scss'],
})
export class MessagesReportComponent implements OnInit {
  totalSentMsg = 0;
  successCount = 0;
  failedCount = 0;
  canStopSubjectValue!: boolean;
  dataForReport: {
    number: number;
    status: boolean;
    reason: string;
  }[] = [];
  subRefs: Subscription[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      TotalSentMsg: Subject<any>;
      successFailedCount: Subject<any>;
      canStop: BehaviorSubject<boolean>;
      finishStatus: BehaviorSubject<boolean>;
    },
    private matdialog: MatDialog,
    private elec: ElectronNativeService,
    private basic: BasicService,
    private obs: ObsServiceService,
    private softServ: SoftwareSettingsService,
    private contServ: ContentService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cd.detectChanges();
    this.subRefs.push(
      this.data.TotalSentMsg.subscribe(() => {
        this.totalSentMsg++;
        this.cd.detectChanges();
      })
    );
    this.subRefs.push(
      this.data.successFailedCount.subscribe((a) => {
        this.dataForReport.push(a);
        if (a.status === true) {
          this.successCount++;
        } else if (a.status === false) {
          this.failedCount++;
        }
        this.cd.detectChanges();
      })
    );
    this.subRefs.push(
      this.data.canStop.subscribe((a) => {
        this.canStopSubjectValue = a;
        this.obs.LoaderSubject.next(a);
        this.cd.detectChanges();
      })
    );
  }
  toggleStartStop() {
    if (this.canStopSubjectValue === true) {
      this.data.canStop.next(false); //Stop Sending
    } else {
      this.data.canStop.next(true); //Start Sending
    }
  }
  async closeDialog() {
    this.subRefs.forEach((s) => s.unsubscribe());
    if (this.contServ.UserTypeObserValue !== 'premium') {
      await this.contServ.setTodayMessageLimit(this.successCount);
    }
    this.obs.LoaderSubject.next(false);
    this.matdialog.closeAll();
  }
  async generateReportClick(report_for: 'all' | 'success' | 'failed' = 'all') {
    if (this.dataForReport.length === 0) {
      VannilaService.swal.fire(
        'Warning',
        'No data to generate report',
        'warning'
      );
      return;
    }
    this.obs.LoaderSubject.next(true);
    const softSettings = this.softServ.settingsObserv.value;
    // const tempDataForReport:any[] =
    //   report_for === 'all'
    //     ? JSON.parse(JSON.stringify(this.dataForReport))
    //     : this.dataForReport.filter((a) =>
    //         report_for === 'success' ? a.status : !a.status
    //       );

    const tempTableData: any = {};
    if (softSettings.reportWithOrignalData === true) {
      this.contServ.table.forEach((a) => {
        tempTableData[a.number.toString()] = a;
      });
      // tempDataForReport.forEach(a=>a=Object.assign(a,tempTableData[a.number.toString()]));
    }
    const tempDataForReport: any[] = [];
    let def: {
      number: number;
      status: boolean;
      reason: string;
    }[];
    if (report_for === 'all') {
      def = this.dataForReport;
    } else {
      def = this.dataForReport.filter((a) =>
        report_for === 'success' ? a.status : !a.status
      );
    }
    def.forEach((a) => {
      const abc = Object.assign(
        {},
        softSettings.reportWithOrignalData === true
          ? tempTableData[a.number.toString()]
          : {
              number: +a.number,
            },
        {
          status: a.status,
          reason: a.reason,
        }
      );
      tempDataForReport.push(abc);
    });
    await this.saveExcel(tempDataForReport);
    this.obs.LoaderSubject.next(false);
  }
  async saveExcel(dataToSave: any) {
    const result = await this.basic.saveFile({
      properties: [
        'createDirectory',
        'showOverwriteConfirmation',
        'dontAddToRecent',
      ],
      title: 'Export Report',
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
          text: 'Do you want to generate report?',
          icon: 'warning',
          showCancelButton: true,
          cancelButtonText: 'NO',
          showConfirmButton: true,
          confirmButtonText: 'YES',
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.saveExcel(dataToSave);
          }
        });
    }
    const wb = this.elec.GetXlsxUtils().book_new();
    wb.SheetNames.push('Sheet1');
    const xSheet = this.elec.GetXlsxUtils().json_to_sheet(dataToSave);
    wb.Sheets['Sheet1'] = xSheet;
    this.elec.WriteXLSX(wb, result.filePath, {
      type: 'base64',
      bookType: 'xlsx',
    });
    VannilaService.swal.fire('File saved', '', 'success');
  }
}

//
