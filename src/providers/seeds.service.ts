import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import {Seed} from "../components/seed.model";
import PouchDB from 'pouchdb';
import {Seeds} from "./seeds";
import {ProgressHttp} from "angular-progress-http";
import {Events} from "ionic-angular";

declare var global: any;

@Injectable()
export class SeedsService {

  private static readonly MIN_INTERVAL = 60000;
  private static readonly DEFAULT_SEED = "eb9e3271-f969-4e37-b2da-5955a003fa96";
  private static readonly AUTH_DOC = "_local/user";
  private static readonly USERS_INDEX_DOC = "_local/users_by_email";

  private localDatabase: any;
  private remoteDatabase: any;
  private sync: any;
  private idx: any;
  private lastIdxUpdate: number;
  private idxBuilding: boolean;

  public userSeed: Seed;
  public userEmail: string;

  private static readonly CHARMAP = {
    'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE',
    'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I',
    'Î': 'I', 'Ï': 'I', 'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O',
    'Õ': 'O', 'Ö': 'O', 'Ő': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U',
    'Ü': 'U', 'Ű': 'U', 'Ý': 'Y', 'Þ': 'TH', 'ß': 'ss',
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae',
    'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i',
    'î': 'i', 'ï': 'i', 'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o',
    'õ': 'o', 'ö': 'o', 'ő': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u',
    'ü': 'u', 'ű': 'u', 'ý': 'y', 'þ': 'th', 'ÿ': 'y', 'ẞ': 'SS',
  };

  private static readonly CHARMAP_REGEX = new RegExp('(' +
    Object.keys(SeedsService.CHARMAP).map(function(char) {return char.replace(/[\|\$]/g, '\\$&');}).join('|') + ')', 'g');

  constructor(private http: ProgressHttp, private evt: Events) {
    // Import fr language indexing rules
    global.lunr = require('lunr');
    require('lunr-languages/lunr.stemmer.support')(global.lunr);
    require('lunr-languages/lunr.fr')(global.lunr);
    global.lunr.tokenizer = this.customTokenizer();
    this.initRemoteDb();
    this.initLocalDb();
  }

  initLocalDb() {
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    let localDbName = ApiAppConfig.LOCAL_DB + '_' + btoa(this.userEmail);
    this.localDatabase = isSafari ? new PouchDB(localDbName, {size: 50, adapter: 'websql'}) : new PouchDB(localDbName);
  }

  initRemoteDb() {
    this.remoteDatabase = new PouchDB(ApiAppConfig.DB_URL + '/' + ApiAppConfig.REMOTE_DB);
  }

  initDb(onProgress) {
    onProgress("Téléchargement des données de l'application en cours (0%)");
    this.localDatabase.info().then((localInfo) => {
      if(localInfo.doc_count === 0) {
        let remote: any = {};
        this.remoteDatabase.info().then((remoteInfo) => {
          remote.lastSeq = remoteInfo.update_seq;
          this.http.withDownloadProgressListener((progress) => {
            onProgress("Téléchargement des données de l'application en cours (" + Math.ceil(progress.loaded / 1024) + "Ko)");
          }).get(ApiAppConfig.DB_URL + '/' + ApiAppConfig.REMOTE_DB + '/_design/scopes/_list/get/seeds?' +
              'keys=[%22apidae%22,%22public%22,%22' + this.userEmail + '%22]&include_docs=true&attachments=true')
            .map(res => res.json()).toPromise()
            .then((data) => {
              onProgress("Import des données téléchargées");
              this.localDatabase.bulkDocs(data.docs, {new_edits: false}).then((res) => {
                onProgress("Import terminé.");
                this.initReplication(remote.lastSeq);
              }).catch((err) => {
                onProgress("L'import des données a échoué.");
                console.log('bulk docs err : ' + JSON.stringify(err));
              });
          }).catch((err) => {
            onProgress("Une erreur s'est produite lors du téléchargement des données.");
            console.log('download err : ' + JSON.stringify(err));
          });
        });

      } else {
        this.initReplication();
      }
    });
  }

