import {Component, ViewChild} from '@angular/core';
import {NavController, Content, NavParams, IonicPage} from 'ionic-angular';
import {RemoteDataService} from "../../providers/remote.service";
import {Seeds} from "../../providers/seeds";
import {Seed} from "../../models/seed.model";

@IonicPage({
  segment: 'widget/:sort/:id'
})
@Component({
  templateUrl: 'widget.html'
})
export class WidgetPage {
  @ViewChild(Content) content: Content;

  private static SORT_ALPHABET = 'alpha';
  private static SORT_CHRONO = 'chrono';

  public root: Seed;
  public inclusions: Array<Seed>;

  private sorting: string;

  constructor(public navCtrl: NavController, private navParams: NavParams, private dataService: RemoteDataService) {
    this.sorting = this.navParams.get('sort');
  }

  ionViewDidEnter(): void {
    let seedId = this.navParams.get('id');
    console.log('sorting : ' + this.sorting);
    if(seedId) {
      this.dataService.getSeedWithInclusions(seedId, Seeds.SCOPE_APIDAE).then((data) => {
        this.root = new Seed(data.root, false, false);
        if(data.includedSeeds.length > 0) {
          this.inclusions = data.includedSeeds.map((n) => {return new Seed(n, false, false)})
            .sort(this.sorting == WidgetPage.SORT_CHRONO ? this.chronologically() : this.alphabetically());
        } else {
          this.inclusions = [];
        }
      });
    }
  }

  displayDetails(node) {
    this.navCtrl.push('SeedPage', {seed: node});
  }

  private alphabetically() {
    return (s1, s2) => {return (s1.label > s2.label) ? 1 : -1;};
  }

  private chronologically() {
    return (s1, s2) => {
      if(s1.startDate && s2.startDate) {
        return new Date(s1.startDate).getTime() - new Date(s2.startDate).getTime();
      } else if(s1.startDate) {
        return 1;
      } else {
        return -1;
      }
    };
  }
}
