import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import {Seed} from "../models/seed.model";
import PouchDB from 'pouchdb-browser';
import {Seeds} from "./seeds";
import {ProgressHttp} from "angular-progress-http";
import {Events, Platform} from "ionic-angular";
import {AuthService} from "./auth.service";

import * as DbWorker from "worker-loader!../workers/db.worker";
import * as pouchClient from "worker-pouch/client";

import DatabaseConfiguration = PouchDB.Configuration.DatabaseConfiguration;

@Injectable()
export class SeedsService {

  private static readonly SEARCH_DOC = "_design/search_local";
  private static readonly SEARCH_PATH = "search_local/all_fields";
  private static readonly USER_SEEDS_FILTER = "seeds/by_user";
  private static readonly USER_SEEDS_VIEW = "_design/scopes/_list/get/seeds";
  private static readonly LOOKUP_DOC = "_design/lookup";
  private static readonly LOOKUP_BY_AUTHOR = "lookup/by_author";
  private static readonly USERS_DOC = "_design/users";
  private static readonly USERS_BY_EMAIL = "users/by_email";

  private localDatabase: any;
  private remoteDatabase: any;
  private sync: any;
  public idxBuilding: boolean;
  private supportsIDB: boolean;
  private worker: Worker;

  private static readonly CHARMAP = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a', 'æ': 'ae', 'œ': 'oe', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'ù': 'u', 'û': 'u', 'ü': 'u', '-': ' ', '_': ' ', '!': ' ', '?': ' ',
    '.': ' ', ',': ' ', ':': ' ', ';': ' ', '/': ' ', '"': ' ', '(': ' ', ')': ' ', '\'': ' ', '`': ' '
  };

  private static readonly CHARMAP_REGEX = /[àáâäæçèéêëîïôöùûü\-_!?.,:;/"()'`]/g;

  private static readonly STOPWORDS = 'aux avec bis ceci cela ces cet cette ceux dans des elle elles est eux etes for ici ils les leur leurs lui mais mes mis moi mon meme nos notre nous oeuvre ont par pas plus pour que quel quelle quelles quels qui sans ses soi sommes son sont suis sur surtout tes the toi ton une vers via vos votre vous'.split(' ');

  constructor(private http: ProgressHttp, private evt: Events, private platform: Platform,
              private authService: AuthService) {
    (<any>PouchDB).adapter('worker', pouchClient);
    // PouchDB.debug.enable('pouchdb:worker:*');
    this.supportsIDB = !this.platform.is('ios');
    this.worker = new DbWorker();
    this.remoteDatabase = this.getRemoteDb();
    this.localDatabase = this.getLocalDb(ApiAppConfig.LOCAL_DB);
  }

  // Inits local db once the user is logged in
  initLocalDb() {
    return this.authService.getPreviousUser().then((prevUserEmail) => {
      return prevUserEmail || 'unknown';
    }).then((prevUser) => {
      if(prevUser !== this.authService.userEmail) {
        // if new user, clear local db
        return this.clearDb(ApiAppConfig.LOCAL_DB).then(() => {
          this.localDatabase = this.getLocalDb(ApiAppConfig.LOCAL_DB);
          return Promise.resolve();
        });
      } else {
        // keep existing db otherwise
        this.localDatabase = this.getLocalDb(ApiAppConfig.LOCAL_DB);
        return Promise.resolve();
      }
    }).catch((err) => {
      console.log('initLocalDb error : ' + JSON.stringify(err));
    });
  }

  clearDb(dbName) {
    console.log('Clearing local database : ' + dbName);
    return this.getLocalDb(dbName).destroy();
  }

  clearLocalDb() {
    this.clearDb(ApiAppConfig.LOCAL_DB);
    this.idxBuilding = false;
  }

  getLocalDb(dbName) {
    let adapter = '|adapter|' + (this.supportsIDB ? 'idb' : 'memory');
    return new PouchDB(dbName + adapter, (<DatabaseConfiguration>{adapter: 'worker', worker: () => {return this.worker;}}));
  }

  getRemoteDb() {
    return new PouchDB(ApiAppConfig.DB_URL + '/' + ApiAppConfig.REMOTE_DB);
  }

  initDbData(onProgress) {
    onProgress("Téléchargement des données de l'application en cours (0%)");
    this.localDatabase.info().then((localInfo) => {
      if(localInfo.doc_count === 0) {
        let remote: any = {};
        this.remoteDatabase.info().then((remoteInfo) => {
          remote.lastSeq = remoteInfo.update_seq;
          this.http.withDownloadProgressListener((progress) => {
            onProgress("Téléchargement des données de l'application en cours (" + Math.ceil(progress.loaded / 1024) + "Ko)");
          }).get(this.userSeedsUrl())
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
    }).catch((err) => {
      console.log('initDbData error : ' + JSON.stringify(err));
    });
  }

  userSeedsUrl() {
    return ApiAppConfig.DB_URL + '/' + ApiAppConfig.REMOTE_DB + '/' + SeedsService.USER_SEEDS_VIEW +
      '?keys=[%22' + Seeds.SCOPE_APIDAE + '%22,%22' + Seeds.SCOPE_PUBLIC + '%22,%22' + this.authService.userEmail +
      '%22]&include_docs=true&attachments=true'
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
          filter: SeedsService.USER_SEEDS_FILTER,
          query_params: {user: this.authService.userEmail}
      }
    };
    if(lastSeq) {
      options['since'] = 'now';
    }
    this.sync = this.localDatabase.sync(this.remoteDatabase, options).on('paused', (res) => {
      this.evt.publish("replication:paused");
    });
    return this.sync;
  }

  cancelReplication() {
    if(this.sync) {
      console.log('Cancelling replication');
      this.sync.cancel();
    }
  }

  changesFeed(limit) {
    return this.localDatabase.changes({
      since: 0,
      live: false,
      descending: true,
      include_docs: true,
      attachments: true,
      limit: limit
    });
  }

  buildEmailIndex() {
    let usersDoc = {
      _id: SeedsService.USERS_DOC,
      views: {
        by_email: {
          map: "function (doc) {\n" +
          "  if(doc.type === 'Person' && doc.email) {\n" +
          "    emit(doc.email, null);  \n" +
          "  }\n" +
          "}"
        }
      }
    };
    return this.localDatabase.get(SeedsService.USERS_DOC).then(() => {
      console.log('users doc present');
      return this.getUsersSeeds(['xxx']);
    }).catch((err) => {
      console.log('users doc missing');
      return this.localDatabase.put(usersDoc).then(() => {
        console.log('users doc added');
        return this.getUsersSeeds(['xxx']);
      }).catch((err) => {
        console.log("users doc error : " + JSON.stringify(err));
      });
    });
  }

  buildSearchIndex() {
    console.log('building indexes');
    if(!this.idxBuilding) {
      this.idxBuilding = true;
      let searchDoc = {
        _id: SeedsService.SEARCH_DOC,
        views: {
          all_fields: {
            map: "function (doc) {\n" +
            "  var charmap = {'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a', 'æ': 'ae', 'œ': 'oe', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'ù': 'u', 'û': 'u', 'ü': 'u', '-': ' ', '_': ' ', '!': ' ', '?': ' ', '.': ' ', ',': ' ', ':': ' ', ';': ' ', '/': ' ', '\"': ' ', '(': ' ', ')': ' ', '\\'': ' ', '`': ' '};\n" +
            "  var escapedChars = /[àáâäæçèéêëîïôöùûü\\-_!?.,:;/\"()'`]/g;\n" +
            "  var stopWords = 'aux avec bis ceci cela ces cet cette ceux dans des elle elles est eux etes for ici ils les leur leurs lui mais mes mis moi mon meme nos notre nous oeuvre ont par pas plus pour que quel quelle quelles quels qui sans ses soi sommes son sont suis sur surtout tes the toi ton une vers via vos votre vous'.split(' ');\n" +
            "  \n" +
            "  var indexedFields = doc.name + ' ' + (doc.description || '') + ' ' + (doc.address || '');\n" +
            "  var allTokens = indexedFields.toLowerCase().replace(escapedChars, function(char) {return charmap[char];}).split(/\\s+/).filter(function(t) {return t.length > 2 && stopWords.indexOf(t) === -1;});\n" +
            "  var joinedTokens = '~' + (doc.scope || 'apidae') + ';' + allTokens.join(';');\n" +
            "  \n" +
            "  for(var i in allTokens) {\n" +
            "    emit(allTokens[i], joinedTokens);\n" +
            "  }  \n" +
            "}"
          }
        }
      };
      let lookupDoc = {
        _id: SeedsService.LOOKUP_DOC,
        views: {
          by_author: {
            map: "function (doc) {\n" +
            "  if(doc.author && doc.updated_at) {\n" +
            "    emit(doc.author + doc.updated_at, null);\n" +
            "  }\n" +
            "}"
          }
        }
      };

      return this.localDatabase.get(SeedsService.SEARCH_DOC).then(() => {
        console.log('search doc present');
        return this.searchNodes('init', Seeds.SCOPE_ALL);
      }).catch((err) => {
        console.log('search doc missing');
        return this.localDatabase.put(searchDoc).then(() => {
          return this.searchNodes('init', Seeds.SCOPE_ALL);
        }).catch((err) => {
          console.log("local search doc error : " + JSON.stringify(err));
        });
      }).then(() => {
        return this.localDatabase.get(SeedsService.LOOKUP_DOC).then(() => {
          console.log('lookup doc present');
          return this.lookUpNodes('xxx');
        }).catch((err) => {
          console.log('lookup doc missing');
          return this.localDatabase.put(lookupDoc).then(() => {
            console.log('lookup doc added');
            return this.lookUpNodes('xxx');
          }).catch((err) => {
            console.log("lookup doc error : " + JSON.stringify(err));
          });
        });
      });
    }
  }

  getNodeData(nodeId) {
    let nodeData = {count: 0, root: null, connectedSeeds: [], includedSeeds: []};
    return this.localDatabase.allDocs({keys: [nodeId], include_docs: true, attachments: true}).then((docs) => {
      nodeData.count = docs.total_rows;
      nodeData.root = new Seed(docs.rows[0].doc, true, false);
      return Promise.all([
        this.localDatabase.allDocs({keys: (nodeData.root.connections || []), include_docs: true, attachments: true}),
        this.localDatabase.allDocs({keys: (nodeData.root.inclusions || []), include_docs: true, attachments: true}),
      ]).then((nodes) => {
        nodeData.root.connectedSeeds = nodes[0].rows.filter((row) => {return row.id && row.doc;}).map((row) => {return new Seed(row.doc, false, false);});
        nodeData.root.includedSeeds = nodes[1].rows.filter((row) => {return row.id && row.doc;}).map((row) => {return new Seed(row.doc, false, false);});
        return nodeData;
      });
    }).catch(function (err) {
      console.log('getNodeData err : ' + JSON.stringify(err));
    });
  }

  getNodes(nodesIds) {
    return this.localDatabase.allDocs({keys: nodesIds, include_docs: true, attachments: true}).then((docs) => {
      return docs.rows.filter((row) => {return row.id && row.doc;}).map((row) => {return new Seed(row.doc, false, false);});
    });
  }

  lookUpNodes(email, stale?) {
    console.time('look up author ' + email);
    return this.localDatabase.query(SeedsService.LOOKUP_BY_AUTHOR, {
      startkey: email + '9',
      endkey: email,
      include_docs: true,
      attachments: true,
      descending: true,
      limit: 50,
      stale: stale
    }).then((results) => {
      console.timeEnd('look up author ' + email);
      return results.rows.filter((row) => {return row.id && row.doc;})
        .map((row) => {return new Seed(row.doc, false, false);});
    }).catch(function (err) {
      console.log('lookup error for email ' + email + ' : ' + JSON.stringify(err));
    });
  }

  searchNodes(query, scope, stale?): Promise<Array<string>> {
    let tokens = this.tokenize(this.normalize(query));

    console.time('search-query');
    let results = [];
    return Promise.all(tokens.map((term) => {
      return this.searchTerm(term, stale);
    })).then((allResults) => {
      console.timeEnd('search-query');
      console.time('search-filter');
      let matches = this.deDup(allResults.map((r) => r['results']).reduce((a, b) => a.concat(b), []),
        (res) => res.id);
      // If scope specified, add a scope-related term to match only relevant results
      if(scope != Seeds.SCOPE_ALL) {
        tokens.unshift('~' + scope);
      }
      results = matches
        .filter((result) => { return tokens.every((t) => result.value.indexOf(t) !== -1); })
        .map((result) => result.id);
      console.timeEnd('search-filter');
      console.time('search-results');
      return Promise.resolve(results);
    }).catch(function (err) {
      console.log('search error : ' + JSON.stringify(err));
    });
  }

  deDup(arr, keySelector) {
    let arrObject = {};
    for(let i = 0; i < arr.length; i++) {
      arrObject[keySelector(arr[i])] = arr[i];
    }
    return Object.keys(arrObject).map((k) => {return arrObject[k];});
  }

  searchTerm(term, stale?) {
    return this.localDatabase.query(SeedsService.SEARCH_PATH, {
      startkey: term,
      endkey: term + '\uffff',
      stale: stale
    }).then((results) => {
      return {
        term: term,
        results: results.rows
      };
    }).catch(function (err) {
      console.log('search error for term ' + term + ' : ' + JSON.stringify(err));
    });
  }

  tokenize(query) {
    return query.split(/\s+/).filter((t) => {return SeedsService.STOPWORDS.indexOf(t) === -1;});
  }

  normalize(query) {
    if(query) {
      return query.toLowerCase().replace(SeedsService.CHARMAP_REGEX, function(char) {
        return SeedsService.CHARMAP[char];
      });
    }
    return '';
  }

  getCurrentUserSeed() {
    return this.authService.currentUser().then((userEmail) => {
      return this.getUsersSeeds([userEmail], true).then((seeds) => {
        return seeds[userEmail];
      });
    }).then((userSeed) => {
      if(userSeed) {
        return Promise.resolve(userSeed);
      } else {
        return this.authService.getUserProfile().then((userProfile) => {
          let newUser = this.buildUserSeed(userProfile);
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
      author: userProfile.email,
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

  getUsersSeeds(emails, attachments = false) {
    console.time('get ' + emails.length + ' users seeds');
    let usersByEmail = {};
    let uniqEmails = this.deDup(emails, (email) => email);

    return this.localDatabase.query(SeedsService.USERS_BY_EMAIL, {
      keys: uniqEmails,
      include_docs: true,
      attachments: attachments,
    }).then((results) => {
      results.rows.map((row) => row.doc).forEach((doc) => {
        usersByEmail[doc.email] = new Seed(doc, false, false);
      });
      console.timeEnd('get ' + emails.length + ' users seeds');
      return usersByEmail;
    }).catch(function (err) {
      console.log('getUsersSeeds error : ' + JSON.stringify(err));
    });
  }

  getNodeDetails(nodeId) {
    return this.localDatabase.get(nodeId, {attachments: true});
  }

  saveNode(seed) {
    let seedParams = seed.submitParams();
    return this.localDatabase.put(seedParams).then((doc) => {
      return this.updateConnections(doc.id, seed);
    });
  }

  updateConnections(nodeId, seed) {
    let updatedSeeds = [];
    return this.localDatabase.allDocs({
        keys: seed.addedConnections,
        include_docs: true
    }).then((nodes) => {
      let docs = nodes.rows.filter((row) => {return row.id;}).map((row) => {return row.doc;});
      for (let doc of docs) {
        if(doc.connections.indexOf(nodeId) == -1) {
          doc.connections.push(nodeId);
          updatedSeeds.push(doc);
        }
      }
    }).then(() => {
      return this.localDatabase.allDocs({
        keys:  seed.removedConnections,
        include_docs: true
      }).then((nodes) => {
        let docs = nodes.rows.filter((row) => {return row.id;}).map((row) => {return row.doc;});
        for (let doc of docs) {
          if(doc.connections.indexOf(nodeId) != -1) {
            doc.connections.splice(doc.connections.indexOf(nodeId), 1);
            updatedSeeds.push(doc);
          }
        }
      });
    }).then((res) => {
      return this.localDatabase.bulkDocs(updatedSeeds).then((resp) => {
        return {ok: true, id: nodeId};
      }).catch((err) => {
        console.log('bulk update error : ' + JSON.stringify(err));
      });
    });
  }
}
