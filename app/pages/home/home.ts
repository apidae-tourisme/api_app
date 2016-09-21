import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ExplorerService} from "../../services/explorer.service";
import {DataService} from "../../services/data.service";
import {NetworkComponent} from "../../components/network.component";
import {NetworkContext} from "../../models/network.context";
import {SvgComponent} from "../../components/svg.component";

@Component({
  templateUrl: 'build/pages/home/home.html',
  directives: [NetworkComponent, SvgComponent],
  providers: [DataService, ExplorerService]
})
export class HomePage {

  private networkContext: NetworkContext;
  private networkData: any;

  constructor(public navCtrl: NavController, private explorerService: ExplorerService,
              private dataService: DataService) {
    this.networkContext = new NetworkContext(this.dataService.config.root);
    this.exploreCurrentNode();
  }

  rootNodeChange(event): void {
    this.networkContext = event.context;
    this.exploreCurrentNode();
  }

  homeNode(): void {
    this.networkContext.changeRoot('Apidae');
    this.exploreCurrentNode();
  }

  exploreCurrentNode(): void {
    this.explorerService.explore(this.networkContext.root, this.networkContext.path).subscribe(nodes => {

      let updatedData: any = {
        nodes: [],
        edges: []
      };

      let linkId = 0;
      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.id) {
          let networkNode = {
            id: node.id,
            label: node.name,
            category: node.label,
            code: '\uf446',
            picture: null
          };

          if (node.thumbnail && (node.thumbnail.indexOf("jpg") != -1 || node.thumbnail.indexOf("logo") != -1)) {
            networkNode.picture = (node.thumbnail.indexOf("http") != - 1) ? node.thumbnail : ('http://' + node.thumbnail);
          }

          switch (node.label) {
            case 'Person' :
              networkNode.code = '\uf47e';
              break;
            case 'Organization' :
              networkNode.code = '\uf47c';
              break;
            case 'Competence' :
              networkNode.code = '\uf1bf';
              break;
            case 'Event' :
              networkNode.code = '\uf3f4';
              break;
            case 'Project' :
              networkNode.code = '\uf180';
              break;
            case 'Action' :
              networkNode.code = '\uf18e';
              break;
            case 'CreativeWork' :
              networkNode.code = '\uf431';
              break;
            case 'Product' :
              networkNode.code = '\uf168';
              break;
            case 'Idea' :
              networkNode.code = '\uf138';
              break;
            case 'Concept' :
              networkNode.code = '\uf412';
              break;
            case 'Schema' :
              networkNode.code = '\uf187';
              break;
          }
          updatedData.nodes.push(networkNode);

          node.linkIds.forEach(function (linkedNodeId) {
            updatedData.edges.push({
              id: linkId++,
              source: node.id,
              target: linkedNodeId
            });
          });
        }
      }
      this.networkData = updatedData;
    });
  }
}
