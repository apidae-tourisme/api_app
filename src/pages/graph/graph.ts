import {Component} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
              public explorerService: ExplorerService) {
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot);
  }

  homeNode(): void {
    this.explorerService.navigateHome();
  }

  ionViewDidEnter() {
    this.explorerService.exploreGraph(true);
  }

  modalSearch() {
    let modal = this.modalCtrl.create(SearchPage);
    modal.present();
  }
}
