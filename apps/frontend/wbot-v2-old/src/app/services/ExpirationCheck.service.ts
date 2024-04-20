import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  FirebaseAuthService,
  FirebaseRealtimeDatabaseService,
} from '@wbotv2/services';
import { UserService } from './user.service';
@Injectable({
  providedIn: 'root',
})
export class ExpirationCheck {
  userDet!: any;
  uid!: string;
  constructor(
    private firebaseAuth: FirebaseAuthService,
    private firedb: FirebaseRealtimeDatabaseService,
    private userserv: UserService,
    private router: Router
  ) {}

  async chkExp() {
    this.uid = this.firebaseAuth.uid;
    let UserFromLocalStorage = localStorage.getItem('users');
    if (UserFromLocalStorage === null || UserFromLocalStorage === 'null') {
      UserFromLocalStorage = await this.setUserInLocal();
    } else {
      UserFromLocalStorage = JSON.parse(UserFromLocalStorage);
    }
    const fireDate = await this.firedb.ReadOnceFromDatabase('users', [
      this.firebaseAuth.uid,
      'last_updated_at',
    ]);
    if (fireDate.exists() === false) {
      this.firebaseAuth.LogoutUser();
      this.router.navigate(['expired_screen']);
      return;
    }
    this.userDet = UserFromLocalStorage;
    if (this.userDet.last_updated_at !== fireDate.val()) {
      this.userDet = await this.setUserInLocal();
    }
    localStorage.setItem('users', JSON.stringify(this.userDet));
    this.userserv.UserDataBhevaior.next(this.userDet);
    if (this.userDet.type !== 'free') {
      if (Date.now() > this.userDet.expire_at) {
        localStorage.setItem('expired', 'true');
        this.router.navigate(['expired_screen']);
        // this.firebaseAuth.LogoutUser();
      } else {
        localStorage.removeItem('expired');
      }
    }
  }

  private async setUserInLocal() {
    const userSnapShot = await this.firedb.ReadOnceFromDatabase('users', [
      this.firebaseAuth.uid,
    ]);
    if (userSnapShot.exists() === false) {
      this.firebaseAuth.LogoutUser();
      this.router.navigate(['expired_screen']);
      return null;
    }
    return userSnapShot.val();
  }
}
