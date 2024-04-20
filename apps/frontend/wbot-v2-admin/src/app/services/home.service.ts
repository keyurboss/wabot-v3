import { Injectable } from '@angular/core';
import {
  FirebaseAuthService,
  FirebaseFunctionsService,
  FirebaseRealtimeDatabaseService,
} from '@wbotv2/services';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { FilterPipe } from './filter.pipe';
import Swal from 'sweetalert2';
import { ObsServiceService } from './obs-service.service';
import { LoginService } from './login.service';

export interface UserInterface {
  uid: string;
  number: number;
  name: string;
  type: 'free' | 'plus' | 'premium';
  created_at: number;
  expire_at: number;
  is_active: boolean;
  is_trial: boolean;
  ref_no: string;
  status: 'active' | 'expired';
  selected: boolean;
  last_updated_at: number;
}
export interface IncomingUsersData {
  created_at: number;
  expire_at: number;
  is_active: boolean;
  is_trial: boolean;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  last_updated_at: number | any;
  name: string;
  number: number;
  ref_no: string;
}

export interface InquiriesInterface {
  ref_code?: string;
  inq_id: string;
  uid: string;
  description: string;
  inquiry_type: 'downgrade_package' | 'complaint' | 'other';
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  subject: string;
  reply_from_admin?: string;
}
export interface IncomingInquiriesData {
  uid: string;
  description: string;
  inquiry_type: 'downgrade_package' | 'complaint' | 'other';
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  subject: string;
  reply_from_admin?: string;
}
@Injectable({
  providedIn: 'root',
})
export class HomeService {
  static swal: typeof Swal = Swal;
  my_ref_code!: string;
  isAdmin = false;
  private _userObserv = new BehaviorSubject<UserInterface[]>([]);
  public get UserObserv() {
    return this._userObserv.asObservable();
  }
  filterPipeObject: FilterPipe;
  allSelected = false;
  users_by_id: {
    [uid: string]: UserInterface;
  } = {};
  private _CIDMap = new BehaviorSubject<{
    [cid: string]: string;
  }>({});
  public get CIDMap() {
    return this._CIDMap.asObservable();
  }
  public get CIDMapValue() {
    return this._CIDMap.value;
  }
  inquiries_by_id: {
    [inq_id: string]: InquiriesInterface;
  } = {};
  inquiriesObserv = new BehaviorSubject<InquiriesInterface[]>([]);
  constructor(
    private firedb: FirebaseRealtimeDatabaseService,
    private firebaseAuth: FirebaseAuthService,
    private login: LoginService,
    private FirebaseFunSer: FirebaseFunctionsService,
    private obs: ObsServiceService
  ) {
    firebaseAuth.LoginBehaviourSubject.subscribe(async (a) => {
      if (a) {
        this.init();
      }
    });
    this.filterPipeObject = new FilterPipe();
  }
  async init() {
    await firstValueFrom(
      this.login.AdminDetailsSubject.pipe(filter((a) => a !== null))
    );
    const AdminDetails = this.login.AdminDetailsSubject.value;
    this.my_ref_code = AdminDetails.ref_code;
    if (AdminDetails.type === 'admin') {
      this.isAdmin = true;
      this.firedb.AddValueListner('users', [], (s) => {
        if (s.exists()) {
          this.AfterUserDetailsRecived(s.val());
        }
      });
      this.firedb.AddValueListner('cids', [], (s) => {
        if (s.exists()) {
          this._CIDMap.next(s.val());
        }
      });
      this.firedb.AddValueListner('inquiries', [], (snapshot) => {
        this.afterInquiriesRecievedAdmin(snapshot.val());
      });
    } else {
      this.firedb.AddValueListner(
        'ref_count',
        [AdminDetails.ref_code],
        async () => {
          this.obs.LoaderSubject.next(true);
          const u = await this.FirebaseFunSer.CallFunctions(
            'UserDetailsFunc'
          ).catch((e) => {
            console.log(e);
            HomeService.swal.fire(
              'Error',
              'Something went wrong. Check console logs.',
              'error'
            );
          });
          this.AfterUserDetailsRecived(u);
          this.obs.LoaderSubject.next(false);
        }
      );
      this.firedb.AddValueListner(
        'inquiries',
        [AdminDetails.ref_code],
        (snapshot) => {
          this.afterInquiriesRecieved(snapshot.val());
        }
      );
    }
  }
  async AfterUserDetailsRecived(user_json: { [key: string]: UserInterface }) {
    const userArray: UserInterface[] = [];
    this.users_by_id = user_json;
    if (typeof user_json === 'undefined' || user_json === null) {
      this._userObserv.next(userArray);
      Swal.fire('Warning', 'No users found for this username', 'warning');
      return;
    }
    Object.keys(user_json).forEach((key) => {
      const user: UserInterface = user_json[key];
      user.uid = key;
      user.selected = false;
      user.type = user.type || 'free';
      user.status = user.expire_at > Date.now() ? 'active' : 'expired';
      userArray.push(user);
    });
    this._userObserv.next(userArray);
  }
  afterInquiriesRecieved(inq_json: {
    [inq_id: string]: IncomingInquiriesData;
  }) {
    const inquiryArray: InquiriesInterface[] = [];
    this.inquiries_by_id = {};
    if (typeof inq_json === 'undefined' || inq_json === null) {
      this.inquiriesObserv.next(inquiryArray);
      Swal.fire('Warning', 'No inquiries found for this username', 'warning');
      return;
    }
    Object.keys(inq_json).forEach((key) => {
      const inq: InquiriesInterface = {
        inq_id: key,
        description: inq_json[key].description,
        inquiry_type: inq_json[key].inquiry_type,
        status: inq_json[key].status,
        subject: inq_json[key].subject,
        uid: inq_json[key].uid,
        reply_from_admin: inq_json[key].reply_from_admin,
      };
      this.inquiries_by_id[key] = inq;
      inquiryArray.push(inq);
    });
    this.inquiriesObserv.next(inquiryArray);
  }
  afterInquiriesRecievedAdmin(inq_json: {
    [ref_c: string]: { [inq_id: string]: IncomingInquiriesData };
  }) {
    const inquiryArray: InquiriesInterface[] = [];
    this.inquiries_by_id = {};
    if (typeof inq_json === 'undefined' || inq_json === null) {
      this.inquiriesObserv.next(inquiryArray);
      Swal.fire('Warning', 'No inquiries found for this username', 'warning');
      return;
    }
    Object.keys(inq_json).forEach((key) => {
      const temp: { [inq_id: string]: IncomingInquiriesData } = inq_json[key];
      Object.keys(temp).forEach((k) => {
        const inq: InquiriesInterface = {
          ref_code: key,
          inq_id: k,
          description: temp[k].description,
          inquiry_type: temp[k].inquiry_type,
          status: temp[k].status,
          subject: temp[k].subject,
          uid: temp[k].uid,
          reply_from_admin: temp[k].reply_from_admin,
        };
        this.inquiries_by_id[k] = inq;
        inquiryArray.push(inq);
      });
    });
    this.inquiriesObserv.next(inquiryArray);
  }
  selectAllClick(searchString: string) {
    this.allSelected = !this.allSelected;
    const filteredUsers: UserInterface[] = this.filterPipeObject.transform(
      this._userObserv.value,
      searchString
    );
    filteredUsers.forEach((a) => (a.selected = this.allSelected));
  }
  logout() {
    this.firebaseAuth.LogoutUser();
    setTimeout(() => {
      location.reload();
    });
  }
  async deleteUser() {
    this.obs.LoaderSubject.next(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedUserData: any = {};
    const uid_to_delete: string[] = [];
    this._userObserv.value.forEach((a) => {
      if (a.selected !== true) {
        return;
      }
      const uid = a.uid;
      uid_to_delete.push(uid);
      updatedUserData[`users/${uid}`] = null;
      updatedUserData[`user_settings/${uid}`] = null;
      updatedUserData[`blacklist/${uid}`] = null;
      updatedUserData[`enckey/${uid}`] = null;
      updatedUserData[`ref_count/${a.ref_no}/${uid}`] = null;
    });
    if (Object.keys(updatedUserData).length > 0) {
      this.FirebaseFunSer.CallFunctions('DeleteUser', {
        uids: uid_to_delete,
      });
      await this.firedb
        .UpdateDataToDatabase([], updatedUserData)
        .then(() => {
          HomeService.swal.fire(
            'Success',
            'User deleted successfully.',
            'success'
          );
        })
        .catch((e) => {
          console.log(e);
          HomeService.swal.fire(
            'Error',
            'Something went wrong. Check console logs.',
            'error'
          );
        });
    }
    this.obs.LoaderSubject.next(false);
  }
  updateUser(user: UserInterface) {
    this.obs.LoaderSubject.next(true);
    const u = this.users_by_id[user.uid];
    if (typeof u === 'undefined') {
      this.obs.LoaderSubject.next(false);
      return -1;
    } else {
      u.name = user.name;
      u.type = user.type;
      u.expire_at = user.expire_at;
      const t: IncomingUsersData = {
        created_at: u.created_at,
        expire_at: u.expire_at,
        is_active: u.is_active,
        is_trial: false,
        type: u.type,
        last_updated_at: this.firedb.ServerTimeStamp,
        name: u.name,
        number: u.number,
        ref_no: u.ref_no,
      };
      this.firedb
        .UpdateDataToDatabase(['users', user.uid], t)
        .then(() => {
          HomeService.swal.fire(
            'Success',
            'User updated successfully.',
            'success'
          );
        })
        .catch((e) => {
          console.log(e);
          HomeService.swal.fire(
            'Error',
            'Something went wrong. Check console logs.',
            'error'
          );
        });
      this.AfterUserDetailsRecived(this.users_by_id);
      this.obs.LoaderSubject.next(false);
      return 1;
    }
  }
}
