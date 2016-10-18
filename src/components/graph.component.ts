import {Component, ElementRef, Input, OnChanges, EventEmitter, Output, DoCheck, SimpleChanges} from "@angular/core";

declare var d3: any;

@Component({
  selector: 'graph',
  template: `<ng-content></ng-content>`
})
export class GraphComponent implements DoCheck, OnChanges {

  @Input() networkData: any;
  @Output() rootChange = new EventEmitter();
  @Output() nodeDetails = new EventEmitter();

  private host;
  private htmlElement;
  private svg;
  private dimensions;
  private nodesContainer;
  private linksContainer;
  private newRoot: string;
  private rootHasChanged: boolean;
  private zoom;
  private zoomContainer;

  constructor(private element: ElementRef) {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.element.nativeElement);
  }

  ngAfterViewInit() {
    this.zoom = d3.zoom();
    // Note : https://bl.ocks.org/mbostock/2b534b091d80a8de39219dd076b316cd - Combine drag & zoom

    this.svg = this.host.append("svg")
      .attr("width", window.innerWidth)
      .attr("height", '100%');
    this.dimensions = {
      width: this.svg.node().getBoundingClientRect().width,
      height: this.svg.node().getBoundingClientRect().height
    };

    this.zoomContainer = this.svg.append("g");
    this.svg.call(this.zoom.on("zoom", () => {
      this.zoomContainer.attr("transform", d3.event.transform);
    })).on("dblclick.zoom", null);

    this.zoomContainer.append("defs")
      .append("font-face")
      .attr("font-family", "Ionicons")
      .append("font-face-src")
      .append("font-face-uri")
      .attr("xlink:href", "assets/fonts/ionicons.svg#Ionicons");

    this.linksContainer = this.zoomContainer.append("g")
      .attr("class", "links");
    this.nodesContainer = this.zoomContainer.append("g")
      .attr("class", "nodes");

    this.drawGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.svg && this.nodesContainer && this.linksContainer) {
      this.linksContainer.selectAll("*").remove();
      this.nodesContainer.selectAll("*").remove();
      this.drawGraph();
    }
  }

  ngDoCheck(): void {
    if(this.linksContainer && this.nodesContainer && this.rootHasChanged) {
      this.rootChange.emit({newRoot: this.newRoot});
      this.rootHasChanged = false;
    }
  }

  drawGraph(): void {
    let labelSize = 12, nodeRadius = 40;
    let nominalHeight = this.dimensions.height / 2;
    let nominalWidth = this.dimensions.width / 2;

    let simulation = d3.forceSimulation()
      .alphaMin(0.1)
      .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(function (link, index) { return computeDistance(index); }))
      .force("charge", d3.forceManyBody().strength(function(node, index) {
        return -800;
      }))
      .force("yCharge", d3.forceY(0).strength(function(node, index) {
        return node.isPrevious ? 0 : 0.1;
      }))
      .force("center", d3.forceCenter(nominalWidth, nominalHeight));

    let linkData = this.linksContainer
      .selectAll("line")
      .data(this.networkData.edges);

    let linkEnter = linkData
      .enter().append("line")
      .attr("stroke-width", 2);

    let textData = this.nodesContainer
      .selectAll("text")
      .data(this.networkData.nodes);

    let textEnter = textData.enter();

    let nodesImg = textEnter.append("image")
      .attr("class", function(d) {return d.picture ? (d.isRoot ? "root img-node" : "img-node") : "";})
      .attr("xlink:href", function(d) {return d.picture;});

    let nodesBg = textEnter.append("text")
      .attr("class", function(d) { return "icon icon-bg " + d.category + (d.isRoot ? " root" : ""); })
      .attr("text-anchor", "middle")
      .text(function(d) {return d.picture ? "\uf1f6" : "\uf1f7";});

    let nodesText = textEnter.append("text")
      .attr("class", function(d) {return "icon" + (d.isRoot ? " root" : "");})
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(function (d) { return d.picture ? '' : d.code; });

    let nodesLabel = textEnter.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", labelSize + "px")
      .html(function (d) {
        var maxLength = nodeRadius * 2 / labelSize;
        if (d.label.length > maxLength && !d.isPrevious) {
          let tspans = '',
            words = d.label.split(/\s+/),
            currentLine = [],
            firstLine = true;
          for (let i = 0; i < words.length; i++) {
            currentLine.push(words[i]);
            if (currentLine.join(' ').length > maxLength || i == words.length - 1) {
              tspans += '<tspan dy="' + (firstLine ? 0 : 1) + 'em">' + currentLine.join(' ') + '</tspan>';
              currentLine = [];
              firstLine = false;
            }
          }
          return tspans;
        } else {
          return d.label;
        }
      });

    let allTexts = this.nodesContainer.selectAll("text");

    d3.selection.prototype.handleTap = function(singleCallback, doubleCallback) {
      let last = 0, wait;
      return this.each(function() {
        let that = this, dnd = false;
        d3.select(this).on("touchstart", function(e) {
          if ((d3.event.timeStamp - last) < 500) {
            if (wait) {
              window.clearTimeout(wait);
              wait = null;
            }
            return doubleCallback(that);
          } else {
            wait = window.setTimeout(
              (function(evt) { return function() {
                if(!dnd) {
                  singleCallback(that);
                }
                wait = null;
              };
              })(d3.event), 500
            );
            last = d3.event.timeStamp;
          }
        });
        d3.select(this).on("touchmove", () => {dnd = true;});
      });
    };

    allTexts.handleTap(changeRootNode, panToNode);

    allTexts.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    simulation.nodes(this.networkData.nodes).on("tick", ticked);
    simulation.force("link").links(this.networkData.edges);

    function computeDistance(index) {
      if(index < 9) {
        return nodeRadius + 40;
      } else if(index < 20) {
        return 2 * nodeRadius + 40;
      } else {
        return 3 * nodeRadius + 40;
      }
    }

    let that = this;

    function changeRootNode(clickedElt) {
      let clickedNode = d3.select(clickedElt).datum().id;
      if(clickedNode != that.newRoot) {
        that.newRoot = clickedNode;
        that.rootHasChanged = true;
      }
    }

    function panToNode(clickedElt) {
      let tappedNode = d3.select(clickedElt);
      let t = d3.zoomIdentity.translate(nominalWidth - parseFloat(tappedNode.attr("x"))*1.5,
        nominalHeight - parseFloat(tappedNode.attr("y"))*1.5).scale(1.5);
      that.zoomContainer.transition().duration(300).attr("transform", "translate(" + t.x + "," + t.y + ") scale(" + t.k + ")");
      window.setTimeout(() => {that.nodeDetails.emit({nodeId: tappedNode.datum().id});}, 300);
    }

    function ticked() {
      linkEnter
        .attr("x1", function (d) {
          let x = d.source.isPrevious ? nominalWidth : d.source.x;
          return parseFloat(x);
        })
        .attr("y1", function (d) {
          let y = d.source.isPrevious ? (nominalHeight * 2 - 30) : d.source.y;
          return parseFloat(y) - 30;
        })
        .attr("x2", function (d) {
          return parseFloat(d.target.x);
        })
        .attr("y2", function (d) {
          return parseFloat(d.target.y) - 30;
        });

      nodesBg
        .attr("x", function (d) {
          return d.isPrevious ? nominalWidth : d.x;
        })
        .attr("y", function (d) {
          return d.isPrevious ? (nominalHeight * 2 - 40) : d.y;
        });

      nodesImg
        .attr("x", function (d) {
          let x = d.isPrevious ? nominalWidth : d.x;
          return d.isRoot ? (x - 44) : (x - 36);
        })
        .attr("y", function (d) {
          let y = d.isPrevious ? (nominalHeight * 2 - 40) : d.y;
          return d.isRoot ? (y - 80) : (y - 64);
        });

      nodesLabel
        .attr("x", function (d) {
          let x = d.isPrevious ? nominalWidth : d.x;
          d3.select(this).selectAll("tspan").attr("x", x);
          return x;
        })
        .attr("y", function (d) {
          let y = d.isPrevious ? (nominalHeight * 2 - 40) : d.y;
          return parseFloat(y) + 12;
        });

      nodesText
        .attr("x", function (d) {
          return d.isPrevious ? nominalWidth : d.x;
        })
        .attr("y", function (d) {
          let y = d.isPrevious ? (nominalHeight * 2 - 40) : d.y;
          return d.isRoot ? (parseFloat(y) - 17) : (parseFloat(y) - 14);
        });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
}

