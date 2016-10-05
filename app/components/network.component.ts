import {
  Component, OnChanges, SimpleChanges, Input, ElementRef, ViewChild, DoCheck, Output,
  EventEmitter
} from "@angular/core";
import {NetworkContext} from "../models/network.context";

declare var vis: any;

@Component({
  selector: 'network',
  template: `<div #netcontainer class="VizNet"></div>`
})
export class NetworkComponent implements DoCheck, OnChanges {

  @Input() networkData: any;
  @Input() networkContext: NetworkContext;
  @Output() rootChange = new EventEmitter();

  @ViewChild("netcontainer") networkContainer: ElementRef;

  private previousRoot : string;
  private networkInstance: any;

  ngAfterViewInit() {
    this.networkInstance = new vis.Network(this.networkContainer.nativeElement, this.networkData,
      {
        layout: {improvedLayout: true},
        nodes: {}
      });
    this.networkInstance.on('select', properties => {
      this.previousRoot = this.networkContext.node;
      this.networkContext.changeNode(properties.nodes[0]);
      console.log('root changed to ' + this.networkContext.node);
    });
  }

  ngDoCheck(): void {
    if(this.previousRoot !== this.networkContext.node) {
      this.rootChange.emit({context: this.networkContext});
      this.previousRoot = this.networkContext.node;
    }
  }

  ngOnChanges(changes: SimpleChanges): any {
    if(this.networkInstance && changes['networkData'].currentValue !== changes['networkData'].previousValue) {
      this.networkInstance.setData(this.networkData);
    }
  }
}
