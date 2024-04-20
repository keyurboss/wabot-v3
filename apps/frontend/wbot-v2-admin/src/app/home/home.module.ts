import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FilterPipe } from '../services/filter.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { EditUserComponent } from './edit-user/edit-user.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewComputerIdsComponent } from './view-computer-ids/view-computer-ids.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SortArrayPipe } from '../services/sort-array.pipe';
import { DecryptFileComponent } from './decrypt-file/decrypt-file.component';
import { InquiriesComponent } from './inquiries/inquiries.component';
import { FilterInquiryPipe } from '../services/filterInquiry.pipe';
import { EditInquiriesComponent } from './edit-inquiries/edit-inquiries.component';
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    FilterPipe,
    FilterInquiryPipe,
    SortArrayPipe,
    EditUserComponent,
    ViewComputerIdsComponent,
    DecryptFileComponent,
    InquiriesComponent,
    EditInquiriesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ScrollingModule,
    MatDialogModule,
    MatTooltipModule,
    ClipboardModule,
    MatSnackBarModule,
    RouterModule.forChild(routes),
  ],
  providers: [DatePipe],
})
export class HomeModule {}
