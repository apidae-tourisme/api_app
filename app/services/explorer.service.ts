import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import 'rxjs/Rx';
import {NetworkContext} from "../models/network.context";

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
          let networkNode = {
            id: node.id,
            label: node.name,
            description: node.description,
            category: node.label.toLowerCase(),
            code: '\uf446',
            picture: null,
            isRoot: node.id == this.networkContext.node,
            isPrevious: this.networkContext.isPrevious(node.id)
          };
          if (node.thumbnail && (node.thumbnail.indexOf("jpg") != -1 || node.thumbnail.indexOf("logo") != -1)) {
            networkNode.picture = (node.thumbnail.indexOf("http") != - 1) ? node.thumbnail : ('http://' + node.thumbnail);
          }

          switch (node.label) {
            case 'Person' :
              networkNode.code = '\uf47e';
              break;
            case 'Organization' :
              networkNode.code = '\uf47c';
              break;
            case 'Competence' :
              networkNode.code = '\uf1bf';
              break;
            case 'Event' :
              networkNode.code = '\uf3f4';
              break;
            case 'Project' :
              networkNode.code = '\uf180';
              break;
            case 'Action' :
              networkNode.code = '\uf18e';
              break;
            case 'CreativeWork' :
              networkNode.code = '\uf431';
              break;
            case 'Product' :
              networkNode.code = '\uf168';
              break;
            case 'Idea' :
              networkNode.code = '\uf138';
              break;
            case 'Concept' :
              networkNode.code = '\uf412';
              break;
            case 'Schema' :
              networkNode.code = '\uf187';
              break;
          }
          parsedData.nodes.push(networkNode);
          parsedData.edges = data.links;
        }
      }
      this.networkData = parsedData;
    });
  }
}
