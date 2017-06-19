import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Component, NgZone} from "@angular/core";
import {AuthService} from "../../providers/auth.service";
import {ExplorerService} from "../../providers/explorer.service";
import {Seed} from "../../components/seed.model";
import {DataService} from "../../providers/data.service";

@IonicPage({
  segment: 'acceder/:id'
})
@Component({
  templateUrl: 'link.html'
})
export class LinkPage {

  constructor(public navCtrl: NavController, public authService: AuthService, private explorerService: ExplorerService,
              private dataService: DataService, private navParams: NavParams, private zone: NgZone) {
    let seedId = this.navParams.get('id');
    console.log('seedId : ' + seedId);
    if(seedId) {
      this.explorerService.navigateTo(seedId, false, () => this.loggedInRedirect());
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
}
