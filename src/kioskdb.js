const { app } = require('electron');
const path = require('path');
import { Low, JSONFile } from 'lowdb';
import { v4 as uuidv4 } from 'uuid';

import u from './renderer/modules/utilities.js';

const initialKioskState = {
  id: null,
  cfa_key: null
};

let db = null;

export const kioskdb = {};

kioskdb.init = async () => {
  const kioskJsonDbPath = path.join(app.getPath('userData'), 'cfa.json');
  console.log(kioskJsonDbPath);
  const adapter = new JSONFile(kioskJsonDbPath);
  db = new Low(adapter);

  const startup = async () => {
    await db.read();
    if (db.data == null) {
      db.data = u.deepClone(initialKioskState);
      db.data = {};
      db.data.id = uuidv4();
      await db.write();
    } else {
      let initialKeys = new Set(Object.keys(initialKioskState));
      let existingKeys = new Set(Object.keys(db.data));
      let newKeys = u.setDifference(initialKeys, existingKeys);
      if (newKeys.size > 0) {
        newKeys.forEach((key) => {
          db.data[key] = initialKioskState[key];
        });
        await db.write();
      }
    }
  };

  await startup();
  return db.data;
};

kioskdb.save = async () => {
  await db.write();
};
