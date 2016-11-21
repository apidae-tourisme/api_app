import {Component} from '@angular/core';

import {ListPage} from "../list/list";
import {MapPage} from "../map/map";
import {GraphPage} from "../graph/graph";
import {NavParams, NavController} from "ionic-angular";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = GraphPage;
  tab2Root: any = MapPage;
  tab3Root: any = ListPage;

  constructor(private navCtrl: NavController) {
  }

  popToRoot(): void {
    console.log('popToRoot');
    this.navCtrl.popToRoot();
  }
}
