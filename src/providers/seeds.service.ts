import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import {Seed} from "../components/seed.model";
import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import {Events} from "ionic-angular";
import {Seeds} from "./seeds";

declare var global: any;

@Injectable()
export class SeedsService {

  private localDatabase: any;
  private remoteDatabase: any;
  private idx: any;
  private isVisible: any;

  public userSeed: Seed;
  public userEmail: string;
  public syncProgress: number;
  public indexProgress: boolean;

  constructor(private evts: Events) {
    PouchDB.plugin(PouchFind);

    // Import fr language indexing rules
    global.lunr = require('lunr');
    require('lunr-languages/lunr.stemmer.support')(global.lunr);
    require('lunr-languages/lunr.fr')(global.lunr);
    global.lunr.tokenizer = this.customTokenizer();

    this.isVisible = (n) => {return (n.scope === 'public' || n.scope === 'apidae' || n.author === this.userEmail) && !n.archived};
  }

  initDb() {
    // Safari requires a special authorization from user to use disk space
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    let localDbName = ApiAppConfig.LOCAL_DB + '_' + btoa(this.userEmail);

    this.localDatabase = isSafari ? new PouchDB(localDbName, {size: 50, adapter: 'websql'}) : new PouchDB(localDbName);
    this.remoteDatabase = new PouchDB(ApiAppConfig.DB_URL + '/' + ApiAppConfig.DB_NAME);
    return this.localDatabase.createIndex({index: {fields: ['email']}});
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
      }).on('paused', (res) => {
        this.syncProgress = null;
        this.indexProgress = true;
        return this.localDatabase.allDocs({
          include_docs: true
        }).then((res) => {
          let that = this;
          let localDocs = res.rows.filter((row) => {return row.doc;}).map((row) => {return row.doc;});
          console.log('indexing ' + localDocs.length + ' docs');
          that.idx = global.lunr(function () {
            this.use(global.lunr.fr);
            this.field('name');
            this.field('description');
            this.field('address');
            this.ref('_id');
            localDocs.forEach((doc) => {
              this.add(doc);
            });
            that.evts.publish('index:built');
          });
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
    let nodeId = rootNodeId || "eb9e3271-f969-4e37-b2da-5955a003fa96";
    let nodeData = {count: 0, nodes: [], links: []};
    return this.localDatabase.allDocs().then((docs) => {
      nodeData.count = docs.total_rows;
    }).then(() => {
      return this.localDatabase.get(nodeId);
    }).then((rootNode) => {
      // console.log('got root node ' + rootNode._id + ' and connections : ' + rootNode.connections);
      return this.localDatabase.allDocs({
        keys: [rootNode._id].concat(rootNode.connections || []),
        include_docs: true,
        attachments: true
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
      return nodes.rows.filter((row) => { return row.id && (scope == Seeds.SCOPE_ALL || row.doc.scope == scope); })
        .map((row) => { return row.doc; });
    });
  }

  getCurrentUserSeed(userProfile?: any) {
    return this.getUserSeed(this.userEmail).then((user) => {
      if(user) {
        return this.getNodeDetails(user._id);
      } else if(userProfile) {
        let userFields = {
          name: (userProfile.firstName || 'Prénom') + ' ' + (userProfile.lastName || 'Nom'),
          email: userProfile.email,
          description: userProfile.profession,
          urls: [],
          scope: Seeds.SCOPE_APIDAE
        };
        ['phoneNumber', 'gsmNumber', 'facebook', 'twitter'].forEach((lnk) => {
          if(userProfile[lnk]) {
            userFields.urls.push(userProfile[lnk]);
          }
        });
        let newUser = new Seed(userFields, false, false);
        return this.saveNode(newUser).then(data => {
          if (data.ok) {
            return this.getNodeDetails(data.id);
          } else {
            console.log('New user seed creation failed : ' + JSON.stringify(data));
            return null;
          }
        });
      }
      return null;
    });
  }

  getUserSeed(userEmail) {
    return this.localDatabase.find({selector: {email: userEmail}}).then(function (res) {
      if (res.docs && res.docs.length > 0) {
        return res.docs[0];
      } else {
        console.log('Unknown user : ' + userEmail);
        return null;
      }
    }).catch(function (err) {
      console.log('User seed retrieval error : ' + JSON.stringify(err));
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

  clearUser(): void {
    this.userSeed = null;
    this.userEmail = null;
  }

  // Unicode normalizer - Extracted from https://github.com/cvan/lunr-unicode-normalizer
  unicodeNormalizer(str) {
    let charmap = {
      // Latin chars
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


      // Currencies
      '€': 'euro', "$": 'dollar',

      // Symbols
      '©': '(c)', 'œ': 'oe', 'Œ': 'OE', '∑': 'sum', '®': '(r)', '†': '+',
      '“': '"', '”': '"', '‘': "'", '’': "'", '∂': 'd', 'ƒ': 'f', '™': 'tm',
      '℠': 'sm', '…': '...', '˚': 'o', 'º': 'o', 'ª': 'a', '•': '*',
      '∆': 'delta', '∞': 'infini', '♥': 'love', '&': 'et', '|': 'ou',
      '<': 'less', '>': 'greater'
    };

    let charmapPattern = Object.keys(charmap).map(function(char) {
      return char.replace(/[\|\$]/g, '\\$&');
    }).join('|');
    let charmapRegExp = new RegExp('(' + charmapPattern + ')', 'g');

    return str.replace(charmapRegExp, function(char) {
      return charmap[char];
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
