import {Component} from '@angular/core';
import {Platform, App} from 'ionic-angular';
import {LoginPage} from "../pages/login/login";
import {AuthService} from "../providers/auth.service";
import {ExplorerService} from "../providers/explorer.service";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {SeedsService} from "../providers/seeds.service";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {TrackingService} from "../providers/tracking.service";

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class ApiApp {
  rootPage = 'LoginPage';

  // Inject app-wide services
  constructor(private platform: Platform, private authService: AuthService, private explorerService: ExplorerService,
              private seedsService: SeedsService, private tracker: TrackingService, private statusBar: StatusBar,
              private splashScreen: SplashScreen, private app: App, private ga: GoogleAnalytics) {
    platform.ready().then(() => {
      this.statusBar.styleDefault();
      if(platform.is('core')) {
        this.splashScreen.hide();
      }
      this.tracker.start();

      // Default back button behavior in Android
      platform.registerBackButtonAction(() => {
        let nav = this.app.getActiveNav();
        if (nav.canGoBack()) {
          nav.pop();
        } else {
          this.platform.exitApp();
        }
      });
    });
  }
}
