import {Component, ViewChild} from "@angular/core";
import {ViewController, Content, IonicPage} from "ionic-angular";
import {SearchService} from "../../providers/search.service";
import {ExplorerService} from "../../providers/explorer.service";
import {Seeds} from "../../providers/seeds";

@IonicPage()
@Component({
  templateUrl: 'search-seeds.html'
})
export class SearchSeeds {
  @ViewChild(Content) content: Content;

  public searchQuery: string;

  constructor(public viewCtrl: ViewController, public searchService: SearchService,
              public explorerService: ExplorerService) {
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
    this.searchService.searchNodes(evt, Seeds.SCOPE_ALL, () => {this.content.resize()})
  }
}
