import {Component, NgZone} from '@angular/core';
import {NavController, Platform, AlertController, IonicPage} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {DataService} from "../../providers/data.service";
import {Seed} from "../../components/seed.model";
import {Network} from "@ionic-native/network";

@IonicPage()
@Component({
  templateUrl: 'login.html'
})
export class LoginPage {

  public msg: string;

  private connectionType: string;

  constructor(public navCtrl: NavController, public authService: AuthService, private platform: Platform,
              private network: Network, private dataService: DataService, private alertCtrl: AlertController,
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
    if(url.indexOf('auth_token') != -1 && url.indexOf('client_id') != -1 && url.indexOf('uid') != -1) {
      let callBackParams = url.slice(url.indexOf('?'));
      this.authService.setLocalAuthData(callBackParams).then(() => {
        window.location.href = '/';
      }, (error) => {
        let alert = this.alertCtrl.create({
          title: "En attente de validation",
          message: "Nous avons bien pris note de votre souhait d’utiliser ApiApp et vous en remercions. Nous reprendrons " +
            "contact avec vous au moment de valider votre accès à l’application. Pour toute question complémentaire, " +
            "vous pouvez nous joindre à l’adresse info@apiapp.apidae-tourisme.com.\n\n" +
            "L’équipe Apidae Tourisme",
          cssClass: "custom_alert",
          buttons: [
            {
              text: 'Fermer',
              handler: () => {
                window.location.href = '/';
              }
            }
          ]
        });
        alert.present();
        console.log('Local auth loading failed');
      });
    } else {
      this.platform.ready().then(() => {
        this.authService.getLocalAuthData().then(authData => {
          if(authData) {
            if(this.hasConnectivity()) {
              this.loggedInRedirect();
            } else {
              this.displayOfflineAlert();
            }
          } else {
            console.log("Local auth data missing");
          }
        })
      });
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
        if(authData && authData.uid) {
          this.dataService.userId = authData.uid;
          this.dataService.getNodeDetails(authData.uid).subscribe(data => {
            this.dataService.userSeed = new Seed(data.node, false, false);
            this.navigateHome();
          }, function() {
            console.log('User seed retrieval failed');
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
