import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from '@wbotv2/services';
import { SplashComponent } from './splash/splash.component';

const routes: Routes = [
  {
    path: 'home',
    canLoad: [LoginGuard],
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    loadChildren: () => import('./home/home.module').then((a) => a.HomeModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((a) => a.LoginModule),
  },
  {
    path: 'expired_screen',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    component: SplashComponent,
    // redirectTo:'login',
    // pathMatch:'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // enableTracing:true
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
