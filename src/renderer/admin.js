/*global ipcRenderer app  */

import { cfaHandshakePostUrl } from '../cfa/endpoints.js';

import u from './modules/utilities.js';

window.app = {};

let admin = {};

const restart = document.getElementById('restart');
const quit = document.getElementById('quit');

const needCfaKey = document.querySelector('#content .need-cfa-key');

const cfaKeyElem = document.getElementById('cfa-key-id');

const enterCfaKey = document.getElementById('enter-cfa-key');
const newCfaKey = document.getElementById('new-cfa-key');

const eraseCfaKey = document.getElementById('erase-cfa-key');
// JXRv3cwNOEnDhz8H8

const eraseCfaLogging = document.getElementById('erase-cfa-logging');

const appNameElem = document.getElementById('app-name');
const appVersionElem = document.getElementById('app-version');

const cfaHandshakeRequest = document.querySelector('#cfa-handshake-status .request');
const cfaHandshakeReponse = document.querySelector('#cfa-handshake-status .response');

const cfaLogging = document.querySelector('#cfa-logging-output .log');

const startoverDisabled = document.getElementById('startover-disabled');

if (u.runningInElectron()) {

  const cfaKeyHasValidFormat = () => {
    let cfa_key = app.kioskState.cfa_key;
    if (cfa_key === undefined) return false;
    if (typeof cfa_key !== 'string') return false;
    if (cfa_key.length !== 17) return false;
    return true;
  };

  const updateView = () => {
    appNameElem.innerText = app.kioskState.appName;
    appVersionElem.innerText = app.kioskState.appVersion;
    let kiosk_elem = document.getElementById('kiosk-id');
    kiosk_elem.innerText = app.kioskState.id;
    if (app.kioskState.cfa_key) {
      cfaKeyElem.innerText = app.kioskState.cfa_key;
    } else {
      cfaKeyElem.innerText = 'not set';
    }
    if (app.kioskState.cfa_key) {
      eraseCfaKey.disabled = false;
    } else {
      eraseCfaKey.disabled = true;
    }
    if (cfaKeyHasValidFormat()) {
      testCfaHandshake.disabled = false;
      needCfaKey.classList.remove('show');
    } else {
      testCfaHandshake.disabled = true;
      needCfaKey.classList.add('show');
    }
    cfaHandshakeRequest.innerText = '';
    cfaHandshakeReponse.innerText = '';
    startoverDisabled.checked = app.kioskState.startover_disabled;
    cfaLogging.innerText = JSON.stringify(app.kioskLogState, null, '  ');
  };

  startoverDisabled.addEventListener('change', () => {
    let obj = { "update-startover-disabled": startoverDisabled.checked };
    ipcRenderer.invoke('update-startover-disabled', obj).then((kioskState) => {
      app.kioskState = kioskState;
      updateView();
    });
  });

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
    updateView();
  });

  ipcRenderer.invoke('getKioskLogState').then((kioskLogState) => {
    app.kioskLogState = kioskLogState;
    updateView();
  });

  enterCfaKey.onsubmit = async () => {
    let obj = { "new-cfa-key": newCfaKey.value };
    ipcRenderer.invoke('new-cfa-key', obj).then((kioskState) => {
      app.kioskState = kioskState;
      updateView();
    });
  };

  eraseCfaKey.addEventListener('click', () => {
    let obj = { "new-cfa-key": null };
    ipcRenderer.invoke('new-cfa-key', obj).then((kioskState) => {
      app.kioskState = kioskState;
      updateView();
    });
  });

  const testCfaHandshake = document.getElementById('test-cfa-handshake');

  testCfaHandshake.addEventListener('click', () => {

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
        response = `Request to perform handshake failed: ${error}, the Developer Tools console might have more clues.`;
        console.error(response);
        cfaHandshakeReponse.innerText = response;
      });
  });

  const cfaCheckIn = document.getElementById('cfa-check-in');

  cfaCheckIn.addEventListener('click', () => {
    ipcRenderer.invoke('checkin').then((result) => {
      console.log(result);
      updateView();
    });
  })

  eraseCfaLogging.addEventListener('click', () => {
    ipcRenderer.invoke('resetKioskLogState').then((kioskLogState) => {
      app.kioskLogState = kioskLogState;
      updateView();
    });
  });

}

export default admin;
