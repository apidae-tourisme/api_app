import {Component, ViewChild} from '@angular/core';
import {Content, NavParams, NavController, IonicPage} from 'ionic-angular';
import {Seed} from "../../models/seed.model";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {RemoteDataService} from "../../providers/remote.service";

@IonicPage({
  segment: 'graines/:id'
})

@Component({
  templateUrl: 'seed.html'
})
export class SeedPage {
  @ViewChild(Content) content: Content;

  public seed: Seed;
  public seedId: string;
  public hasParent: boolean;

  constructor(private navParams: NavParams, private navCtrl: NavController, private iab: InAppBrowser,
              private dataService: RemoteDataService) {
    this.seedId = this.navParams.get('id');
    if(this.navParams.get('seed')) {
      this.seed = this.navParams.get('seed');
      this.hasParent = true;
    } else {
      this.dataService.getSeed(this.seedId).then((data) => {
        this.seed = new Seed(data, false, false);
      });
      this.hasParent = false;
    }
  }

  closeDetails() {
    this.navCtrl.pop();
  }

  dateFormat(date): string {
    if(date) {
      let dateObj = new Date(date);
      return [this.lpad(dateObj.getUTCDate()), this.lpad(dateObj.getUTCMonth() + 1), dateObj.getUTCFullYear()].join('/');
    }
    return '';
  }

  lpad(d): string {
    return d < 10 ? ('0' + d) : d;
  }

  linkIcon(url): string {
    return Seed.formattedUrl(url).icon;
  }

  linkLabel(url): string {
    return Seed.trimmed(url);
  }

  openUrl(url): void {
    this.iab.create(url, '_system');
  }

  openAddress(address) {
    this.iab.create('https://maps.google.com?q=' + address, '_blank', 'location=yes');
  }
}
