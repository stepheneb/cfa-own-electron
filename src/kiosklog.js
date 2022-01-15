const { app } = require('electron');
const path = require('path');
import { Low, JSONFile } from 'lowdb';
// import { lodash } from 'lodash';

import u from './renderer/modules/utilities.js';

const initialKioskLogState = {
  touch_begins: []
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

kiosklog.save = async () => {
  await logDb.write();
};

kiosklog.reset = async () => {
  logDb.data = {};
  await logDb.write();
  await kiosklog.init();
  return logDb.data;
};
