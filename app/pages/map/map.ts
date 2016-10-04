import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {DataService} from "../../services/data.service";
import {NetworkComponent} from "../../components/network.component";
import {SvgComponent} from "../../components/svg.component";

@Component({
  templateUrl: 'build/pages/map/map.html',
  directives: [NetworkComponent, SvgComponent]
})
export class MapPage {

  private cachedNodes: Array<any>;
  private nodes: Array<any>;

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
    // this.dataService.getNodeData().subscribe(data => {
    //   this.cachedNodes = data.nodes;
    //   this.nodes = data.nodes;
    // });
  }
}
