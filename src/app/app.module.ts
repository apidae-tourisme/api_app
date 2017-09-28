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
import {Network} from "@ionic-native/network";
import {Keyboard} from "@ionic-native/keyboard";
import {StatusBar} from "@ionic-native/status-bar";
import {SplashScreen} from "@ionic-native/splash-screen";
import {SeedsService} from "../providers/seeds.service";
import {ProgressHttpModule} from "angular-progress-http";
import {RemoteDataService} from "../providers/remote.service";

@NgModule({
  declarations: [
    ApiApp
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ProgressHttpModule,
    IonicModule.forRoot(ApiApp,
      {
        scrollAssist: false,
        autoFocusAssist: false,
        mode: 'md',
        // Web only
        locationStrategy: 'path'
      }
    ),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ApiApp
  ],
  providers: [
    Keyboard,
    StatusBar,
    SplashScreen,
    InAppBrowser,
    Camera,
    File,
    Network,
    ApiAppConfig,
    AuthService,
    DataService,
    SeedsService,
    ExplorerService,
    SearchService,
    RemoteDataService,
    Seeds
  ]
})
export class AppModule {
}
