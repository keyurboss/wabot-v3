import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { SharedPipeModule } from '../../shared-pipe/shared-pipe.module';
import { AccountListComponent } from './account-list/account-list.component';
import { BlackListComponent } from './black-list/black-list.component';
import { ContentComponent } from './content/content.component';
import { ImportCheckboxComponent } from './import-checkbox/import-checkbox.component';
import { ManageAccountsComponent } from './manage-accounts/manage-accounts.component';
import { ManuallyAddComponent } from './manually-add/manually-add.component';
import { MessagesReportComponent } from './messages-report/messages-report.component';
import { RemoveNumbersPopComponent } from './remove-numbers-pop/remove-numbers-pop.component';
import { SotfwareSettingComponent } from './sotfware-setting/sotfware-setting.component';
import { TextSearchFromJsonArrayPipe } from './text-search-from-json-array.pipe';

const route: Routes = [
  {
    path: 'block-list',
    component: BlackListComponent,
  },
  {
    path: 'manually',
    component: ManuallyAddComponent,
  },
  {
    path: 'soft-set',
    component: SotfwareSettingComponent,
  },
  // {
  //   path: '',
  //   component:ManuallyAddComponent,
  // },
  {
    path: 'import-chk',
    component: ImportCheckboxComponent,
  },
  {
    path: '',
    component: ContentComponent,
  },
];

@NgModule({
  declarations: [
    ContentComponent,
    TextSearchFromJsonArrayPipe,
    BlackListComponent,
    SotfwareSettingComponent,
    ImportCheckboxComponent,
    ManuallyAddComponent,
    ManageAccountsComponent,
    AccountListComponent,
    MessagesReportComponent,
    RemoveNumbersPopComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    SharedPipeModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    MatTooltipModule,
    MatDialogModule,
    ScrollingModule,
    MatSliderModule,
  ],
  providers: [],
  exports: [BlackListComponent],
})
export class ContentModule {}
