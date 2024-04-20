import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ObsServiceService } from './services/obs-service.service';

@Component({
  selector: 'wbot-v2-nx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'wbot-v2-admin';
  _LoaderObse!: Observable<boolean>;
  constructor(obss: ObsServiceService) {
    this._LoaderObse = obss.LoaderSubject.asObservable().pipe(map((a) => !a));
  }
}
