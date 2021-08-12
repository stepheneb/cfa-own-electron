const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld("ELECTRON", true);

window.ipcRenderer = ipcRenderer;
