import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FirebaseRealtimeDatabaseService } from '@wbotv2/services';
import { HomeService } from '../../services/home.service';
import { EditInquiriesComponent } from '../edit-inquiries/edit-inquiries.component';

@Component({
  selector: 'wbot-v2-nx-inquiries',
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss'],
})
export class InquiriesComponent {
  searchString = '';
  constructor(
    private matdialog: MatDialog,
    public homeServ: HomeService,
    private firedb: FirebaseRealtimeDatabaseService
  ) {}
  viewInquiry(view_inq_id: string, uid: string) {
    this.matdialog.open(EditInquiriesComponent, {
      width: '50vw',
      height: '80vh',
      data: { view_inq_id: view_inq_id, uid: uid },
    });
  }
  async deleteInquiry(inq_id_to_delete: string) {
    if (this.homeServ.inquiries_by_id[inq_id_to_delete].status === 'PENDING') {
      HomeService.swal.fire(
        'Warning',
        'You cannot delete this inquiry. Status: Pending',
        'warning'
      );
      return;
    }
    let p;
    if (this.homeServ.isAdmin === false) {
      p = this.firedb.RemoveDataFromDatabase([
        'inquiries',
        this.homeServ.my_ref_code,
        inq_id_to_delete,
      ]);
    } else {
      if (
        typeof this.homeServ.inquiries_by_id[inq_id_to_delete].ref_code ===
        'undefined'
      ) {
        HomeService.swal.fire(
          'Error',
          'Something went wrong. Unable to delete this inquiry. Contact developer.',
          'error'
        );
        return;
      } else {
        p = this.firedb.RemoveDataFromDatabase([
          'inquiries',
          this.homeServ.inquiries_by_id[inq_id_to_delete].ref_code as any,
          inq_id_to_delete,
        ]);
      }
    }
    p.then(() => {
      HomeService.swal.fire(
        'Success',
        'Inquiry deleted successfully.',
        'success'
      );
    });
    p.catch(() => {
      HomeService.swal.fire(
        'Error',
        'Something went wrong. Unable to delete inquiry. Please try again later.',
        'error'
      );
    });
  }
  closeDialog() {
    this.matdialog.closeAll();
  }
}
