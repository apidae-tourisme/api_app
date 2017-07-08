import {Component, NgZone} from '@angular/core';
import {NavController, Platform, AlertController, IonicPage} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {Network} from "@ionic-native/network";
import {SeedsService} from "../../providers/seeds.service";

@IonicPage()
@Component({
  templateUrl: 'login.html'
})
export class LoginPage {

  public msg: string;

  private connectionType: string;

  constructor(public navCtrl: NavController, public authService: AuthService, private platform: Platform,
              private network: Network, private dataService: SeedsService, private alertCtrl: AlertController) {
    this.connectionType = 'web';

    // Subscribe to connectivity changes on mobile devices
    if(platform.is('cordova')) {
      this.platform.ready().then(() => {
        this.connectionType = this.network.type;
        this.network.onConnect().subscribe(() => {
          this.connectionType = this.network.type;
        });
        this.network.onDisconnect().subscribe(() => {
          this.connectionType = this.network.type;
        });
      });
    }
  }

  ionViewDidEnter() {
    let url = window.location.href;
    // callback in browser - Apidae SSO from browser
    if(url.indexOf('code') != -1) {
      this.authService.handleAuthCallback(url, () => {
        this.loggedInRedirect();
        }, () => {
          console.log('handleAuthCallback error');
        });
    } else {
      this.loggedInRedirect();
    }
  }

  authenticateUser(): void {
    if(this.hasConnectivity()) {
      this.authService.authenticate(() => this.loggedInRedirect(), () => {});
    } else {
      this.displayOfflineAlert();
    }
  }

  loggedInRedirect(): void {
    if(this.dataService.userEmail) {
      this.navCtrl.push('LoadingPage', {isOnline: this.hasConnectivity()});
    } else {
      this.dataService.getAuth().then(authData => {
        this.dataService.userEmail = authData.user.email;
        this.navCtrl.push('LoadingPage', {isOnline: this.hasConnectivity()});
      }).catch((err) => {
        console.log('Invalid auth data');
      });
    }
  }

  hasConnectivity(): boolean {
    return this.connectionType && this.connectionType != 'none';
  }

  displayOfflineAlert(): void {
    let alert = this.alertCtrl.create({
      title: "Aucune connectivité",
      message: "Oups, pas de réseau :(\nPour vous authentifier, ApiApp a besoin d'une connexion Internet, via le réseau téléphonique mobile, le Wifi,...",
      cssClass: "custom_alert",
      buttons: [{text: 'Fermer'}]
    });
    alert.present();
  }
}
