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
    this.updateCurrentNode();
  }

  rootNodeChange(event): void {
    this.networkContext = event.context;
    this.updateCurrentNode();
  }

  homeNode(): void {
    this.networkContext.changeRoot('root');
    this.updateCurrentNode();
  }

  updateCurrentNode(): void {
    this.explorerService.exploreGraph(this.networkContext.root).subscribe(nodeData => {
      let updatedData: any = {
        nodes: [],
        edges: []
      };
      let nodes = nodeData.nodes;

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.id) {
          let networkNode = {
            id: node.id,
            label: node.name,
            category: node.label,
            code: '\uf446',
            picture: null,
            isRoot: (node.id == this.networkContext.root || this.networkContext.root == 'root' && node.name == 'Apidae')
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
          updatedData.edges = nodeData.links;
        }
      }
      this.networkData = updatedData;
    });
  }
}
