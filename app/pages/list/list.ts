import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ExplorerService} from "../../services/explorer.service";
import {DataService} from "../../services/data.service";
import {NetworkComponent} from "../../components/network.component";
import {SvgComponent} from "../../components/svg.component";

@Component({
  templateUrl: 'build/pages/list/list.html',
  directives: [NetworkComponent, SvgComponent],
  providers: [DataService, ExplorerService]
})
export class ListPage {

  private nodes: Array<any>;

  constructor(public navCtrl: NavController, private dataService: DataService) {
    this.loadNodes();
  }

  filterNodes(ev: any) {
    this.loadNodes();

    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.nodes = this.nodes.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
          (item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  loadNodes(): void {
    // this.dataService.getData().subscribe(data => {
    //   this.nodes = data['nodes'];
    // });
  }
}
