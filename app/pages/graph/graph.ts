import {Component} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {ExplorerService} from "../../services/explorer.service";
import {SvgComponent} from "../../components/svg.component";
import {SearchPage} from "../search/search";

@Component({
  templateUrl: 'build/pages/graph/graph.html',
  directives: [SvgComponent]
})
export class GraphPage {

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
              public explorerService: ExplorerService) {
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.context.root);
  }

  homeNode(): void {
    this.explorerService.navigateTo('root');
  }

  ionViewDidEnter() {
    this.explorerService.exploreGraph(true);
  }

  modalSearch() {
    let modal = this.modalCtrl.create(SearchPage);
    modal.present();
  }
}
