/*jshint esversion: 8 */

const { app, BrowserWindow, Menu, ipcMain } = require("electron");

const fs = require("fs");

export const isMac = process.platform === "darwin";
export const isWindows = process.platform === "win32";
export const isSource = fs.existsSync("package.json");

import { windowStateKeeper } from './window-state-keeper';
import { kioskdb } from './kioskdb';
import { kiosklog } from './kiosklog';
import { checkin } from './cfa/checkin';
import { scheduler } from './cfa/scheduler';

import { failedRequests } from './cfa/failed-requests';
import { handshake } from './cfa/handshake';

import { images } from './cfa/images';

import { template } from './menu';

// create images dir to save failed Save Image requests for later delivery
images.setup();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, adminWindow, kioskState, kioskLogState, kioskStatusState;

export const admin = process.argv.find((arg) => arg == '--admin') ? true : false;
// export const visitor = process.argv.find((arg) => arg == '--visitor') ? true : false;

let pageready = false;

// Admin or Main page is ready and can handle callbacks

ipcMain.handle('pageready', async () => {
  pageready = true;
  kioskState = await kioskdb.read();
  kioskLogState = await kiosklog.read();
  kioskStatusState = await performHandShake();

  if (admin) {
    sendCommand('kioskStateUpdate', kioskState);
    sendCommand('kioskLogStateUpdate', kioskLogState);
    sendCommand('kioskStatusUpdate', kioskStatusState);
    if (kioskState.checkin_interval_enabled) {
      scheduler.start();
    }
  } else {
    let kiosk = {
      kioskState: kioskState,
      kioskLogState: kioskLogState,
      kioskStatusState: kioskStatusState
    }
    sendCommand('kioskUpdate', kiosk);
    if (kioskState.checkin_interval_enabled) {
      scheduler.start();
    }
  }
});

export const sendCommand = (cmd, msg) => {
  if (pageready) {
    if (admin) {
      adminWindow.webContents.send(cmd, msg);
    } else {
      mainWindow.webContents.send(cmd, msg);
    }
  }
};

/**
 * createMainWindow - Description
 *
 * @return {type} Description
 */

