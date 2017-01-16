import {Platform} from 'ionic-angular';
import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import {ExplorerService} from "./explorer.service";
import {Seed} from "../components/seed.model";

@Injectable()
export class SearchService {

  public nodes: Array<any>;
  public showSearch: boolean;
  public searching: boolean;

  constructor(private dataService: DataService, public explorerService: ExplorerService, protected platform: Platform) {
    this.showSearch = false;
    this.searching = false;
    this.nodes = [];
  }

  toggleSearch(): void {
    this.showSearch = true;
  }

  searchNodes(ev: any, onComplete): void {
    this.searching = true;
    let val = ev.target.value;

    if (val && val.trim() != '' && val.length > 2) {
      this.dataService.searchNodes(val).subscribe(data => {
        this.nodes = [];
        for (let i = 0; i < data.nodes.length; i++) {
          this.nodes.push(new Seed(data.nodes[i], false, false));
        }
        this.searching = false;
        onComplete();
      });
    } else {
      this.nodes = [];
      this.searching = false;
      onComplete();
    }
  }

  clearNodes(onComplete?): void {
    this.nodes = [];
    if(onComplete) {
      onComplete();
      this.showSearch = false;
    }
  }
}
