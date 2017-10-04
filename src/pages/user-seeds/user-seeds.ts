import {Component} from "@angular/core";
import {ViewController, IonicPage, NavController} from "ionic-angular";
import {ExplorerService} from "../../providers/explorer.service";
import {SeedsService} from "../../providers/seeds.service";
import {Seed} from "../../models/seed.model";
import {AuthService} from "../../providers/auth.service";

@IonicPage()
@Component({
  templateUrl: 'user-seeds.html'
})
export class UserSeedsPage {

  public userSeeds: Array<Seed>;

  constructor(public viewCtrl: ViewController, private navCtrl: NavController, private seedsService: SeedsService,
              private explorerService: ExplorerService, private authService: AuthService) {
    this.userSeeds = [];
  }

  ionViewDidEnter() {
    this.authService.currentUser().then((userEmail) => {
      this.seedsService.lookUpNodes(userEmail).then((seeds) => {
        this.userSeeds = seeds;
      })
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  navigateTo(node): void {
    this.explorerService.navigateTo(node, () => {this.navCtrl.popToRoot();});
  }
}
