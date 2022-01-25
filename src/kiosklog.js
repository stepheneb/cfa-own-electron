const { app } = require('electron');
const path = require('path');
import { Low, JSONFile } from 'lowdb';
// import { lodash } from 'lodash';

import u from './renderer/modules/utilities.js';
// import { sendCommand, admin } from './main.js';

const initialKioskLogState = {
  touch_begins: [],
  failed_cfa_requests: []
};

let logDb = null;

export const kiosklog = {};

kiosklog.init = async () => {
  const kioskJsonLogPath = path.join(app.getPath('userData'), 'cfalog.json');
  console.log(kioskJsonLogPath);
  const adapter = new JSONFile(kioskJsonLogPath);
  logDb = new Low(adapter);

  const startup = async () => {
    await logDb.read();
    if (logDb.data == null) {
      logDb.data = u.deepClone(initialKioskLogState);
      logDb.data = {};
      await logDb.write();
    } else {
      let initialKeys = new Set(Object.keys(initialKioskLogState));
      let existingKeys = new Set(Object.keys(logDb.data));
      let newKeys = u.setDifference(initialKeys, existingKeys);
      if (newKeys.size > 0) {
        newKeys.forEach((key) => {
          logDb.data[key] = initialKioskLogState[key];
        });
        await logDb.write();
      }
    }
  };
  await startup();
  return logDb.data;
};

kiosklog.read = async () => {
  await logDb.read();
  return logDb.data;
};

kiosklog.save = async (kioskLogState = logDb.data) => {
  logDb.data = kioskLogState;
  await logDb.write();
  return logDb.data;
};

kiosklog.reset = async () => {
  logDb.data = {};
  await logDb.write();
  await kiosklog.init();
  return logDb.data;
};
