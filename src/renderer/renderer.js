/*jshint esversion: 6 */
/*global ipcRenderer  */

/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import u from './modules/utilities';

import 'platform';

import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

import 'simple-keyboard/build/css/index.css';

import './sass/main';

import main from './main.js';

main.start();

console.log('👋 This message is being logged by "renderer.js", included via webpack');

if (u.runningInElectron()) {
  document.addEventListener("keydown", function (event) {

    if (event.ctrlKey && event.keyCode == 192) {
      event.stopPropagation();
      event.preventDefault();
      console.log("control + backtic was pressed.");
      ipcRenderer.send('ctrl-backtic');
    }
  });
}
