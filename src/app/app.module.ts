import {NgModule} from '@angular/core';
import {IonicApp, IonicModule} from 'ionic-angular';
import {ApiApp} from './app.component';
import {TabsPage} from '../pages/tabs/tabs';
import {GraphPage} from "../pages/graph/graph";
import {ListPage} from "../pages/list/list";
import {SearchPage} from "../pages/search/search";
import {GraphComponent} from "../components/graph.component";
import {DataService} from "../providers/data.service";
import {ExplorerService} from "../providers/explorer.service";
import {NetworkContext} from "../providers/network.context";
import {MapPage} from "../pages/map/map";

@NgModule({
  declarations: [
    ApiApp,
    TabsPage,
    GraphPage,
    MapPage,
    ListPage,
    SearchPage,
    GraphComponent
  ],
  imports: [
    IonicModule.forRoot(ApiApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ApiApp,
    TabsPage,
    GraphPage,
    MapPage,
    ListPage,
    SearchPage
  ],
  providers: [
    DataService,
    ExplorerService,
    NetworkContext
  ]
})
export class AppModule {
}
