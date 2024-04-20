import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FirebaseAuthService,
  FirebaseFunctionsService,
} from '@wbotv2/services';
import { ContentService } from '../../services/content.service';
import { UserService } from '../../services/user.service';
import { VannilaService } from '../../services/vannila.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'wbot-v2-nx-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.scss'],
})
export class InquiryComponent {
  subject = '';
  description = '';
  inquiryType: 'downgrade_package' | 'complaint' | 'other' = 'other';
  seeMyInquiries = false;

  constructor(
    private firebaseAuth: FirebaseAuthService,
    public contServ: ContentService,
    private userServ: UserService,
    private fireFunc: FirebaseFunctionsService,
    private router: Router
  ) {}
  backButtonClick() {
    this.router.navigate(['home']);
  }
  async submit() {
    this.subject = this.subject.trim();
    this.description = this.description.trim();
    if (this.subject.length > 0 && this.description.length > 0) {
      const temp = {
        subject: this.subject,
        status: 'PENDING',
        inquiry_type: this.inquiryType,
        description: this.description,
        uid: this.firebaseAuth.uid,
      };
      const p = await this.fireFunc.CallFunctions('newManageInquiryFunc', {
        type: 'generate',
        ref_code: this.userServ.UserDataBhevaior.value.ref_no,
        data_to_set: temp,
      });
      if (p.success === 1) {
        VannilaService.swal
          .fire(
            'Success',
            'Inquiry submitted to admin. We will get back to you on your contact number.',
            'success'
          )
          .then(() => {
            this.contServ.getInquiriesFromDb();
          });
        this.subject = '';
        this.description = '';
      } else {
        VannilaService.swal.fire(
          'Error',
          'Unable to submit inquiry. Please try again later.',
          'error'
        );
      }
    } else {
      VannilaService.swal.fire(
        'Warning',
        'Subject or Description is empty.',
        'warning'
      );
    }
  }
  async deleteInquiry(inq_id: any) {
    const p = await this.fireFunc.CallFunctions('newManageInquiryFunc', {
      type: 'delete',
      ref_code: this.userServ.UserDataBhevaior.value.ref_no,
      id: inq_id,
    });
    if (p.success === 1) {
      const q = this.contServ.inquiry_table_body.findIndex(
        (a) => a.inq_id === inq_id
      );
      if (q > -1) {
        this.contServ.inquiry_table_body.splice(q, 1);
      }
      VannilaService.swal.fire(
        'Success',
        'Inquiry deleted successfully.',
        'success'
      );
    } else {
      VannilaService.swal.fire(
        'Error',
        'Unable to delete inquiry. Please try again later.',
        'error'
      );
    }
  }
  viewReply(type: 'details' | 'reply', a: string | undefined, b?: string) {
    if (type === 'details') {
      const temp = 'Subject:\n' + a + '\n\nDescription:\n' + b;
      VannilaService.swal.fire({
        title: 'Inquiry Details',
        html: '<pre><p style="text-align:left">' + temp + '</p></pre>',
      });
    } else {
      if (typeof a === 'undefined') {
        return;
      }
      VannilaService.swal.fire('Reply from Admin', a, 'info');
    }
  }
}
