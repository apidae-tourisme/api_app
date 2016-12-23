import {Component} from "@angular/core";
import {ViewController, NavParams} from "ionic-angular";
import {Seeds} from "../../providers/seeds";

@Component({
  templateUrl: 'seed-type.html'
})
export class SeedType {
  public type: string;

  constructor(public viewCtrl: ViewController, private params: NavParams) {
    this.type = params.get('type');
  }

  dismiss() {
    this.viewCtrl.dismiss({type: this.type});
  }

  selectType(newType): void {
    this.viewCtrl.dismiss({type: newType});
  }

  orderedSeeds(): any {
    return Seeds.ORDERED;
  }
}
