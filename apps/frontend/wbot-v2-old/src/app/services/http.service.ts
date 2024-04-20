import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  FirebaseAuthService,
  FirebaseFunctionsService,
} from '@wbotv2/services';
import { VannilaService } from './vannila.service';
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private vanilla: VannilaService,
    private FirebaseFunSer: FirebaseFunctionsService,
    private auth: FirebaseAuthService,
    private route: Router
  ) {}
  async Login(redirect = true) {
    const cid = await this.vanilla.GetComputerId();
    const LoginResp: {
      success: number;
      token: string;
    } = await this.FirebaseFunSer.CallFunctions('LoginFunc', {
      computer_id: cid,
    });

    if (LoginResp.success === -1) {
      this.route.navigate(['login', 'user-subscription'], {
        replaceUrl: true,
      });
    }
    if (LoginResp.success === -2) {
      if (redirect === true) {
        this.route.navigate(['expired_screen'], {
          replaceUrl: true,
        });
      }
    }
    if (LoginResp.success === 1) {
      this.auth.signinWithCustomToken(LoginResp.token);
      if (redirect === true) {
        this.route.navigate(['home'], {
          replaceUrl: true,
        });
      }
    }
    return LoginResp;
  }
  async Signup(data: {
    name: string;
    number: number;
    ref_no: string;
    type: 'free' | 'plus' | 'premium';
  }) {
    const cid = await this.vanilla.GetComputerId();
    const LoginResp: {
      success: number;
      token: string;
      error?: string;
    } = await this.FirebaseFunSer.CallFunctions('SignUp', {
      computer_id: cid,
      name: data.name,
      number: data.number,
      ref_no: data.ref_no,
      type: data.type,
    });
    if (LoginResp.success === -1) {
      // this.route.navigate(['login','signup'], {
      //   replaceUrl: true,
      // });
    }
    if (LoginResp.success === -2) {
      // this.auth.signinWithCustomToken(LoginResp.token);
      this.route.navigate(['expired_screen'], {
        replaceUrl: true,
      });
    }
    if (LoginResp.success === 1) {
      this.auth.signinWithCustomToken(LoginResp.token);
      this.route.navigate(['home'], {
        replaceUrl: true,
      });
    }
    return LoginResp;
  }
}
