import {Component} from '@angular/core';
import {NavParams, Events, ViewController} from 'ionic-angular';
import {Seed} from "../../components/seed.model";

@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {

  public node: Seed;

  constructor(public viewCtrl: ViewController, params: NavParams,
              public events: Events) {
    this.node = new Seed(params.get('node'), false, false);
  }

  closeModal(): void {
    this.viewCtrl.dismiss();
    // this.events.publish('actions:hide');
  }
}
