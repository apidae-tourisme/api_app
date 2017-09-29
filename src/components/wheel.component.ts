import {Component, ElementRef, EventEmitter, Output} from "@angular/core";
import {ComponentUtils} from "./component.utils";

declare var d3: any;

@Component({
  selector: 'apiwheel',
  template: `<ng-content></ng-content>`
})
export class WheelComponent {

  private static readonly VIEWS = [0, 1, 2, 3, 4, 5];
  private static readonly ICONS = ['\ue903', '\uf22a', '\ue906'];

  @Output() viewChange = new EventEmitter();

  private host;
  private htmlElement;
  private svg;
  private wheelContainer;
  private unitX;
  private unitY;
  private padding;
  private currentView;
  private views;

  constructor(private element: ElementRef) {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.element.nativeElement);
    this.unitX = 70;
    this.unitY = 80;
    this.padding = 5;
    this.currentView = 0;
  }

  ngAfterViewInit() {
    let pathScale = 2;
    this.svg = this.host.append("svg")
      .attr("width", window.innerWidth)
      .attr("height", '100%')
      .attr("class", "wheel");

    this.wheelContainer = this.svg.append("g");
    this.wheelContainer.append("path").attr("id", "wheel_path").attr("d", ComponentUtils.HEXAGON)
      .attr("transform", "translate(" + ((window.innerWidth - this.unitX * 2) / 2) + ", " + (this.unitY / 2 + this.padding) + ") scale(" + pathScale + ")");
    this.wheelContainer.append("path").attr("id", "wheel_inner").attr("d", ComponentUtils.HEXAGON)
      .attr("transform", "translate(" + ((window.innerWidth - this.unitX * 1.2) / 2) + ", 75) scale(1.2)");
    this.wheelContainer.append("text")
      .attr("x", window.innerWidth / 2)
      .attr("y", 110)
      .attr("class", "main_counter")
      .attr("text-anchor", "middle");
    this.views = this.wheelContainer.selectAll("g").data(WheelComponent.VIEWS).enter().append("g")
      .attr("class", (d) => {return "view" + (d == this.currentView ? " active" : "") + " icon_" + d % 3;})
      .attr("transform", (d) => { return this.translateCenter(window.innerWidth / 2, this.unitY / 2 + this.padding, d);});
    this.views.append("circle")
      .attr("r", this.unitY / 4 + this.padding / 2)
      .attr("cx", 0)
      .attr("cy", 0);
    this.views.append("text")
      .attr("y", this.padding)
      .attr("class", "icon")
      .attr("text-anchor", "middle")
      .text((d) => {return WheelComponent.ICONS[d % 3];});
    this.views.append("text")
      .attr("y", this.unitY / 4 - this.padding * 0.75)
      .attr("class", "counter")
      .attr("text-anchor", "middle");

    let allLinks = this.wheelContainer.selectAll(".view");
    let that = this;
    allLinks.on("click", translateViews);

    function translateViews() {
      let selectedView = d3.select(this).datum();
      that.translateViews(allLinks, selectedView);
    }
  }

  render(seed) {
    this.views.selectAll("text.counter").text((d) => {
      let viewIdx = d % 3;
      return viewIdx == 0 ? seed.connectedSeeds.length : (viewIdx == 1 ? seed.urls.length : seed.includedSeeds.length);
    });
    this.wheelContainer.selectAll("text.main_counter").text((d) => {
      return seed.linksCount();
    });
    if(this.currentView != 0 && this.currentView != 3) {
      let allLinks = this.wheelContainer.selectAll(".view");
      this.translateViews(allLinks, (this.currentView == 2 || this.currentView == 4) ? 3 : 0);
    }
  }

  translateViews(allLinks, selectedView) {
    if(selectedView != this.currentView) {
      this.viewChange.emit({current: this.currentView % 3, selected: selectedView % 3});
      allLinks
        .attr("class", (d) => {return "view" + (d == selectedView ? " active" : "") + " icon_" + d % 3;})
        .transition()
        .duration(750)
        .ease(d3.easeCubicOut)
        .attr("transform", (d) => {
          let viewPosition = (d - selectedView + WheelComponent.VIEWS.length) % WheelComponent.VIEWS.length;
          return this.translateCenter(window.innerWidth / 2, this.unitY / 2 + this.padding, viewPosition);
        });
      this.currentView = selectedView;
    }
  }

  translateCenter(refX, refY, viewPosition) {
    let center = {x: refX, y: refY};
    switch(viewPosition) {
      case 0:
        break;
      case 1:
        center.x = refX - this.unitX;
        center.y = refY + this.unitY / 2;
        break;
      case 2:
        center.x = refX - this.unitX;
        center.y = refY + this.unitY * 3 / 2;
        break;
      case 3:
        center.y = refY + this.unitY * 2;
        break;
      case 4:
        center.x = refX + this.unitX;
        center.y = refY + this.unitY * 3 / 2;
        break;
      case 5:
        center.x = refX + this.unitX;
        center.y = refY + this.unitY / 2;
        break;
      default:
        break;
    }
    return "translate(" + center.x + "," + center.y + ")";
  }
}
