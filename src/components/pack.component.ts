import {Component, ElementRef, EventEmitter, Input, Output} from "@angular/core";
import {ComponentUtils} from "./component.utils";

declare var d3: any;

@Component({
  selector: 'pack',
  template: `<ng-content></ng-content>`
})
export class PackComponent {

  private static readonly PACK_PATH = 'explorer';

  @Input() width: number;
  @Input() height: number;

  @Output() rootChange = new EventEmitter();
  @Output() showDetails = new EventEmitter();

  private host;
  private htmlElement;
  private svg;
  private nodesContainer;
  private linksContainer;
  private zoom;
  private zoomContainer;
  private defaultTransform;
  private layout;
  private node;
  private link;
  private pack;

  constructor(private element: ElementRef) {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.element.nativeElement);
    this.layout = {
      unitX: 70,
      unitY: 80,
      unitIcon: 30,
      unitImg: 28,
      linkDistance: 75,
      rootScaleX: 1.6,
      rootScaleY: 1.6,
      textMedium: 10,
      textSmall: 7,
      textTiny: 6,
      padding: 3,
      seedsLength: 30,
      descLength: 50,
      periphNodesCount: 9
    };
  }

  ngAfterViewInit() {
    this.svg = this.host.append("svg")
      .attr("width", window.innerWidth)
      .attr("height", '100%');
    this.zoomContainer = this.svg.append("g");
    // this.zoom = d3.zoom().scaleExtent([0.6, 1.5]);
    // this.svg.call(this.zoom.on("zoom", () => {
    //   this.zoomContainer.attr("transform", d3.event.transform);
    // })).on("dblclick.zoom", null)
    //   .on("mousedown.zoom", null);

    let defs = this.zoomContainer.append("defs");
    ComponentUtils.defineCommonPaths(defs);

    // var text = g.selectAll("text")
    //   .data(nodes)
    //   .enter().append("text")
    //   .attr("class", "label")
    //   .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
    //   .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
    //   .text(function(d) { return d.data.name; });

  }

  render(nodesData) {
    let that = this;
    this.zoomContainer.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
    this.pack = d3.pack()
      .size([this.width - 10, this.height - 10])
      .padding(2);

    let root = d3.hierarchy(nodesData, function(d) {return d.includedSeeds;})
      .sum(function(d) { return d.parent ? 1 : 0; })
      .sort(function(a, b) { return (a.label > b.label) ? 1 : -1; });

    let nodes = this.pack(root).descendants();

    let circle = this.zoomContainer.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", function(d) {return d.parent ? 40 : ((that.width / 2) - 5);})
      // .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) {return d.parent ? "black" : "white";});
  }
}
