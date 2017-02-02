import {Component, ViewChild} from '@angular/core';
import {NavController, Searchbar, NavParams} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {FormPage} from "../form/form";
import {DataService} from "../../providers/data.service";
import {Keyboard} from "ionic-native";

@Component({
  templateUrl: 'search.html'
})
export class SearchPage {
  @ViewChild(Searchbar) searchbar: Searchbar;

  private tabIndex: number;

  public searchQuery: string;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public dataService: DataService,
              private navCtrl: NavController, private params: NavParams) {
    this.searchQuery = null;
    this.tabIndex = +params.get('tabIndex');
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchbar.setFocus();
      Keyboard.show();
    });
  }

  navigateTo(node, reset): void {
    this.explorerService.navigateTo(node, reset, () => {this.navCtrl.pop();});
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

  searchNodes(evt): void {
    this.searchService.searchNodes(evt, () => {});
  }

  createSeed() {
    this.navCtrl.push(FormPage);
  }
}
