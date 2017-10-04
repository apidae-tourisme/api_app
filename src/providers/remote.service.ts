import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import PouchDB from 'pouchdb-browser';
import {Seeds} from "./seeds";

@Injectable()
export class RemoteDataService {

  private remoteDatabase: any;

  constructor() {
    this.remoteDatabase = new PouchDB(ApiAppConfig.DB_URL + '/' + ApiAppConfig.REMOTE_DB);
  }

  getSeed(seedId) {
    return this.remoteDatabase.get(seedId, {attachments: true});
  }

  getSeedWithInclusions(seedId, scope) {
    let nodeData = {count: 0, root: null, includedSeeds: []};
    return this.remoteDatabase.get(seedId, {attachments: true})
      .then((rootNode) => {
        nodeData.root = rootNode;
        return this.remoteDatabase.allDocs({
          keys: (rootNode.inclusions || []),
          include_docs: true,
          attachments: true
      }).then(nodes => {
        nodeData.includedSeeds = nodes.rows
          .filter((row) => {return row.id && row.doc && (row.doc.scope == Seeds.SCOPE_PUBLIC || row.doc.scope == scope);})
          .map((row) => {return row.doc;});
        return nodeData;
      });
    }).catch(function (err) {
      console.log('getNodeData err : ' + JSON.stringify(err));
    });
  }
}
