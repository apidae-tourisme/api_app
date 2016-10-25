import {Component} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {DetailsPage} from "../details/details";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'list.html'
})
export class ListPage {

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
              public explorerService: ExplorerService, private dataService: DataService) {
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

  modalDetails(nodeId) {
    this.dataService.getNodeDetails(nodeId).subscribe(data => {
      let modal = this.modalCtrl.create(DetailsPage, {node: data.node});
      modal.present();
    });
  }

  // switchToNetwork() {
  //   this.navCtrl.popToRoot();
  // }
}
