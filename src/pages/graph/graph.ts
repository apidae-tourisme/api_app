import {Component, ViewChild, Renderer} from '@angular/core';
import {Events, NavController, Content, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage extends SearchPage {
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public events: Events, protected renderer: Renderer,
              protected dataService: DataService, public explorerService: ExplorerService, protected platform: Platform) {
    super(navCtrl, events, renderer, dataService, explorerService, platform);
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot, false);
  }

  homeNode(): void {
    this.explorerService.navigateHome();
    this.clearResults();
  }

  ionViewDidEnter(): void {
    this.explorerService.exploreGraph(true);
  }

  navigateTo(node): void {
    this.explorerService.navigateTo(node, true);
    this.clearResults();
  }

  loadResults(): void {
    this.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.clearNodes(() => {this.content.resize()});
  }
}
