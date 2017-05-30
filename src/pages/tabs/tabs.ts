import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavParams, Tabs} from "ionic-angular";
// import {GraphPage} from "../graph/graph";

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('appTabs') tabs: Tabs;

  tab1Root: any = 'GraphPage';
  tab2Root: any = 'DetailsPage';
  tab3Root: any = 'ListPage';

  constructor(private navParams: NavParams) {
  }

  // ionViewDidEnter() {
  //   let displayMode = this.navParams.get('mode');
  //   if(displayMode) {
  //     if(displayMode == 'detail') {
  //       this.tabs.select(1);
  //     } else if(displayMode == 'liste') {
  //       this.tabs.select(2);
  //     }
  //   }
  // }
}
