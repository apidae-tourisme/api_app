import {Component} from '@angular/core';
import {NavController, ModalController} from 'ionic-angular';
import {DataService} from "../../providers/data.service";
import {SearchPage} from "../search/search";

@Component({
  templateUrl: 'map.html'
})
export class MapPage {

  private cachedNodes: Array<any>;
  private nodes: Array<any>;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private dataService: DataService) {
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
    // this.dataService.getNodeData().subscribe(data => {
    //   this.cachedNodes = data.nodes;
    //   this.nodes = data.nodes;
    // });
  }

  modalSearch() {
    let modal = this.modalCtrl.create(SearchPage);
    modal.present();
  }
}
