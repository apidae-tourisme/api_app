import {Component} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {AuthService} from "../../providers/auth.service";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
              public explorerService: ExplorerService, public authService: AuthService) {
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot);
  }

  homeNode(): void {
    this.explorerService.navigateHome();
  }

  ionViewWillEnter() {
    if(!this.authService.isLoggedIn()) {
      document.querySelector("div.tabbar")['style'].display = 'none';
    }
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
}
