import {Component} from "@angular/core";
import {ViewController, IonicPage, NavController} from "ionic-angular";
import {ExplorerService} from "../../providers/explorer.service";
import {SeedsService} from "../../providers/seeds.service";
import {Seed} from "../../models/seed.model";
import {TrackingService} from "../../providers/tracking.service";

@IonicPage()
@Component({
  templateUrl: 'history.html'
})
export class HistoryPage {

  public history: Array<Seed>;

  constructor(public viewCtrl: ViewController, private navCtrl: NavController, private seedsService: SeedsService,
              private explorerService: ExplorerService, private tracker: TrackingService) {
    this.history = [];
  }

  ionViewDidEnter() {
    this.seedsService.getNodes(this.explorerService.history()).then((seeds) => {
      this.history = seeds;
    });
    this.tracker.trackView('Historique');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  navigateTo(node): void {
    this.explorerService.navigateTo(node, () => {this.navCtrl.popToRoot();});
  }
}
