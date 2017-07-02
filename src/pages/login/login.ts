import {Component, NgZone} from '@angular/core';
import {NavController, Platform, AlertController, IonicPage, Events, ModalController} from 'ionic-angular';
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
  public loggingIn: boolean;

  private connectionType: string;
  private termsActive: boolean;

  constructor(public navCtrl: NavController, public authService: AuthService, private platform: Platform,
              private network: Network, private dataService: SeedsService, private alertCtrl: AlertController,
              private zone: NgZone, private evts: Events, private modalCtrl: ModalController) {
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

    this.evts.subscribe('index:built', () => {
      if(!this.dataService.userSeed) {
        this.dataService.getCurrentUserSeed(this.authService.userProfile).then((data) => {
          if(data) {
            this.dataService.userSeed = new Seed(data, false, false);
            if(this.dataService.userSeed.termsConditions) {
              this.navigateHome();
            } else if(!this.termsActive) {
              this.displayTermsConditions();
            }
          }
        });
      }
    });
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
    this.loggingIn = true;
    if(this.dataService.userSeed) {
      this.navigateHome();
    } else {
      this.authService.getLocalAuthData().then(authData => {
        if(authData && authData.email) {
          this.dataService.userEmail = authData.email;
          this.dataService.initDb().then(() => {
            return this.dataService.initReplication();
          }).then(() => {
            console.log('replication started');
          }).catch((err) => {
            console.log('failed to init replication : ' + JSON.stringify(err));
          });
        } else {
          this.loggingIn = false;
          console.log('Invalid auth data');
        }
      }, function() {
        this.loggingIn = false;
        console.log('Local auth data is invalid');
      });
    }
  }

  // root change is wrapped in a ng zone call to prevent duplicate controller instances (see https://github.com/driftyco/ionic/issues/5960)
  navigateHome(): void {
    this.zone.run(() => {
      this.navCtrl.setRoot('TabsPage', {animate: false});
    });
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

  displayTermsConditions(): void {
    this.termsActive = true;
    let terms = this.modalCtrl.create('Terms');
    terms.onDidDismiss(data => {
      this.termsActive = false;
      if(data.accept) {
        this.dataService.getNodeDetails(this.dataService.userSeed.id).then((data) => {
          this.dataService.userSeed = new Seed(data, false, false);
          this.dataService.userSeed.termsConditions = true;
          return this.dataService.userSeed;
        }).then((userSeed) => {
          return this.dataService.saveNode(userSeed);
        }).then(this.navigateHome());
      } else {
        this.loggingIn = false;
      }
    });
    terms.present();
  }
}
