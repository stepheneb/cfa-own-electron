/*jshint esversion: 8 */

const { app, BrowserWindow, Menu, ipcMain } = require("electron");

const fs = require("fs");

export const isMac = process.platform === "darwin";
export const isWindows = process.platform === "win32";
export const isSource = fs.existsSync("package.json");

import { windowStateKeeper } from './window-state-keeper';

import { appMenu } from './app-menu';

// Menu.setApplicationMenu(appMenu);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

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
  //
  //     frame: false,

  mainWindow = new BrowserWindow({
    title: "main",
    x: mainWindowStateKeeper.x,
    y: mainWindowStateKeeper.y,
    width: mainWindowStateKeeper.width,
    height: mainWindowStateKeeper.height,
    menuBarVisible: true,
    autoHideMenuBar: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });
  mainWindowStateKeeper.track(mainWindow);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools if app is not packaged.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("enter-full-screen", () => {
    mainWindow.setAutoHideMenuBar(true);
    mainWindow.setMenuBarVisibility(false);
    if (isWindows) {
      mainWindow.setSkipTaskBar(true);
      Menu.setApplicationMenu(null);
    }
  });

  mainWindow.on("leave-full-screen", () => {
    mainWindow.setAutoHideMenuBar(false);
    mainWindow.setMenuBarVisibility(true);
    if (isWindows) {
      mainWindow.setSkipTaskBar(false);
      Menu.setApplicationMenu(appMenu);
    }
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createMainWindow();
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
  if (mainWindow === null) {
    createMainWindow();
  }
});

ipcMain.on('ctrl-esc', () => {
  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
    mainWindow.setAutoHideMenuBar(false);
    mainWindow.setMenuBarVisibility(true);
    if (isWindows) {
      mainWindow.setSkipTaskBar(false);
      Menu.setApplicationMenu(appMenu);
    }
  }
});
