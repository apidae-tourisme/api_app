import {Component, ViewChild} from '@angular/core';
import {NavController, Searchbar, NavParams, IonicPage} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {FormPage} from "../form/form";
import {DataService} from "../../providers/data.service";
import {Keyboard} from "@ionic-native/keyboard";
import {Seeds} from "../../providers/seeds";
import {ExplorerPage} from "../explorer/explorer";

@IonicPage({
  segment: 'recherche'
})
@Component({
  templateUrl: 'search.html'
})
export class SearchPage {
  @ViewChild(Searchbar) searchbar: Searchbar;

  private tabIndex: number;

  public searchQuery: string;
  public searchScope: string;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public dataService: DataService,
              private keyboard: Keyboard, private navCtrl: NavController, private params: NavParams) {
    this.searchQuery = null;
    this.tabIndex = +params.get('tabIndex');
    this.searchScope = Seeds.SCOPE_ALL;
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      this.keyboard.show();
    }, 200);
  }

  navigateTo(node, reset): void {
    this.explorerService.navigateTo(node, reset, () => {this.navCtrl.popToRoot();});
  }

  loadResults(): void {
    this.searchService.toggleSearch();
  }

  clearResults(): void {
    this.searchService.clearNodes();
    this.searchQuery = null;
  }

  closeSearch(): void {
    this.clearResults();
    this.navCtrl.pop();
  }

  scopeChanged(evt): void {
    this.searchNodes(evt);
  }

  searchNodes(evt): void {
    this.searchService.searchNodes(this.searchQuery, this.searchScope, () => {});
  }

  createSeed() {
    this.navCtrl.push('FormPage', {name: this.searchQuery});
  }
}
