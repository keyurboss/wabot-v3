import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import {
  FirebaseAuthService,
  FirebaseRealtimeDatabaseService,
} from '@wbotv2/services';
const BlackListDataNameInLocalStorage = 'blackListData';
@Injectable({
  providedIn: 'root',
})
export class BlacklistService {
  lastUpdatedDate!: any;
  private _listNum: any[] = [];
  private _BlackListObser = new BehaviorSubject<any[]>([]);
  private isUpdatedbyus = false;
  public get listNum(): any[] {
    return this._listNum;
  }
  public get BlackListObser() {
    return this._BlackListObser.asObservable();
  }
  constructor(
    private firedb: FirebaseRealtimeDatabaseService,
    private firebaseAuth: FirebaseAuthService
  ) {
    firstValueFrom(
      firebaseAuth.LoginBehaviourSubject.pipe(
        filter((a) => a !== null && a === true)
      )
    ).then((a) => {
      console.log(a);
      this.chkBlacklist();
    });
  }

  UpdateListInDatabase() {
    this.isUpdatedbyus = true;
    const t = this.firedb.ServerTimeStamp;
    this.firedb.UpdateDataToDatabase(['blacklist', this.firebaseAuth.uid], {
      last_updated_at: t,
      list: this.listNum,
    });
    this.updateListInLocalStorageAndObserver(
      this.listNum,
      parseInt(t.toString())
    );
  }
  addNumber(contact: number, updateDatabase = true) {
    if (this.listNum.indexOf(contact) === -1) {
      this.listNum.push(contact);
      this.updateListInLocalStorageAndObserver(this.listNum);
      if (updateDatabase === true) {
        this.UpdateListInDatabase();
      }
      return 1;
    }
    return -1;
  }
  DeleteNumber(contact: number, updateDatabase = true) {
    const indesx = this.listNum.indexOf(contact);
    if (indesx > -1) {
      this.listNum.splice(indesx, 1);
      this.updateListInLocalStorageAndObserver(this.listNum);
      if (updateDatabase === true) {
        this.UpdateListInDatabase();
      }
    }
  }
  async getSnap(val: string) {
    return await this.firedb.ReadOnceFromDatabase('blacklist', [
      this.firebaseAuth.uid,
      val,
    ]);
  }
  private updateListInLocalStorageAndObserver(
    list: any[],
    timeStamp = Date.now()
  ) {
    this._listNum = list;
    this._BlackListObser.next(list);
    localStorage.setItem(
      BlackListDataNameInLocalStorage,
      JSON.stringify({
        last_updated_at: timeStamp,
        list,
      })
    );
  }
  async chkBlacklist() {
    let CurrentData: any = localStorage.getItem(
      BlackListDataNameInLocalStorage
    );
    const SnapShot = await this.firedb.ReadOnceFromDatabase('blacklist', [
      this.firebaseAuth.uid,
    ]);
    if (CurrentData === null) {
      if (SnapShot.exists() === false) {
        const tt = this.firedb.ServerTimeStamp;
        this.firedb.SetDataToDatabase(
          ['blacklist', this.firebaseAuth.uid, 'last_updated_at'],
          tt
        );
        this.isUpdatedbyus = true;
        CurrentData.last_updated_at = tt;
        CurrentData.list = [];
      } else {
        CurrentData = SnapShot.val();
        this.updateListInLocalStorageAndObserver(
          CurrentData.list || [],
          CurrentData.last_updated_at
        );
      }
    } else {
      CurrentData = JSON.parse(CurrentData);
      if (SnapShot.exists()) {
        const SnapShotData = SnapShot.val();
        if (CurrentData.last_updated_at !== SnapShotData.last_updated_at) {
          this.updateListInLocalStorageAndObserver(
            SnapShotData.list || [],
            SnapShotData.last_updated_at
          );
          CurrentData = SnapShotData;
        }
      }
      this._listNum = CurrentData.list;
      this._BlackListObser.next(this._listNum);
    }

    this.firedb.AddValueListner(
      'blacklist',
      [this.firebaseAuth.uid, 'last_updated_at'],
      async (timesatmpSnapshot) => {
        if (timesatmpSnapshot.exists()) {
          if (CurrentData.last_updated_at !== timesatmpSnapshot.val()) {
            if (this.isUpdatedbyus === false) {
              const ListSnapshot = await this.getSnap('list');
              if (ListSnapshot.exists()) {
                CurrentData.list = ListSnapshot.val();
              }
              this.updateListInLocalStorageAndObserver(
                CurrentData.list || [],
                timesatmpSnapshot.val()
              );
            } else {
              this.isUpdatedbyus = false;
              this.updateListInLocalStorageAndObserver(
                this.listNum || [],
                timesatmpSnapshot.val()
              );
            }
          }
        }
      }
    );
  }
}