  initReplication(lastSeq?) {
    let options = {
      live: true,
      retry: true,
      continuous: true,
      filter: (doc) => {
        return doc._id.indexOf('_design') !== 0;
      },
      pull: {
          filter: 'seeds/by_user',
          query_params: {user: this.userEmail}
      }
    };
    if(lastSeq) {
      options['since'] = 'now';
    }
    return this.localDatabase.sync(this.remoteDatabase, options).on('paused', (res) => {
      this.evt.publish("replication:paused");
      let now = new Date().getTime();
      if(this.idx && !this.idxBuilding && (now - this.lastIdxUpdate) > SeedsService.MIN_INTERVAL) {
        this.buildSearchIndex();
      }
    }).on('change', (info) => {
      console.log('replication changed : ' + JSON.stringify(info));
    });
  }

  cancelReplication() {
    if(this.sync) {
      this.sync.cancel();
    }
  }

  buildEmailIndex() {
    let usersByEmail = {};
    console.time('buildEmailIndex');
    return this.localDatabase.allDocs({include_docs: true}).then((res) => {
      let persons = res.rows.filter((row) => {return row.doc && row.doc.type === 'Person' && row.doc.email;});
      for (let p of persons) {
        usersByEmail[p.doc.email] = p.id;
      }
      console.timeEnd('buildEmailIndex');
      return this.localDatabase.put({
        _id: SeedsService.USERS_INDEX_DOC,
        index: usersByEmail
      }).catch((err) => {
        console.log('email index save error : ' + JSON.stringify(err));
      });
    });
    // return this.localDatabase.createIndex({index: {fields: ['email']}});
  }

  buildSearchIndex() {
    console.time('search-index-update');
    this.idxBuilding = true;
    return this.localDatabase.allDocs({
      include_docs: true
    }).then((res) => {
      console.log('buildSearchIndex allDocs - total_row : ' + res.total_rows + ' - offset : ' + res.offset + ' - length : ' + res.rows.length);
      let that = this;
      let localDocs = res.rows.map((row) => {return row.doc;});
      console.log('indexing ' + localDocs.length + ' docs');
      that.idx = global.lunr(function () {
        this.use(global.lunr.fr);
        this.b(0);
        this.field('name');
        this.field('description');
        this.field('address');
        this.ref('_id');
        localDocs.forEach((doc) => {
          this.add(doc);
        });
        that.lastIdxUpdate = new Date().getTime();
        that.idxBuilding = false;
        console.timeEnd('search-index-update');
      });
    });
  }

  getNodeData(rootNodeId) {
    let nodeId = rootNodeId || SeedsService.DEFAULT_SEED;
    let nodeData = {count: 0, nodes: [], links: []};
    return this.localDatabase.allDocs().then((docs) => {
      nodeData.count = docs.rows.length;
    }).then(() => {
      return this.localDatabase.get(nodeId);
    }).then((rootNode) => {
      // console.log('got root node ' + rootNode._id + ' and connections : ' + rootNode.connections);
      return this.localDatabase.allDocs({
        keys: [rootNode._id].concat(rootNode.connections || []),
        include_docs: true,
        attachments: true
      }).then(nodes => {
        let visibleNodes = nodes.rows.filter((row) => {return row.id && row.doc;}).map((row) => {return row.doc;});
        nodeData.nodes = visibleNodes;
        nodeData.links = visibleNodes.slice(1).map((n) => {return {source: n._id, target: visibleNodes[0]._id};});
        return nodeData;
      });
    }).catch(function (err) {
      console.log('getNodeData err : ' + JSON.stringify(err));
    });
  }

