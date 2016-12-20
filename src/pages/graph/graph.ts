import {Component, ViewChild, Renderer} from '@angular/core';
import {Content, NavController, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {DetailsPage} from "../details/details";
import {DataService} from "../../providers/data.service";
import {AuthService} from "../../providers/auth.service";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              private platform: Platform, private dataService: DataService, private navCtrl: NavController,
              protected renderer: Renderer) {
    this.searchQuery = null;
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
    this.searchService.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {this.content.resize()});
    this.searchQuery = null;
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
