import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FirebaseAuthService,
  FirebaseFunctionsService,
} from '@wbotv2/services';
import { environment } from '../../../environments/environment';
import { filter, Subscription } from 'rxjs';
import { ContentService } from '../../services/content.service';
import { ElectronNativeService } from '../../services/Electron.Native.service';
import {
  OrderResponse,
  SuccessPaymentResponseInterface,
} from '../../services/interfaces';
import { ObsServiceService } from '../../services/obs-service.service';
import { PaymentResponseService } from '../../services/payment-response.service';
import { SocketService } from '../../services/socket.service';
import { VannilaService } from '../../services/vannila.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'wbot-v2-nx-user-subscription',
  templateUrl: './user-subscription.component.html',
  styleUrls: ['./user-subscription.component.scss'],
})
export class UserSubscriptionComponent implements OnDestroy {
  s: Subscription[] = [];
  routeParamUserType!: 'free' | 'plus' | 'premium' | undefined;
  isRouteParamUndefined = true;
  selectedPlan = 'free';
  is_user_trial!: boolean;
  is_expired!: boolean;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private firebasefun: FirebaseFunctionsService,
    private auth: FirebaseAuthService,
    private obs: ObsServiceService,
    private eleN: ElectronNativeService,
    private payServ: PaymentResponseService,
    //DO NOT REMOVE ThIS SOCKET SERVICE. IT IS USED TO INITIALIZE SOCKET SERVICE ON THIS PAGE
    private sockServ: SocketService,
    public contServ: ContentService,
  ) {
    const expLocal: any = localStorage.getItem('expired');
    if (expLocal !== null) {
      this.is_expired = JSON.parse(expLocal);
    } else {
      this.is_expired = false;
    }
    this.s.push(
      this.activatedRoute.queryParams.subscribe((p) => {
        if (
          p['current-type'] === 'free' ||
          p['current-type'] === 'plus' ||
          p['current-type'] === 'premium'
        ) {
          this.routeParamUserType = p['current-type'];
          this.is_user_trial = JSON.parse(p['is_user_trial']);
        } else {
          let userFromLocal: any = localStorage.getItem('users');
          if (userFromLocal === null || userFromLocal === 'null') {
            // this.routeParamUserType = 'undefined';
          } else {
            userFromLocal = JSON.parse(userFromLocal);
            this.routeParamUserType = userFromLocal.type;
            this.is_user_trial = userFromLocal.is_trial;
          }
        }
        this.isRouteParamUndefined =
          typeof this.routeParamUserType === 'undefined' ? true : false;
      }),
    );
  }
  ngOnDestroy(): void {
    this.s.forEach((s) => {
      s.unsubscribe();
    });
  }
  backButtonClick() {
    this.router.navigate(['home']);
  }

  selectPlan(p: string) {
    if (this.isRouteParamUndefined === true) {
      //New Login
      this.selectedPlan = p;
      this.router.navigate(['login', 'signup'], {
        queryParams: { plan: this.selectedPlan },
      });
    } else {
      //Existing User
      this.obs.LoaderSubject.next(true);
      switch (this.routeParamUserType) {
        case 'free':
          if (p !== 'free') {
            this.CreateOrderAndPay(p, false, false);
          }
          break;
        case 'plus':
          if (p !== 'free') {
            if (p === 'plus') {
              this.CreateOrderAndPay(
                p,
                true,
                this.is_user_trial === true ? true : false,
              );
            } else {
              this.CreateOrderAndPay(
                p,
                false,
                this.is_user_trial === true ? true : false,
              );
            }
          }
          break;
        case 'premium':
          if (p === 'premium') {
            this.CreateOrderAndPay(
              p,
              true,
              this.is_user_trial === true ? true : false,
            );
          }
          break;
        default:
          VannilaService.swal.fire(
            'Warning',
            'Something went wrong',
            'warning',
          );
      }
    }
  }
  async CreateOrderAndPay(
    package_name: string,
    is_renew: boolean,
    is_new_buy: boolean,
  ) {
    this.payServ.payment_response_subject.next(null as any);
    this.payServ.isPaymentTabClosed.next(null as any);
    this.s.forEach((a) => a.unsubscribe());
    const respon = await this.firebasefun.CallFunctions('newGenrateOrder', {
      package: package_name,
      is_renew,
      is_new_buy,
    });
    let Order: OrderResponse | undefined;
    if (respon.success === 1) {
      Order = respon.respData;
      if (typeof Order !== 'undefined') {
        this.startTransaction(Order, is_renew, is_new_buy);
      }
    } else {
      this.obs.LoaderSubject.next(false);
      VannilaService.swal.fire(
        'Payment Unsuccessful',
        `${respon.error}`,
        'error',
      );
    }
  }

  startTransaction(
    Order: OrderResponse | undefined,
    is_renew: boolean,
    is_new_buy: boolean,
  ) {
    if (typeof Order === 'undefined') {
      return;
    }
    this.payServ.payment_response_subject.next(null as any);
    this.s.push(
      this.payServ.isPaymentTabClosed.subscribe((s) => {
        console.log('isPaymentTabClosed==>', s);

        if (
          s !== null &&
          s === true &&
          this.payServ.payment_response_subject.getValue() === null
        ) {
          console.log('Sending abort');

          this.sockServ.emitPaymentResponseAbort({
            success: 0,
            data: 'Abort',
          });
        }
      }),
    );
    this.eleN.SendToIpcMain(
      'openForPayment',
      `${
        environment.production
          ? 'https://wbotv2.firebaseapp.com/'
          : 'http://localhost:4215'
      }/login/payment-check?order=${JSON.stringify(Order)}&desc=${
        is_new_buy === true
          ? 'New Package'
          : is_renew === true
            ? 'Package Renewal'
            : 'Package Upgrade'
      }`,
    );
    console.log('Order==>', Order);

    this.s.push(
      this.payServ.payment_response_subject
        .pipe(filter((a) => a !== null))
        .subscribe(async (a) => {
          console.log('A==>', a);

          if (a !== null) {
            if (a.success === 0 && a.data === 'Abort') {
              this.obs.LoaderSubject.next(false);
              VannilaService.swal.fire(
                'Warning',
                'Payment aborted.',
                'warning',
              );
            } else if (a.success === 1) {
              const data: SuccessPaymentResponseInterface = a.data as any;
              const recieved_signature = data.razorpay_signature;
              const generated_Signature = await this.firebasefun.CallFunctions(
                'newGeneratePaymentSignature',
                {
                  order_id: Order.id,
                  razorpay_payment_id: data.razorpay_payment_id,
                },
              );
              this.obs.LoaderSubject.next(false);
              if (recieved_signature === generated_Signature) {
                VannilaService.swal
                  .fire('Success', 'Payment successful.', 'success')
                  .then(() => {
                    this.router.navigate([''], {
                      replaceUrl: true,
                    });
                    setTimeout(() => {
                      location.reload();
                    }, 500);
                  });
              } else {
                console.log('Recieved Signature==>', recieved_signature);
                console.log('Generated Signature==>', generated_Signature);

                VannilaService.swal.fire(
                  'Warning',
                  'Payment unsuccessful. Payment could not be verified. If amount is deducted from your account, then please contact admin.',
                  'warning',
                );
              }
            } else if (a.success === -1) {
              this.obs.LoaderSubject.next(false);
              VannilaService.swal.fire(
                'Warning',
                'Payment unsuccessful.',
                'warning',
              );
            }
          }
        }),
    );
  }
  openUserDetails(event: KeyboardEvent) {
    const isNumber = event.key;
    // if (isNumber === 'Backspace') {
    //   return;
    // }
    if (isNumber.toLowerCase() === 'd' && event.ctrlKey && event.shiftKey) {
      const v = this.auth.UserBehaviourSubject.value;
      if (v !== null) {
        VannilaService.swal.fire('User ID', v.uid, 'info');
      }
      // event.preventDefault();
      // event.stopPropagation();
    }
  }
}
