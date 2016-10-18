import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {InAppBrowser} from "ionic-native";
import {TabsPage} from "../tabs/tabs";

@Component({
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(public navCtrl: NavController, public authService: AuthService) {
  }

  ngAfterViewInit() {
    if(this.authService.isLoggedIn()) {
      console.log('user is already logged in');
      this.navCtrl.setRoot(TabsPage, {}, {animate: false});
    }
  }

  authenticateUser(): void {
    // Note : use a specific path instead of the current location ?
    let authUrl = this.authService.authUrl() + '?auth_origin_url=' + encodeURIComponent(window.location.href);
    let browser = new InAppBrowser(authUrl, '_blank', 'location=no');
    browser.on('loadstop').subscribe(data => {
      let callBackUrl = data['url'];
      if(callBackUrl && callBackUrl.indexOf('auth_token') != -1 && callBackUrl.indexOf('client_id') != -1 &&
        callBackUrl.indexOf('uid') != -1) {
        let callBackParams = callBackUrl.slice(callBackUrl.indexOf('?'));
        this.authService.loadQueryAuthData(callBackParams);
        browser.close();
        this.navCtrl.setRoot(TabsPage, {}, {animate: false});
      }
    });
    browser.on('loaderror').subscribe(data => {
      console.log('OAuth request error : ' + JSON.stringify(data));
    });
  }
}
