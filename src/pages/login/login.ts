import {Component} from '@angular/core';
import {NavController, Platform, AlertController, IonicPage} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {Network} from "@ionic-native/network";

@IonicPage()
@Component({
  templateUrl: 'login.html'
})
export class LoginPage {

  public msg: string;

  private connectionType: string;

  constructor(public navCtrl: NavController, public authService: AuthService, private platform: Platform,
              private network: Network, private alertCtrl: AlertController) {
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
    if(url.indexOf('code') != -1) {
      // callback in browser - Apidae SSO from browser
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
    if(this.authService.userEmail) {
      this.navCtrl.push('LoadingPage', {isOnline: this.hasConnectivity()});
    } else {
      this.authService.getUserProfile().then(userProfile => {
        this.authService.userEmail = userProfile.email;
        this.navCtrl.push('LoadingPage', {isOnline: this.hasConnectivity()});
      }).catch((err) => {
        console.log('Auth required');
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
