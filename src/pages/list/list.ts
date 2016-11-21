import {Component} from '@angular/core';
import {NavController, ModalController, Events} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'list.html'
})
export class ListPage extends SearchPage {

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public events: Events,
              protected dataService: DataService, public explorerService: ExplorerService) {
    super(navCtrl, modalCtrl, events, dataService, explorerService);
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

  navigateToList(node): void {
    this.explorerService.navigateTo(node);
  }
}
