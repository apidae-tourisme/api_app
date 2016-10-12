import {Component} from '@angular/core';

import {ListPage} from "../list/list";
import {MapPage} from "../map/map";
import {GraphPage} from "../graph/graph";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = GraphPage;
  tab2Root: any = MapPage;
  tab3Root: any = ListPage;

  constructor() {
  }
}
