import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';
import { VannilaService } from './vannila.service';

@Injectable()
export class CheckForUpdateService {
  constructor(appRef: ApplicationRef, updates: SwUpdate) {
    // Allow the app to stabilize first, before starting
    // polling for updates with `interval()`.
    try {
      const appIsStable$ = appRef.isStable.pipe(
        first((isStable) => isStable === true)
      );
      const everyOneHours$ = interval(1 * 60 * 60 * 1000);
      const everyOneHoursOnceAppIsStable$ = concat(
        appIsStable$,
        everyOneHours$
      );

      everyOneHoursOnceAppIsStable$.subscribe(() => updates.checkForUpdate());
      updates.versionUpdates.subscribe((evt) => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            VannilaService.swal.fire({
              allowOutsideClick: false,
              title: 'Update Alert..!!',
              icon: 'info',
              text: `Downloading new app version: ${evt.version.hash}`,
              // showConfirmButton: false,
            });
            break;
          case 'VERSION_READY':
            VannilaService.swal
              .fire({
                allowOutsideClick: false,
                title: 'New Version Is Downloaded..!!',
                icon: 'question',
                text: `Do You want to reload to use new version`,
                showDenyButton: true,
                denyButtonText: 'No',
                confirmButtonText: 'Reload',
                // showConfirmButton: false,
              })
              .then((a) => {
                if (a.isConfirmed === true) {
                  location.reload();
                }
              });
            console.log(`Current app version: ${evt.currentVersion.hash}`);
            console.log(
              `New app version ready for use: ${evt.latestVersion.hash}`
            );
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(
              `Failed to install app version '${evt.version.hash}': ${evt.error}`
            );
            break;
        }
      });
    } catch (e) {
      //
    }
  }
}
