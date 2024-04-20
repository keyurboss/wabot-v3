import { AfterViewInit, Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ElectronNativeService } from './services/Electron.Native.service';
import { ObsServiceService } from './services/obs-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  _LoaderObse!: Observable<boolean>;
  _HeadeObse!: Observable<boolean>;
  constructor(
    obss: ObsServiceService,
    private Electron: ElectronNativeService
  ) {
    this._LoaderObse = obss.LoaderSubject.pipe(map((a) => !a));
  }
  ngAfterViewInit(): void {
    this.Electron.SendToIpcMain('show');
  }
}
