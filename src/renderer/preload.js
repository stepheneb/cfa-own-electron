const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld("ELECTRON", true);
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);
