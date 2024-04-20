import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ENV, FIREBASEAPP } from '@wbotv2/services';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SplashComponent } from './splash/splash.component';

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
  declarations: [AppComponent, SplashComponent],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule],
  providers: [
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
export class AppModule {}
