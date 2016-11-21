import {Component} from '@angular/core';
import {Events, NavController} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage extends SearchPage {

  constructor(public navCtrl: NavController, public events: Events,
              protected dataService: DataService, public explorerService: ExplorerService) {
    super(navCtrl, events, dataService, explorerService);
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot);
  }

  homeNode(): void {
    this.explorerService.navigateHome();
  }

  ionViewDidEnter(): void {
    this.explorerService.exploreGraph(true);
  }
}
