import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test/test.component';
import { RouterModule, Routes } from '@angular/router';
import { ContentModule } from '../home/content/content.module';

const rout: Routes = [
  {
    path: '',
    component: TestComponent,
  },
];

@NgModule({
  declarations: [TestComponent],
  imports: [CommonModule, RouterModule.forChild(rout), ContentModule],
})
export class TestModule {}
