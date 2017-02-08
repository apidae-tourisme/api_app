import {Component} from '@angular/core';
import {Platform, App} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import {LoginPage} from "../pages/login/login";
import {AuthService} from "../providers/auth.service";
import {ExplorerService} from "../providers/explorer.service";

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class ApiApp {
  rootPage = LoginPage;

  constructor(private platform: Platform, private authService: AuthService, private explorerService: ExplorerService,
              private app: App) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
      if(platform.is('core')) {
        Splashscreen.hide();
      }

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
