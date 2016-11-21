import {Component, ViewChild} from '@angular/core';
import {NavController, Events, Content} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'list.html'
})
export class ListPage extends SearchPage {
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public events: Events,
              protected dataService: DataService, public explorerService: ExplorerService) {
    super(navCtrl, events, dataService, explorerService);
  }

  homeNode(): void {
    this.explorerService.navigateHome(() => {this.content.resize();});
  }

  loadListNodes(): void {
    this.loadNodes(() => {this.content.resize();});
  }

  ionViewDidEnter(): void {
    this.explorerService.exploreGraph(true);
  }

  navigateToList(node): void {
    this.explorerService.navigateTo(node, () => {this.content.resize();});
  }
}
