import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { RouterModule, Routes } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { UserSubscriptionComponent } from './user-subscription/user-subscription.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { PaymentCheckComponent } from './payment-check/payment-check.component';
const route: Routes = [
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'user-subscription',
    component: UserSubscriptionComponent,
  },
  {
    path: 'payment-check',
    component: PaymentCheckComponent,
  },
];

@NgModule({
  declarations: [
    SignupComponent,
    UserSubscriptionComponent,
    PaymentCheckComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
  ],
})
export class LoginSignupModule {}
