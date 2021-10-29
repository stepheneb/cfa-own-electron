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

  const cfaKeyHasValidFormat = () => {
    let cfa_key = app.kioskState.cfa_key;
    if (cfa_key === undefined) return false;
    if (typeof cfa_key !== 'string') return false;
    if (cfa_key.length !== 17) return false;
    return true;
  };

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
    if (cfaKeyHasValidFormat()) {
      testCfaHandshake.disabled = false;
    }
  });

  enterCfaKey.onsubmit = async () => {
    let obj = { "new-cfa-key": newCfaKey.value };
    ipcRenderer.invoke('new-cfa-key', obj).then((kioskState) => {
      app.kioskState = kioskState;
    });
    if (cfaKeyHasValidFormat()) {
      testCfaHandshake.disabled = false;
    }
  };

  const testCfaHandshake = document.getElementById('test-cfa-handshake');

  testCfaHandshake.addEventListener('click', () => {
    const cfaHandshakePostUrl = "https://waps.cfa.harvard.edu/microobservatory/own_kiosk/api/v1/handshake/handshake.php";
    const cfaHandshakeRequest = document.querySelector('#cfa-handshake-status .request');
    const cfaHandshakeReponse = document.querySelector('#cfa-handshake-status .response');

    let request = {
      kiosk_id: app.kioskState.id,
      credential: app.kioskState.cfa_key
    };
    let response = '';

    cfaHandshakeRequest.innerText = JSON.stringify(request, null, '  ');
    cfaHandshakeReponse.innerText = response;

    fetch(cfaHandshakePostUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: JSON.stringify(request)
      })
      .then(response => response.json())
      .then(json => {
        response = JSON.stringify(json, null, '  ');
        console.log(response);
        cfaHandshakeReponse.innerText = response;
      })
      .catch(error => {
        response = `Request to send image failed: ${error}.\nThe Developer Tools console might have more clues.`;
        console.error(response);
        cfaHandshakeReponse.innerText = response;
      });
  });
}

export default admin;
