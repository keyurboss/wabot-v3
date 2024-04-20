import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'wbot-v2-nx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  viewPass = false;
  constructor(private loginServ: LoginService, private route: Router) {}

  async loginClick() {
    if (this.username === '') {
      this.error = 'please enter username';
    } else if (this.password === '') {
      this.error = 'please enter password';
    } else {
      this.error = '';
      const a: { success: number; token: string } = await this.loginServ.login({
        uname: this.username,
        upass: this.password,
      });
      if (a.success === 1) {
        this.route.navigate(['home']);
      } else {
        // this.error="Incorrect Username or Password."
        this.error = a.token;
      }
    }
  }
  togglePassword() {
    this.viewPass = !this.viewPass;
  }
}
