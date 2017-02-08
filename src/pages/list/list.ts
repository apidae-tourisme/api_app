import {Component, ViewChild} from '@angular/core';
import {NavController, Content, NavParams, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {DataService} from "../../providers/data.service";
import {SearchPage} from "../search/search";

@Component({
  templateUrl: 'list.html'
})
export class ListPage {
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, private navParams: NavParams, public searchService: SearchService,
              public explorerService: ExplorerService, public dataService: DataService, private platform: Platform) {
  }

  ionViewDidLoad(): void {
    let seedId = this.navParams.get('seedId') || this.explorerService.currentNode();
    this.explorerService.navigateTo(seedId, false);
  }

  ionViewDidEnter(): void {
    this.registerBack();
  }

  navigateTo(node, showGraph, reset): void {
    if(showGraph) {
      this.explorerService.navigateTo(node, reset, () => {
        this.navCtrl.parent.select(0);
      });
    } else {
      this.explorerService.navigateTo(node, reset, () => {this.content.resize();});
    }
  }

  displaySearch() {
    this.navCtrl.push(SearchPage);
  }

  displayDetails() {
    this.navCtrl.parent.select(1);
  }

  registerBack() {
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        } else {
          let prevNode = this.explorerService.previousNode();
          if(prevNode) {
            this.explorerService.navigateTo(prevNode, false, () => this.content.resize());
          }
        }
      }, 100);
    });
  }
}
