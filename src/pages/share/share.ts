import {Component, ViewChild} from '@angular/core';
import {Content, NavParams, NavController, IonicPage} from 'ionic-angular';
import {ApiAppConfig} from "../../providers/apiapp.config";

@IonicPage({
  segment: 'partager/:id'
})

@Component({
  templateUrl: 'share.html'
})
export class SharePage {
  @ViewChild(Content) content: Content;

  public seedId: string;
  public directLink: string;

  constructor(private navParams: NavParams, private navCtrl: NavController) {
    this.seedId = this.navParams.get('id');
    this.directLink = ApiAppConfig.SHARING_HOST + '/graines/' + this.seedId;
  }

  closeShare() {
    this.navCtrl.pop();
  }

  widgetUrl(sorting) {
    return ApiAppConfig.SHARING_HOST + '/widget/' + sorting + '/' + this.seedId;
  }
}
