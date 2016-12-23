import {NgModule} from '@angular/core';
import {IonicApp, IonicModule, Tabs} from 'ionic-angular';
import {ApiApp} from './app.component';
import {TabsPage} from '../pages/tabs/tabs';
import {GraphPage} from "../pages/graph/graph";
import {ListPage} from "../pages/list/list";
import {GraphComponent} from "../components/graph.component";
import {DataService} from "../providers/data.service";
import {ExplorerService} from "../providers/explorer.service";
import {NetworkContext} from "../providers/network.context";
import {MapPage} from "../pages/map/map";
import {AuthService} from "../providers/auth.service";
import {LoginPage} from "../pages/login/login";
import {DetailsPage} from "../pages/details/details";
import { Storage } from '@ionic/storage';
import {SearchService} from "../providers/search.service";
import {FormPage} from "../pages/form/form";
import {SeedType} from "../pages/form/seed-type";
import {Seeds} from "../providers/seeds";

@NgModule({
  declarations: [
    ApiApp,
    TabsPage,
    LoginPage,
    GraphPage,
    MapPage,
    ListPage,
    DetailsPage,
    FormPage,
    SeedType,
    GraphComponent
  ],
  imports: [
    IonicModule.forRoot(ApiApp,
      {
        scrollAssist: false,
        autoFocusAssist: false,
        mode: 'md',
        tabsPlacement: 'bottom'
      }
    )
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ApiApp,
    TabsPage,
    LoginPage,
    GraphPage,
    MapPage,
    ListPage,
    DetailsPage,
    FormPage,
    SeedType
  ],
  providers: [
    AuthService,
    DataService,
    ExplorerService,
    SearchService,
    NetworkContext,
    Storage,
    Seeds
  ]
})
export class AppModule {
}
