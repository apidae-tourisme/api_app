import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {TabsPage} from "../tabs/tabs";

@Component({
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(public navCtrl: NavController, public authService: AuthService, private platform: Platform) {
  }

  ionViewDidEnter() {
    console.log('view did enter');
    let url = window.location.href;
    if(url.indexOf('auth_token') != -1 && url.indexOf('client_id') != -1 && url.indexOf('uid') != -1) {
      let callBackParams = url.slice(url.indexOf('?'));
      let storedAuth = this.authService.setLocalAuthData(callBackParams);
      if(storedAuth) {
        storedAuth.then(() => this.loggedInRedirect());
      }
    } else {
      this.platform.ready().then(() => {
        console.log('loading auth data');
        this.authService.getLocalAuthData().then(authData => {
          console.log('authData : ' + JSON.stringify(authData));
          if(authData) {
            this.loggedInRedirect();
          }
        })
      });
    }
  }

  authenticateUser(): void {
    this.authService.authenticate(() => this.loggedInRedirect(), () => {});
  }

  loggedInRedirect(): void {
    this.navCtrl.setRoot(TabsPage, {}, {animate: false});
  }
}
