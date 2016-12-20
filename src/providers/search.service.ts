import {Platform} from 'ionic-angular';
import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import {ExplorerService} from "./explorer.service";
import {Seed} from "../components/seed.model";

@Injectable()
export class SearchService {
  private cachedNodes: Array<any>;
  public nodes: Array<any>;
  public showSearch: boolean;
  public searching: boolean;

  constructor(private dataService: DataService, public explorerService: ExplorerService, protected platform: Platform) {
    this.showSearch = false;
    this.searching = false;
    this.cachedNodes = [];
    this.nodes = [];
  }

  filterNodes(ev: any) {
    this.searching = true;
    let val = ev.target.value;

    if (val && val.trim() != '') {
      this.nodes = this.cachedNodes.filter((item) => {
        return (item.label && item.label.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
          (item.description && item.description.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    } else {
      this.nodes = [];
    }
    this.searching = false;
  }

  loadNodes(onComplete?): void {
    this.showSearch = true;
    this.dataService.getAllNodesData().subscribe(data => {
      this.cachedNodes = [];
      for(let i = 0; i < data.nodes.length; i++) {
        this.cachedNodes.push(new Seed(data.nodes[i], false, false));
      }
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
}
