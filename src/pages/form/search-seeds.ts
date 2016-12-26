import {Component, Renderer, ViewChild} from "@angular/core";
import {ViewController, Platform, Content} from "ionic-angular";
import {SearchService} from "../../providers/search.service";

@Component({
  templateUrl: 'search-seeds.html'
})
export class SearchSeeds {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public viewCtrl: ViewController, private renderer: Renderer, public searchService: SearchService,
              private platform: Platform) {
    this.searchQuery = null;
  }

  dismiss() {
    this.clearResults();
    this.viewCtrl.dismiss();
  }

  selectSeed(seed): void {
    this.clearResults();
    this.viewCtrl.dismiss({seed: seed});
  }

  loadResults(): void {
    this.searchService.loadNodes(() => {this.content.resize()});
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {this.content.resize()});
    this.searchQuery = null;
  }

  filterNodes(ev: any) {
    this.searchService.filterNodes(ev);

    // Temp fix on iOS - Searchbar keeps focus even when another button is clicked
    if(this.platform.is('ios')) {
      this.renderer.invokeElementMethod(ev.target, 'blur');
    }
  }
}
