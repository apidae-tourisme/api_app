import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ExplorerService} from "../../services/explorer.service";
import {DataService} from "../../services/data.service";
import {NetworkComponent} from "../../components/network.component";
import {NetworkContext} from "../../models/network.context";

declare var vis: any;

@Component({
  templateUrl: 'build/pages/home/home.html',
  directives: [NetworkComponent],
  providers: [DataService, ExplorerService]
})
export class HomePage {

  private networkContext: NetworkContext;
  private networkData: any;
  private isLoading: boolean;

  constructor(public navCtrl: NavController, private explorerService: ExplorerService,
              private dataService: DataService) {
    this.networkData = {
      nodes: new vis.DataSet(),
      edges: new vis.DataSet()
    };
    this.networkContext = new NetworkContext(this.dataService.config.root);
    this.exploreCurrentNode();
  }

  rootNodeChange(event): void {
    this.networkContext = event.context;
    this.exploreCurrentNode();
  }

  exploreCurrentNode(): void {
    this.isLoading = true;
    this.explorerService.explore(this.networkContext.root, this.networkContext.path).subscribe(nodes => {

      let updatedData: any = {
        nodes: new vis.DataSet(),
        edges: new vis.DataSet()
      };

      var classes = [], linkId = 0;
      // Ajoute les nodes
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.id) {
          let visNode = {
            id: node.id,
            borderWidth: 1,
            color: {
              border: '#bec2c3',
              background: '#fff'
            },
            label: node.name,
            font: '20px Arial #004489',
            mass: 5,
            size: 80
          };
          if (node.thumbnail) {
            visNode['shape'] = 'circularImage';
            visNode['image'] = (node.thumbnail.indexOf('http') === 0)
              ? node.thumbnail
              : 'http://' + node.thumbnail;
          } else {
            visNode['shape'] = 'dot';
            switch (node.label) {
              case 'Person' :
                visNode.color.background = '#c8c88c';
                break;
              case 'Organization' :
                visNode.color.background = '#b5739d';
                break;
              case 'Competence' :
                visNode.color.background = '#ffcf10';
                break;
              case 'Event' :
                visNode.color.background = '#c9b6b7';
                break;
              case 'Project' :
                visNode.color.background = '#61bd4f';
                break;
              case 'Action' :
                visNode.color.background = '#ff5c5c';
                break;
              case 'CreativeWork' :
                visNode.color.background = '#A2C2C4';
                break;
              case 'Product' :
                visNode.color.background = '#e67e22';
                break;
              case 'Idea' :
                visNode.color.background = '#7AA9E7';
                break;
              case 'Concept' :
                visNode.color.background = '#cccccc';
                break;
              case 'Schema' :
                visNode.color.background = '#333333';
                break;
            }
          }
          updatedData.nodes.add(visNode);

          //  Ajoute le lien du node vers le parent
          // TODO : encore utile ? pourquoi à la fois 'parent' et linkIds
          //if (node.parent) {
          //    $scope.network_data.edges.add({
          //        id: linkId++,
          //        from: node.id,
          //        to: node.parent
          //    });
          //}
          node.linkIds.forEach(function (linkedNodeId) {
            updatedData.edges.add({
              id: linkId++,
              from: node.id,
              to: linkedNodeId
            });
          });
        }
      }
      this.networkData = updatedData;
      this.isLoading = false;
    });
  }
}
