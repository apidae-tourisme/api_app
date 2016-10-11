import {Component} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";

@Component({
  templateUrl: 'list.html'
})
export class ListPage {

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
              public explorerService: ExplorerService) {
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

  navigateTo(node): void {
    this.explorerService.navigateTo(node);
  }

  modalSearch() {
    let modal = this.modalCtrl.create(SearchPage);
    modal.present();
  }
}
