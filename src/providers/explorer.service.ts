import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import 'rxjs/Rx';
import {NetworkContext} from "../providers/network.context";
import {Seed} from "../components/seed.model";

@Injectable()
export class ExplorerService {

  networkContext: NetworkContext;
  networkData: any;
  rootNode: Seed;
  previousNode: Seed;

  constructor(private dataService: DataService) {
    this.networkContext = new NetworkContext();
  }

  navigateTo(newNode: string, reset, onComplete?): void {
    this.networkContext.changeNode(newNode, reset);
    this.exploreGraph(false, onComplete);
  }

  navigateHome(onComplete?): void {
    this.networkContext.changeNode(null, true);
    this.exploreGraph(false, onComplete);
  }

  exploreGraph(resetData: boolean, onComplete?): void {
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
          if(networkNode.isRoot) {
            this.rootNode = networkNode;
          }
          if(networkNode.isPrevious) {
            this.previousNode = networkNode;
          }
          parsedData.nodes.push(networkNode);
          parsedData.edges = data.links;
        }
      }
      this.networkData = parsedData;
      if(onComplete) {
        onComplete();
      }
    });
  }
}
