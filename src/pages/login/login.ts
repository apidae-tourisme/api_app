import {Component, NgZone} from '@angular/core';
import {NavController, Platform, AlertController, IonicPage} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {DataService} from "../../providers/data.service";
import {Seed} from "../../components/seed.model";
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
              private network: Network, private dataService: SeedsService, private alertCtrl: AlertController,
              private zone: NgZone) {
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
    if(this.dataService.userSeed) {
      this.navigateHome();
    } else {
      this.authService.getLocalAuthData().then(authData => {
        if(authData && authData.email) {
          this.dataService.userEmail = authData.email;
          this.dataService.getUserSeed(authData.email, (data) => {
            this.dataService.userSeed = new Seed(data, false, false);
            this.navigateHome();
          });
        } else {
          console.log('Invalid auth data');
        }
      }, function() {
        console.log('Local auth data is invalid');
      });
    }
  }

  // root change is wrapped in a ng zone call to prevent duplicate controller instances (see https://github.com/driftyco/ionic/issues/5960)
  navigateHome(): void {
    this.zone.run(() => {
      console.log('setting root');
      this.navCtrl.setRoot('TabsPage', {animate: false});
    });
  }

  hasConnectivity(): boolean {
    return this.connectionType && this.connectionType != 'none';
  }

  displayOfflineAlert(): void {
    let alert = this.alertCtrl.create({
      title: "Aucune connectivité",
      message: "Oups, pas de réseau :(\nCette première version d'ApiApp a besoin d'une connexion Internet, via le réseau téléphonique mobile, le Wifi,...",
      cssClass: "custom_alert",
      buttons: [{text: 'Fermer'}]
    });
    alert.present();
  }
}
