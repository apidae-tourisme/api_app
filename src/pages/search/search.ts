import {Component} from '@angular/core';
import {NavController, ModalController, Events} from 'ionic-angular';
import {DataService} from "../../providers/data.service";
import {DetailsPage} from "../details/details";
import {ExplorerService} from "../../providers/explorer.service";

@Component({
  templateUrl: 'search.html'
})
export class SearchPage {

  private cachedNodes: Array<any>;
  public nodes: Array<any>;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public events: Events,
              private dataService: DataService, private explorerService: ExplorerService) {
    this.loadNodes();
  }

  filterNodes(ev: any) {
    this.nodes = this.cachedNodes;
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.nodes = this.nodes.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
          (item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  loadNodes(): void {
    this.dataService.getAllNodesData().subscribe(data => {
      this.cachedNodes = data.nodes;
      this.nodes = data.nodes;
    });
  }

  closeModal(): void {
    this.navCtrl.pop();
  }

  modalDetails(nodeId) {
    this.dataService.getNodeDetails(nodeId).subscribe(data => {
      let modal = this.modalCtrl.create(DetailsPage, {node: data.node});
      modal.present();
    });
  }

  navigateTo(nodeId) {
    this.explorerService.networkContext.changeNode(nodeId);
    this.explorerService.exploreGraph(true);
    this.navCtrl.popToRoot();
  }
}
