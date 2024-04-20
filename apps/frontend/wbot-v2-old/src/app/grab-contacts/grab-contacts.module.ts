import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrabContactsComponent } from './grab-contacts/grab-contacts.component';
import { RouterModule, Routes } from '@angular/router';
import { GrabGroupComponent } from './grab-group/grab-group.component';
import { GrabMyComponent } from './grab-my/grab-my.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedPipeModule } from '../shared-pipe/shared-pipe.module';
import { MatMenuModule } from '@angular/material/menu';

const routes: Routes = [
  {
    path: '',
    component: GrabContactsComponent,
    children: [
      {
        path: '',
        component: GrabGroupComponent,
      },
      {
        path: 'c',
        component: GrabMyComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [GrabContactsComponent, GrabGroupComponent, GrabMyComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    FormsModule,
    SharedPipeModule,
    MatTooltipModule,
    ScrollingModule,
    RouterModule.forChild(routes),
    MatMenuModule,
  ],
  exports: [],
})
export class GrabContactsModule {}
