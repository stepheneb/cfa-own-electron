const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld("ELECTRON", true);
contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);

contextBridge.exposeInMainWorld("api", {
  logDataUpdate: (fn) => {
    ipcRenderer.on("logDataUpdate", (event, ...args) => fn(...args));
  }
});
