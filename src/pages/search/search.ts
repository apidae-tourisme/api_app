import {NavController, Events, Platform} from 'ionic-angular';
import {DataService} from "../../providers/data.service";
import {DetailsPage} from "../details/details";
import {ExplorerService} from "../../providers/explorer.service";
import {Seed} from "../../components/seed.model";
import {Renderer} from "@angular/core";

export class SearchPage {
  private cachedNodes: Array<any>;
  public nodes: Array<any>;
  public showSearch: boolean;

  constructor(public navCtrl: NavController, public events: Events, protected renderer: Renderer,
              protected dataService: DataService, public explorerService: ExplorerService, protected platform: Platform) {
    this.showSearch = false;
    this.cachedNodes = [];
  }

  filterNodes(ev: any) {
    this.nodes = this.cachedNodes;
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.nodes = this.nodes.filter((item) => {
        return (item.label && item.label.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
          (item.description && item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }

    // Temp fix on iOS - Searchbar keeps focus even when another button is clicked
    if(this.platform.is('ios')) {
      this.renderer.invokeElementMethod(ev.target, 'blur');
    }
  }

  loadNodes(onComplete?): void {
    this.showSearch = true;
    this.dataService.getAllNodesData().subscribe(data => {
      this.cachedNodes = [];
      for(let i = 0; i < data.nodes.length; i++) {
        this.cachedNodes.push(new Seed(data.nodes[i], false, false));
      }
      this.nodes = this.cachedNodes;
      if(onComplete) {
        onComplete();
      }
    });
  }

  clearNodes(onComplete?): void {
    this.showSearch = false;
    this.nodes = [];
    if(onComplete) {
      onComplete();
    }
  }

  modalDetails(nodeId?) {
    let currentNode = nodeId || this.explorerService.networkContext.node;
    this.dataService.getNodeDetails(currentNode).subscribe(data => {
      this.navCtrl.push(DetailsPage, {node: data.node});
    });
  }
}
