import {Component} from "@angular/core";
import {ViewController, NavParams, IonicPage} from "ionic-angular";

@IonicPage({
    segment: 'iframe/:id'
})
@Component({
  templateUrl: 'iframe.html'
})
export class IframePage {
  public url: string;

  constructor(public viewCtrl: ViewController, private params: NavParams) {
    this.url = params.get('url');
  }

  iframeCode() {
    return '<iframe src="' + this.url + '" style="width: 100%; height: 360px; max-height: 50vh;" frameborder="0" seamless="seamless"></iframe>';
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
