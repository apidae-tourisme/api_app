import {Component} from '@angular/core';
import {NavController, ModalController, Events} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {DetailsPage} from "../details/details";
import {DataService} from "../../providers/data.service";
import {GraphPage} from "../graph/graph";

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

  // modalSearch() {
  //   let modal = this.modalCtrl.create(SearchPage);
  //   modal.present();
  // }

  // modalDetails(nodeId) {
  //   this.dataService.getNodeDetails(nodeId).subscribe(data => {
  //     let modal = this.modalCtrl.create(DetailsPage, {node: data.node});
  //     modal.present();
  //   });
  // }

  navigateToNetwork(nodeId?) {
    if(nodeId) {
      this.explorerService.networkContext.changeNode(nodeId);
    }
    this.navCtrl.setRoot(GraphPage);
    // this.explorerService.exploreGraph(true);
  }
}
