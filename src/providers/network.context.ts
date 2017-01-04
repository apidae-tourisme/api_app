export class NetworkContext {

  node: string;
  previousNodes: Array<string>;

  constructor() {
    this.previousNodes = [];
  }

  changeNode(newNode, reset): void {
    if(reset) {
      this.previousNodes = [];
    } else {
      if(this.isPrevious(newNode)) {
        this.previousNodes.pop();
      } else if(newNode != this.node) {
        this.previousNodes.push(this.node);
      }
    }
    this.node = newNode;
  }

  reset(node?): void {
    this.node = node;
    this.previousNodes = [];
  }

  isPrevious(nodeId): boolean {
    return this.previousNodes.length > 0 && nodeId == this.previousNodes[this.previousNodes.length -1];
  }
}
