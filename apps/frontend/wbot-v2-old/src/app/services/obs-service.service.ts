import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ObsServiceService {
  LoaderSubject = new BehaviorSubject(false);
  showHeaderBehavi = new BehaviorSubject(true);
}
