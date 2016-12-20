import {Component, ViewChild, Renderer} from '@angular/core';
import {Content, NavController, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";
import {Seed} from "../../components/seed.model";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public authService: AuthService,
              private platform: Platform, private navCtrl: NavController, protected renderer: Renderer) {
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

  trackSeedById(i: number, seed: Seed) {
    return seed.id;
  }

  createSeed() {

  }
}
