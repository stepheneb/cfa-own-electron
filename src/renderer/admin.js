/*global ipcRenderer app  */

import u from './modules/utilities.js';

window.app = {};

let admin = {};

const restart = document.getElementById('restart');
const quit = document.getElementById('quit');
const cfa_key_elem = document.getElementById('cfa-key-id');

const enterCfaKey = document.getElementById('enter-cfa-key');
const newCfaKey = document.getElementById('new-cfa-key');

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
    app.kioskState = kioskState;
    let kiosk_elem = document.getElementById('kiosk-id');
    kiosk_elem.innerText = kioskState.id;
    if (kioskState.cfa_key) {
      cfa_key_elem.innerText = kioskState.cfa_key;
    } else {
      cfa_key_elem.innerText = 'not set';
    }
  });

  enterCfaKey.onsubmit = async () => {
    let obj = { "new-cfa-key": newCfaKey.value };
    ipcRenderer.invoke('new-cfa-key', obj).then((kioskState) => {
      app.kioskState = kioskState;
    });
  };
}

export default admin;
