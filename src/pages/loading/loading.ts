import {Component, NgZone} from '@angular/core';
import {NavController, IonicPage, ModalController, NavParams} from 'ionic-angular';
import {SeedsService} from "../../providers/seeds.service";
import {AuthService} from "../../providers/auth.service";
import {Seed} from "../../components/seed.model";

@IonicPage()
@Component({
  templateUrl: 'loading.html'
})
export class LoadingPage {

  public msg: string;
  public syncProgress: number;

  private sync: any;

  constructor(public navCtrl: NavController, private dataService: SeedsService, private authService: AuthService,
              private zone: NgZone, private modalCtrl: ModalController, private navParams: NavParams) {
  }

  ionViewDidEnter() {
    let isOnline = this.navParams.get('isOnline');
    this.msg = 'Initialisation de la base de données';
    if(isOnline) {
      this.dataService.initDb().then(() => {
        return this.dataService.dbInfo();
      }).then((infos) => {
        let remoteSeq = infos[1].update_seq;
        if(infos[0].doc_count === 0) {
          // First init - Display loading page (pull events only)
          this.sync = this.dataService.initReplication().on('change', (info) => {
            if(remoteSeq - info.change.last_seq > SeedsService.BATCH_SIZE) {
              this.syncProgress = Math.min(Math.floor((info.change.last_seq / remoteSeq) * 100), 100);
            } else {
              this.syncProgress = 100;
            }
            this.msg = "Mise à jour des données de l'application en cours (" + this.syncProgress + "%)";
            if(this.syncProgress === 100) {
              this.sync.removeAllListeners('change');
              this.completeSetUp();
            }
          });
        } else {
          // Local db is not empty, start sync and move on
          this.sync = this.dataService.initReplication();
          this.completeSetUp();
        }
      });
    } else {
      this.dataService.initLocalDb();
      this.completeSetUp();
    }
  }

  completeSetUp() {
    this.buildIndexes().then(() => {
      this.msg = "Chargement du profil utilisateur";
      return this.dataService.getCurrentUserSeed(this.authService.userProfile);
    }).then((data) => {
      this.redirectUser(data);
    });
  }

  buildIndexes() {
    this.msg = "Mise à jour de l'index - 1/2";
    return this.dataService.buildEmailIndex().then(() => {
      this.msg = "Mise à jour de l'index - 2/2";
      return this.dataService.buildSearchIndex();
    });
  }

  redirectUser(data) {
    if(data) {
      this.dataService.userSeed = new Seed(data, false, false);
      if(this.dataService.userSeed.termsConditions) {
        this.navigateHome();
      } else {
        this.displayTermsConditions();
      }
    }
  }

  // root change is wrapped in a ng zone call to prevent duplicate controller instances (see https://github.com/driftyco/ionic/issues/5960)
  navigateHome(): void {
    this.zone.run(() => {
      this.navCtrl.setRoot('TabsPage', {animate: false});
    });
  }

  displayTermsConditions(): void {
    let terms = this.modalCtrl.create('Terms');
    terms.onDidDismiss(data => {
      if(data.accept) {
        this.dataService.userSeed.termsConditions = true;
        return this.dataService.saveNode(this.dataService.userSeed).then(() => {
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
      this.dataService.clearUser();
      this.navCtrl.pop();
    });
  }
}
