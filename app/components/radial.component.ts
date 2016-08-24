import {Component, ElementRef, Input, OnChanges, SimpleChanges} from "@angular/core";

import * as D3 from 'd3';


@Component({
  selector: 'radial',
  template: `<ng-content></ng-content>`
})
export class RadialComponent implements OnChanges {

  @Input() nodesMap: Map<number,any>;

  private host;        // D3 object referencing host dom object
  private svg;         // SVG in which we will print our chart
  // private margin;      // Space between the svg borders and the actual chart graphic
  private width;       // Component width
  private height;      // Component height
  // private xScale;      // D3 scale in X
  // private yScale;      // D3 scale in Y
  // private xAxis;       // D3 X Axis
  // private yAxis;       // D3 Y Axis
  private htmlElement; // Host HTMLElement


  constructor(private element: ElementRef) {
    this.htmlElement = this.element.nativeElement;
    this.host = D3.select(this.element.nativeElement);
  }

  ngOnChanges() {
    this.drawGraph();
  }

  drawGraph() {
    this.host.html(''); // Clear all content
    let nodesMap = this.nodesMap;

    var diameter = window.innerHeight-228, //TODO
      radius = diameter / 2,
      innerRadius = 80; /*250 radius - 200;*/
    var cluster = D3.layout.cluster()
      .size([360, innerRadius])
      .sort(null)
      .value(function (d) {
        console.log(typeof d);
        return d.size;
      });
    var bundle = D3.layout.bundle();
    var line = D3.svg.line.radial()
      .interpolate("bundle")
      .tension(.85)
      .radius(function (d) {
        return d[1];
      })
      .angle(function (d) {
        return d[0] / 180 * Math.PI;
      });
    this.svg = this.host.append("svg")
      .attr("width", window.innerWidth)
      .attr("height", diameter)
      .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

    var svgLinks = this.svg.append("g").selectAll(".link"),
      svgNodes = this.svg.append("g").selectAll(".node");

    cluster(buildRootNode(nodesMap));

    var links = buildLinksArray(nodesMap);

    svgLinks = svgLinks
      .data(bundle(links))
      .enter().append("path")
      .each(function (d) {
        d.source = d[0];
        d.target = d[d.length - 1];
      })
      .attr("class", "link")
      .attr("d", line);

    svgNodes = svgNodes
      .data(Object.keys(nodesMap).map(function (id) {
        return nodesMap[id];
      }))
      .enter().append("text")
      .attr("dx", function (data) {
        return data.x < 180 ? 2 : -2;
      })
      .attr("dy", ".31em")
      .attr("transform", function (data) {
        return "rotate(" + (data.x - 90) + ")translate(" + data.y + ")" + (data.x < 180 ? "" : "rotate(180)");
      })
      .style("text-anchor", function (data) {
        return data.x < 180 ? "start" : "end";
      })
      .text(function (data) {
        return data.name;
      });
      // .on("click", clicked)
      // .on("mouseover", mouseovered)
      // .on("mouseout", mouseouted);

    svgNodes.each(function (nodeData) {
      var svgNode = this;
      D3.select(svgNode).attr("class", "node " + nodeData.class);
    });

    D3.select(self.frameElement).style("height", diameter + "px");

    // Return a root node with all nodes in the map as children
    function buildRootNode(nodesMap) {
      var root = {
        children: []
      };
      Object.keys(nodesMap).forEach(function (id) {
        root.children.push(nodesMap[id]);
      });
      return root;
    }
    // Return a list of links from the nodes map.
    function buildLinksArray(nodesMap) {
      var links = [];
      Object.keys(nodesMap).forEach(function (id) {
        var node = nodesMap[id];
        if (node.parents) {
          node.parents.forEach(function (parentId) {
            var parentNode = nodesMap[parentId];
            links.push({source: node, target: parentNode});
          });
        }
      });
      return links;
    }

    // function mouseovered(data) {
    //   svgNodes
    //     .each(function (n) {
    //       n.target = n.source = false;
    //     });
    //   svgLinks
    //     .classed("link--target", function (l) {
    //       if (l.target === data) return l.source.source = true;
    //     })
    //     .classed("link--source", function (l) {
    //       if (l.source === data) return l.target.target = true;
    //     })
    //     .filter(function (l) {
    //       return l.target === data || l.source === data;
    //     })
    //     .each(function () {
    //       this.parentNode.appendChild(this);
    //     });
    //   svgNodes
    //     .classed("node--target", function (n) {
    //       return n.target;
    //     })
    //     .classed("node--source", function (n) {
    //       return n.source;
    //     });
    // }
    // function mouseouted(data) {
    //   svgLinks
    //     .classed("link--target", false)
    //     .classed("link--source", false);
    //   svgNodes
    //     .classed("node--target", false)
    //     .classed("node--source", false);
    // }
    //
    // function clicked(data) {
    //   scope.$apply(function () {
    //     scope.click({node: data});
    //   });
    // }
  }
}
