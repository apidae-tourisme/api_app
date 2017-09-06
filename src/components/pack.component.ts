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
      margin: 30,
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
    let defs = this.svg.append("defs");
    ComponentUtils.defineCommonPaths(defs);

    this.zoomContainer = this.svg.append("g");
    // this.zoom = d3.zoom().scaleExtent([0.6, 1.5]);
    // this.svg.call(this.zoom.on("zoom", () => {
    //   this.zoomContainer.attr("transform", d3.event.transform);
    // })).on("dblclick.zoom", null)
    //   .on("mousedown.zoom", null);
  }

  render(nodesData) {
    let layout = this.layout;
    let isNarrow = (this.width / this.height) < (layout.unitX / layout.unitY);
    let packWidth = isNarrow ? (this.width - 2 * layout.margin) : ((this.height - 2 * layout.margin) * layout.unitX / layout.unitY);
    let packHeight = isNarrow ? ((this.width - 2 * layout.margin) * layout.unitY / layout.unitX) : (this.height - 2 * layout.margin);
    let scaleX = packWidth / layout.unitX;
    let scaleY = packHeight / layout.unitY;

    this.zoomContainer.attr("transform", "translate(" + (isNarrow ? layout.margin : ((this.width - packWidth) / 2)) + "," + (isNarrow ? ((this.height - packHeight) / 2) : layout.margin) + ")");
    this.zoomContainer.selectAll("g").remove();
    this.node = this.zoomContainer.selectAll("g");
    this.pack = d3.pack()
      .size([packWidth, packHeight])
      .padding(0);

    let root = d3.hierarchy(nodesData).sum(function(d) { return d.parent ? 2 : 1; });

    let desc = this.pack(root).descendants();
    this.node = this.node.data(desc, function(d) {return d.data.id;});

    let nodesEnter = this.node.enter().append("g");
    nodesEnter.attr("class", function(d) { return d.parent ? "leaf node" : "node"; })
      .attr("transform", function(d) {
        let innerScale = Math.min(2 * d.r / layout.unitY, 1);
        let tx = d.parent ? (d.x - d.parent.x / scaleX) : 0;
        let ty = d.parent ? (d.y - d.parent.y / scaleY) : 0;
        return "translate(" + tx + "," + ty + ") scale(" + (d.parent ? innerScale : scaleX) + "," + (d.parent ? innerScale : scaleY) + ")";
      })
      .append("use")
        .attr("class", function (d) {
          return d.data.category + " node_bg bg_" + d.data.category;
        })
        .attr("filter", "")
        .attr("xlink:href", "#seed");

    nodesEnter.append("use")
      .attr("x", function(d) { return (layout.unitX - (layout.unitIcon / (d.parent ? 1 : scaleX * 0.6))) / 2; })
      .attr("y", function(d) { return d.parent ? (layout.unitIcon / 2 - layout.padding * 2) : 0; })
      .attr("width", function(d) { return layout.unitIcon / (d.parent ? 1 : scaleX * 0.6); })
      .attr("height", function(d) { return layout.unitIcon / (d.parent ? 1 : scaleY * 0.6); })
      .attr("class", function (d) {
        return d.data.category + " icon";
      })
      .attr("xlink:href", function (d) {
        return d.data.picture() ? '' : ('#' + d.data.category);
      });

    nodesEnter.append("image")
      .attr("class", "img-node")
      .attr("x", function(d) { return (layout.unitX - (layout.unitImg / (d.parent ? 1 : scaleX * 0.6))) / 2; })
      .attr("y", function(d) { return d.parent ? (layout.unitImg / 2 - layout.padding * 2) : 0; })
      .attr("width", function(d) { return layout.unitImg / (d.parent ? 1 : scaleX * 0.6); })
      .attr("height", function(d) { return layout.unitImg / (d.parent ? 1 : scaleY * 0.6); })
      .attr("xlink:href", function (d) {
        return d.data.picture() ? d.data.pictureData() : null;
      });

    nodesEnter.append("text")
      .attr("x", function(d) { return (layout.unitX - (layout.textMedium) / (d.parent ? 1 : scaleX * 0.6)) / 2 + (layout.padding / (d.parent ? 1 : scaleX * 0.6)) * 0.5; })
      .attr("y", function(d) { return layout.padding / (d.parent ? 1 : scaleX * 0.6); })
      .attr("font-size", function(d) { return layout.textMedium / (d.parent ? 1 : scaleX * 0.6); })
      .attr("class", "icon")
      .text(function (d) {
        return d.data.scope == 'private' ? '\uf31d' : ''
      });

    let inclusions = nodesEnter.append("g")
      .attr("class", "inclusion")
      .attr("transform", function(d) {return "translate(" + layout.unitX / 2 + "," + layout.unitY + ") scale(" + 1 / (d.parent ? 1 : scaleX) + "," + 1 / (d.parent ? 1 : scaleY) + ")"; });

    inclusions.append("circle")
      .attr("r", layout.textSmall)
      .attr("cx", 0)
      .attr("cy", -3);

    inclusions.append("text")
      .attr("font-size", layout.textSmall)
      .attr("text-anchor", "middle")
      .attr("textLength", "10")
      .attr("lengthAdjust", "spacing")
      .text(function (d) {
        return d.data.inclusions.length;
      });

    nodesEnter.append("text")
      .attr("text-anchor", "middle")
      .attr("x", function (d) {
        return layout.unitX * (d.parent ? 1 : scaleX * 0.6) / 2;
      })
      .attr("y", function (d) {
        return layout.unitIcon * (d.data.noIcon() ? 0.75 : 1.25) + 2 * layout.padding;
      })
      .attr("transform", function(d) { return "scale(" + (1 / (d.parent ? 1 : (scaleX * 0.6))) + "," + (1 / (d.parent ? 1 : (scaleY * 0.6))) +  ")"; })
      .attr("class", function (d) {
        return d.data.category + " label";
      })
      .text(function(d) { return d.data.isRoot ? (d.data.label + "|" + (d.data.description || '')) : d.data.label; });

    let allLabels = this.svg.selectAll("text.label");
    wrapLabels(allLabels);

    function wrapLabels(texts) {
      texts.each(function() {
        let text = d3.select(this);
        if(text.text().indexOf("|") != -1) {
          let textTokens = text.text().split("|");
          ComponentUtils.doWrap(text, textTokens[0], true, true, layout.textSmall, 0, layout);
          ComponentUtils.doWrap(text, textTokens[1], false, true, layout.textTiny, layout.padding * 3, layout);
        } else {
          ComponentUtils.doWrap(text, text.text(), true, false, layout.textMedium, 0, layout);
        }
      });
    }
  }
}
