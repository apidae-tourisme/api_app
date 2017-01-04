import {Component, ViewChild, Renderer} from '@angular/core';
import {Content, NavController, Platform, NavParams} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {FormPage} from "../form/form";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public dataService: DataService,
              private platform: Platform, private navCtrl: NavController, private renderer: Renderer, private navParams: NavParams) {
    this.searchQuery = null;
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot, false);
  }

  ionViewDidEnter(): void {
    let seedId = this.navParams.get('seedId') || this.explorerService.currentNode();
    this.explorerService.navigateTo(seedId, false);
  }

  navigateTo(node, reset): void {
    this.explorerService.navigateTo(node, reset);
    this.clearResults();
  }

  loadResults(): void {
    this.searchService.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {this.content.resize()});
    this.searchQuery = null;
  }

  displayDetails() {
    this.navCtrl.parent.select(1);
  }

  filterNodes(ev: any) {
    this.searchService.filterNodes(ev);
    this.content.resize();

    // Temp fix on iOS - Searchbar keeps focus even when another button is clicked
    if(this.platform.is('ios')) {
      this.renderer.invokeElementMethod(ev.target, 'blur');
    }
  }

  createSeed() {
    this.navCtrl.push(FormPage);
  }
}
