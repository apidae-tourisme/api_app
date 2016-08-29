import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';


@Component({
  template: `<ion-tabs tabsPlacement="bottom" primary>
      <ion-tab [root]="tab1Root" tabTitle="Réseau" tabIcon="git-network"></ion-tab>
      <ion-tab [root]="tab2Root" tabTitle="Carte" tabIcon="pin"></ion-tab>
      <ion-tab [root]="tab3Root" tabTitle="Liste" tabIcon="list"></ion-tab>
     </ion-tabs>`
})
export class MyApp {
  tab1Root: any = HomePage;
  tab2Root: any = HomePage;
  tab3Root: any = HomePage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp);
