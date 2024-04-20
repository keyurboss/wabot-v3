import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserInterface } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  UserDataBhevaior = new BehaviorSubject<UserInterface>(null as any);
}
