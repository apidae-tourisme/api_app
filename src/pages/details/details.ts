import {Component} from '@angular/core';
import {NavParams, Events, NavController} from 'ionic-angular';
import {Seed} from "../../components/seed.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {InAppBrowser} from "ionic-native";
import {ExplorerService} from "../../providers/explorer.service";

@Component({
  templateUrl: 'details.html'
})
export class DetailsPage {

  public node: Seed;

  constructor(params: NavParams, private navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer,
              private explorerService: ExplorerService) {
    console.log(params.get('node'));
    this.node = new Seed(params.get('node'), false, false);
  }

  sanitizeUrl(url): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  openUrl(url): void {
    let browser = new InAppBrowser(url, '_blank', 'location=no');
  }

  navigateToList(node): void {
    this.explorerService.networkContext.reset(node);
    this.navCtrl.pop();
    if (this.navCtrl.parent.getSelected() != this.navCtrl.parent.getByIndex(2)) {
      this.navCtrl.parent.select(2);
    }
  }

  navigateToNetwork(node) {
    this.explorerService.networkContext.reset(node);
    this.navCtrl.pop();
    if (this.navCtrl.parent.getSelected() != this.navCtrl.parent.getByIndex(0)) {
      this.navCtrl.parent.select(0);
    }
  }
}
