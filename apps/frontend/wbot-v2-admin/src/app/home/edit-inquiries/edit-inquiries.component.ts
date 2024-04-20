import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseRealtimeDatabaseService } from '@wbotv2/services';
import {
  HomeService,
  IncomingInquiriesData,
  InquiriesInterface,
} from '../../services/home.service';

@Component({
  selector: 'wbot-v2-nx-edit-inquiries',
  templateUrl: './edit-inquiries.component.html',
  styleUrls: ['./edit-inquiries.component.scss'],
})
export class EditInquiriesComponent {
  error = 'something went wrong';
  username!: string;
  inquiryDetails!: InquiriesInterface;
  newStatus!: 'PENDING' | 'RESOLVED' | 'REJECTED';
  newReply!: string | undefined;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      view_inq_id: string;
      uid: string;
    },
    public homeServ: HomeService,
    public firedb: FirebaseRealtimeDatabaseService
  ) {
    this.username = homeServ.users_by_id[data.uid].name;
    this.inquiryDetails = homeServ.inquiries_by_id[data.view_inq_id];
    this.newStatus = this.inquiryDetails.status;
    this.newReply = this.inquiryDetails.reply_from_admin;
  }
  async updateInquiry() {
    if (
      this.newReply === this.inquiryDetails.reply_from_admin &&
      this.newStatus === this.inquiryDetails.status
    ) {
      HomeService.swal.fire('Info', 'Nothing changed.', 'info');
      return;
    } else if (
      this.newReply !== this.inquiryDetails.reply_from_admin &&
      this.newStatus === this.inquiryDetails.status
    ) {
      await HomeService.swal
        .fire({
          title: 'Warning',
          text: 'You have replied but not changed status. Are you sure you want to continue?',
          icon: 'warning',
          showConfirmButton: true,
          showDenyButton: true,
        })
        .then((r) => {
          if (r.isConfirmed === true) {
            this.changeIt();
          }
        });
    } else {
      this.changeIt();
    }
  }

  changeIt() {
    if (
      typeof this.newReply === 'undefined' ||
      this.newReply.trim().length === 0
    ) {
      HomeService.swal.fire('Warning', 'You must reply something.', 'warning');
      return;
    }
    const temp: IncomingInquiriesData = {
      uid: this.inquiryDetails.uid,
      description: this.inquiryDetails.description,
      inquiry_type: this.inquiryDetails.inquiry_type,
      status: this.newStatus,
      subject: this.inquiryDetails.subject,
      reply_from_admin: this.newReply,
    };
    let p;
    if (this.homeServ.isAdmin === false) {
      p = this.firedb.UpdateDataToDatabase(
        ['inquiries', this.homeServ.my_ref_code, this.data.view_inq_id],
        temp
      );
    } else {
      if (
        typeof this.homeServ.inquiries_by_id[this.data.view_inq_id].ref_code ===
        'undefined'
      ) {
        HomeService.swal.fire(
          'Error',
          'Something went wrong. Unable to update this inquiry. Contact developer.',
          'error'
        );
        return;
      } else {
        p = this.firedb.UpdateDataToDatabase(
          [
            'inquiries',
            this.homeServ.inquiries_by_id[this.data.view_inq_id]
              .ref_code as any,
            this.data.view_inq_id,
          ],
          temp
        );
      }
    }
    p.then(() => {
      HomeService.swal.fire(
        'Success',
        'Inquiry updated successfully.',
        'success'
      );
    });
    p.catch(() => {
      HomeService.swal.fire(
        'Error',
        'Something went wrong. Unable to update inquiry. Please try again later.',
        'error'
      );
    });
  }
}
