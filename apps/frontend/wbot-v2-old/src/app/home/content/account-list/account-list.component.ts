import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent {
  enableDefaultDisplay = true;
  opts: string[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      c: string;
      disableOpt: { old: boolean; unsaved: boolean };
      accChoice: string;
    },
    private sockServ: SocketService
  ) {}
  fetchOptions() {
    this.opts = this.sockServ.WAccountNames;
    if (this.opts.length > 0) {
      this.enableDefaultDisplay = false;
    }
  }
}
