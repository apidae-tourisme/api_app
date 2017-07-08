import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Component, NgZone} from "@angular/core";
import {AuthService} from "../../providers/auth.service";
import {ExplorerService} from "../../providers/explorer.service";
import {Seed} from "../../components/seed.model";
import {SeedsService} from "../../providers/seeds.service";

@IonicPage({
  segment: 'acceder/:id'
})
@Component({
  templateUrl: 'link.html'
})
export class LinkPage {

  constructor(public navCtrl: NavController, public authService: AuthService, private explorerService: ExplorerService,
              private dataService: SeedsService, private navParams: NavParams, private zone: NgZone) {
    let seedId = this.navParams.get('id');
    if(seedId) {
      this.explorerService.navigateTo(seedId, false, () => this.loggedInRedirect());
    }
  }

  loggedInRedirect(): void {
    if(this.dataService.userSeed) {
      this.navigateHome();
    } else {
      this.dataService.getAuth().then(authData => {
        this.dataService.userEmail = authData.user.email;
        this.dataService.getCurrentUserSeed().then((data) => {
          if(data) {
            this.dataService.userSeed = new Seed(data, false, false);
            this.navigateHome();
          }
        });
      }).catch((err) => {
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
}
