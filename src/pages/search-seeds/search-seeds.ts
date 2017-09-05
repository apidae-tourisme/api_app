import {Component, ViewChild} from "@angular/core";
import {ViewController, Content, IonicPage, Searchbar, NavParams} from "ionic-angular";
import {SearchService} from "../../providers/search.service";
import {ExplorerService} from "../../providers/explorer.service";
import {Seeds} from "../../providers/seeds";
import {Keyboard} from "@ionic-native/keyboard";
import {Seed} from "../../models/seed.model";

@IonicPage({
  segment: 'selectionner'
})
@Component({
  templateUrl: 'search-seeds.html'
})
export class SearchSeeds {
  @ViewChild(Content) content: Content;
  @ViewChild(Searchbar) searchbar: Searchbar;

  public node: Seed;
  public searchQuery: string;
  public searchScope: string;

  constructor(public viewCtrl: ViewController, public searchService: SearchService, private params: NavParams,
              private keyboard: Keyboard, public explorerService: ExplorerService) {
    this.searchQuery = null;
    this.searchScope = Seeds.SCOPE_ALL;
    this.node = params.get('node');
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

  toggleConnection(seed) {
    if(this.node.connections.indexOf(seed.id) != -1) {
      this.node.removeConnection(seed)
    } else {
      this.node.addConnection(seed);
    }
  }

  toggleInclusion(seed) {
    if(this.node.inclusions.indexOf(seed.id) != -1) {
      this.node.includedSeeds.splice(this.node.includedSeeds.indexOf(seed), 1);
      this.node.inclusions.splice(this.node.inclusions.indexOf(seed.id), 1);
    } else {
      this.node.includedSeeds.push(seed);
      this.node.inclusions.push(seed.id);
    }
  }
}
