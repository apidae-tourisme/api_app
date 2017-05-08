import {Component, ViewChild} from '@angular/core';
import {Content, NavController, NavParams, Platform} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {DataService} from "../../providers/data.service";
import {GraphComponent} from "../../components/graph.component";
import {SearchPage} from "../search/search";

@Component({
  templateUrl: 'graph.html'
})
export class GraphPage {
  @ViewChild(Content) content: Content;
  @ViewChild(GraphComponent) graph: GraphComponent;

  public loading: boolean;
  public graphWidth: number;
  public graphHeight: number;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public dataService: DataService,
              private navCtrl: NavController, private navParams: NavParams, private platform: Platform) {
    this.loading = true;
  }

  rootNodeChange(event): void {
    this.explorerService.navigateTo(event.newRoot, false, () => this.drawNetwork());
  }

  ionViewDidEnter(): void {
    this.graphWidth = this.content.contentWidth;
    this.graphHeight = this.content.contentHeight;
    this.registerBack();
    let seedParam = this.navParams.get('seedId');
    if(seedParam) {
      this.explorerService.navigateTo(seedParam == 'default' ? null : seedParam, true, () => this.drawNetwork());
    } else {
      this.explorerService.navigateTo(this.explorerService.currentNode(), false, () => this.drawNetwork());
    }
  }

  navigateTo(node, reset): void {
    this.explorerService.navigateTo(node, reset, () => this.drawNetwork());
  }

  displayDetails() {
    this.navCtrl.parent.select(1);
  }

  drawNetwork() {
    if(this.graph) {
      this.loading = false;
      this.content.resize();
      this.graph.render(this.explorerService.networkData.nodes, this.explorerService.networkData.edges);
    }
  }

  displaySearch() {
    this.navCtrl.push(SearchPage);
  }

  registerBack() {
    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() => {
        if (this.navCtrl.canGoBack()) {
          this.navCtrl.pop();
        } else {
          let prevNode = this.explorerService.previousNode();
          if(prevNode) {
            this.explorerService.navigateTo(prevNode, false, () => this.drawNetwork());
          }
        }
      }, 100);
    });
  }
}
