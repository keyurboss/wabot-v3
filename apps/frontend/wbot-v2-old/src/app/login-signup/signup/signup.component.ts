import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ObsServiceService } from '../../services/obs-service.service';
import { VannilaService } from '../../services/vannila.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnDestroy {
  name!: string;
  monumber!: string;
  ref!: string;
  hideForm = false;
  type: 'free' | 'plus' | 'premium' = 'free';
  subscriptions: Subscription[] = [];
  constructor(
    private http: HttpService,
    private obs: ObsServiceService,
    private route: ActivatedRoute
  ) {
    this.getUserTypeFromRoute();
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }

  getUserTypeFromRoute() {
    this.subscriptions.push(
      this.route.queryParams.subscribe((p) => {
        this.type = p['plan'];
        if (typeof p['plan'] === 'undefined') this.type = 'free';
      })
    );
  }
  async submit() {
    if (
      typeof this.monumber === 'undefined' ||
      isNaN(+this.monumber) ||
      this.monumber.length !== 10
    ) {
      VannilaService.swal.fire(
        'Warning',
        'Please Enter Valid Number',
        'warning'
      );
      return;
    }
    if (typeof this.ref === 'undefined' || this.ref === '') {
      if (this.type === 'free') {
        this.ref = 'LFREE';
      } else {
        VannilaService.swal.fire(
          'Warning',
          'Please Enter Reference No.',
          'warning'
        );
        return;
      }
    }
    if (this.ref.length !== 5) {
      VannilaService.swal.fire(
        'Warning',
        'Please Enter Valid Reference No.',
        'warning'
      );
      return;
    }
    if (typeof this.name === 'undefined') {
      VannilaService.swal.fire('Warning', 'Please Enter Name', 'warning');
      return;
    }
    // const id = await this.vanill.GetComputerId();
    this.obs.LoaderSubject.next(true);
    const a: { success: number; error?: string } = await this.http.Signup({
      name: this.name,
      number: +this.monumber,
      ref_no: this.ref,
      type: this.type,
    });
    this.obs.LoaderSubject.next(false);
    if (a.success === 1) {
      VannilaService.swal.fire(
        'Success',
        'Your Request Has been submitted to server Ask Admin For Help',
        'success'
      );
      // .then(() => {
      // location.reload();
      // });
    } else if (typeof a.error !== 'undefined' && a.success === -1) {
      VannilaService.swal.fire('Error..!!', a.error, 'error');
    }
  }
}
