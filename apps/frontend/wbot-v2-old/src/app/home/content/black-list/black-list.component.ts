import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  FixedSizeVirtualScrollStrategy,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs';
import { BlacklistService } from '../../../services/blacklist.service';

export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(50, 0, 0);
  }
}
interface VirtualScroll extends CdkVirtualScrollViewport {
  RefFunc: (offset: number, to?: 'to-start' | 'to-end') => void;
}

@Component({
  selector: 'app-block-list',
  templateUrl: './block-list.component.html',
  styleUrls: ['./block-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy },
  ],
})
export class BlackListComponent implements OnInit, OnDestroy {
  numberArray!: Observable<any[]>;
  error: any;
  inputString = '';
  isListChanged = false;
  @ViewChild('harsh') VirtualScollEle!: VirtualScroll;
  constructor(
    private _blocklistservice: BlacklistService,
    private cha: ChangeDetectorRef
  ) {}
  ngOnDestroy(): void {
    if (this.isListChanged === true) {
      this._blocklistservice.UpdateListInDatabase();
    }
  }
  ngOnInit() {
    this.numberArray = this._blocklistservice.BlackListObser;
  }

  delete(con: number) {
    this.isListChanged = true;
    this._blocklistservice.DeleteNumber(con, false);
    this.inputString = this.inputString + ' ';
    setTimeout(() => {
      this.inputString = this.inputString.trim();
      this.cha.detectChanges();
    });
    this.cha.detectChanges();
  }
  add(newCont: string) {
    this.isListChanged = true;
    if (newCont.length < 10) {
      this.error = 'Please enter atleast 10 digits';
      return;
    }
    const x = this._blocklistservice.addNumber(Number(newCont), false);
    if (x == -1) {
      this.error = 'Number is already blacklisted.';
    } else {
      this.error = '';
    }
    this.inputString = '';
    this.cha.detectChanges();
  }

  validationForNumber(event: KeyboardEvent) {
    const isNumber = event.key;
    if (isNumber === 'Backspace') {
      return;
    }
    if (typeof isNumber !== 'undefined' && isNaN(+isNumber)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
