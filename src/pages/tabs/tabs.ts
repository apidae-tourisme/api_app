import {Component, ViewChild} from '@angular/core';
import {IonicPage, Tabs} from "ionic-angular";


@IonicPage({
  segment: 'explorer'
})
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('appTabs') tabs: Tabs;

  tab1Root: any = 'GraphPage';
  tab2Root: any = 'DetailsPage';
  tab3Root: any = 'ListPage';

  tabParams: any;

  constructor() {
  }
}
