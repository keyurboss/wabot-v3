import { Component, OnDestroy } from '@angular/core';
import { VannilaService } from '../../services/vannila.service';
import { BasicService } from '../../services/basic.service';
import { map, Observable, Subscription } from 'rxjs';
import { UserInterface } from '../../services/interfaces';
import { UserService } from '../../services/user.service';
// import { FirebaseAuthService } from '@wbotv2/services';
import { Router } from '@angular/router';
import { ObsServiceService } from '../../services/obs-service.service';
import { ElectronNativeService } from '../../services/Electron.Native.service';

@Component({
  selector: 'app-header',
  standalone:true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  // swal = VannilaService.swal;
  _HeadeObse!: Observable<boolean>;
  user!: UserInterface;
  subsc: Subscription[] = [];
  constructor(
    private basic: BasicService,
    private elec: ElectronNativeService,
    userServices: UserService,
    obss: ObsServiceService,
    private router: Router
  ) {
    this.subsc.push(
      userServices.UserDataBhevaior.subscribe((a) => (this.user = a))
    );
    this._HeadeObse = obss.showHeaderBehavi.pipe(map((a) => !a));

    // auth.LoginBehaviourSubject.subscribe(() => {
    //   // if(a === true){
    //   // }
    // });
  }
  ngOnDestroy(): void {
    this.subsc.forEach((s) => s.unsubscribe());
  }
  openSubscription(utype: 'free' | 'plus' | 'premium', utrial: boolean) {
    this.router.navigate(['login', 'user-subscription'], {
      skipLocationChange: true,
      queryParams: { 'current-type': utype, is_user_trial: utrial },
    });
  }
  openInquiry() {
    this.router.navigate(['inquiry'], {
      skipLocationChange: true,
    });
  }
  close() {
    VannilaService.swal
      .fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: 'Are You Sure You want to quit ?',
        showCancelButton: true,
        // confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, Close it!',
        cancelButtonColor: '#d33',
      })
      .then(async (willDelete) => {
        if (willDelete.value === true) {
          this.elec.CloseWhatsappWebWindow();
          VannilaService.swal
            .fire({
              title: 'Okay Byyee!',
              timer: 1500,
              text: 'See You again!',
              showConfirmButton: false,
            })
            .then(() => {
              this.basic.close();
            });
        }
      });
  }
  minimise() {
    this.basic.minimeze();
  }
  reload() {
    VannilaService.swal
      .fire({
        icon: 'warning',
        title: 'Are you sure you want to reload?',
        text: 'Unsaved Changes Will Be lost',
        // background:'transparent',
        // backdrop:false,
        showCancelButton: true,
        // confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Reload',
        cancelButtonColor: '#d33',
      })
      .then((sure) => {
        if (sure.value) {
          window.location.reload();
        }
      });
  }
}
