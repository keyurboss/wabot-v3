import { Injectable } from '@angular/core';
import {
  FirebaseAuthService,
  FirebaseRealtimeDatabaseService,
} from '@wbotv2/services';
import { BehaviorSubject } from 'rxjs';

export interface UserSettingsData {
  individual_interval: number;
  batch_interval: {
    is_active: boolean;
    batch_count: number;
    batch_interval: number;
  };
  ignoreForwardStrategy: boolean;
  autoLogout: boolean;
  isContentRTL: boolean;
  reportWithOrignalData: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SoftwareSettingsService {
  uSettings: UserSettingsData = {
    batch_interval: {
      batch_count: 5,
      batch_interval: 10,
      is_active: false,
    },
    reportWithOrignalData: false,
    individual_interval: 1.5,
    ignoreForwardStrategy: false,
    autoLogout: false,
    isContentRTL: false,
  };
  private _settingsObserv = new BehaviorSubject<UserSettingsData>(
    this.uSettings
  );
  public get settingsObserv() {
    return this._settingsObserv;
  }

  constructor(
    private firedb: FirebaseRealtimeDatabaseService,
    private firebaseAuth: FirebaseAuthService
  ) {
    this.chkUserSettings();
  }
  async getSnap(val: string) {
    return await this.firedb.ReadOnceFromDatabase('user_settings', [
      this.firebaseAuth.uid,
      val,
    ]);
  }
  private updateSettingsInLocal(set: UserSettingsData, timeStamp = Date.now()) {
    this.uSettings = set;
    this._settingsObserv.next(set);
    localStorage.setItem(
      'user_settings_new',
      JSON.stringify({
        last_updated_at: timeStamp,
        settings: set,
      })
    );
  }
  individualSettingsInLocal(newInterval: number, timeStamp = Date.now()) {
    this.uSettings.individual_interval = newInterval;
    this._settingsObserv.next(this.uSettings);
    localStorage.setItem(
      'user_settings_new',
      JSON.stringify({
        last_updated_at: timeStamp,
        settings: this.uSettings,
      })
    );
  }

  updateSettingsInDb(newSet: UserSettingsData) {
    this.firedb.UpdateDataToDatabase(['user_settings', this.firebaseAuth.uid], {
      last_updated_at: this.firedb.ServerTimeStamp,
      settings: newSet,
    });
    this.updateSettingsInLocal(newSet);
  }
  async chkUserSettings() {
    let currentSettings: any = localStorage.getItem('user_settings_new');
    if (currentSettings === null) {
      const SnapShot = await this.firedb.ReadOnceFromDatabase('user_settings', [
        this.firebaseAuth.uid,
      ]);
      if (SnapShot.exists() === false) {
        this.firedb.SetDataToDatabase(
          ['user_settings', this.firebaseAuth.uid],
          {
            last_updated_at: this.firedb.ServerTimeStamp,
            settings: this.uSettings,
          }
        );
        currentSettings = {
          settings: this.uSettings,
          last_updated_at: Date.now(),
        };
      } else {
        currentSettings = SnapShot.val();
        this.updateSettingsInLocal(
          currentSettings.settings || this.uSettings,
          currentSettings.last_updated_at
        );
      }
    } else {
      currentSettings = JSON.parse(currentSettings);
      if (Array.isArray(currentSettings.settings)) {
        currentSettings.settings = this.uSettings;
      }
      this.updateSettingsInLocal(currentSettings.settings || this.uSettings);
    }

    this.firedb.AddValueListner(
      'user_settings',
      [this.firebaseAuth.uid, 'last_updated_at'],
      async (timestampSnapshot) => {
        if (timestampSnapshot.exists()) {
          if (currentSettings.last_updated_at !== timestampSnapshot.val()) {
            const settingsSnapShot = await this.getSnap('settings');
            if (settingsSnapShot.exists()) {
              currentSettings.settings = settingsSnapShot.val();
            }
            this.updateSettingsInLocal(
              currentSettings.settings || this.uSettings,
              timestampSnapshot.val()
            );
          }
        }
      }
    );
  }
}
