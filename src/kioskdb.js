const { app } = require('electron');
const path = require('path');
import { Low, JSONFile } from 'lowdb';
import { v4 as uuidv4 } from 'uuid';

import u from './renderer/modules/utilities.js';

const initialKioskState = {
  id: null,
  cfa_key: null,
  startover_disabled: false,
  appName: app.getName(),
  appVersion: app.getVersion(),
  cfa_registered: false,
  cfa_credential_valid: false,
  cfa_ip_address_valid: false,
  ip_address: false,
  online: false,
  working: false,
  autostart_visitor: true,
  checkin_interval: 240,
  last_checkin: false
};

let db = null;

export const kioskdb = {};

const updateWorkingStatus = () => {
  let data = db.data;
  if (data.online &&
    data.cfa_registered &&
    data.cfa_credential_valid &&
    data.cfa_ip_address_valid) {
    data.working = true;
  } else {
    data.working = false;
  }
}

kioskdb.init = async () => {
  let appName = app.getName();
  let appVersion = app.getVersion();

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
        updateWorkingStatus();
        await db.write();
      }
    }
    if (db.data.appName != appName || db.data.appVersion != appVersion) {
      db.data.appName = appName;
      db.data.appVersion = appVersion;
      await db.write();
    }
  };
  await startup();
  return db.data;
};

kioskdb.read = async () => {
  await db.read();
  return db.data;
};

kioskdb.save = async (kioskState = db.data) => {
  db.data = kioskState;
  updateWorkingStatus();
  await db.write();
  return db.data;
};
