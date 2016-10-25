import {Component} from '@angular/core';
import {NavParams, Events, ViewController} from 'ionic-angular';
import {Seed} from "../../components/seed.model";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {

  public node: Seed;

  constructor(public viewCtrl: ViewController, params: NavParams,
              public events: Events, private sanitizer:DomSanitizer) {
    this.node = new Seed(params.get('node'), false, false);
  }

  closeModal(): void {
    this.viewCtrl.dismiss();
    // this.events.publish('actions:hide');
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
