import { Component } from '@angular/core';
import { filter, firstValueFrom } from 'rxjs';
import { ElectronNativeService } from '../../../services/Electron.Native.service';
import { SocketService } from '../../../services/socket.service';
import { VannilaService } from '../../../services/vannila.service';

@Component({
  selector: 'app-manage-accounts',
  templateUrl: './manage-accounts.component.html',
  styleUrls: ['./manage-accounts.component.scss'],
})
export class ManageAccountsComponent {
  existingAccounts = this.sockServ.WAAccountNamesObservable;
  constructor(
    private sockServ: SocketService,
    private ele: ElectronNativeService
  ) {}
  async add() {
    const Input = await VannilaService.swal.fire({
      input: 'text',
      title: 'Save Account Name',
      text: 'Please Enter The Name You want to save with',
      allowOutsideClick: false,
      showCancelButton: true,
    });
    if (Input.dismiss || Input.isDenied || Input.value.length === 0) {
      return;
    }
    const name = Input.value.replace(/\W/gim, '');
    if (this.sockServ.WAccountNames.includes(name) || name.length === 0) {
      const r = await VannilaService.swal.fire({
        icon: 'warning',
        title: 'Duplicate Name',
        text: `${name} Already Exist In Database`,
        confirmButtonText: 'Re-Enter It',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'Dismiss',
      });
      if (r.isConfirmed) {
        this.add();
      }
      return;
    }
    this.sockServ.StartWhatsapp({
      sessionString: name,
      closeExisting: true,
      saveSession: true,
      // destroyPreviousSession:
    });

    const statu = await firstValueFrom(
      this.sockServ.WAStatusObservable.pipe(
        filter((a) => a.logged_in && a.active)
      )
    );
    if (statu.logged_in === true) {
      this.ele.CloseWhatsappWebWindow();
      this.sockServ.UpdateAccountName(name);
    }
  }
  delete(inpStr: string) {
    this.sockServ.RemoveAccountName(inpStr);
  }
}