const createMainWindow = async () => {
  const mainWindowStateKeeper = await windowStateKeeper('main');

  // Create the browser window.
  //
  // when kiosk mode is true can't exit application
  //     kiosk: true,
  //     frame: false,

  mainWindow = new BrowserWindow({
    title: "main",
    x: mainWindowStateKeeper.x,
    y: mainWindowStateKeeper.y,
    width: mainWindowStateKeeper.width,
    height: mainWindowStateKeeper.height,
    menuBarVisible: true,
    autoHideMenuBar: false,
    fullscreen: true,
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindowStateKeeper.track(mainWindow);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools if app is not packaged.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    supportFullScreenEnter();
  });

  mainWindow.on("enter-full-screen", () => {
    supportFullScreenEnter();
  });

  mainWindow.on("leave-full-screen", () => {
    supportFullScreenLeave();
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

const createAdminWindow = async () => {
  const adminWindowStateKeeper = await windowStateKeeper('admin');
  adminWindow = new BrowserWindow({
    title: "main",
    x: adminWindowStateKeeper.x,
    y: adminWindowStateKeeper.y,
    width: adminWindowStateKeeper.width,
    height: adminWindowStateKeeper.height,
    webPreferences: {
      preload: ADMIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      allowRunningInsecureContent: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: true
    }
  });
  adminWindowStateKeeper.track(adminWindow);

  // and load the index.html of the app.
  adminWindow.loadURL(ADMIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools if app is not packaged.
  if (!app.isPackaged) {
    adminWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  adminWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    adminWindow = null;
  });
};

// https://github.com/electron/electron/blob/main/docs/api/app.md#apprequestsingleinstancelock
const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();

} else {

  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (admin) {
      if (adminWindow) {
        if (adminWindow.isMinimized()) adminWindow.restore();
        adminWindow.focus();
      }
    } else {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", () => {
    if (admin) {
      createAdminWindow();
    } else {
      createMainWindow();
    }
    kioskdb.init();
    kiosklog.init();
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (admin) {
    if (adminWindow === null) {
      createAdminWindow();
    }
  } else {
    if (mainWindow === null) {
      createMainWindow();
    }
  }
});

const argsRemoveAdmin = () => {
  let args = Array.from(process.argv.slice(1));
  let index = args.findIndex((item) => item == '--admin');
  if (index >= 0) {
    args.splice(index, 1);
  }
  return args;
};

const argsAddAdmin = () => {
  return process.argv.slice(1).concat(['--admin']);
};

if (admin) {
  ipcMain.on('restart', () => {
    scheduler.stop();
    app.relaunch({ args: argsRemoveAdmin() });
    app.exit(0);
  });
  ipcMain.on('quit', () => {
    scheduler.stop();
    app.quit();
  });
} else {
  ipcMain.on('ctrl-backtic', () => {
    scheduler.stop();
    mainWindow.setFullScreen(false);
    supportFullScreenLeave();
    app.relaunch({ args: argsAddAdmin() });
    app.quit(0);
  });
}

// ask to be sent kiosk states

ipcMain.handle('getKioskState', async () => {
  kioskState = await kioskdb.read();
  sendCommand('kioskStateUpdate', kioskState);
});

ipcMain.handle('getKioskLogState', async () => {
  kioskLogState = await kiosklog.read();
  sendCommand('kioskLogStateUpdate', kioskLogState);
});

// Save new cfa_key (credential)

ipcMain.handle('new-cfa-key', async (e, obj) => {
  kioskState.cfa_key = obj['new-cfa-key'];
  kioskState = await kioskdb.save(kioskState);

  kioskStatusState = await performHandShake();
  sendCommand('kioskStatusUpdate', kioskStatusState);

  kioskState = await kioskdb.read();
  sendCommand('kioskStateUpdate', kioskState);
});

// save enable/disable automatic admin window visitor startup after 60s

ipcMain.handle('update-autostart-visitor', async (e, obj) => {
  kioskState.autostart_visitor = obj['update-autostart-visitor'];
  await kioskdb.save(kioskState);
  sendCommand('kioskStateUpdate', kioskState);
});

// save disable/enable automatic visitor timeout startover flag

ipcMain.handle('update-startover-disabled', async (e, obj) => {
  kioskState.startover_disabled = obj['update-startover-disabled'];
  await kioskdb.save(kioskState);
  sendCommand('kioskStateUpdate', kioskState);
});

// Logging ...

// Save new new-checkin-interval

ipcMain.handle('new-checkin-interval', async (e, obj) => {
  let checkin_interval = parseInt(obj['new-checkin-interval']);
  if (Number.isInteger(checkin_interval)) {
    kioskState.checkin_interval = checkin_interval
    kioskState = await kioskdb.save(kioskState);
    sendCommand('kioskStateUpdate', kioskState);
  }
  finishWithHandshake();
});

ipcMain.handle('update-checkin-enabled', async (e, obj) => {
  kioskState.checkin_interval_enabled = obj['update-checkin-enabled'];
  await kioskdb.save(kioskState);
  if (kioskState.checkin_interval_enabled) {
    scheduler.start();
  } else {
    scheduler.stop();
  }
  sendCommand('kioskStateUpdate', kioskState);
  finishWithHandshake();
});

ipcMain.handle('resetKioskLogState', async () => {
  images.eraseAll();
  kioskLogState = await kiosklog.reset();
  sendCommand('kioskLogStateUpdate', kioskLogState);
});

// Called only from Visitor Application
// ***FIX***

ipcMain.handle('log-touch_begin', async (e, obj) => {
  kioskLogState = await kiosklog.read();
  let datetime = obj['touch_begin'];
  kioskLogState.touch_begins.push(datetime);
  await kiosklog.save(kioskLogState);
  return kioskLogState;
});

// Called only from Visitor Application
// Log failed CfA POST requests for later delivery ...
// ***FIX***

ipcMain.handle('log_failed_cfa_request', async (e, obj) => {
  kioskLogState = await kiosklog.read();
  let failedRequest = obj['failed_cfa_request'];
  if (failedRequest.kind == 'save-and-send') {
    const imageBase64Path = images.save(failedRequest.body.imageFilename, failedRequest.body.img_data);
    delete failedRequest.body.img_data;
    failedRequest.body.imageBase64Path = imageBase64Path;
  }
  kioskLogState.failed_cfa_requests.push(failedRequest);
  await kiosklog.save(kioskLogState);
  return kioskLogState;
});

// Send CfA Check-in requests ...

ipcMain.handle('checkin', async () => {
  let results = await checkin.sendBoth();
  kioskState = await kioskdb.read();
  kioskLogState = await kiosklog.read();
  sendCommand('kioskLogStateUpdate', kioskLogState);
  finishWithHandshake();
  return {
    name: 'checkin-both',
    results: results
  }
});

// Perform CfA Check-in Report request ...

ipcMain.handle('checkin-report', async () => {
  kioskState = await kioskdb.read();
  kioskLogState = await kiosklog.read();
  let result = await checkin.sendReport(kioskState, kioskLogState);
  kioskLogState = await kiosklog.read();
  sendCommand('kioskLogStateUpdate', kioskLogState);
  return result;
});

// Send CfA Resend Failed POST Requests ...

ipcMain.handle('sendFailedRequests', async () => {
  kioskState = await kioskdb.read();
  kioskLogState = await kiosklog.read();
  let results = await failedRequests.send(kioskState, kioskLogState);
  kioskLogState = await kiosklog.read();
  sendCommand('kioskLogStateUpdate', kioskLogState);
  return results;
});

// Perform CfA Handshake request ...

ipcMain.handle('handshake', async () => {
  kioskLogState = await kiosklog.read();
  kioskStatusState = await performHandShake();
  kioskState = await kioskdb.read();
  if (admin) {
    kioskStatusState = await performHandShake();
    kioskState = await kioskdb.read();
    sendCommand('kioskStatusUpdate', kioskStatusState);
    sendCommand('kioskStateUpdate', kioskState);
  } else {
    kioskLogState = await kiosklog.read();
    kioskStatusState = await performHandShake();
    let kiosk = {
      kioskState: kioskState,
      kioskLogState: kioskLogState,
      kioskStatusState: kioskStatusState
    }
    kioskStatusState = await performHandShake();
    sendCommand('kioskUpdate', kiosk);
  }
});

// Update online status ... send from renderer process: navigator.onLine change.

ipcMain.handle('online-status', async (e, obj) => {
  let online = obj['online'];
  kioskState = await kioskdb.read();
  kioskState.online = online;
  await kioskdb.save(kioskState);
  if (admin) {
    sendCommand('kioskStateUpdate', kioskState);
  } else {
    kioskLogState = await kiosklog.read();
    kioskStatusState = await performHandShake();
    let kiosk = {
      kioskState: kioskState,
      kioskLogState: kioskLogState,
      kioskStatusState: kioskStatusState
    }
    sendCommand('kioskUpdate', kiosk);
  }
});

// ----------------------------

export const finishWithHandshake = async () => {
  let kioskStatusState = await performHandShake();
  if (admin) {
    sendCommand('kioskStatusUpdate', kioskStatusState);
  } else {
    sendCommand('webConsoleLog', kioskStatusState);
  }
}

const performHandShake = async () => {
  let kioskState = await kioskdb.read();
  let status = await handshake.query(kioskState);
  if (status.success) {
    kioskState.cfa_registered = true;
    kioskState.cfa_credential_valid = true;
    kioskState.ip_address = status.ip_address;
    kioskState.cfa_ip_address_valid = true;
    kioskState.online = true;
    kioskState.cfa_database_error = false;
  } else {
    switch (status.code) {
    case 0:
      kioskState.online = false;
      kioskState.cfa_database_error = false;
      break;

    case 402: // Kiosk Not Registered
      kioskState.cfa_registered = false;
      kioskState.cfa_database_error = false;
      break;

    case 403: // Credential Invalid
      kioskState.cfa_credential_valid = false;
      kioskState.cfa_database_error = false;
      break;

    case 404: // IP Address Changed
      kioskState.cfa_registered = true;
      kioskState.cfa_credential_valid = true;
      kioskState.cfa_ip_address_valid = false;
      kioskState.cfa_database_error = false;
      break;

    case 405: // Credential Failed
      kioskState.cfa_registered = true;
      kioskState.cfa_credential_valid = true;
      kioskState.cfa_ip_address_valid = false;
      kioskState.cfa_database_error = true;
      break;

    case 400:
    case 406:
      kioskState.cfa_unknown_error = true;
      break;

    case 600: // CfA Server Error
      kioskState.cfa_database_error = true;
      break;
    }
  }
  kioskState = await kioskdb.save(kioskState);
  return status;
}

const supportFullScreenEnter = () => {
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.setMenuBarVisibility(false);
  if (isWindows) {
    if (typeof mainWindow.setSkipTaskBar == 'function') {
      mainWindow.setSkipTaskBar(true);
    }
    Menu.setApplicationMenu(null);
  }
};

const supportFullScreenLeave = () => {
  mainWindow.setAutoHideMenuBar(false);
  mainWindow.setMenuBarVisibility(true);
  if (isWindows) {
    if (typeof mainWindow.setSkipTaskBar == 'function') {
      mainWindow.setSkipTaskBar(false);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
};
