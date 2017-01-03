import {NgModule} from '@angular/core';
import {IonicApp, IonicModule, DeepLinkConfig} from 'ionic-angular';
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
import {Storage} from '@ionic/storage';
import {SearchService} from "../providers/search.service";
import {FormPage} from "../pages/form/form";
import {SeedType} from "../pages/form/seed-type";
import {Seeds} from "../providers/seeds";
import {ApiAppConfig} from "../providers/apiapp.config";
import {SearchSeeds} from "../pages/form/search-seeds";
import {EditAvatar} from "../pages/form/edit-avatar";

export const deepLinkConfig: DeepLinkConfig = {
  links: [
    { component: LoginPage, name: 'Connexion', segment: '' },
    { component: TabsPage, name: 'Tabs', segment: ':seedId/:mode' }
  ]
};

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
    SearchSeeds,
    EditAvatar,
    GraphComponent
  ],
  imports: [
    IonicModule.forRoot(ApiApp,
      {
        scrollAssist: false,
        autoFocusAssist: false,
        mode: 'md',
        tabsPlacement: 'bottom'
      }, deepLinkConfig
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
    SeedType,
    SearchSeeds,
    EditAvatar
  ],
  providers: [
    AuthService,
    DataService,
    ExplorerService,
    SearchService,
    NetworkContext,
    Storage,
    Seeds,
    ApiAppConfig
  ]
})
export class AppModule {
}
