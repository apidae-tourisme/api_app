import {Component} from '@angular/core';
import {NavController, IonicPage, ModalController, NavParams, Events} from 'ionic-angular';
import {SeedsService} from "../../providers/seeds.service";
import {AuthService} from "../../providers/auth.service";
import {Seed} from "../../models/seed.model";

@IonicPage({
  segment: 'initialisation'
})
@Component({
  templateUrl: 'loading.html'
})
export class LoadingPage {

  public msg: string;
  private complete: boolean;

  constructor(public navCtrl: NavController, private dataService: SeedsService, private authService: AuthService,
              private evt: Events, private modalCtrl: ModalController, private navParams: NavParams) {
  }

  ionViewDidEnter() {
    let isOnline = this.navParams.get('isOnline');
    this.msg = 'Initialisation de la base de données';
    this.complete = false;
    this.evt.subscribe("replication:paused", () => {
      if(!this.complete) {
        this.complete = true;
        this.completeSetUp();
      }
    });

    this.dataService.initLocalDb().then(() => {
      if(isOnline) {
        this.dataService.initDbData((progress) => {this.msg = progress;});
      } else {
        this.complete = true;
        this.completeSetUp();
      }
    });
  }

  ionViewWillLeave() {
    this.evt.unsubscribe("replication:paused");
  }

  completeSetUp() {
    this.buildIndexes().then(() => {
      this.msg = "Chargement du profil utilisateur";
      return this.dataService.getCurrentUserSeed();
    }).then((userSeed) => {
      this.redirectUser(userSeed);
    });
  }

  buildIndexes() {
    this.msg = "Chargement des données";
    return this.dataService.buildEmailIndex().then(() => {
      this.dataService.buildSearchIndex().then(() => {
        this.dataService.idxBuilding = false;
      });
    });
  }

  redirectUser(userSeed) {
    if(userSeed) {
      this.authService.userSeed = userSeed;
      if(this.authService.userSeed.termsConditions) {
        this.navigateHome();
      } else {
        this.displayTermsConditions();
      }
    }
  }

  navigateHome(): void {
    this.navCtrl.setRoot('ExplorerPage', {}, {animate: false});
  }

  displayTermsConditions(): void {
    let terms = this.modalCtrl.create('Terms');
    terms.onDidDismiss(data => {
      if(data.accept) {
        this.authService.userSeed.termsConditions = true;
        return this.dataService.saveNode(this.authService.userSeed).then(() => {
          this.navigateHome();
        });
      } else {
        this.cancel();
      }
    });
    terms.present();
  }

  cancel() {
    this.dataService.cancelReplication();
    this.authService.logOut().then(() => {
      if(!this.complete) {
        this.dataService.clearLocalDb();
      }
      this.navCtrl.pop();
    });
  }
}
