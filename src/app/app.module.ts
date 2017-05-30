import {NgModule} from '@angular/core';
import {IonicApp, IonicModule} from 'ionic-angular';
import {ApiApp} from './app.component';
import {DataService} from "../providers/data.service";
import {ExplorerService} from "../providers/explorer.service";
import {AuthService} from "../providers/auth.service";
import {IonicStorageModule} from '@ionic/storage';
import {SearchService} from "../providers/search.service";
import {Seeds} from "../providers/seeds";
import {ApiAppConfig} from "../providers/apiapp.config";
import {BrowserModule} from "@angular/platform-browser";
import {HttpModule} from "@angular/http";
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {Camera} from "@ionic-native/camera";
import {File} from '@ionic-native/file';
import {Transfer} from "@ionic-native/transfer";
import {Network} from "@ionic-native/network";
import {Keyboard} from "@ionic-native/keyboard";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";

// export const deepLinkConfig: DeepLinkConfig = {
//   links: [
//     { component: LoginPage, name: 'Connexion', segment: '' },
//     { component: TabsPage, name: 'Tabs', segment: ':seedId/:mode' }
//   ]
// };

@NgModule({
  declarations: [
    ApiApp
    // TabsPage,
    // LoginPage,
    // GraphPage,
    // MapPage,
    // ListPage,
    // SearchPage,
    // DetailsPage,
    // FormPage,
    // SeedType,
    // SearchSeeds,
    // EditAvatar
    // GraphComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(ApiApp,
      {
        scrollAssist: false,
        autoFocusAssist: false,
        mode: 'md',
        tabsPlacement: 'bottom',
        tabsHideOnSubPages: true
      }
    ),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ApiApp
    // TabsPage,
    // LoginPage,
    // GraphPage,
    // MapPage,
    // ListPage,
    // SearchPage,
    // DetailsPage,
    // FormPage,
    // SeedType,
    // SearchSeeds,
    // EditAvatar
  ],
  providers: [
    Keyboard,
    StatusBar,
    SplashScreen,
    InAppBrowser,
    Camera,
    File,
    Transfer,
    Network,
    AuthService,
    DataService,
    ExplorerService,
    SearchService,
    Seeds,
    ApiAppConfig
  ]
})
export class AppModule {
}
