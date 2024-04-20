/* eslint-disable @typescript-eslint/no-empty-function */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { initializeApp } from 'firebase/app';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FIREBASEAPP, ENV } from '@wbotv2/services';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonCompModule } from './common/common.comp.module';
import { ExpireScreenComponent } from './expire-screen/expire-screen.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { CheckForUpdateService } from './services/check-for-update.service';

const firebaseConfig = {
  apiKey: 'AIzaSyDJm5H1uSCQskm2eqpVu3CwmZh_qtJQWnM',
  authDomain: 'wbotv2.firebaseapp.com',
  databaseURL:
    'https://wbotv2-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'wbotv2',
  storageBucket: 'wbotv2.appspot.com',
  messagingSenderId: '922518837306',
  appId: '1:922518837306:web:fad9bf7233d33ad60a7d03',
  measurementId: 'G-CVT3XGWB00',
};

@NgModule({
  declarations: [AppComponent, SplashScreenComponent, ExpireScreenComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonCompModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    CheckForUpdateService,
    {
      provide: FIREBASEAPP,
      useValue: initializeApp(firebaseConfig),
    },
    {
      provide: ENV,
      useValue: environment,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(cup: CheckForUpdateService) {}
}
