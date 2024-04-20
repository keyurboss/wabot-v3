import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService } from '@wbotv2/services';
import { Subscription } from 'rxjs';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class SplashScreenComponent implements OnDestroy {
  subsc: Subscription[] = [];
  constructor(
    private http: HttpService,
    auth: FirebaseAuthService,
    router: Router
  ) {
    // func.Signup('asdasdasd','asdasdasdasd','asdassaasdad');
    setTimeout(() => {
      this.subsc.push(
        auth.LoginBehaviourSubject.subscribe((a) => {
          if (a !== null) {
            if (a === true) {
              router.navigate(['home'], {
                replaceUrl: true,
              });
            } else {
              this.LoginFunctionPath();
            }
          }
        })
      );
    }, 500);
  }
  ngOnDestroy(): void {
    this.subsc.forEach((s) => s.unsubscribe());
  }
  LoginFunctionPath() {
    this.http.Login();
  }
}
