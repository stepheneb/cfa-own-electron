const { app } = require('electron');
const path = require('path');
import { Low, JSONFile } from 'lowdb';

import { v4 as uuidv4 } from 'uuid';

export const kioskdb = async () => {
  const kioskJsonDbPath = path.join(app.getPath('userData'), 'cfa.json');
  console.log(kioskJsonDbPath);
  const adapter = new JSONFile(kioskJsonDbPath);
  const db = new Low(adapter);

  const startup = async () => {
    await db.read();
    if (db.data == null) {
      db.data = { id: uuidv4() };
      await db.write();
    }
  };

  await startup();

  return db.data;

};
