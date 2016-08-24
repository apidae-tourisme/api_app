import {DataService} from "../../services/data.service";
import {Component} from "@angular/core";
import {NavController} from "ionic-angular";

@Component({

})
export class RadialPage {
  private nodesMap: Map<number, any>;

  constructor(public navCtrl: NavController, private dataService: DataService) {
    this.dataService.getData().subscribe(data => {
      this.nodesMap = data['nodesMap'];
    });
  }

//
// var nodesMap;
// dataSrv().then(function (data) {
// nodesMap = data.nodesMap;
// });
//
//   function loadData() {
//   explorerSrv.getExploredNodes().then(function (nodes) {
//
//     var nodesMap = {};
//     // Ajoute les noeuds
//     nodes.forEach(function (node) {
//       nodesMap[node.id] = {
//         id: node.id,
//         name: node.name,
//         class: node.label,
//         parents: node.linkIds
//       };
//     });
//     $scope.nodesMap = nodesMap;
//
//   });
// }
//   loadData();
//   $scope.$on('data_changed', function (event) {
//   loadData();
// });
//
//
//   $scope.selectAsRoot = function (graphNode) {
//   contextSrv.changeRoot(graphNode.id);
// };
}
