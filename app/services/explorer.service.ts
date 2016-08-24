import {Injectable} from "@angular/core";
import {DataService} from "./data.service";
import {Observable} from "rxjs";
import 'rxjs/Rx';

@Injectable()
export class ExplorerService {
  exploredNodes: any;

  constructor(private dataService: DataService) {
    this.exploredNodes = this.explore();
  }

  explore(rootNodeIds?, path?, typesMap?) : Observable<any> {
    return this.dataService.getData().map(function (data) {
      if (Array.isArray(rootNodeIds) && rootNodeIds.length > 0) {
        var nodesIdMap = {};
        rootNodeIds.forEach(function (rootNodeId) {
          nodesIdMap[rootNodeId] = false;
          console.log('#root', rootNodeId, data.nodesMap[rootNodeId]);
        });
        var bothLinksMaps = {direct: data.directLinks, reverse: data.reverseLinks};

        var pathArray = parsePath(path);
        for (var i = 0; i < pathArray.length; i++) {
          var partialPath = pathArray[i];
          expandAllLinks(
            nodesIdMap,
            bothLinksMaps,
            data.nodesMap,
            partialPath.depth,
            partialPath.directions,
            typesMap
          );
        }

        var nodesMap = {},
          nodesArray = [];

        return clearLinks(filterByTypes(
          Object.keys(nodesIdMap).map(function (id) {
            return data.nodesMap[id];
          }),
          typesMap
        ));

      } else {
        return clearLinks(filterByTypes(data.nodes, typesMap));
      }


      /**
       * TODO faire une classe TypeMap ?
       */
      function isTypeVisible(node, typesMap) {
        return !typesMap || typesMap[node.label];
      }

      /**
       * Filtre le tableau de noeuds, en ne gardant que ceux des types visibles
       */
      function filterByTypes(nodes, typesMap) {
        return nodes.filter(function (node) {
          return isTypeVisible(node, typesMap);
        });
      }

      /**
       * Renvoie un tableau de noeuds clonés (pour ne pas modifier ceux d'origine chargés du tableur)
       * ne contenant que les liens vers des noeuds faisant partie de la sélection.
       */
      function clearLinks(nodes) {
        var nodesArray = [],
          nodesMap = {};
        nodes.forEach(function (node) {
          var copiedNode = Object.assign({}, node);
          nodesArray.push(copiedNode);
          nodesMap[node.id] = copiedNode;
        });
        // TODO faire plutôt un forEach sur le tableau
        Object.keys(nodesMap).forEach(function (nodeId) {
          var node = nodesMap[nodeId],
            linkIds = [],
            linkNames = [];
          node.linkIds.forEach(function (linkId) {
            var linkedNode = nodesMap[linkId];
            if (linkedNode) {
              linkIds.push(linkId);
              linkNames.push(linkedNode.name);
            }
          });
          node.linkIds = linkIds;
          node.link = node.linkIds.join(',');
          node.linkNames = linkNames;
        });
        return nodesArray;
      }

      /**
       * Ajoute les noeuds liés à la map d'identifiant de noeuds, en fonction d'une direction ou des deux, et d'une profondeur.
       */
      function expandAllLinks(nodesIdMap, bothLinksMaps, nodesMap, maxDepth, directions, typesMap) {
        Object.keys(nodesIdMap).forEach(function (nodeId) {
          nodesIdMap[nodeId] = false; // Vaudra true quand ce noeud aura été traité
        });
        for (var depth = 0; maxDepth == '*' || depth < maxDepth; depth++) {
          var addedNewNodes = false;
          Object.keys(nodesIdMap).forEach(function (nodeId) {
            if (nodesIdMap[nodeId] === false) {
              var addedDirect = directions.direct
                && followLinks(nodesIdMap, bothLinksMaps.direct[nodeId], nodesMap, typesMap, nodeId + ' -->');
              var addedReverse = directions.reverse
                && followLinks(nodesIdMap, bothLinksMaps.reverse[nodeId], nodesMap, typesMap, nodeId + ' <--');
              addedNewNodes = addedNewNodes || addedDirect || addedReverse;
              nodesIdMap[nodeId] = true;
            }
          });
          if (!addedNewNodes) {
            break;
          }
        }
      }

      /**
       * Ajoute à la map les identifiants des noeuds passés en paramètres (ceux liés à un premier noeud).
       * La valeur est mise à false, car ces nouveaux noeuds n'ont pas eux-mêmes été dépliés.
       */
      function followLinks(nodesIdMap, links, nodesMap, typesMap, log) {
        var addedNewNodes = false;
        links && links.forEach(function (linkId) {
          if (nodesIdMap[linkId] === undefined && isTypeVisible(nodesMap[linkId], typesMap)) {
            nodesIdMap[linkId] = false;
            addedNewNodes = true;
          }
        });
        return addedNewNodes;
      }

      //function filterNodesAndLinks(nodesIdMap, typesMap, nodesMap) {
      //    var nodesMap = {},
      //        nodesArray = [];
      //    Object.keys(nodesIdMap).forEach(function (id) {
      //        var copiedNode = angular.copy(nodesMap[id]);
      //        nodesArray.push(copiedNode);
      //        nodesMap[id] = copiedNode;
      //    });
      //    Object.keys(nodesMap).forEach(function (nodeId) {
      //        var node = nodesMap[nodeId],
      //            linkIds = [],
      //            linkNames = [];
      //        node.linkIds.forEach(function (linkId) {
      //            var linkedNode = nodesMap[linkId];
      //            if (linkedNode) {
      //                linkIds.push(linkId);
      //                linkNames.push(linkedNode.name);
      //            }
      //        });
      //        node.linkIds = linkIds;
      //        node.link = node.linkIds.join(',');
      //        node.linkNames = linkNames;
      //
      //    });
      //    return nodesArray;
      //}

      function parsePath(path) {
        var tmpPath = (path || '').trim();
        var array = [];
        while (tmpPath) {
          var direction = tmpPath[0];
          var depth = tmpPath[1] == '*' ? '*' : tmpPath.replace(/.([0-9]*).*/, "$1");
          tmpPath = tmpPath.substr(direction.length + depth.length);
          if ((direction == 'D' || direction == 'R' || direction == 'B') && depth.length > 0) {
            array.push({
              directions: {
                direct: direction == 'D' || direction == 'B',
                reverse: direction == 'R' || direction == 'B'
              },
              depth: depth
            });
          } else {
            throw "Chemin invalide : " + path;
          }
        }
        return array;
      }
    });
  }

  setRootNodes(rootNodeIds, path, typesMap) {
    this.explore(rootNodeIds, path, typesMap);
  }

  getExploredNodes() {
    return this.exploredNodes;
  }
}
