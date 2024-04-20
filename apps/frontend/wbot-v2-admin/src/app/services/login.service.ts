import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  FirebaseAuthService,
  FirebaseFunctionsService,
  FirebaseRealtimeDatabaseService,
} from '@wbotv2/services';
import { BehaviorSubject } from 'rxjs';
import { ObsServiceService } from './obs-service.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  AdminDetailsSubject = new BehaviorSubject<{
    name: string;
    ref_code: string;
    type: string;
  }>(null as any);
  constructor(
    private firebaseAuth: FirebaseAuthService,
    private FirebaseFunSer: FirebaseFunctionsService,
    private firebaseDb: FirebaseRealtimeDatabaseService,
    private obs: ObsServiceService,
    private route: Router
  ) {
    firebaseAuth.changePersist();
    firebaseAuth.UserBehaviourSubject.subscribe((a) => {
      if (a !== null) {
        this.firebaseDb
          .ReadOnceFromDatabase('admin', ['users', a.uid])
          .then((a1) => {
            this.AdminDetailsSubject.next(a1.exists() ? a1.val() : null);
          });
      } else {
        this.AdminDetailsSubject.next(null as any);
      }
    });
  }

  async login(data: { uname: string; upass: string }) {
    this.obs.LoaderSubject.next(true);
    const LoginResp: {
      success: number;
      token: string;
    } = await this.FirebaseFunSer.CallFunctions('LoginAdminFunc', {
      uname: data.uname,
      upass: data.upass,
    });
    if (LoginResp.success === -1) {
      this.route.navigate(['login'], {
        replaceUrl: true,
      });
    }
    if (LoginResp.success === 1) {
      await this.firebaseAuth.signinWithCustomToken(LoginResp.token);
      this.firebaseAuth.LoginBehaviourSubject.next(true);
      this.route.navigate(['home'], {
        replaceUrl: true,
      });
    }
    this.obs.LoaderSubject.next(false);
    return LoginResp;
  }
}
