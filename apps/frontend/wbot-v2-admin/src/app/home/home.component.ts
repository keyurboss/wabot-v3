import { Component } from '@angular/core';
import { FilterPipe } from '../services/filter.pipe';
import { HomeService } from '../services/home.service';
import { MatDialog } from '@angular/material/dialog';
import { EditUserComponent } from './edit-user/edit-user.component';
import { ViewComputerIdsComponent } from './view-computer-ids/view-computer-ids.component';
import { DecryptFileComponent } from './decrypt-file/decrypt-file.component';
import { InquiriesComponent } from './inquiries/inquiries.component';

@Component({
  selector: 'wbot-v2-nx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  searchString = '';
  filterPipeObject: FilterPipe;
  directionToSort: 'asc' | 'desc' = 'asc';
  colToSort = '';
  ad: { [k: string]: 'asc' | 'desc' } = {
    Name: this.directionToSort,
    Number: this.directionToSort,
    Type: this.directionToSort,
    'Created On': this.directionToSort,
    'Expires On': this.directionToSort,
    Status: this.directionToSort,
  };
  headers = ['Name', 'Number', 'Type', 'Created On', 'Expires On', 'Status'];
  constructor(public homeServ: HomeService, private dialog: MatDialog) {
    this.filterPipeObject = new FilterPipe();
    this.ad['CreatedOn'] = 'desc';
    this.sortUsers('Created On');
  }
  editUser(uid: string) {
    const user = this.homeServ.users_by_id[uid];
    if (typeof user === 'undefined') {
      //TODO: Notify user not found error
      return;
    }
    this.dialog.open(EditUserComponent, {
      width: '50vw',
      height: '60vh',
      data: { userrr: user },
    });
  }
  deleteUser() {
    this.homeServ.deleteUser();
    this.searchString = '';
    this.homeServ.allSelected = false;
  }
  viewCids() {
    this.dialog.open(ViewComputerIdsComponent, {
      width: '90vw',
      height: '90vh',
    });
  }
  sortUsers(h: string) {
    this.colToSort = h;
    this.ad[h] = this.ad[h] === 'asc' ? 'desc' : 'asc';
    this.directionToSort = this.ad[h];
  }
  openDecryptFileComponent() {
    this.dialog.open(DecryptFileComponent, {
      width: '50vw',
      height: '60vh',
    });
  }
  openInquiries() {
    this.dialog.open(InquiriesComponent, {
      width: '90vw',
      height: '90vh',
    });
  }
}
