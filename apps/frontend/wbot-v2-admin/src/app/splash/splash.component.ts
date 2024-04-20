import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '@wbotv2/services';
import { Subscription } from 'rxjs';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'wbot-v2-nx-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent implements OnDestroy {
  subsc: Subscription[] = [];
  constructor(
    private loginServ: LoginService,
    auth: FirebaseAuthService,
    router: Router
  ) {
    setTimeout(() => {
      this.subsc.push(
        auth.LoginBehaviourSubject.subscribe((a) => {
          if (a !== null) {
            if (a === true) {
              router.navigate(['home'], {
                replaceUrl: true,
              });
            } else {
              router.navigate(['login'], {
                replaceUrl: true,
              });
            }
          }
        })
      );
    }, 500);
  }
  ngOnDestroy(): void {
    this.subsc.forEach((s) => s.unsubscribe());
  }
}
