import * as registerWorkerPouch from 'worker-pouch/worker';
import PouchDB from 'pouchdb-browser';
import PouchAdapterMemory from 'pouchdb-adapter-memory';

// PouchDB.debug.enable('pouchdb:worker:*');
PouchDB.plugin(PouchAdapterMemory);

function pouchCreator(opts) {
  if(opts.name) {
    let dbParams = opts.name.split('|adapter|');
    if(dbParams.length == 2) {
      opts.name = dbParams[0];
      opts.adapter = dbParams[1];
    }
  }
  return new PouchDB(opts);
}

registerWorkerPouch(self, pouchCreator);
