import {Injectable} from "@angular/core";
import 'rxjs/Rx';
import {Seed} from "../models/seed.model";
import {SeedsService} from "./seeds.service";

@Injectable()
export class ExplorerService {

  private static readonly DEFAULT_SEED = "b0502ec3-56f2-4e15-a0ed-878f6131d6ef";
  private static readonly MAX_STEPS = 50;

  public networkData: any;
  public rootNode: Seed;
  public navHistory: Array<string>;

  private navIndex: number;

  constructor(private dataService: SeedsService) {
    this.initData();
  }

  navigateForward(onComplete?): void {
    let newIndex = this.navIndex < this.navHistory.length - 1 ? ++this.navIndex : this.navHistory.length - 1;
    this.loadNodeData(this.navHistory[newIndex], onComplete);
  }

  navigateBackward(onComplete?): void {
    let newIndex = this.navIndex > 0 ? --this.navIndex : 0;
    this.loadNodeData(this.navHistory[newIndex], onComplete);
  }

  navigateTo(newNode: string, onComplete?): void {
    let nodeId = newNode || ExplorerService.DEFAULT_SEED;
    this.navHistory.splice(this.navIndex + 1);
    this.navHistory.push(nodeId);
    if(this.navHistory.length > ExplorerService.MAX_STEPS) {
      this.navHistory.shift();
    }
    this.navIndex = this.navHistory.length - 1;
    this.loadNodeData(nodeId, onComplete);
  }

  loadNodeData(newNode, onComplete?): void {
    this.dataService.getNodeData(newNode).then(data => {
      this.rootNode = data.root;
      this.networkData = {
        nodes: [data.root].concat(data.root.connectedSeeds),
        edges: data.root.connectedSeeds.map((n) => {return {source: n.id, target: data.root.id};}),
        count: data.count
      };

      if(onComplete) {
        onComplete();
      }
    });
  }

  isFirstStep(): boolean {
    return this.navIndex == 0;
  }

  isLastStep(): boolean {
    return this.navHistory.length == 0 || this.navIndex == this.navHistory.length - 1;
  }

  history(): Array<string> {
    return this.navHistory.slice(0, this.navIndex).reverse();
  }

  initData(): void {
    this.navHistory = [];
    this.navIndex = 0;
    this.rootNode = null;
    this.networkData = {
      nodes: [],
      edges: []
    }
  }
}
