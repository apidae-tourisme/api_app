import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import {Seed} from "../components/seed.model";
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import {Events} from "ionic-angular";

declare var global: any;

@Injectable()
export class SeedsService {

  private localDatabase: any;
  private remoteDatabase: any;
  private isVisible: any;

  public userSeed: Seed;
  public userEmail: string;
  public syncProgress: number;
  public indexProgress: boolean;

  constructor(private evts: Events) {
    PouchDB.plugin(PouchFind);
    PouchDB.plugin(require('pouchdb-quick-search'));

    // Import fr language indexing rules
    global.lunr = require('lunr');
    require('lunr-languages/lunr.stemmer.support')(global.lunr);
    require('lunr-languages/lunr.fr')(global.lunr);

    // Safari requires a special authorization from user to use disk space
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.localDatabase = isSafari ? new PouchDB(ApiAppConfig.DB_NAME, {size: 50, adapter: 'websql'}) : new PouchDB(ApiAppConfig.DB_NAME);
    this.remoteDatabase = new PouchDB(ApiAppConfig.DB_URL + '/' + ApiAppConfig.DB_NAME);
    this.localDatabase.createIndex({index: {fields: ['email']}});
    this.isVisible = (n) => {return (n.scope === 'public' || n.scope === 'apidae' || n.author === this.userEmail) && !n.archived};
  }

  initReplication() {
    let options = {
      live: true,
      retry: true,
      continuous: true,
      filter: (doc) => {
        return doc._id.indexOf('_design') !== 0;
      },
      pull: {
        filter: this.isVisible
      }
    };
    return Promise.all([this.localDatabase.allDocs(), this.remoteDatabase.allDocs()]).then((values) => {
      return values[1].total_rows - values[0].total_rows;
    }).then((count) => {
      return PouchDB.sync(this.localDatabase, this.remoteDatabase, options).on('change', (info) => {
        if(count > 0) {
          this.syncProgress = Math.min(Math.floor((info.change.last_seq / count) * 100), 100);
        } else {
          this.syncProgress = 100;
        }
      }).on('paused', (err) => {
        this.syncProgress = null;
        this.indexProgress = true;
        this.localDatabase.search({
          fields: ['name', 'description', 'address'],
          build: true,
          language: 'fr'
        }).then((res) => {
          this.indexProgress = false;
          this.evts.publish('index:built');
        }).catch((err) => {
          console.log('index building error : ' + JSON.stringify(err));
        });
      }).on('active', function () {
        console.log('sync active');
      }).on('denied', function (err) {
        console.log('sync denied : ' + JSON.stringify(err));
      }).on('complete', function (info) {
        console.log('sync complete : ' + JSON.stringify(info));
      }).on('error', function (err) {
        console.log('sync error : ' + JSON.stringify(err));
      });
    });
  }

  getNodeData(rootNodeId) {
    // Default id = Apidae root
    let nodeId = rootNodeId || "eb9e3271f9694e37b2da5955a003fa96";
    let nodeData = {count: 0, nodes: [], links: []};
    return this.localDatabase.allDocs().then((docs) => {
      nodeData.count = docs.total_rows;
    }).then(() => {
      let node = this.localDatabase.get(nodeId);
      return node;
    }).then((rootNode) => {
      // console.log('got root node ' + rootNode._id + ' and connections : ' + rootNode.connections);
      return this.localDatabase.allDocs({
        keys:  [rootNode._id].concat(rootNode.connections || []),
        include_docs: true
      }).then(nodes => {
        let visibleNodes = nodes.rows.filter((row) => {return row.id;}).map((row) => {return row.doc;});
        nodeData.nodes = visibleNodes;
        nodeData.links = visibleNodes.slice(1).map((n) => {return {source: n._id, target: visibleNodes[0]._id};});
        return nodeData;
      });
    }).catch(function (err) {
      console.log('getNodeData err : ' + JSON.stringify(err));
    });
  }

  searchNodes(query) {
    return this.localDatabase.search({
      query: query,
      fields: ['name', 'description', 'address'],
      stale: 'ok',
      include_docs: true,
      language: 'fr'
    }).then(function (res) {
      return (res.rows && res.rows.length > 0) ? res.rows.map((r) => {return r.doc;}) : [];
    }).catch(function (err) {
      console.log('Search nodes error : ' + JSON.stringify(err));
    });
  }

  getCurrentUserSeed(success) {
    this.getUserSeed(this.userEmail, success);
  }

  getUserSeed(userEmail, success) {
    this.localDatabase.find({selector: {email: userEmail}}).then(function (res) {
      if (res.docs && res.docs.length > 0) {
        success(res.docs[0]);
      } else {
        console.log('Unknown user : ' + userEmail);
      }
    }).catch(function (err) {
      console.log('User seed retrieval error : ' + JSON.stringify(err));
    });
  }

  getNodeDetails(nodeId) {
    return this.localDatabase.get(nodeId);
  }

  saveNode(seed) {
    let seedParams = seed.submitParams();
    return this.connectionsChange(seedParams).then((changes) => {
      return this.localDatabase.put(seedParams).then((doc) => {
        return this.updateConnections(doc.id, changes);
      });
    });
  }

  connectionsChange(seedParams) {
    if(seedParams.isNew) {
      return Promise.resolve({added: seedParams.connections, removed: []});
    } else {
      return this.getNodeDetails(seedParams._id).then((data) => {
        let newConnections = seedParams.connections || [];
        let prevConnections = data.connections || [];
        let addedNodes = newConnections.filter((c) => {
          return prevConnections.indexOf(c) == -1;
        });
        let removedNodes = prevConnections.filter((c) => {
          return newConnections.indexOf(c) == -1;
        });
        return {added: addedNodes, removed: removedNodes};
      });
    }
  }

  updateConnections(nodeId, changes) {
    let updatedSeeds = [];
    return this.localDatabase.allDocs({
        keys: changes.added,
        include_docs: true
      }).then((nodes) => {
        let docs = nodes.rows.filter((row) => {return row.id;}).map((row) => {return row.doc;});
        for (let doc of docs) {
          doc.connections.push(nodeId);
          updatedSeeds.push(doc);
        }
        return changes;
      }).then((res) => {
      return this.localDatabase.allDocs({
        keys:  res.removed,
        include_docs: true
      }).then((nodes) => {
        let docs = nodes.rows.filter((row) => {return row.id;}).map((row) => {return row.doc;});
        for (let doc of docs) {
          doc.connections.splice(doc.connections.indexOf(nodeId));
          updatedSeeds.push(doc);
        }
        return res;
      });
    }).then((res) => {
      return this.localDatabase.bulkDocs(updatedSeeds).then((resp) => {
        return {ok: true, id: nodeId};
      }).catch((err) => {
        console.log('bulk update error : ' + JSON.stringify(err));
      });
    });
  }

  clearUser(): void {
    this.userSeed = null;
    this.userEmail = null;
  }
}
