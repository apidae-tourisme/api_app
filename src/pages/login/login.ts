import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {TabsPage} from "../tabs/tabs";
import {DataService} from "../../providers/data.service";
import {Seed} from "../../components/seed.model";

@Component({
  templateUrl: 'login.html'
})
export class LoginPage {

  constructor(public navCtrl: NavController, public authService: AuthService, private platform: Platform,
              private dataService: DataService) {
  }

  ionViewDidEnter() {
    let url = window.location.href;
    if(url.indexOf('auth_token') != -1 && url.indexOf('client_id') != -1 && url.indexOf('uid') != -1) {
      let callBackParams = url.slice(url.indexOf('?'));
      let storedAuth = this.authService.setLocalAuthData(callBackParams);
      if(storedAuth) {
        storedAuth.then(() => {
          window.location.href = '/';
        });
      }
    } else {
      this.platform.ready().then(() => {
        this.authService.getLocalAuthData().then(authData => {
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
    if(this.dataService.userSeed) {
      this.navigateHome();
    } else {
      this.authService.getLocalAuthData().then(authData => {
        if(authData && authData.uid) {
          this.dataService.userId = authData.uid;
          this.dataService.getNodeDetails(authData.uid).subscribe(data => {
            this.dataService.userSeed = new Seed(data.node, false, false);
            this.navigateHome();
          }, function() {
            console.log('User seed retrieval failed');
          });
        }
      }, function() {
        console.log('Local auth data is invalid');
      });
    }
  }

  navigateHome(): void {
    this.navCtrl.setRoot(TabsPage, {'seedId': 'default'}, {animate: false});
  }
}
