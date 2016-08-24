import {Injectable} from "@angular/core";

@Injectable()
export class SpreadsheetService {
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  readSpreadsheet() : any {

    function trim(item) {
      return typeof item === 'string' ? item.trim() : item;
    }

    function indexBy(array, callback) {
      var map = {};
      array.forEach(function (item) {
        map[callback(item)] = item;
      });
      return map;
    }

    function compact(array) {
      return array.filter(function (item) {
        return item;
      });
    }

    function title(entry) {
      return trim(entry.title.$t);
    }

    function property(entry, property) {
      return trim(entry['gsx$' + property].$t);
    }

    // Construit le tableau des noeuds
    var nodesArray = this.data.feed.entry.map(function (entry) {
      return {
        schema:         title(entry),
        //  time:           property(entry, 'time'),
        //  src:            property(entry, 'src'),
        //  field:          property(entry, 'field'),
        id:             property(entry, 'id'),
        label:          property(entry, 'label'),
        name:           property(entry, 'name'),
        description:    property(entry, 'description'),
        location:       property(entry, 'location'),
        startdate:      property(entry, 'startdate'),
        enddate:        property(entry, 'enddate'),
        link:           property(entry, 'link'),
        //  parent:         property(entry, 'ilink'),        lien interne
        thumbnail:      property(entry, 'thumbnail'),
        url:            property(entry, 'url'),
        linkIds:        compact(property(entry, 'link').split(',').map(trim))
      };
    });

    var nodesMap = indexBy(nodesArray, function (node) {
      return node.id;
    });

    var directLinks = {},
      reverseLinks = {},
      types = {};

    nodesArray.forEach(function (node) {
      types[node.label] = 1; // La valeur est sans importance, seule la clef est utilisée

      // Conserve seulement les liens qui référencent un noeud existant
      node.linkIds = compact(
        node.linkIds.map(function (linkId) {
          var linkedNode = nodesMap[linkId];
          if (linkedNode) {
            return linkedNode.id;
          } else {
            console.error("Lien inconnu : " + linkId);
          }
        })
      );
      node.link = node.linkIds.join(',');

      // Tableau contenant les noms des noeuds liés
      node.linkNames = node.linkIds.map(function (linkId) {
        var linkedNode = nodesMap[linkId];
        return linkedNode.name;
      });

      if (node.id) {
        directLinks[node.id] = node.linkIds.slice(0);
        node.linkIds.forEach(function (linkId) {
          reverseLinks[linkId] = reverseLinks[linkId] || [];
          reverseLinks[linkId].push(node.id);
        });
      }
    });

    return {
      nodes: nodesArray,
      nodesMap: nodesMap,
      directLinks: directLinks,
      reverseLinks: reverseLinks,
      types: Object.keys(types)
    };
  }
}
