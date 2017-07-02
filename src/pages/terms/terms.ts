import {Component} from "@angular/core";
import {ViewController, IonicPage} from "ionic-angular";

@IonicPage()
@Component({
  templateUrl: 'terms.html'
})
export class Terms {
  public type: string;

  constructor(public viewCtrl: ViewController) {
  }

  dismiss(accept) {
    this.viewCtrl.dismiss({accept: accept});
  }
}
