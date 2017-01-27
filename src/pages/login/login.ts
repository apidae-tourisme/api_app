import {Component, NgZone} from '@angular/core';
import {NavController, Platform, AlertController} from 'ionic-angular';
import {AuthService} from "../../providers/auth.service";
import {TabsPage} from "../tabs/tabs";
import {DataService} from "../../providers/data.service";
import {Seed} from "../../components/seed.model";

@Component({
  templateUrl: 'login.html'
})
export class LoginPage {

  public msg: string;

  constructor(public navCtrl: NavController, public authService: AuthService, private platform: Platform,
              private dataService: DataService, private alertCtrl: AlertController, private zone: NgZone) {
  }

  ionViewDidEnter() {
    let url = window.location.href;
    if(url.indexOf('auth_token') != -1 && url.indexOf('client_id') != -1 && url.indexOf('uid') != -1) {
      let callBackParams = url.slice(url.indexOf('?'));
      this.authService.setLocalAuthData(callBackParams).then(() => {
        window.location.href = '/';
      }, (error) => {
        let alert = this.alertCtrl.create({
          title: "Echec de l'authentification",
          message: "Nous n'avons pas pu vous identifier. Veuillez vous assurer que votre compte utilisateur ApiApp est actif.",
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
      this.navCtrl.setRoot(TabsPage, {animate: false});
    });
  }
}
