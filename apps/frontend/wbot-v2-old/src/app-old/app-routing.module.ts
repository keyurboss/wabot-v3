import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from '@wbotv2/services';
import { ExpireScreenComponent } from './expire-screen/expire-screen.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    // component:SplashScreenComponent
  },
  {
    path: 'home',
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    canLoad: [LoginGuard],
    loadChildren: () => import('./home/home.module').then((a) => a.HomeModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login-signup/login-signup.module').then(
        (a) => a.LoginSignupModule
      ),
  },
  {
    path: 'inquiry',
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    canLoad: [LoginGuard],
    loadChildren: () =>
      import('./inquiry/inquiry.module').then((a) => a.InquiryModule),
  },
  // {
  //   path: 'test',
  //   // loadChildren: () => import('./test/test.module').then((a) => a.TestModule),
  // },
  {
    path: 'splash',
    component: SplashScreenComponent,
  },
  {
    path: 'grab',
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    canLoad: [LoginGuard],
    loadChildren: () =>
      import('./grab-contacts/grab-contacts.module').then(
        (a) => a.GrabContactsModule
      ),
  },
  {
    path: 'expired_screen',
    component: ExpireScreenComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // preloadingStrategy: 'PreloadAllModules',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
