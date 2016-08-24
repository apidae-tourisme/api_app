export class NetworkContext {

  root: Array<any>;
  path: string;
  defaultPath: string;
  typesArray: Array<any>;
  typesMap: any;

  constructor(defaultRoot) {
    this.root = [defaultRoot];
    this.path = 'R1D1';
  }

  changeRoot(newRoot): void {
    if (newRoot && !Array.isArray(newRoot)) {
      newRoot = [newRoot];
    }
    this.root = newRoot;
    if (this.defaultPath && this.defaultPath != 'none') {
      this.path = this.defaultPath;
    }
  }
}
