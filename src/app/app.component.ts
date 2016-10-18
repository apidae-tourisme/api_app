import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {TabsPage} from '../pages/tabs/tabs';
import {LoginPage} from "../pages/login/login";
import {AuthService} from "../providers/auth.service";
import {ExplorerService} from "../providers/explorer.service";
import {NetworkContext} from "../providers/network.context";

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class ApiApp {
  rootPage = LoginPage;

  constructor(platform: Platform, private authService: AuthService, private explorerService: ExplorerService,
              private networkContact: NetworkContext) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
    });
  }
}
