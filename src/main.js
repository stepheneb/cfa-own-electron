/*jshint esversion: 8 */

debugger;

const { app, BrowserWindow, Menu, ipcMain } = require("electron");

const fs = require("fs");

export const isMac = process.platform === "darwin";
export const isWindows = process.platform === "win32";
export const isSource = fs.existsSync("package.json");

import { windowStateKeeper } from './window-state-keeper';

import { template } from './menu';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, adminWindow;

const admin = process.argv.find((arg) => arg == '--admin') ? true : false;

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  if (admin) {
    createAdminWindow();
  } else {
    createMainWindow();
  }
});

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
    app.relaunch({ args: argsRemoveAdmin() });
    app.exit(0);
  });
} else {
  ipcMain.on('ctrl-backtic', () => {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      supportFullScreenLeave();
      app.relaunch({ args: argsAddAdmin() });
      app.quit(0);
    }
  });
}
