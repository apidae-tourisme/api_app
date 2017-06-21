import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import {Seed} from "../components/seed.model";
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';

@Injectable()
export class SeedsService {

  private db: any;
  private remote: any;

  public userSeed: Seed;
  public userEmail: string;

  constructor() {
    PouchDB.plugin(PouchFind);
    PouchDB.plugin(require('pouchdb-quick-search'));
    this.db = new PouchDB(ApiAppConfig.DB_NAME);
    this.remote = ApiAppConfig.DB_URL + '/' + ApiAppConfig.DB_NAME;
    let options = {
      live: true,
      retry: true,
      continuous: true,
      filter: function(doc) {
        return doc._id.indexOf('_design') !== 0;
      }
    };
    this.db.sync(this.remote, options);
    this.db.createIndex({
      index: {fields: ['email']}
    });
    this.db.on('error', function (err) { debugger; });
  }

  getNodeData(rootNodeId) {
    // Default id = Apidae root
    let nodeId = rootNodeId || "eb9e3271f9694e37b2da5955a003fa96";
    return this.db.get(nodeId).then((res) => {
      return res;
    }).then((rootNode) => {
      return this.db.allDocs({
        keys:  [rootNode._id].concat(rootNode.connections),
        include_docs: true
      }).then(nodes => {
        let visibleNodes = nodes.rows.map((row) => {return row.doc;})
          .filter((n) => {return n.scope === 'public' || n.scope === 'apidae' || n.author === this.userEmail;});
        return {
          count: 1,
          nodes: visibleNodes,
          links: visibleNodes.slice(1).map((n) => {return {source: n._id, target: visibleNodes[0]._id};})
        };
      });
    }).catch(function (err) {
      console.log('getNodeData err : ' + JSON.stringify(err));
    });
  }

  searchNodes(query) {
    return this.db.search({
      query: query,
      fields: ['name', 'description'],
      include_docs: true
    }).then(function (res) {
      console.log('searchNodes res : ' + JSON.stringify(res));
      return (res.rows && res.rows.length > 0) ? res.rows.map((r) => {return r.doc;}) : [];
    }).catch(function (err) {
      console.log('Search nodes error : ' + JSON.stringify(err));
    });
  }

  getUserSeed(userEmail, success) {
    this.db.find({selector: {email: userEmail}}).then(function (res) {
      if (res.docs && res.docs.length > 0) {
        success(res.docs[0]);
      } else {
        console.log('Unknown user : ' + JSON.stringify(res));
      }
    }).catch(function (err) {
      console.log('User seed retrieval error : ' + JSON.stringify(err));
    });
  }

  getNodeDetails(nodeId, success) {
    console.log('nodeId : ' + nodeId);
    this.db.get(nodeId).then(function (res) {
      console.log('getNodeDetails res : ' + res);
      success(res);
    }).catch(function (err) {
      console.log('getNodeDetails err : ' + err);
    })
    // let url = ApiAppConfig.API_URL + "/seeds/" + nodeId + "/details.json";
    // return this.http.get(url, this.userHeader()).map(resp => {
    //   return resp.json();
    // });
  }

  editNode(nodeId) {
    // let url = ApiAppConfig.API_URL + "/seeds/" + nodeId + "/edit.json";
    // return this.http.get(url, this.userHeader()).map(resp => {
    //   return resp.json();
    // });
  }

  saveNode(seed) {
    // let nodeId = seed.id;
    // let url = ApiAppConfig.API_URL + "/seeds";
    // let seedParams = seed.submitParams();
    // if(nodeId) {
    //   url += "/" + nodeId + ".json";
    //   return this.http.patch(url, {seed: seedParams}, this.userHeader()).map(resp => {
    //     return resp.json();
    //   });
    // } else {
    //   url += ".json";
    //   return this.http.post(url, {seed: seedParams}, this.userHeader()).map(resp => {
    //     return resp.json();
    //   });
    // }
  }
}
