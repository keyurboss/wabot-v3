import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HomeService, UserInterface } from '../../services/home.service';

@Component({
  selector: 'wbot-v2-nx-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
})
export class EditUserComponent {
  createdDate!: string;
  expiredDate!: string;
  user!: UserInterface;
  Oriuser = '';
  error = '';
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { userrr: UserInterface },
    private matdialog: MatDialog,
    private homeServ: HomeService
  ) {
    this.user = JSON.parse(JSON.stringify(data.userrr));
    this.Oriuser = JSON.stringify(data.userrr);

    if (typeof this.user === 'undefined') {
      matdialog.closeAll();
    }
    this.createdDate = this.dateToGoodDate(new Date(this.user.created_at));
    this.expiredDate = this.dateToGoodDate(new Date(this.user.expire_at));
  }
  submitUser() {
    if (this.expiredDate === '') {
      this.error = 'please enter date';
      return;
    }
    const y = parseInt(this.expiredDate.slice(0, 4));
    const m = parseInt(this.expiredDate.slice(5, 7));
    const d = parseInt(this.expiredDate.slice(8, 10));
    this.user.expire_at = new Date(y, m - 1, d).getTime();
    if (JSON.stringify(this.user) === this.Oriuser) {
      this.matdialog.closeAll();
    } else if (this.user.name === '') {
      this.error = 'please enter name';
    } else {
      this.error = '';
      const op = this.homeServ.updateUser(this.user);
      if (op === -1) {
        this.error = 'User not found for update';
      } else {
        this.error = '';
        HomeService.swal.fire('Success', 'User Updated', 'success');
        this.matdialog.closeAll();
      }
    }
  }

  closeDialog() {
    this.matdialog.closeAll();
  }
  dateToGoodDate(d: Date) {
    const mon = d.getMonth() + 1;
    const x =
      mon.toString().length === 1 ? '0' + mon.toString() : mon.toString();
    const da = d.getDate();
    const y = da.toString().length === 1 ? '0' + da.toString() : da.toString();
    return d.getFullYear() + '-' + x + '-' + y;
  }
}
