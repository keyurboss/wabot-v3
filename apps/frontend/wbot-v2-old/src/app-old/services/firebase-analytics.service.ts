import { Injectable } from '@angular/core';
import {
  getAnalytics,
  setCurrentScreen,
  logEvent,
  setUserId,
} from 'firebase/analytics';
import {
  Router,
  Event as NavigationEvent,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs';
import { FirebaseAuthService } from '@wbotv2/services';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAnalyticsService {
  analytics = getAnalytics();
  constructor(private router: Router, private fireAuth: FirebaseAuthService) {
    setUserId(this.analytics, fireAuth.uid);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEvent) => {
        // setCurrentScreen(this.analytics,)
        logEvent(this.analytics, 'page_view', {
          page_location: '',
          page_path: event as any,
          page_title: '',
        });
      });
    /* Automatically collected events:
      
      app_exception: when the app crashes or throws an exception

      app_update: when the app is updated to a new version and launched again
                The previous app version id is passed as a parameter.

      page_view: each time the page loads or the browser history state is changed by the active site
                This event is collected automatically. You cannot turn off collection.
                An advanced setting on this option controls whether the event is sent based on 
                browser-history events. This measurement option listens for pushState, popState, 
                and replaceState.

      user_engagement: when the app is in the foreground or webpage is in focus for at least one second.
      */
  }
}
