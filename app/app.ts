import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {GraphPage} from './pages/graph/graph';
import {ListPage} from "./pages/list/list";
import {MapPage} from "./pages/map/map";
import {ExplorerService} from "./services/explorer.service";
import {DataService} from "./services/data.service";


@Component({
  template: `<ion-tabs tabsPlacement="bottom" danger>
      <ion-tab [root]="tab1Root" tabTitle="Réseau" tabIcon="git-network"></ion-tab>
      <ion-tab [root]="tab2Root" tabTitle="Carte" tabIcon="pin"></ion-tab>
      <ion-tab [root]="tab3Root" tabTitle="Liste" tabIcon="list"></ion-tab>
     </ion-tabs>`
})
export class ApiApp {
  tab1Root: any = GraphPage;
  tab2Root: any = MapPage;
  tab3Root: any = ListPage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(ApiApp, [DataService, ExplorerService]);
