import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {DataService} from "../../providers/data.service";

@Component({
  templateUrl: 'search.html'
})
export class SearchPage {

  private cachedNodes: Array<any>;
  public nodes: Array<any>;

  constructor(public navCtrl: NavController, private dataService: DataService) {
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
}
