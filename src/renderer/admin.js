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
    let kiosk_elem = document.getElementById('kiosk-id');
    kiosk_elem.innerText = kioskState.id;
    let cfa_key_elem = document.getElementById('cfa-key-id');
    if (kioskState.cfa_key) {
      cfa_key_elem.innerText = kioskState.cfa_key;
    } {
      cfa_key_elem.innerText = 'not set';
    }
  });
}

export default admin;
