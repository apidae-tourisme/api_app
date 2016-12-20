import {Component, ViewChild, Renderer} from '@angular/core';
import {NavController, Content, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {AuthService} from "../../providers/auth.service";

@Component({
  templateUrl: 'list.html'
})
export class ListPage {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public navCtrl: NavController, protected renderer: Renderer, public searchService: SearchService,
              public explorerService: ExplorerService, public authService: AuthService, protected platform: Platform) {
    this.searchQuery = null;
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

  }
}
