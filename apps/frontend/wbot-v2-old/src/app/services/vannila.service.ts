import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { ElectronNativeService } from './Electron.Native.service';

@Injectable({
  providedIn: 'root',
})
export class VannilaService {
  static swal: typeof Swal = Swal;
  isElectron = false;
  constructor(private elec: ElectronNativeService) {
    this.isElectron =
      typeof (window as any).isElectron === 'undefined'
        ? false
        : (window as any).isElectron;
  }
  async GetComputerId(): Promise<string> {
    let computerid = localStorage.getItem('computer_id');
    if (computerid === null) {
      if (this.isElectron === false) {
        computerid = this.randomBytes(64);
        localStorage.setItem('computer_id', computerid);
      } else {
        computerid = await this.elec.ComputerId();
        localStorage.setItem('computer_id', computerid);
      }
    }
    return computerid;
  }
  randomBytes(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
