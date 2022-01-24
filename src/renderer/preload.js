const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld("ELECTRON", true);
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);

contextBridge.exposeInMainWorld("api", {
  kioskStateUpdate: (fn) => {
    ipcRenderer.on("kioskStateUpdate", (event, ...args) => fn(...args));
  },
  kioskLogStateUpdate: (fn) => {
    ipcRenderer.on("kioskLogStateUpdate", (event, ...args) => fn(...args));
  },
  kioskStatusUpdate: (fn) => {
    ipcRenderer.on("kioskStatusUpdate", (event, ...args) => fn(...args));
  },
  kioskUpdate: (fn) => {
    ipcRenderer.on("kioskUpdate", (event, ...args) => fn(...args));
  }
});
