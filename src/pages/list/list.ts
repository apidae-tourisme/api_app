import {Component, ViewChild} from '@angular/core';
import {NavController, Content, NavParams} from 'ionic-angular';
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

  constructor(public navCtrl: NavController, private navParams: NavParams, public searchService: SearchService,
              public explorerService: ExplorerService, public dataService: DataService) {
    this.searchQuery = null;
  }

  ionViewDidLoad(): void {
    let seedId = this.navParams.get('seedId') || this.explorerService.currentNode();
    this.explorerService.navigateTo(seedId, false);
    this.clearResults();
  }

  navigateTo(node, showGraph, reset, clear?): void {
    if(showGraph) {
      this.explorerService.navigateTo(node, reset, () => {
        if(clear) {
          this.clearResults();
        }
        this.navCtrl.parent.select(0);
      });
    } else {
      this.explorerService.navigateTo(node, reset, () => {
        if(clear) {
          this.clearResults();
        }
      });
    }
  }

  loadResults(): void {
    this.searchService.toggleSearch();
    this.content.resize();
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {this.content.resize()});
    this.searchQuery = null;
  }

  searchNodes(evt): void {
    this.searchService.searchNodes(evt, () => {this.content.resize()})
  }

  displayDetails() {
    this.navCtrl.parent.select(1);
  }

  createSeed() {
    this.navCtrl.push(FormPage);
  }
}
