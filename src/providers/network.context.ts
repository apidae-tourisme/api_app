export class NetworkContext {

  node: string;
  previousNodes: Array<string>;

  constructor() {
    this.previousNodes = [];
  }

  changeNode(newNode): void {
    if(this.isPrevious(newNode)) {
      this.previousNodes.pop();
    } else {
      this.previousNodes.push(this.node);
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
