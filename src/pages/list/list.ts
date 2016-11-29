import {Component, ViewChild, Renderer} from '@angular/core';
import {NavController, Events, Content, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchPage} from "../search/search";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'list.html'
})
export class ListPage extends SearchPage {
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, public events: Events, protected renderer: Renderer,
              protected dataService: DataService, public explorerService: ExplorerService, protected platform: Platform) {
    super(navCtrl, events, renderer, dataService, explorerService, platform);
  }

  homeNode(): void {
    this.explorerService.navigateHome();
    this.clearResults();
  }

  ionViewDidEnter(): void {
    this.explorerService.exploreGraph(true);
  }

  navigateTo(node, reset): void {
    this.explorerService.navigateTo(node, reset);
    this.clearResults();
  }

  loadResults(): void {
    this.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.clearNodes(() => {this.content.resize()});
  }
}
