import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronNativeService } from './Electron.Native.service';
import {
  FailurePaymentResponseInterface,
  SuccessPaymentResponseInterface,
} from './interfaces';
import { SocketService } from './socket.service';
@Injectable({
  providedIn: 'root',
})
export class PaymentResponseService {
  isPaymentTabClosed = new BehaviorSubject<boolean>(null as any);
  private _payment_response_subject = new BehaviorSubject<{
    success: number;
    data:
      | SuccessPaymentResponseInterface
      | FailurePaymentResponseInterface
      | 'Abort';
  }>(null as any);
  public get payment_response_subject() {
    return this._payment_response_subject;
  }
  constructor(sock: SocketService, ele: ElectronNativeService) {
    console.log('Payment Response Service Called..');
    ele.ExposedApi.onIpcRender('payment_response_from_browser', (...data) => {
      console.log('payment_response_from_browser=>', ...data);

      this.payment_response_subject.next(data[0]);
    });
    ele.ExposedApi.onIpcRender('payment_tab_closed_by_payment_tab', () => {
      console.log(
        'in disconnect event main software, making ispaymenttabclosed true',
      );

      this.isPaymentTabClosed.next(true);
    });
  }
  Init() {
    console.log('Initializing namespace and listeners');
  }
  emitClosePaymentTab() {
    console.log('in emit close payment tab, disconnecting connection');
    // this.conn.disconnect();
  }
  emitPaymentResponse(data: any) {
    console.log('emitting response=>', data);
    // this.conn.emit('pay_resp', data);
  }
}
