import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import {Seed} from "../components/seed.model";
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import {Events} from "ionic-angular";

@Injectable()
export class SeedsService {

  private localDatabase: any;
  private remoteDatabase: any;
  private isVisible: any;

  public userSeed: Seed;
  public userEmail: string;
  public syncProgress: number;

  constructor(private evts: Events) {
    PouchDB.plugin(PouchFind);
    PouchDB.plugin(require('pouchdb-quick-search'));

    // Safari requires a special authorization from user to use disk space
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.localDatabase = isSafari ? new PouchDB(ApiAppConfig.DB_NAME, {size: 50, adapter: 'websql'}) : new PouchDB(ApiAppConfig.DB_NAME);
    this.remoteDatabase = new PouchDB(ApiAppConfig.DB_URL + '/' + ApiAppConfig.DB_NAME);
    this.localDatabase.createIndex({
      index: {fields: ['email']}
    });
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
        filter: (doc) => {
          return doc.doc.scope === 'public' || doc.doc.scope === 'apidae' || doc.doc.author === this.userEmail;
        }
      }
    };
    return Promise.all([this.localDatabase.allDocs(), this.remoteDatabase.allDocs()]).then((values) => {
      return values[1].total_rows - values[0].total_rows;
    }).then((count) => {
      return PouchDB.sync(this.localDatabase, this.remoteDatabase, options).on('change', (info) => {
        if(count > 0) {
          this.syncProgress = Math.min(Math.floor((info.change.docs_written / count) * 100), 100);
        } else {
          this.syncProgress = 100;
        }
      }).on('paused', (err) => {
        console.log('sync paused : ' + JSON.stringify(err));
        this.evts.publish('sync:paused');
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
      console.log('total count');
      nodeData.count = docs.total_rows;
    }).then(() => {
      return this.localDatabase.get(nodeId);
    }).then((rootNode) => {
      console.log('got root node ' + rootNode._id + ' and connections : ' + rootNode.connections);
      return this.localDatabase.allDocs({
        keys:  [rootNode._id].concat(rootNode.connections || []),
        include_docs: true
      }).then(nodes => {
        console.log('got node data');
        let visibleNodes = nodes.rows.map((row) => {return row.doc;})
          .filter(this.isVisible);
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
      include_docs: true,
      // index pre-building seems to break the search
      // build: true,
      language: 'fr',
      filter: this.isVisible
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

  getNodeDetails(nodeId, success) {
    this.localDatabase.get(nodeId).then(function (res) {
      success(res);
    }).catch(function (err) {
      console.log('getNodeDetails err : ' + err);
    })
  }

  saveNode(seed) {
    let nodeId = seed.id;
    let seedParams = seed.submitParams();
    console.log('submitParams : ' + JSON.stringify(seedParams));
    if(nodeId) {
      return this.localDatabase.put(seedParams);
    } else {
      return this.localDatabase.post(seedParams);
    }
  }

  clearUser(): void {
    this.userSeed = null;
    this.userEmail = null;
  }
}
