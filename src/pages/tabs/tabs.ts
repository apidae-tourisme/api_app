import {Component} from '@angular/core';

import {ListPage} from "../list/list";
import {GraphPage} from "../graph/graph";
import {DetailsPage} from "../details/details";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = GraphPage;
  tab2Root: any = DetailsPage;
  tab3Root: any = ListPage;

  constructor() {
  }
}
