import {Component, ViewChild} from '@angular/core';
import {Content, NavParams, NavController, IonicPage} from 'ionic-angular';
import {ApiAppConfig} from "../../providers/apiapp.config";
import {WidgetPage} from "../widget/widget";
import {InAppBrowser} from "@ionic-native/in-app-browser";


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
  public sortBy: string;
  public sharingModes: Array<any>;

  constructor(private navParams: NavParams, private navCtrl: NavController, private iab: InAppBrowser) {
    this.seedId = this.navParams.get('id');
    this.directLink = ApiAppConfig.SHARING_HOST + '/graines/' + this.seedId;
    this.sortBy = WidgetPage.SORT_ALPHABET;
    this.sharingModes = [
      {icon: 'open', label: 'Partager sur le web', url: ''},
      {icon: 'at', label: 'Envoyer par email', url: 'mailto:?subject=Partage ApiApp&body='},
      {icon: 'chatbubbles', label: 'Envoyer par SMS', url: 'sms:&body='},
      {icon: 'logo-facebook', label: 'Partager sur Facebook', url: 'https://www.facebook.com/sharer/sharer.php?u='},
      {icon: 'logo-twitter', label: 'Partager sur Twitter', url: 'https://twitter.com/intent/tweet/?text=ApiApp&url='},
      {icon: 'logo-linkedin', label: 'Partager sur LinkedIn', url: 'https://www.linkedin.com/shareArticle?mini=true&url='},
    ]
  }

  setSortBy(sort) {
    this.sortBy = sort;
  }

  closeShare() {
    this.navCtrl.pop();
  }

  shareWidget(mode) {
    this.openUrl(mode.url + this.widgetUrl());
  }

  openUrl(url): void {
    this.iab.create(url, '_system');
  }

  widgetUrl() {
    return ApiAppConfig.SHARING_HOST + '/widget/' + this.sortBy + '/' + this.seedId;
  }
}
