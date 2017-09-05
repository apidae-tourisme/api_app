import {Component, ViewChild} from '@angular/core';
import {Content, IonicPage, NavController, Platform, Slides} from 'ionic-angular';
import {ExplorerService} from "../../providers/explorer.service";
import {SearchService} from "../../providers/search.service";
import {GraphComponent} from "../../components/graph.component";
import {SeedsService} from "../../providers/seeds.service";
import {AuthService} from "../../providers/auth.service";
import {Seed} from "../../models/seed.model";
import {PackComponent} from "../../components/pack.component";

@IonicPage({
  segment: 'explorer'
})
@Component({
  templateUrl: 'explorer.html'
})
export class ExplorerPage {
  @ViewChild('viewSlides') viewSlides: Slides;
  @ViewChild(Content) content: Content;
  @ViewChild(GraphComponent) graph: GraphComponent;
  @ViewChild(PackComponent) pack: PackComponent;

  public loading: boolean;
  public graphWidth: number;
  public graphHeight: number;
  public currentView: string;
  public prevDisabled: boolean;
  public nextDisabled: boolean;

  constructor(public explorerService: ExplorerService, public searchService: SearchService, public dataService: SeedsService,
              public authService: AuthService, private navCtrl: NavController, private platform: Platform) {
    this.loading = true;
    this.currentView = 'connections';
    this.prevDisabled = true;
    this.nextDisabled = true;
  }

  rootNodeChange(event): void {
    this.navigateTo(event.newRoot, false);
  }

  ionViewDidEnter(): void {
    if(!this.authService.userSeed) {
      this.dataService.getCurrentUserSeed().then((data) => {
        if(data) {
          this.authService.userSeed = new Seed(data, false, false);
        }
      });
    }
    this.graphWidth = this.content.contentWidth;
    this.graphHeight = this.content.contentHeight;

    this.registerBack();
    if(!this.explorerService.rootNode) {
      this.explorerService.navigateTo(null, true, () => this.drawNetwork());
    } else {
      this.drawNetwork();
    }
  }

  navigateTo(node, reset): void {
    console.log('navigateTo : ' + node + ' - previousNode : ' + this.explorerService.previousNode() +
      ' - nextNode : ' + this.explorerService.nextNode());
    this.explorerService.navigateTo(node, reset, () => {
      this.prevDisabled = this.explorerService.previousNode() == null;
      this.nextDisabled = this.explorerService.nextNode() == null;
      this.drawNetwork();
    });
  }

  displayDetails() {
    this.navCtrl.push('DetailsPage', {id: this.explorerService.rootNode.id});
  }

  editSeed(): void {
    this.dataService.getNodeData(this.explorerService.rootNode.id).then((data) => {
      let node = new Seed(data.root, false, false);
      if(data.connectedSeeds.length > 0) {
        node.connectedSeeds = data.connectedSeeds.map((n) => {return new Seed(n, false, false)});
      }
      if(data.includedSeeds.length > 0) {
        node.includedSeeds = data.includedSeeds.map((n) => {return new Seed(n, false, false)});
      }
      this.navCtrl.push('FormPage', {id: node.id, node: node});
    });
  }

  shareSeed(): void {
    this.navCtrl.push('SharePage', {id: this.explorerService.rootNode.id});
  }

  drawNetwork() {
    if(this.graph) {
      this.loading = false;
      this.content.resize();
      this.graph.render(this.explorerService.networkData.nodes, this.explorerService.networkData.edges);
      if (this.pack) {
        this.pack.render(this.explorerService.rootNode);
      }
    }
  }

  displaySearch() {
    this.navCtrl.push('SearchPage');
  }

  displayInclusions() {
    this.viewSlides.slideTo(1, 500);
    this.currentView = 'inclusions';
  }

  displayConnections() {
    this.viewSlides.slideTo(0, 500);
    this.currentView = 'connections';
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

  slidesTapped(evt): void {
    // let date = null;
    // let elt = evt.originalEvent.target;
    // if(elt.tagName == 'SPAN') {
    //   date = elt.parentElement.id;
    // } else if(elt.tagName == 'BUTTON') {
    //   date = elt.id;
    // }
    //
    // if(date) {
    //   this.request.toggleDate(date);
    // }
  }

  switchView(evt): void {

  }
}
