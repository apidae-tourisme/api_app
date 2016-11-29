import {Component, ElementRef, Input, OnChanges, EventEmitter, Output, DoCheck, SimpleChanges} from "@angular/core";

declare var d3: any;

@Component({
  selector: 'graph',
  template: `<ng-content></ng-content>`
})
export class GraphComponent implements DoCheck, OnChanges {

  @Input() networkData: any;
  @Output() rootChange = new EventEmitter();
  @Output() showDetails = new EventEmitter();

  private host;
  private htmlElement;
  private svg;
  private dimensions;
  private nodesContainer;
  private linksContainer;
  private newRoot: string;
  private rootHasChanged: boolean;
  private rootDetails: boolean;
  private zoom;
  private zoomContainer;
  private defaultTransform;

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
    })).on("dblclick.zoom", null)
      .on("mousedown.zoom", null);

    let defs = this.zoomContainer.append("defs");
    defs.append("font-face")
      .attr("font-family", "Ionicons")
      .append("font-face-src")
      .append("font-face-uri")
      .attr("xlink:href", "assets/fonts/ionicons.svg#Ionicons");

    let grad = defs.append("linearGradient").attr("id", "grad")
      .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
    grad.append("stop").attr("offset", "50%").style("stop-color", "white").attr("stop-opacity", "0");
    grad.append("stop").attr("offset", "50%").style("stop-color", "white").attr("stop-opacity", "0.2");

    this.linksContainer = this.zoomContainer.append("g")
      .attr("class", "links");
    this.nodesContainer = this.zoomContainer.append("g")
      .attr("class", "nodes");

    this.drawGraph();
    this.defaultTransform = d3.zoomTransform(this.zoomContainer);
    this.newRoot = this.nodesContainer.selectAll("text").select(function(d, i) { return d.isRoot ? d : null; }).datum().id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.svg && this.nodesContainer && this.linksContainer) {
      this.linksContainer.selectAll("*").remove();
      this.nodesContainer.selectAll("*").remove();
      this.drawGraph();
      this.zoomContainer.attr("transform", this.defaultTransform);
    }
  }

  ngDoCheck(): void {
    if(this.linksContainer && this.nodesContainer) {
      if(this.rootHasChanged) {
        this.rootChange.emit({newRoot: this.newRoot});
        this.rootHasChanged = false;
      } else if(this.rootDetails) {
        this.showDetails.emit();
        this.rootDetails = false;
      }
    }
  }

  drawGraph(): void {
    let labelSize = 10, nodeRadius = 60;
    let nominalHeight = this.dimensions.height / 2;
    let nominalWidth = this.dimensions.width / 2;

    let simulation = d3.forceSimulation()
      .alphaMin(0.1)
      .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(function (link, index) { return computeDistance(index); }))
      .force("charge", d3.forceManyBody().strength(function(node, index) {
        return node.isRoot ? -2000 : -800;
      }))
      // .force("yCharge", d3.forceY(0).strength(function(node, index) {
      //   return node.isPrevious ? 0 : 0.1;
      // }))
      .force("center", d3.forceCenter(nominalWidth - 5, nominalHeight + 28));

    let linkData = this.linksContainer
      .selectAll("line")
      .data(this.networkData.edges);

    let linkEnter = linkData
      .enter().append("line");

    let textData = this.nodesContainer
      .selectAll("text")
      .data(this.networkData.nodes);

    let textEnter = textData.enter();

    let nodesBg = textEnter.append("rect")
      .attr("width", function(d) {return d.isRoot ? 150 : 80;})
      .attr("height", function(d) {return d.isRoot ? 160 : 80;})
      .attr("rx", function(d) { return d.isRoot ? 30 : 40; })
      .attr("ry", function(d) { return d.isRoot ? 30 : 40; })
      .attr("class", function(d) { return "icon icon-bg " + d.category + (d.isRoot ? " root" : ""); })
      .attr("text-anchor", "middle");

    let nodesMask = textEnter.append("rect")
      .attr("width", function(d) {return d.isRoot ? 150 : 80;})
      .attr("height", function(d) {return d.isRoot ? 160 : 80;})
      .attr("rx", function(d) { return d.isRoot ? 30 : 40; })
      .attr("ry", function(d) { return d.isRoot ? 30 : 40; })
      .attr("fill", "url(#grad)");

    let nodesImg = textEnter.append("image")
      .attr("class", function(d) {return d.picture ? (d.isRoot ? "root img-node" : "img-node") : "";})
      .attr("width", function(d) {return d.isRoot ? 48 : 32;})
      .attr("height", function(d) {return d.isRoot ? 48 : 32;})
      .attr("xlink:href", function(d) {return d.isPrevious ? '' : d.picture;});

    let nodesText = textEnter.append("text")
      .attr("class", function(d) {return "icon" + (d.isRoot ? " root" : "");})
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(function (d) { return d.isPrevious ? '\uf27d' : (d.picture ? '' : d.code); });

    let nodesLabel = textEnter.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", labelSize + "px")
      .attr("fill", "white")
      .attr("dy", "1em")
      .html(function (d) {
        return d.isRoot ? (d.label + "|" + (d.description || '')) : d.label;
      });

    let allTexts = this.nodesContainer.selectAll("text");
    allTexts.on("click", changeRootNode);
    nodesImg.on("click", changeRootNode);
    nodesBg.on("click", changeRootNode);

    // let draggableTexts = allTexts.select(function(d, i) { return (d.isRoot || d.isPrevious) ? null : this; });
    // draggableTexts.call(d3.drag()
    //   .on("start", dragstarted)
    //   .on("drag", dragged)
    //   .on("end", dragended));
    // let draggableImg = nodesImg.select(function(d, i) { return (d.isRoot || d.isPrevious) ? null : this; });
    // draggableImg.call(d3.drag()
    //   .on("start", dragstarted)
    //   .on("drag", dragged)
    //   .on("end", dragended));
    // let draggableBg = nodesBg.select(function(d, i) { return (d.isRoot || d.isPrevious) ? null : this; });
    // draggableBg.call(d3.drag()
    //   .on("start", dragstarted)
    //   .on("drag", dragged)
    //   .on("end", dragended));

    wrapLabels(nodesLabel);

    simulation.nodes(this.networkData.nodes).on("tick", ticked);
    simulation.force("link").links(this.networkData.edges);

    function computeDistance(index) {
      if(index < 9) {
        return nodeRadius + 50;
      } else if(index < 20) {
        return 2 * nodeRadius + 50;
      } else {
        return 3 * nodeRadius + 50;
      }
    }

    let that = this;

    function changeRootNode() {
      let clickedNode = d3.select(this);
      if(clickedNode.datum().isRoot) {
        that.rootDetails = true;
      } else {
        that.newRoot = clickedNode.datum().id;
        that.rootHasChanged = true;
      }
    }

    function wrapLabels(texts) {
      texts.each(function() {
        let text = d3.select(this);
        if(text.text().indexOf("|") != -1) {
          let textTokens = text.text().split("|");
          doWrap(text, textTokens[0], true, 12);
          doWrap(text, textTokens[1], false, labelSize);
        } else {
          doWrap(text, text.text(), true, labelSize);
        }

        function doWrap(textElt, val, reset, fontSize) {
          let words = val.split(/\s+/).reverse(),
            word,
            line = [],
            y = text.attr("y"),
            width = textElt.datum().isRoot ? 140 : 70;
          if(reset) {
            textElt.text(null);
          }
          let tspan = textElt.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1.4em")
            .attr("font-size", fontSize + "px");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = textElt.append("tspan").attr("x", 0).attr("y", y).attr("dy", "1em").text(word);
            }
          }
        }
      });
    }

    function ticked() {
      linkEnter
        .attr("x1", function (d) {
          let x = d.source.isPrevious ? 45 : d.source.x;
          return parseFloat(x);
        })
        .attr("y1", function (d) {
          let y = d.source.isPrevious ? 75 : d.source.y;
          return parseFloat(y) - 30;
        })
        .attr("x2", function (d) {
          return parseFloat(d.target.x);
        })
        .attr("y2", function (d) {
          return parseFloat(d.target.y);
        });

      nodesBg
        .attr("x", function (d) {
          return d.isPrevious ? 5 : (d.isRoot ? (nominalWidth - 75) : (d.x - 40));
        })
        .attr("y", function (d) {
          return d.isPrevious ? 5 : (d.isRoot ? (nominalHeight - 80) : (d.y - 70));
        });

      nodesMask
        .attr("x", function (d) {
          return d.isPrevious ? 5 : (d.isRoot ? (nominalWidth - 75) : (d.x - 40));
        })
        .attr("y", function (d) {
          return d.isPrevious ? 5 : (d.isRoot ? (nominalHeight - 80) : (d.y - 70));
        });

      nodesImg
        .attr("x", function (d) {
          let x = d.isPrevious ? 44 : d.x;
          return d.isRoot ? (nominalWidth - 25) : (x - 16);
        })
        .attr("y", function (d) {
          let y = d.isPrevious ? 74 : d.y;
          return d.isRoot ? (nominalHeight - 70) : (y - 64);
        });

      nodesLabel
        .attr("x", function (d) {
          let x = d.isPrevious ? 45 : (d.isRoot ? nominalWidth : d.x);
          d3.select(this).selectAll("tspan").attr("x", x);
          return x;
        })
        .attr("y", function (d) {
          let y = d.isPrevious ? 28 : (parseFloat(d.y) - 46);
          return (d.isRoot ? (nominalHeight - 36) : y) + 12;
        });

      nodesText
        .attr("x", function (d) {
          let x = d.isPrevious ? 45 : d.x;
          return d.isRoot ? (nominalWidth) : x;
        })
        .attr("y", function (d) {
          let y = d.isPrevious ? 75 : d.y;
          return d.isRoot ? (nominalHeight - 30) : (parseFloat(y) - 35);
        });
    }

    // function dragstarted(d) {
    //   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //   d.fx = d.x;
    //   d.fy = d.y;
    // }
    //
    // function dragged(d) {
    //   d.fx = d3.event.x;
    //   d.fy = d3.event.y;
    // }
    //
    // function dragended(d) {
    //   if (!d3.event.active) simulation.alphaTarget(0);
    //   d.fx = null;
    //   d.fy = null;
    // }
  }
}

