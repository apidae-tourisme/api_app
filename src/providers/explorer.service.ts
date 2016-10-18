import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import 'rxjs/Rx';
import {NetworkContext} from "../providers/network.context";
import {Seed} from "../components/seed.model";

@Injectable()
export class ExplorerService {

  networkContext: NetworkContext;
  networkData: any;

  constructor(private dataService: DataService) {
    this.networkContext = new NetworkContext();
  }

  navigateTo(newNode: string): void {
    this.networkContext.changeNode(newNode);
    this.exploreGraph();
  }

  navigateHome(): void {
    this.networkContext.reset();
    this.exploreGraph();
  }

  exploreGraph(resetData?: boolean): void {
    if(resetData) {
      this.networkData = null;
    }

    this.dataService.getNodeData(this.networkContext.node).subscribe(data => {
      let parsedData: any = {
        nodes: [],
        edges: []
      };
      let nodes = data.nodes;
      if(!this.networkContext.node) {
        this.networkContext.node = nodes[0].id;
      }

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.id) {
          let networkNode = new Seed(node, node.id == this.networkContext.node, this.networkContext.isPrevious(node.id));
          parsedData.nodes.push(networkNode);
          parsedData.edges = data.links;
        }
      }
      this.networkData = parsedData;
    });
  }
}
