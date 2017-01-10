import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import 'rxjs/Rx';
import {Seed} from "../components/seed.model";

@Injectable()
export class ExplorerService {

  networkData: any;
  rootNode: Seed;
  nav: Array<Seed>;

  constructor(private dataService: DataService) {
    this.nav = [];
    this.networkData = {
      nodes: [],
      edges: []
    }
  }

  navigateTo(newNode: string, reset, onComplete?): void {
    // Debug log
    // console.log('navigateTo : ' + newNode + ' - reset : ' + reset);
    this.exploreGraph(reset, newNode, onComplete);
  }

  private exploreGraph(resetData: boolean, newNode, onComplete?): void {

    this.dataService.getNodeData(newNode).subscribe(data => {
      let parsedData: any = {
        nodes: [],
        edges: []
      };
      let nodes = data.nodes;
      let currentRoot = this.rootNode;
      let newPrevious = resetData ? null : this.newPreviousNode(newNode, currentRoot);
      let prevDisconnected = true;

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.id) {
          let networkNode = new Seed(node, node.is_root, node.id == newPrevious);
          if(networkNode.isRoot) {
            this.rootNode = networkNode;
          }
          if(networkNode.isPrevious) {
            parsedData.previousNode = networkNode;
            prevDisconnected = false;
          }
          parsedData.nodes.push(networkNode);
        }
      }
      parsedData.edges = data.links;

      // Reset - no history
      if(resetData) {
        this.networkData = null;
        this.nav = [];
        this.nav.push(this.rootNode);
        parsedData.previousNode = null;
      }
      // Node unchanged (switched tabs or refresh)
      else if(newNode && newNode == this.currentNode()) {
        parsedData.previousNode = this.networkData.previousNode;
      }
      // Node changed - Nav backward
      else if(newNode && newNode == this.previousNode()) {
        this.nav.pop();
        if(this.nav.length == 1) {
          parsedData.previousNode = null;
        } else {
          parsedData.previousNode = this.nav[this.nav.length - 2];
        }
      }
      // Node changed - Nav forward / search
      else {
        if(!parsedData.previousNode) {
          parsedData.previousNode = currentRoot;
        }
        this.nav.push(this.rootNode);
      }

      if(parsedData.previousNode) {
        parsedData.previousNode.disconnected = prevDisconnected;
      }

      // Debug logs
      // console.log('rootNode : ' + this.rootNode.id);
      // console.log('previousNode : ' + (parsedData.previousNode ? parsedData.previousNode.id : null));
      // console.log('nav : ' + this.nav.map(function(s) {return s.id;}));

      this.networkData = parsedData;

      if(onComplete) {
        onComplete();
      }
    });
  }

  currentNode(): string {
    return this.nav.length > 0 ? this.nav[this.nav.length - 1].id : null;
  }

  previousNode(): string {
    return this.nav.length > 1 ? this.nav[this.nav.length - 2].id : null;
  }

  newPreviousNode(newNode, currentRoot): string {
    if(currentRoot && newNode != currentRoot.id) {
      return newNode == this.previousNode() ? this.beforePreviousNode() : currentRoot.id;
    } else {
      return null;
    }
  }

  beforePreviousNode(): string {
    return this.nav.length > 2 ? this.nav[this.nav.length - 3].id : null;
  }

  clearData(): void {
    this.nav = [];
    this.networkData = null;
    this.rootNode = null;
  }
}
