import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { ExpirationCheck } from '../services/ExpirationCheck.service';
import { FirebaseAuthService } from '@wbotv2/services';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'content',
        pathMatch: 'full',
      },
      {
        path: 'content',
        loadChildren: () =>
          import('./content/content.module').then((a) => a.ContentModule),
      },
    ],
  },
];

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class HomeModule {
  constructor(expS: ExpirationCheck, fireAuth: FirebaseAuthService) {
    fireAuth.LoginBehaviourSubject.subscribe((s) => {
      if (s === true) {
        expS.chkExp();
      }
    });
  }
}
