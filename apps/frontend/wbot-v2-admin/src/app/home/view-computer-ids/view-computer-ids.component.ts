/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseRealtimeDatabaseService } from '@wbotv2/services';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HomeService, UserInterface } from '../../services/home.service';

@Component({
  selector: 'wbot-v2-nx-view-computer-ids',
  templateUrl: './view-computer-ids.component.html',
  styleUrls: ['./view-computer-ids.component.scss'],
})
export class ViewComputerIdsComponent implements OnDestroy {
  error = '';
  dataObs = new BehaviorSubject<
    (UserInterface & {
      cid: string;
    })[]
  >([]);
  enableEditSection = false;
  oldUserID = '';
  newUserID = '';
  cidToEdit = '';
  searchString = '';
  subscri: Subscription[] = [];
  constructor(
    private matdialog: MatDialog,
    private homeServ: HomeService,
    private firedb: FirebaseRealtimeDatabaseService,
    private snack: MatSnackBar
  ) {
    this.error = '';
    this.subscri.push(
      homeServ.UserObserv.subscribe(
        (a) => a.length > 0 && this.UserDetailsChanged()
      )
    );
    this.subscri.push(
      homeServ.CIDMap.subscribe(
        (a) => Object.keys(a).length > 0 && this.UserDetailsChanged()
      )
    );
  }
  UserDetailsChanged() {
    const data: any[] = [];
    const cids = this.homeServ.CIDMapValue;
    Object.keys(cids).forEach((cid) => {
      const uid = cids[cid];
      if (typeof this.homeServ.users_by_id[uid] === 'undefined') {
        return;
      }
      data.push(
        Object.assign(
          {
            cid,
          },
          this.homeServ.users_by_id[uid]
        )
      );
    });
    this.dataObs.next(data);
  }
  ngOnDestroy(): void {
    this.subscri.forEach((a) => a.unsubscribe());
    // throw new Error('Method not implemented.');
  }
  editClick(cid: string, uid: string) {
    this.enableEditSection = true;
    this.oldUserID = uid;
    this.cidToEdit = cid;
  }
  async update() {
    const newid = this.newUserID.trim();
    if (this.oldUserID === newid || newid === '') {
      this.enableEditSection = false;
      this.cidToEdit = '';
    } else {
      if (this.cidToEdit !== '') {
        await this.firedb
          .SetDataToDatabase(['cids', this.cidToEdit], newid)
          .catch((e) => {
            console.log(e);
            HomeService.swal.fire(
              'Error',
              'Something went wrong. Check console logs.',
              'error'
            );
          });
        this.enableEditSection = false;
        HomeService.swal.fire('Success', 'User ID updated', 'success');
      }
    }
  }
  openSnackBar() {
    this.snack.open('copied', '', { duration: 1000 });
  }
  cancel() {
    this.enableEditSection = false;
    this.cidToEdit = '';
    this.oldUserID = '';
    this.newUserID = '';
  }
  closeDialog() {
    this.matdialog.closeAll();
  }
  async deleteComputerId(cid: string) {
    if (cid === '') {
      return;
    }
    const res = await HomeService.swal.fire({
      title: 'Warning',
      text: `Are you sure you want to delete cid:${cid}?`,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'NO',
      showConfirmButton: true,
      confirmButtonText: 'YES',
    });
    if (res.isConfirmed) {
      this.firedb
        .SetDataToDatabase(['cids', cid], null)
        .then(() => {
          this.snack.open('deleted successfully', '', { duration: 1000 });
        })
        .catch((e) => {
          HomeService.swal.fire(
            'Error',
            'Something went wrong. Unable to delete',
            'error'
          );
        });
    }
  }
}
