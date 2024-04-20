import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  SoftwareSettingsService,
  UserSettingsData,
} from '../../../services/software-settings.service';

@Component({
  selector: 'app-sotfware-setting',
  templateUrl: './sotfware-setting.component.html',
  styleUrls: ['./sotfware-setting.component.scss'],
})
export class SotfwareSettingComponent implements OnInit {
  uset!: Observable<UserSettingsData>;
  softwarestring = '';
  constructor(private softSetService: SoftwareSettingsService) {}
  ngOnInit(): void {
    this.uset = this.softSetService.settingsObserv;
    this.softwarestring = JSON.stringify(
      this.softSetService.settingsObserv.value
    );
  }
  saveSettings(u: UserSettingsData) {
    if (JSON.stringify(u) === this.softwarestring) {
      return;
    }
    this.softSetService.updateSettingsInDb(u);
  }
  formatLabel(value: number) {
    if (value >= 60) {
      return Math.round(value / 60) + 'sec';
    }
    return value.toString();
  }
  chatinterval(value: number) {
    if (value >= 1) {
      return Math.round(value).toString();
    }
    return value.toString();
  }
}
