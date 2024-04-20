import { Injectable } from '@angular/core';
import { FilterPipe } from '../shared-pipe/filter.pipe';
import { VariableCheckerPipe } from '../shared-pipe/variable-checker.pipe';
import {
  ElectronNativeService,
  OpenDialogOptions,
  SaveDialogOptions,
} from './Electron.Native.service';
@Injectable({
  providedIn: 'root',
})
export class BasicService {
  FilterPipeInstance = new FilterPipe();
  VariableCheckerPipeInstance = new VariableCheckerPipe();
  constructor(private ElectronN: ElectronNativeService) {}
  getCurrentDirectory() {
    // throw new Error('Method not implemented.');
  }
  openFile(option: OpenDialogOptions) {
    return this.ElectronN.OpenDialog(option);
  }
  saveFile(option: SaveDialogOptions) {
    return this.ElectronN.SaveDialog(option);
  }
  close() {
    this.ElectronN.SendToIpcMain('close');
  }
  minimeze() {
    this.ElectronN.SendToIpcMain('mini');
  }
}
