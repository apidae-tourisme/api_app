import {Component, ViewChild, Renderer} from '@angular/core';
import {NavController, Content, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {DetailsPage} from "../details/details";
import {SearchService} from "../../providers/search.service";
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'list.html'
})
export class ListPage {
  @ViewChild(Content) content: Content;

  constructor(public navCtrl: NavController, protected renderer: Renderer, private dataService: DataService,
              public searchService: SearchService, public explorerService: ExplorerService, protected platform: Platform) {
  }

  homeNode(): void {
    this.explorerService.navigateHome(() => {this.content.resize()});
    this.clearResults();
  }

  ionViewDidEnter(): void {
    this.explorerService.exploreGraph(true);
  }

  navigateTo(node, reset, clear?): void {
    this.explorerService.navigateTo(node, reset, () => {this.content.resize()});
    if(clear) {
      this.clearResults();
    }
  }

  loadResults(): void {
    this.searchService.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {this.content.resize()});
  }

  modalDetails(nodeId?) {
    let currentNode = nodeId || this.explorerService.networkContext.node;
    this.dataService.getNodeDetails(currentNode).subscribe(data => {
      this.navCtrl.push(DetailsPage, {node: data.node});
    });
  }

  filterNodes(ev: any) {
    this.searchService.filterNodes(ev);

    // Temp fix on iOS - Searchbar keeps focus even when another button is clicked
    if(this.platform.is('ios')) {
      this.renderer.invokeElementMethod(ev.target, 'blur');
    }
  }
}
