import {Component, ViewChild} from "@angular/core";
import {ViewController, Content} from "ionic-angular";
import {SearchService} from "../../providers/search.service";

@Component({
  templateUrl: 'search-seeds.html'
})
export class SearchSeeds {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public viewCtrl: ViewController, public searchService: SearchService) {
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
}
