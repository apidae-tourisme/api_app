import {Component, ViewChild} from '@angular/core';
import {Content, NavController, NavParams} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {FormPage} from "../form/form";
import {DataService} from "../../providers/data.service";
import {GraphComponent} from "../../components/graph.component";
import {Observable} from "rxjs/Rx";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {
  @ViewChild(Content) content: Content;
  @ViewChild(GraphComponent) graph: GraphComponent;

  public searchQuery: string;
  private initComplete: boolean;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public dataService: DataService,
              private navCtrl: NavController, private navParams: NavParams) {
    this.searchQuery = null;
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot, false, () => this.drawNetwork());
  }

  // This is to prevent multiple controller instances in some cases (see https://github.com/driftyco/ionic/issues/5960)
  ionViewCanEnter(): boolean {
    let validState = this.navCtrl.length() == 0 || this.navCtrl.getActive().name == 'FormPage';
    if(!validState) {
      console.log("Blocked invalid state in Graph page - navCtrl length : " +
        this.navCtrl.length() + ' - active page : ' + this.navCtrl.getActive().name);
    }
    return validState;
  }

  // initComplete flag prevents the graph from being rendered more than once (see https://github.com/driftyco/ionic/issues/5960)
  ionViewDidEnter(): void {
    if(this.navCtrl.length() == 1 && !this.initComplete) {
      let seedParam = this.navParams.get('seedId');
      if(seedParam) {
        this.explorerService.navigateTo(seedParam == 'default' ? null : seedParam, true, () => this.drawNetwork());
      } else {
        this.explorerService.navigateTo(this.explorerService.currentNode(), false, () => this.drawNetwork());
      }
      this.initComplete = true;
      this.clearResults();
    } else {
      this.drawNetwork();
      this.content.resize();
    }
  }

  navigateTo(node, reset): void {
    this.explorerService.navigateTo(node, reset, () => this.drawNetwork());
    this.clearResults();
  }

  loadResults(): void {
    this.searchService.toggleSearch();
  }

  clearResults(): void {
    this.searchService.clearNodes(() => {this.content.resize()});
    this.searchQuery = null;
  }

  closeSearch(): void {
    this.searchQuery = null;
    this.searchService.clearNodes(() => {
      console.log('clearing nodes');
      let timer = Observable.timer(1000);
      timer.subscribe(() => {
        this.drawNetwork();
      });
    });
  }

  searchNodes(evt): void {
    this.searchService.searchNodes(evt, () => {this.content.resize()})
  }

  displayDetails() {
    this.navCtrl.parent.select(1);
  }

  createSeed() {
    this.navCtrl.push(FormPage);
  }

  resizeContent() {
    this.content.resize();
  }

  drawNetwork() {
    if(this.graph) {
      console.log('drawing graph');
      this.graph.drawNetwork(this.explorerService.networkData);
    }
  }
}
