(()=>{var e={298:e=>{"use strict";e.exports=require("electron")}},r={};function o(t){var n=r[t];if(void 0!==n)return n.exports;var a=r[t]={exports:{}};return e[t](a,a.exports,o),a.exports}(()=>{const{ipcRenderer:e,contextBridge:r}=o(298);r.exposeInMainWorld("ELECTRON",!0),r.exposeInMainWorld("ipcRenderer",e),r.exposeInMainWorld("api",{logDataUpdate:r=>{e.on("logDataUpdate",((e,...o)=>r(...o)))}})})()})();
//# sourceMappingURL=preload.js.map