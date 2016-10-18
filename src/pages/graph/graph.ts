import {Component} from '@angular/core';
import {ModalController, Events, NavParams} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {AuthService} from "../../providers/auth.service";
import {DataService} from "../../providers/data.service";
import {DetailsPage} from "../details/details";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {

  public targetedNode: any;

  constructor(public modalCtrl: ModalController, private dataService: DataService,
              public explorerService: ExplorerService, public authService: AuthService, public events: Events) {
    this.events.subscribe('actions:hide', (evt) => {
      this.hideActions(evt);
    });
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot);
  }

  showNodeActions(event): void {
    this.dataService.getNodeDetails(event.nodeId).subscribe(data => {
      this.targetedNode = data.node;
    });
  }

  hideActions(event): void {
    this.targetedNode = null;
  }

  homeNode(): void {
    this.targetedNode = null;
    this.explorerService.navigateHome();
  }

  ionViewDidEnter() {
    if(this.authService.isLoggedIn()) {
      this.explorerService.exploreGraph(true);
    }
  }

  modalSearch() {
    let modal = this.modalCtrl.create(SearchPage);
    modal.present();
  }

  modalDetails() {
    let modal = this.modalCtrl.create(DetailsPage, {node: this.targetedNode});
    modal.present();
  }
}
