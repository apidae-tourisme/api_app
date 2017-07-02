import {Component, ViewChild} from "@angular/core";
import {ViewController, Content, IonicPage, Searchbar} from "ionic-angular";
import {SearchService} from "../../providers/search.service";
import {ExplorerService} from "../../providers/explorer.service";
import {Seeds} from "../../providers/seeds";
import {Keyboard} from "@ionic-native/keyboard";

@IonicPage()
@Component({
  templateUrl: 'search-seeds.html'
})
export class SearchSeeds {
  @ViewChild(Content) content: Content;
  @ViewChild(Searchbar) searchbar: Searchbar;

  public searchQuery: string;
  public searchScope: string;

  constructor(public viewCtrl: ViewController, public searchService: SearchService,
              private keyboard: Keyboard, public explorerService: ExplorerService) {
    this.searchQuery = null;
    this.searchScope = Seeds.SCOPE_ALL;
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      this.keyboard.show();
    }, 200);
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

  scopeChanged(evt): void {
    this.searchNodes(evt);
  }

  searchNodes(evt): void {
    this.searchService.searchNodes(this.searchQuery, this.searchScope, () => {this.content.resize()})
  }
}
