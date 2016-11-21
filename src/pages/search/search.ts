import {Component} from '@angular/core';
import {NavController, ModalController, Events} from 'ionic-angular';
import {DataService} from "../../providers/data.service";
import {DetailsPage} from "../details/details";
import {ExplorerService} from "../../providers/explorer.service";
import {Seed} from "../../components/seed.model";

export class SearchPage {

  private cachedNodes: Array<any>;
  public nodes: Array<any>;
  public showSearch: boolean;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public events: Events,
              protected dataService: DataService, public explorerService: ExplorerService) {
    this.showSearch = false;
    this.cachedNodes = [];
  }

  filterNodes(ev: any) {
    this.nodes = this.cachedNodes;
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.nodes = this.nodes.filter((item) => {
        return (item.name && item.name.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
          (item.description && item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  loadNodes(): void {
    this.showSearch = true;
    this.dataService.getAllNodesData().subscribe(data => {
      for(let i = 0; i < data.nodes.length; i++) {
        this.cachedNodes.push(new Seed(data.nodes[i], false, false));
      }
      this.nodes = this.cachedNodes;
    });
  }

  hideResults(ev: any): void {
    ev.stopPropagation();
    this.showSearch = false;
    this.nodes = [];
  }

  closeModal(): void {
    this.navCtrl.pop();
  }

  modalDetails(nodeId?) {
    let currentNode = nodeId || this.explorerService.networkContext.node;
    this.dataService.getNodeDetails(currentNode).subscribe(data => {
      // let modal = this.modalCtrl.create(DetailsPage, {node: data.node});
      // modal.present();
      this.navCtrl.push(DetailsPage, {node: data.node});
    });
  }
}
