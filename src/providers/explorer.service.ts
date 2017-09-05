import {Injectable} from "@angular/core";
import 'rxjs/Rx';
import {Seed} from "../models/seed.model";
import {SeedsService} from "./seeds.service";

@Injectable()
export class ExplorerService {

  public networkData: any;
  public rootNode: Seed;
  public navBackward: Array<Seed>;
  public navForward: Array<Seed>;

  constructor(private dataService: SeedsService) {
    this.navBackward = [];
    this.navForward = [];
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

    this.dataService.getNodeData(newNode).then(data => {
      let parsedData: any = {
        nodes: [],
        edges: [],
        count: data.count
      };
      let nodes = [data.root].concat(data.connectedSeeds);
      let currentRoot = this.rootNode;
      let newPrevious = resetData ? null : this.newPreviousNode(newNode, currentRoot);
      let prevDisconnected = true;

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node._id) {
          let networkNode = new Seed(node, i == 0, node._id == newPrevious);
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
      parsedData.edges = data.connectedSeeds.map((n) => {return {source: n._id, target: data.root._id};});

      let inclusions = [];
      for (let i = 0; i < data.includedSeeds.length; i++) {
        inclusions.push(new Seed(data.includedSeeds[i], false, false));
      }
      this.rootNode.includedSeeds = inclusions;

      // Reset - no history
      if(resetData) {
        this.networkData = null;
        this.navBackward = [];
        this.navForward = [];
        this.navBackward.push(this.rootNode);
        parsedData.previousNode = null;
      }
      // Node unchanged (switched tabs or refresh)
      else if(newNode && newNode == this.currentNode()) {
        parsedData.previousNode = this.networkData.previousNode;
      }
      // Node changed - Nav backward
      else if(newNode && newNode == this.previousNode()) {
        this.navForward.push(this.navBackward.pop());
        if(this.navBackward.length == 1) {
          parsedData.previousNode = null;
        } else {
          parsedData.previousNode = this.navBackward[this.navBackward.length - 2];
        }
      }
      // Node changed - Nav forward
      else if(newNode && newNode == this.nextNode()) {
        this.navBackward.push(this.navForward.pop());
        if(!parsedData.previousNode) {
          parsedData.previousNode = currentRoot;
        }
      }
      // Node changed - Search
      else {
        if(!parsedData.previousNode) {
          parsedData.previousNode = currentRoot;
        }
        this.navBackward.push(this.rootNode);
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
    return this.navBackward.length > 0 ? this.navBackward[this.navBackward.length - 1].id : null;
  }

  previousNode(): string {
    return this.navBackward.length > 1 ? this.navBackward[this.navBackward.length - 2].id : null;
  }

  nextNode(): string {
    return this.navForward.length > 0 ? this.navForward[this.navForward.length - 1].id : null;
  }

  newPreviousNode(newNode, currentRoot): string {
    if(currentRoot && newNode != currentRoot.id) {
      return newNode == this.previousNode() ? this.beforePreviousNode() : currentRoot.id;
    } else {
      return null;
    }
  }

  beforePreviousNode(): string {
    return this.navBackward.length > 2 ? this.navBackward[this.navBackward.length - 3].id : null;
  }

  clearData(): void {
    this.navBackward = [];
    this.navForward = [];
    this.networkData = null;
    this.rootNode = null;
  }
}
