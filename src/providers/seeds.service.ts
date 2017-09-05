import {Injectable} from "@angular/core";
import {ApiAppConfig} from "./apiapp.config";
import {Seed} from "../models/seed.model";
import PouchDB from 'pouchdb';
import {Seeds} from "./seeds";
import {ProgressHttp} from "angular-progress-http";
import {Events, Platform} from "ionic-angular";
import {AuthService} from "./auth.service";

@Injectable()
export class SeedsService {

  private static readonly DEFAULT_SEED = "eb9e3271-f969-4e37-b2da-5955a003fa96";
  private static readonly USERS_INDEX_DOC = "_local/users_by_email";
  private static readonly CURRENT_USER = "_local/current_user";
  private static readonly SEARCH_DOC = "_design/search_local";
  private static readonly SEARCH_PATH = "search_local/all_fields";
  private static readonly USER_SEEDS_FILTER = "seeds/by_user";
  private static readonly USER_SEEDS_VIEW = "_design/scopes/_list/get/seeds";

  private localDatabase: any;
  private remoteDatabase: any;
  private sync: any;
  private idxBuilding: boolean;
  private isMobile: boolean;
  private isSafari: boolean;

  private static readonly CHARMAP = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a', 'æ': 'ae', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'ù': 'u', 'û': 'u', 'ü': 'u', '-': ' ', '_': ' ', '!': ' ', '?': ' ',
    '.': ' ', ',': ' ', ':': ' ', ';': ' ', '/': ' ', '"': ' ', '(': ' ', ')': ' ', '\'': ' ', '`': ' '
  };

  private static readonly CHARMAP_REGEX = /[àáâäæçèéêëîïôöùûü\-_!?.,:;/"()'`]/g;

  private static readonly STOPWORDS = 'aie aient aies ait aura aurai auraient aurais aurait auras aurez auriez aurions aurons auront aux avaient avais avait avec avez aviez avions avons ayant ayez ayons ceci cela ces cet cette dans des elle est eue eues eurent eus eusse eussent eusses eussiez eussions eut eux eumes eut etes furent fus fusse fussent fusses fussiez fussions fut fumes fut futes ici ils les leur leurs lui mais mes moi mon meme nos notre nous ont par pas pour que quel quelle quelles quels qui sans sera serai seraient serais serait seras serez seriez serions serons seront ses soi soient sois soit sommes son sont soyez soyons suis sur tes toi ton une vos votre vous etaient etais etait etant etiez etions ete etee etees etes etes'.split(' ');

  constructor(private http: ProgressHttp, private evt: Events, private platform: Platform,
              private authService: AuthService) {
    this.isMobile = this.platform.is('mobile');
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.remoteDatabase = this.getRemoteDb();
    this.localDatabase = this.getLocalDb(ApiAppConfig.LOCAL_DB, this.isSafari);
  }

  // Inits local db once the user is logged in
  // Note : only one local db is maintained - this is to prevent the app from exceeding the browsers space storage limit
  initLocalDb() {
    let legacyDbName = ApiAppConfig.LOCAL_DB + '_' + btoa(this.authService.userEmail);
    console.log('isSafari : ' + this.isSafari + ' - platforms : ' + this.platform.platforms());
    // Clear legacy per-user local databases
    return this.clearDb(legacyDbName, this.isSafari).then(() => {
      this.localDatabase.get(SeedsService.CURRENT_USER).then((userDoc) => {
        return userDoc.email;
      }).catch((err) => {
        console.log('current user doc missing');
        return this.authService.userEmail;
      }).then((prevUser) => {
        if(prevUser !== this.authService.userEmail) {
          // if new user, clear local db
          return this.clearDb(ApiAppConfig.LOCAL_DB, this.isSafari).then(() => {
            this.localDatabase = this.getLocalDb(ApiAppConfig.LOCAL_DB, this.isSafari);
            return this.localDatabase.put({_id: SeedsService.CURRENT_USER, email: this.authService.userEmail});
          });
        } else {
          // keep existing db otherwise
          this.localDatabase = this.getLocalDb(ApiAppConfig.LOCAL_DB, this.isSafari);
          return Promise.resolve();
        }
      });
    }).catch((err) => {
      console.log('initLocalDb error : ' + JSON.stringify(err));
    });
  }

  clearDb(dbName, isSafari) {
    console.log('Clearing local database : ' + dbName);
    return this.getLocalDb(dbName, isSafari).destroy();
  }

  clearLocalDb() {
    this.clearDb(ApiAppConfig.LOCAL_DB, this.isSafari);
  }

  getLocalDb(dbName, isSafari) {
    return isSafari ? new PouchDB(dbName, {size: this.isMobile ? 49 : 99, adapter: 'websql'}) : new PouchDB(dbName);
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
      '?keys=[%22apidae%22,%22public%22,%22' + this.authService.userEmail + '%22]&include_docs=true&attachments=true'
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
    return this.localDatabase.sync(this.remoteDatabase, options).on('paused', (res) => {
      this.evt.publish("replication:paused");
    });
  }

  cancelReplication() {
    if(this.sync) {
      this.sync.cancel();
    }
  }

  buildEmailIndex() {
    let usersByEmail = {};
    return this.localDatabase.allDocs({include_docs: true}).then((res) => {
      let persons = res.rows.filter((row) => {return row.doc && row.doc.type === 'Person' && row.doc.email;});
      for (let p of persons) {
        usersByEmail[p.doc.email] = p.id;
      }
      return this.localDatabase.get(SeedsService.USERS_INDEX_DOC).catch((err) => {
        console.log('email index doc missing');
        return this.localDatabase.put({
          _id: SeedsService.USERS_INDEX_DOC,
          index: usersByEmail
        }).catch((err) => {
          console.log('email index save error : ' + JSON.stringify(err));
        });
      });
    });
  }

  buildSearchIndex() {
    console.log('building search index');
    if(!this.idxBuilding) {
      this.idxBuilding = true;
      let searchDoc = {
        _id: SeedsService.SEARCH_DOC,
        views: {
          all_fields: {
            map: "function (doc) {\n  var charmap = {'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a', 'æ': 'ae', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'ù': 'u', 'û': 'u', 'ü': 'u', '-': ' ', '_': ' ', '!': ' ', '?': ' ', '.': ' ', ',': ' ', ':': ' ', ';': ' ', '/': ' ', '\"': ' ', '(': ' ', ')': ' ', '\\'': ' ', '`': ' '};\n  var escapedChars = /[àáâäæçèéêëîïôöùûü\\-_!?.,:;/\"()'`]/g;\n  var stopWords = 'aie aient aies ait aura aurai auraient aurais aurait auras aurez auriez aurions aurons auront aux avaient avais avait avec avez aviez avions avons ayant ayez ayons ceci cela ces cet cette dans des elle est eue eues eurent eus eusse eussent eusses eussiez eussions eut eux eumes eut etes furent fus fusse fussent fusses fussiez fussions fut fumes fut futes ici ils les leur leurs lui mais mes moi mon meme nos notre nous ont par pas pour que quel quelle quelles quels qui sans sera serai seraient serais serait seras serez seriez serions serons seront ses soi soient sois soit sommes son sont soyez soyons suis sur tes toi ton une vos votre vous etaient etais etait etant etiez etions ete etee etees etes etes'.split(' ');\n  \n  var nameTokens = doc.name.toLowerCase().replace(escapedChars, function(char) {return charmap[char];}).split(/\\s+/);\n  for(var i in nameTokens) {\n    if(nameTokens[i].length > 2 && stopWords.indexOf(nameTokens[i] === -1)) {\n      emit(nameTokens[i], null);\n    }\n  }\n  if(doc.description) {\n    var descTokens = doc.description.toLowerCase().replace(escapedChars, function(char) {return charmap[char];}).split(/\\s+/);\n    for(var k in descTokens) {\n      if(descTokens[k].length > 2 && stopWords.indexOf(descTokens[k] === -1)) {\n        emit(descTokens[k], null);\n      }\n    }  \n  }\n  if(doc.address) {\n    var addrTokens = doc.address.toLowerCase().replace(escapedChars, function(char) {return charmap[char];}).split(/\\s+/);\n    for(var j in addrTokens) {\n      if(addrTokens[j].length > 2 && stopWords.indexOf(addrTokens[j] === -1)) {\n        emit(addrTokens[j], null);\n      }\n    }  \n  }\n}"
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
      });
    }
  }

  getNodeData(rootNodeId) {
    let nodeId = rootNodeId || SeedsService.DEFAULT_SEED;
    let nodeData = {count: 0, root: null, connectedSeeds: [], includedSeeds: []};
    return this.localDatabase.allDocs().then((docs) => {
      nodeData.count = docs.rows.length;
    }).then(() => {
      return this.localDatabase.get(nodeId, {attachments: true});
    }).then((rootNode) => {
      nodeData.root = rootNode;
      // console.log('got root node ' + rootNode._id + ' and connections : ' + rootNode.connections);
      return Promise.all([
        this.localDatabase.allDocs({keys: (rootNode.connections || []), include_docs: true, attachments: true}),
        this.localDatabase.allDocs({keys: (rootNode.inclusions || []), include_docs: true, attachments: true}),
      ]).then((nodes) => {
        nodeData.connectedSeeds = nodes[0].rows.filter((row) => {return row.id && row.doc;}).map((row) => {return row.doc;});
        nodeData.includedSeeds = nodes[1].rows.filter((row) => {return row.id && row.doc;}).map((row) => {return row.doc;});
        return nodeData;
      });
    }).catch(function (err) {
      console.log('getNodeData err : ' + JSON.stringify(err));
    });
  }

  searchNodes(query, scope) {
    let tokens = this.tokenize(this.normalize(query));

    console.time('search-query');
    let results = [];
    return Promise.all(tokens.map((term) => {
      return this.searchTerm(term);
    })).then((allResults) => {
      console.timeEnd('search-query');
      console.time('search-results');
      allResults.forEach((res) => {
        let otherTerms = tokens.filter((t) => {return t !== res['term'];});
        results = results.concat(res['results'].filter((result) => {
            return (scope == Seeds.SCOPE_ALL || result.scope == scope) && this.matchTerms(result, otherTerms);
          }));
      });
      console.timeEnd('search-results');
      return deDup(results);
    }).catch(function (err) {
      console.log('search error : ' + JSON.stringify(err));
    });

    function deDup(arr) {
      let arrObject = {};
      for(let i = 0; i < arr.length; i++) {
        arrObject[arr[i]._id] = arr[i];
      }
      return Object.keys(arrObject).map((k) => {return arrObject[k];});
    }
  }

  matchTerms(doc, terms) {
    let match = true;
    if(terms.length > 0) {
      terms.forEach((t) => {
        match = match && (this.normalize(doc.name).indexOf(t) !== -1 || this.normalize(doc.description).indexOf(t) !== -1 || this.normalize(doc.address).indexOf(t) !== -1);
      });
    }
    return match;
  }

  searchTerm(term) {
    return this.localDatabase.query(SeedsService.SEARCH_PATH, {
      startkey     : term,
      endkey       : term + '\uffff',
      limit        : 50,
      include_docs : true,
      attachments: true
    }).then((results) => {
      return {
        term: term,
        results: results.rows.filter((row) => { return row.doc && row.doc._id; }).map((row) => { return row.doc; })
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
      return this.getUserSeed(userEmail);
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
