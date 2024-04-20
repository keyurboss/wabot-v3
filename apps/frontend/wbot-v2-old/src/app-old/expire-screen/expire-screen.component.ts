import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-expire-screen',
  templateUrl: './expire-screen.component.html',
  styleUrls: ['./expire-screen.component.scss'],
})
export class ExpireScreenComponent {
  constructor(httpS: HttpService, router: Router) {
    httpS.Login(false).then((a) => {
      if (a.success === 1) {
        localStorage.removeItem('expired');
        localStorage.removeItem('users');
        router.navigate(['home'], {
          replaceUrl: true,
        });
      }
      if (a.success === -2) {
        router.navigate(['login', 'user-subscription']);
      }
    });
  }
}
