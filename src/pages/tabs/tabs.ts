import {Component, NgZone, ViewChild} from '@angular/core';
import {App, IonicPage, Tabs} from "ionic-angular";
import {SeedsService} from "../../providers/seeds.service";


@IonicPage({
  segment: 'explorer'
})
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('appTabs') tabs: Tabs;

  tab1Root: any = 'GraphPage';
  tab2Root: any = 'DetailsPage';
  tab3Root: any = 'ListPage';

  tabParams: any;

  constructor(private app: App, private dataService: SeedsService, private zone: NgZone) {
  }

  ionViewWillEnter() {
    if(!this.dataService.userEmail) {
      this.zone.run(() => {
        this.app.getRootNav().setRoot('LoginPage');
      });
    }
  }
}
