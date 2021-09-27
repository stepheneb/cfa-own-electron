/*global ipcRenderer  */

import u from './modules/utilities.js';

let admin = {};

const restart = document.getElementById('restart');
const quit = document.getElementById('quit');

if (u.runningInElectron()) {
  restart.addEventListener('click', () => {
    console.log("admin:restart button pressed.");
    ipcRenderer.send('restart');
  });

  quit.addEventListener('click', () => {
    console.log("admin:quit button pressed.");
    ipcRenderer.send('quit');
  });

  ipcRenderer.invoke('getKioskState').then((kioskState) => {
    admin.kioskState = kioskState;
    let kiosk_id = document.getElementById('kiosk_id');
    kiosk_id.innerText = kioskState.id;
  });
}

export default admin;