  searchNodes(query, scope) {
    // Mix lunr querying strategies as recommended in https://github.com/olivernn/lunr.js/issues/273
    let queryTerms = global.lunr.tokenizer(query);
    let results = this.idx.query((q) => {
      queryTerms.forEach((term) => {
        q.term(term, { usePipeline: true, boost: 100 });
        q.term(term, { usePipeline: true, wildcard: global.lunr.Query.wildcard.TRAILING, boost: 10 });
      });
    });

    return this.localDatabase.allDocs({
      keys: results.map((res) => { return res.ref; }),
      include_docs: true,
      attachments: true
    }).then((nodes) => {
      return nodes.rows.filter((row) => { return row.id && row.doc && (scope == Seeds.SCOPE_ALL || row.doc.scope == scope); })
        .map((row) => { return row.doc; });
    });
  }

  getCurrentUserSeed() {
    return this.getUserSeed(this.userEmail).then((userSeed) => {
      if(userSeed) {
        return Promise.resolve(userSeed);
      } else {
        return this.getAuth().then((doc) => {
          let newUser = this.buildUserSeed(doc.user);
          return this.localDatabase.put(newUser.submitParams()).then(data => {
            if (data.ok) {
              return this.getNodeDetails(data.id);
            } else {
              console.log('New user seed creation failed : ' + JSON.stringify(data));
              return null;
            }
          }).catch((err) => {
            console.log('newUser err : ' + JSON.stringify(err));
          });
        }).catch((err) => {
          console.log("Local auth data missing");
        });
      }
    });
  }

  buildUserSeed(userProfile) {
    let userFields = {
      name: (userProfile.firstName || 'Prénom') + ' ' + (userProfile.lastName || 'Nom'),
      email: userProfile.email,
      external_id: userProfile.id.toString(),
      description: userProfile.profession,
      urls: [],
      type: Seeds.PERSON,
      scope: Seeds.SCOPE_APIDAE
    };
    ['phoneNumber', 'gsmNumber', 'facebook', 'twitter'].forEach((lnk) => {
      if(userProfile[lnk]) {
        userFields.urls.push(userProfile[lnk]);
      }
    });
    return new Seed(userFields, false, false);
  }

  getUserSeed(userEmail) {
    return this.localDatabase.get(SeedsService.USERS_INDEX_DOC).then((doc) => {
      let userId = doc.index[userEmail];
      if(userId) {
        return this.getNodeDetails(userId);
      } else {
        Promise.resolve(null);
      }
    }).catch((err) => {
      console.log("getUserSeed error : " + JSON.stringify(err));
    });
  }

  getNodeDetails(nodeId) {
    return this.localDatabase.get(nodeId, {attachments: true});
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
    if(seedParams._rev) {
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
    } else {
      return Promise.resolve({added: seedParams.connections, removed: []});
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

  getAuth() {
    return this.localDatabase.get(SeedsService.AUTH_DOC);
  }

  setAuth(userProfile) {
    return this.localDatabase.put({
      _id: SeedsService.AUTH_DOC,
      user: userProfile
    });
  }

  clearAuthData(): void {
    this.userSeed = null;
    this.userEmail = null;
    return this.getAuth().then((doc) => {
      this.localDatabase.remove(doc);
    });
  }

  // Unicode normalizer - Extracted from https://github.com/cvan/lunr-unicode-normalizer
  unicodeNormalizer(str) {
    return str.replace(SeedsService.CHARMAP_REGEX, function(char) {
      return SeedsService.CHARMAP[char];
    });
  };

  // Returns a custom lunr tokenizer which removes accents and splits on spaces & hyphens
  customTokenizer() {
    let that = this;
    let tokenizer = function(obj) {
      if (!arguments.length || obj === null || obj === undefined) return [];
      if (Array.isArray(obj)) {
        return obj.map(function(t) {
          return that.unicodeNormalizer(t).toLowerCase();
        });
      }

      let str = obj.toString().replace(/^\s+/, '');

      for (let i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
          str = str.substring(0, i + 1);
          break;
        }
      }

      str = that.unicodeNormalizer(str);

      return str
        .replace('-', ' ')
        .split(/\s+/)
        .map(function(token) {
          return token.toLowerCase();
        });
    };

    for(let attr in global.lunr.tokenizer){
      tokenizer[attr] = global.lunr.tokenizer[attr];
    }

    return tokenizer;
  }
}
