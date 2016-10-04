import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ExplorerService} from "../../services/explorer.service";
import {SvgComponent} from "../../components/svg.component";

@Component({
  templateUrl: 'build/pages/graph/graph.html',
  directives: [SvgComponent]
})
export class GraphPage {

  constructor(public navCtrl: NavController, public explorerService: ExplorerService) {
    this.explorerService.exploreGraph();
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.context.root);
  }

  homeNode(): void {
    this.explorerService.navigateTo('root');
  }

  ionViewDidLeave(): void {
    this.navCtrl.pop();
  }
}
