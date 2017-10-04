import PouchDB from 'pouchdb-browser';
// import PouchAdapterSqlite from 'pouchdb-adapter-cordova-sqlite';

let registerPromiseWorker = require('promise-worker/register');

registerPromiseWorker((message) => {
  const LOCAL_DB = 'api-app_local';
  const SCOPE_ALL = "all";
  const SEARCH_DOC = "_design/search_local";
  const SEARCH_PATH = "search_local/all_fields";
  const LOOKUP_DOC = "_design/lookup";
  const LOOKUP_BY_EMAIL = "lookup/by_author";

  const CHARMAP = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a', 'æ': 'ae', 'œ': 'oe', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'ù': 'u', 'û': 'u', 'ü': 'u', '-': ' ', '_': ' ', '!': ' ', '?': ' ',
        '.': ' ', ',': ' ', ':': ' ', ';': ' ', '/': ' ', '"': ' ', '(': ' ', ')': ' ', '\'': ' ', '`': ' '
  };
  const CHARMAP_REGEX = /[àáâäæçèéêëîïôöùûü\-_!?.,:;/"()'`]/g;
  const STOPWORDS = ('aux avec bis ceci cela ces cet cette ceux dans des elle elles est eux etes for ici ils les leur' +
    ' leurs lui mais mes mis moi mon meme nos notre nous oeuvre ont par pas plus pour que quel quelle quelles quels' +
    ' qui sans ses soi sommes son sont suis sur surtout tes the toi ton une vers via vos votre vous').split(' ');

  // PouchDB.plugin(PouchAdapterSqlite);
  let db: any = getLocalDb(LOCAL_DB);
  console.log('Using adapter in worker : ' + db.adapter);

  console.log('building search index from worker : ' + db);

  let searchDoc = {
    _id: SEARCH_DOC,
    views: {
      all_fields: {
        map: "function (doc) {\n" +
        "  var charmap = {'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a', 'æ': 'ae', 'œ': 'oe', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'î': 'i', 'ï': 'i', 'ô': 'o', 'ö': 'o', 'ù': 'u', 'û': 'u', 'ü': 'u', '-': ' ', '_': ' ', '!': ' ', '?': ' ', '.': ' ', ',': ' ', ':': ' ', ';': ' ', '/': ' ', '\"': ' ', '(': ' ', ')': ' ', '\\'': ' ', '`': ' '};\n" +
        "  var escapedChars = /[àáâäæçèéêëîïôöùûü\\-_!?.,:;/\"()'`]/g;\n" +
        "  var stopWords = 'aux avec bis ceci cela ces cet cette ceux dans des elle elles est eux etes for ici ils les leur leurs lui mais mes mis moi mon meme nos notre nous oeuvre ont par pas plus pour que quel quelle quelles quels qui sans ses soi sommes son sont suis sur surtout tes the toi ton une vers via vos votre vous'.split(' ');\n" +
        "  \n" +
        "  var nameTokens = doc.name.toLowerCase().replace(escapedChars, function(char) {return charmap[char];}).split(/\\s+/).filter(function(t) {return t.length > 2 && stopWords.indexOf(t) === -1;});\n" +
        "  var descTokens = doc.description ? doc.description.toLowerCase().replace(escapedChars, function(char) {return charmap[char];}).split(/\\s+/).filter(function(t) { return t.length > 2 && stopWords.indexOf(t) === -1;}) : [];\n" +
        "  var addrTokens = doc.address ? doc.address.toLowerCase().replace(escapedChars, function(char) {return charmap[char];}).split(/\\s+/).filter(function(t) {return t.length > 2 && stopWords.indexOf(t) === -1;}) : [];\n" +
        "  var allTokens = nameTokens.concat(descTokens).concat(addrTokens).join(';');\n" +
        "  \n" +
        "  for(var i in nameTokens) {\n" +
        "    emit(nameTokens[i], allTokens);\n" +
        "  }\n" +
        "  \n" +
        "  for(var k in descTokens) {\n" +
        "    emit(descTokens[k], allTokens);\n" +
        "  }  \n" +
        "    \n" +
        "  for(var j in addrTokens) {\n" +
        "    emit(addrTokens[j], allTokens);\n" +
        "  }  \n" +
        "}"
      }
    }
  };

  let lookupDoc = {
    _id: LOOKUP_DOC,
    views: {
      by_author: {
        map: "function (doc) {\n" +
        "  if(doc.author) {\n" +
        "    emit(doc.author, null);  \n" +
        "  }\n" +
        "}"
      }
    }
  };

  return db.get(SEARCH_DOC).then(() => {
    console.log('search doc present');
    return searchNodes('xxx', SCOPE_ALL);
  }).catch((err) => {
    console.log('search doc missing');
    return db.put(searchDoc).then(() => {
      console.log('search doc added');
      return searchNodes('xxx', SCOPE_ALL);
    }).catch((err) => {
      console.log("local search doc error : " + JSON.stringify(err));
    });
  }).then(() => {
    db.get(LOOKUP_DOC).then(() => {
      console.log('lookup doc present');
      return lookUpNodes('xxx');
    }).catch((err) => {
      console.log('lookup doc missing');
      return db.put(lookupDoc).then(() => {
        console.log('lookup doc added');
        return lookUpNodes('xxx');
      }).catch((err) => {
        console.log("lookup doc error : " + JSON.stringify(err));
      });
    });
  });

  function getLocalDb(dbName) {
    return new PouchDB(dbName);
  }

  function lookUpNodes(email) {
    console.time('look up author');
    return db.query(LOOKUP_BY_EMAIL, {
      keys: [email]
    }).then((results) => {
      console.timeEnd('look up author');
      return {
        results: results.rows
      };
    }).catch(function (err) {
      console.log('lookup error for email ' + email + ' : ' + JSON.stringify(err));
    });
  }

  function searchNodes(query, scope) {
    let tokens = tokenize(normalize(query));

    console.time('search-query');
    let results = [];
    return Promise.all(tokens.map((term) => {
      return searchTerm(term);
    })).then((allResults) => {
      console.timeEnd('search-query');
      console.time('search-filter');
      let matches = deDup(allResults.map((r) => r['results']).reduce((a, b) => a.concat(b), []));
      results = matches
        .filter((result) => {
          return tokens.every((t) => result.value.indexOf(t) !== -1)
        })
        .map((result) => result.id);
      console.timeEnd('search-filter');
      console.time('search-results');
      return db.allDocs({keys: results, include_docs: true, attachments: true});
    }).then((queryResults) => {
      console.timeEnd('search-results');
      return queryResults.rows.map((row) => {return row.doc;})
        .filter((doc) => {return (scope == SCOPE_ALL || doc.scope == scope);});
    }).catch(function (err) {
      console.log('search error : ' + JSON.stringify(err));
    });
  }

  function deDup(arr) {
    let arrObject = {};
    for(let i = 0; i < arr.length; i++) {
      arrObject[arr[i].id] = arr[i];
    }
    return Object.keys(arrObject).map((k) => {return arrObject[k];});
  }

  function searchTerm(term) {
    return db.query(SEARCH_PATH, {
      startkey     : term,
      endkey       : term + '\uffff'
    }).then((results) => {
      return {
        term: term,
        results: results.rows
      };
    }).catch(function (err) {
      console.log('search error for term ' + term + ' : ' + JSON.stringify(err));
    });
  }

  function tokenize(query) {
    return query.split(/\s+/).filter((t) => {return STOPWORDS.indexOf(t) === -1;});
  }

  function normalize(query) {
    if(query) {
      return query.toLowerCase().replace(CHARMAP_REGEX, function(char) {
        return CHARMAP[char];
      });
    }
    return '';
  }
});
