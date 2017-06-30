import {Platform} from 'ionic-angular';
import {Injectable} from "@angular/core";
import {ExplorerService} from "./explorer.service";
import {Seed} from "../components/seed.model";
import {SeedsService} from "./seeds.service";

@Injectable()
export class SearchService {

  public nodes: Array<any>;
  public showSearch: boolean;
  public searching: boolean;

  constructor(private dataService: SeedsService, public explorerService: ExplorerService, protected platform: Platform) {
    this.showSearch = false;
    this.searching = false;
    this.nodes = [];
  }

  toggleSearch(): void {
    this.showSearch = true;
  }

  searchNodes(query, scope, onComplete): void {
    this.searching = true;

    if (query && query.trim() != '' && query.length > 2) {
      this.dataService.searchNodes(query, scope).then(nodes => {
        this.nodes = [];
        if(nodes) {
          for (let i = 0; i < nodes.length; i++) {
            this.nodes.push(new Seed(nodes[i], false, false));
          }
          this.searching = false;
          onComplete();
        }
      });
    } else {
      this.nodes = [];
      this.searching = false;
      onComplete();
    }
  }

  clearNodes(onComplete?): void {
    this.nodes = [];
    this.showSearch = false;
    if(onComplete) {
      onComplete();
    }
  }
}
