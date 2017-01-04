import {Component, ViewChild, Renderer} from '@angular/core';
import {NavController, Content, Platform, NavParams} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {FormPage} from "../form/form";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'list.html'
})
export class ListPage {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public navCtrl: NavController, private navParams: NavParams, private renderer: Renderer,
              public searchService: SearchService, public explorerService: ExplorerService,
              public dataService: DataService, private platform: Platform) {
    this.searchQuery = null;
  }

  homeNode(): void {
    this.explorerService.navigateHome(() => {this.content.resize()});
    this.clearResults();
    this.navCtrl.parent.select(0);
  }

  ionViewDidEnter(): void {
    let seedId = this.navParams.get('seedId');
    if(seedId && seedId != 'default') {
      this.navigateTo(seedId, true, false);
    } else {
      this.explorerService.exploreGraph(false);
    }
  }

  navigateTo(node, showGraph, clear?): void {
    this.explorerService.navigateTo(node, false, () => {this.content.resize()});
    if(clear) {
      this.clearResults();
    }
    if(showGraph) {
      this.navCtrl.parent.select(0);
    }
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

    // Temp fix on iOS - Searchbar keeps focus even when another button is clicked
    if(this.platform.is('ios')) {
      this.renderer.invokeElementMethod(ev.target, 'blur');
    }
  }

  createSeed() {
    this.navCtrl.push(FormPage);
  }
}
