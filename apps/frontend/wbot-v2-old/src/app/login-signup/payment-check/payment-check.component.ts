import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseFunctionsService } from '@wbotv2/services';
import { environment } from '../../../environments/environment';
import { firstValueFrom, Subscription } from 'rxjs';
import { OrderResponse } from '../../services/interfaces';
import { PaymentResponseService } from '../../services/payment-response.service';
import { ObsServiceService } from '../../services/obs-service.service';

declare const Razorpay: any;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'wbot-v2-nx-payment-check',
  templateUrl: './payment-check.component.html',
  styleUrls: ['./payment-check.component.scss'],
})
export class PaymentCheckComponent implements OnInit, OnDestroy {
  order!: OrderResponse;
  private desc = '';
  paymentResponse!: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };
  subscriptions: Subscription[] = [];
  public_key!: string;
  constructor(
    activatedRoute: ActivatedRoute,
    route: Router,
    private payServ: PaymentResponseService,
    private obs: ObsServiceService,
    private firefunc: FirebaseFunctionsService
  ) {
    payServ.Init();
    firstValueFrom(activatedRoute.queryParams).then((a) => {
      if (
        typeof a['order'] === 'undefined' ||
        typeof a['desc'] === 'undefined'
      ) {
        location.replace('https://rpsoftech.net');
      }
      this.order = JSON.parse(a['order']);
      this.desc = a['desc'];
      route.navigate([], {
        relativeTo: activatedRoute,
      });
      this.getKeyAndStartPayment();
    });
  }
  ngOnDestroy(): void {
    this.obs.showHeaderBehavi.next(true);
  }
  ngOnInit(): void {
    this.obs.showHeaderBehavi.next(false);
  }
  async getKeyAndStartPayment() {
    await this.firefunc
      .CallFunctions('SucscriptionPackageDetailsFunc', 'public_key')
      .then((v) => {
        this.public_key = v;
        this.startPayment();
      });
  }
  LoadScript(url: string): Promise<void> {
    return new Promise((res) => {
      const resource = document.createElement('script');
      resource.async = true;
      resource.src = url;
      resource.onload = () => {
        res();
      };
      const script: any = document.getElementsByTagName('script')[0];
      script.parentNode.insertBefore(resource, script);
      window.addEventListener('beforeunload', () => {
        return 'Are you sure you want to close this page?';
      });
      window.addEventListener('close', () => {
        this.payServ.emitClosePaymentTab();
        this.subscriptions.forEach((s) => {
          s.unsubscribe();
        });
      });
    });
  }

  async startPayment() {
    await this.LoadScript('https://checkout.razorpay.com/v1/checkout.js');
    const Op = {
      key: this.public_key,
      amount: this.order.amount,
      currency: this.order.currency,
      name: 'R P Softech',
      description: this.desc,
      order_id: this.order.id,
      prefill: environment.production
        ? {}
        : {
            name: 'Pheni Patel',
            email: 'tempfeni24@gmail.com',
            contact: '9998887770',
          },
      handler: (response: any) => {
        this.payServ.emitPaymentResponse({
          success: 1,
          data: response,
        });
      },
    };
    const rzp1 = new Razorpay(Op);
    rzp1.on('payment.failed', (response: any) => {
      this.payServ.emitPaymentResponse({
        success: -1,
        data: response,
      });
    });
    rzp1.open();
  }
}
