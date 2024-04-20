import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grab-contacts',
  templateUrl: './grab-contacts.component.html',
  styleUrls: ['./grab-contacts.component.scss'],
})
export class GrabContactsComponent {
  constructor(private router: Router) {}
}
