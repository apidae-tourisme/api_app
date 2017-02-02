import {Component, ViewChild} from '@angular/core';
import {NavController, Content, NavParams} from 'ionic-angular';
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
              public explorerService: ExplorerService, public dataService: DataService) {
  }

  ionViewDidLoad(): void {
    let seedId = this.navParams.get('seedId') || this.explorerService.currentNode();
    this.explorerService.navigateTo(seedId, false);
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
}
