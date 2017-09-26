import {Component, ElementRef, EventEmitter, Input, Output} from "@angular/core";
import {ComponentUtils} from "./component.utils";

declare var d3: any;

@Component({
  selector: 'graph',
  template: `<ng-content></ng-content>`
})
export class GraphComponent {

  private static readonly GRAPH_PATH = 'explorer';

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
  private simulation;
  private node;
  private link;

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
    this.zoom = d3.zoom().scaleExtent([0.6, 1.5]);
    this.svg.call(this.zoom.on("zoom", () => {
      this.zoomContainer.attr("transform", d3.event.transform);
    })).on("dblclick.zoom", null)
      .on("mousedown.zoom", null);

    let defs = this.zoomContainer.append("defs");
    ComponentUtils.defineCommonPaths(defs);

    this.linksContainer = this.zoomContainer.append("g").attr("class", "links");
    this.nodesContainer = this.zoomContainer.append("g").attr("class", "nodes");
    this.defaultTransform = d3.zoomTransform(this.zoomContainer);

    let that = this;
    let layout = this.layout;
    this.link = this.linksContainer.selectAll("line");
    this.node = this.nodesContainer.selectAll("g");

    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(function (link, index) {
        return index < layout.periphNodesCount ? layout.linkDistance : (layout.linkDistance * 1.6);
      }))
      .force("charge", d3.forceManyBody().strength(function (node, index) {
        return node.isRoot ? (that.simulation.nodes().length == 2 ? -20000 : -1200) : -800;
      }))
      .on("tick", ticked);

    function ticked() {
      that.link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", that.width / 2)
        .attr("y2", that.height / 2);

      that.node.attr("transform", function (d) {
          let scale = d.isRoot ? layout.rootScaleX : 1;
          let tx = (d.isRoot ? that.width / 2 : d.x)  - layout.unitX * scale / 2;
          let ty = (d.isRoot ? that.height / 2 : d.y)  - layout.unitY * scale / 2;
          return "translate(" + tx + "," + ty + ") scale(" + scale + ")";
        });
    }
  }

  render(nodes, edges) {
    let that = this;
    let layout = this.layout;

    setTimeout(function() {
      that.node = that.node.data(nodes, function(d) { return d.id; }).style("opacity", 1);
      that.node.exit().remove();
      that.link = that.link.data(edges, function(d) { return d.source + "-" + d.target; }).style("opacity", 1);
      that.link.exit().remove();

      let nodesEnter = that.node.enter().append("g");

      nodesEnter.append("use")
        .attr("class", function (d) {
          return d.category + " node_bg bg_" + d.category;
        })
        .attr("filter", "")
        .attr("xlink:href", "#seed");

      nodesEnter.append("use")
        .attr("x", (layout.unitX - layout.unitIcon) / 2)
        .attr("y", (layout.unitIcon / 2) - (layout.padding * 2))
        .attr("width", layout.unitIcon)
        .attr("height", layout.unitIcon)
        .attr("class", function (d) {
          return d.category + " icon";
        })
        .attr("xlink:href", function (d) {
          return d.picture() ? '' : ('#' + d.category);
        });

      nodesEnter.append("image")
        .attr("class", "img-node")
        .attr("x", (layout.unitX - layout.unitImg) / 2)
        .attr("y", (layout.unitImg / 2) - (layout.padding * 2))
        .attr("width", layout.unitImg)
        .attr("height", layout.unitImg)
        .attr("xlink:href", function (d) {
          return d.picture() ? d.pictureData() : null;
        });

      nodesEnter.append("text")
        .attr("x", (layout.unitX - layout.textMedium) / 2 + layout.padding * 0.5)
        .attr("y", layout.padding)
        .attr("font-size", layout.textMedium)
        .attr("class", "icon")
        .text(function (d) {
          return d.scope == 'private' ? '\uf31d' : ''
        });

      let connections = nodesEnter.append("g")
        .attr("class", "connection");

      connections.append("circle")
        .attr("r", 7)
        .attr("cx", 0)
        .attr("cy", -3);

      connections.append("text")
        .attr("font-size", 8)
        .attr("text-anchor", "middle")
        .attr("textLength", "8")
        .attr("lengthAdjust", "spacing")
        .text(function (d) {
          return d.connections.length;
        });

      nodesEnter.append("text")
        .attr("text-anchor", "middle")
        .attr("x", function (d) {
          return layout.unitX / 2;
        })
        .attr("y", function (d) {
          return (layout.unitIcon * 1.5 - layout.padding * 2) * (d.noIcon() ? 0.75 : 1) + 2 * layout.padding;
        })
        .attr("class", function (d) {
          return d.category + " label";
        })
        .attr("dy", "1em");

      that.node = nodesEnter.merge(that.node);
      that.node.attr("class", function(d) { return d.isRoot ? "root node" : "node"; });
      that.node.select("g.connection").attr("transform", function(d) {
        return "translate(" + layout.unitX / 2 + "," + (layout.unitY - layout.padding) + ") scale(" + (d.isRoot ? 0.625 : 1) + ")"
      });

      that.link = that.link.enter().append("line").attr("id", function(d) { return d.source + "-" + d.target; }).merge(that.link);
      that.simulation.nodes(nodes);
      that.simulation.force("link").links(edges);

      let allLabels = that.node.select("text.label");
      allLabels.text(function (d) {
        return d.isRoot ? (d.label + "|" + (d.description || '')) : d.label;
      });
      wrapLabels(allLabels);

      that.nodesContainer.selectAll("g").on("click", changeRootNode);

      that.simulation.force("center", d3.forceCenter(that.width / 2, that.height / 2));
      that.simulation.alpha(1).restart();

      // Fix svg display issue on FF when using <base> tag (see https://gist.github.com/leonderijke/c5cf7c5b2e424c0061d2)
      // Web only
      // prependBaseUrl();
    }, 350);

    function changeRootNode() {
      that.simulation.stop();

      let clickedNode = d3.select(this).datum();
      if(clickedNode.isRoot) {
        that.showDetails.emit();
      } else {
        that.rootChange.emit({newRoot: clickedNode.id});
        that.nodesContainer.selectAll("g.node").filter(function (d) {
          return d.id != clickedNode.id;
        }).style("opacity", 0);
        that.linksContainer.selectAll("line").style("opacity", 0);

        d3.select(this).transition().duration(600)
          .attr("transform", "translate(" + (that.width / 2 - (layout.unitX * layout.rootScaleX / 2)) + ","
            + (that.height / 2 - (layout.unitY * layout.rootScaleY / 2)) + ") scale(" + layout.rootScaleX + "," + layout.rootScaleY + ")");
      }
    }

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

    function prependBaseUrl() {
      [].slice.call(document.querySelectorAll("use[*|href]"))
        .filter(function (element) {
          return (element.getAttribute("href").indexOf("#") === 0);
        })
        .forEach(function (element) {
          element.setAttribute("href", GraphComponent.GRAPH_PATH + element.getAttribute("href"));
        });
    }
  }
}

