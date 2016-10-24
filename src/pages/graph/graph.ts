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

  constructor(public modalCtrl: ModalController, private dataService: DataService,
              public explorerService: ExplorerService, public authService: AuthService, public events: Events) {
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot);
  }

  homeNode(): void {
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
    this.dataService.getNodeDetails(this.explorerService.networkContext.node).subscribe(data => {
      let modal = this.modalCtrl.create(DetailsPage, {node: data.node});
      modal.present();
    });
  }
}
