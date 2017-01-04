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

  ionViewDidEnter(): void {
    let seedId = this.navParams.get('seedId') || this.explorerService.currentNode();
    this.explorerService.navigateTo(seedId, false);
  }

  navigateTo(node, showGraph, reset, clear?): void {
    if(clear) {
      this.clearResults();
    }
    if(showGraph) {
      this.explorerService.navigateTo(node, reset, () => {
        this.explorerService.skipExplore = true;
        this.navCtrl.parent.select(0);
      });
    } else {
      this.explorerService.navigateTo(node, reset, () => {
        this.content.resize()
      });
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
