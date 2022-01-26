/*global ipcRenderer app  */

import u from './modules/utilities.js';

window.app = {};

let admin = {};

const restart = document.getElementById('restart');
const quit = document.getElementById('quit');

const appNameElem = document.getElementById('app-name');
const appVersionElem = document.getElementById('app-version');

// CfA Kiosk id and key-credential settings section

// const cfaSettings = cfaHandshake.querySelector('.settings.section');
const cfaKeyElem = document.getElementById('cfa-key-id');
const enterCfaKey = document.getElementById('enter-cfa-key');
const newCfaKey = document.getElementById('new-cfa-key');
const eraseCfaKey = document.getElementById('erase-cfa-key');

// CfA status section

const cfaStatus = document.querySelector('.status.section');
const workingStatus = cfaStatus.querySelector('.working');
const onlineStatus = cfaStatus.querySelector('.online');
const registeredStatus = cfaStatus.querySelector('.registered');
const credentialStatus = cfaStatus.querySelector('.credential');
const ipAddressStatus = cfaStatus.querySelector('.ipaddress');
const ipAddress = cfaStatus.querySelector('.address');
const messageStatus = cfaStatus.querySelector('.message');

// CfA Autostart Visitor application section

const cfaAutostart = document.querySelector('.autostart.section');
const cfaAutostartShown = getComputedStyle(cfaAutostart).display !== 'none';
const countdownClockEl = cfaAutostart.querySelector('.countdown-clock .indicator');
const autostartEnabled = cfaAutostart.querySelector('input.autostar-enabled');

// CfA handshake section

const cfaHandshake = document.querySelector('.handshake.section');
const cfaHandshakeTest = cfaHandshake.querySelector('button.handshake');
const cfaHandshakeDisclose = cfaHandshake.querySelector('.disclose');
const cfaHandshakeRequest = cfaHandshake.querySelector('.logs .request');
const cfaHandshakeReponse = cfaHandshake.querySelector('.logs .response');

// CfA logged data section

const cfaLogging = document.querySelector('.logging.section');
const cfaLoggingDisclose = cfaLogging.querySelector('.disclose');
const cfaCheckinInterval = cfaLogging.querySelector('.title .checkin-interval');
const cfaNextCheckin = cfaCheckinInterval.querySelector('.next .checkin');
const cfaCurrentInterval = cfaCheckinInterval.querySelector('.current .interval');

const cfaCheckinEnable = cfaCheckinInterval.querySelector('.enable input.checkin');

const formNewInterval = cfaCheckinInterval.querySelector('.new form.interval');
const inputNewInterval = cfaCheckinInterval.querySelector('.new input.interval');

const cfaLoggingReloadBtn = cfaLogging.querySelector('button.reload');
const cfaCheckIn = cfaLogging.querySelector('button.check-in');
const cfaSendReport = cfaLogging.querySelector('button.report');
const cfaResendFailedRequestsBtn = cfaLogging.querySelector('button.resend');
const failedRequestCountSpan = cfaResendFailedRequestsBtn.querySelector('span.count')
const eraseCfaLogging = cfaLogging.querySelector('button.erase');

const cfaLoggingResponse = cfaLogging.querySelector('.logs pre.log');

// CfA Debugging section

const cfaDebugging = document.querySelector('.debugging.section');
const startoverDisabled = cfaDebugging.querySelector('input.startover-disabled');

// Main ...

let failedRequestCount;

let firstPageRender = true;
let kioskStateReceived = false;
let kioskLogStateReceived = false;
let kioskStatusReceived = false;

// Start everything off by letting the NodeJS
// main process know when the page is ready.

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.invoke('pageready');
  firstPageRender = true;
});

// Listeners for updates from main NodeJS process

// Listener: kioskStateUpdate
window.api.kioskStateUpdate((kioskState) => {
  console.log(u.printableJSON(kioskState));
  app.kioskState = kioskState;
  kioskStateReceived = true;
  if (kioskStateReceived && kioskLogStateReceived && kioskStatusReceived) {
    updateView();
  }
});

// Listener: kioskLogStateUpdate
window.api.kioskLogStateUpdate((kioskLogState) => {
  console.log(u.printableJSON(kioskLogState));
  app.kioskLogState = kioskLogState;
  kioskLogStateReceived = true;
  if (kioskStateReceived && kioskLogStateReceived && kioskStatusReceived) {
    updateView();
  }
});

// Listener: kioskStatusUpdate
// Communications Status update
window.api.kioskStatusUpdate((kioskStatus) => {
  console.log(u.printableJSON(kioskStatus));
  app.kioskStatus = kioskStatus;
  kioskStatusReceived = true;
  if (kioskStateReceived && kioskLogStateReceived && kioskStatusReceived) {
    showHandshakeResults();
    updateView();
    // }
  }
});

// Listener: checkinTimerTick
// Checkin Interval countdown clock
window.api.checkinTimerTick((countdown) => {
  cfaNextCheckin.innerText = u.secondsToHHMMSS(countdown);
});

// View

const updateView = () => {
  appNameElem.innerText = app.kioskState.appName;
  appVersionElem.innerText = app.kioskState.appVersion;

  // CfA Kiosk id and key-credential

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

  // View: Autostart Visitor application

  autostartEnabled.checked = app.kioskState.autostart_visitor;
  if (firstPageRender && cfaAutostartShown) {
    startAutostartCounddownClock();
  }

  // View: CfA status

  if (app.kioskState.working) {
    workingStatus.classList.remove('false');
  } else {
    workingStatus.classList.add('false');
    stopAutoStart();
  }

  if (app.kioskState.online) {
    onlineStatus.classList.remove('false');
  } else {
    onlineStatus.classList.add('false');
  }

  if (app.kioskState.cfa_registered) {
    registeredStatus.classList.remove('false');
  } else {
    registeredStatus.classList.add('false');
  }

  if (app.kioskState.cfa_credential_valid) {
    credentialStatus.classList.remove('false');
  } else {
    credentialStatus.classList.add('false');
  }

  if (app.kioskState.cfa_ip_address_valid) {
    ipAddressStatus.classList.remove('false');
  } else {
    ipAddressStatus.classList.add('false');
  }
  ipAddress.innerText = app.kioskState.ip_address;

  if (app.kioskStatus.code == 200) {
    messageStatus.innerText = '';
  } else {
    messageStatus.innerText = `Error: ${app.kioskStatus.code} ${app.kioskStatus.message}`;
  }

  // View: Scheduled Check-in enabled

  cfaCheckinEnable.checked = app.kioskState.checkin_interval_enabled;

  // View: Debugging visitor application, disable timeout startover

  startoverDisabled.checked = app.kioskState.startover_disabled;

  // View: Handshake

  // View: Handshake
  if (firstPageRender) {
    cfaHandshake.classList.remove('show');
  }

  // View: CfA Visitor Logs

  cfaLoggingResponse.innerText = JSON.stringify(app.kioskLogState, null, '  ');
  failedRequestCount = app.kioskLogState.failed_cfa_requests.length;
  if (failedRequestCount > 0) {
    cfaResendFailedRequestsBtn.disabled = false;
    failedRequestCountSpan.innerText = app.kioskLogState.failed_cfa_requests.length;
  } else {
    cfaResendFailedRequestsBtn.disabled = true;
    failedRequestCountSpan.innerText = ' ';
  }

  cfaCurrentInterval.innerText = u.minutesToHHMM(app.kioskState.checkin_interval);

  if (!cfaCheckinEnable.checked) {
    cfaNextCheckin.innerText = '...';
  }

  inputNewInterval.value = app.kioskState.checkin_interval;

  firstPageRender = false;
};

//
// Controller
//

cfaLoggingDisclose.addEventListener('click', () => {
  cfaLogging.classList.toggle('show');
  cfaLoggingDisclose.classList.toggle('expanded');
})
// Controller: Automatic Vistor Startup button toggled

if (cfaAutostartShown) {
  autostartEnabled.addEventListener('change', () => {
    let obj = { "update-autostart-visitor": autostartEnabled.checked };
    ipcRenderer.invoke('update-autostart-visitor', obj);
  });
}

// Controller: Automatic Check-in checkbox toggled

cfaCheckinEnable.addEventListener('change', () => {
  let obj = { "update-checkin-enabled": cfaCheckinEnable.checked };
  ipcRenderer.invoke('update-checkin-enabled', obj);
});

// Controller: Visitor Timeout Startover checkbox toggled

startoverDisabled.addEventListener('change', () => {
  let obj = { "update-startover-disabled": startoverDisabled.checked };
  ipcRenderer.invoke('update-startover-disabled', obj);
});

// Controller: App Restart button clicked

restart.addEventListener('click', () => {
  console.log("admin:restart button pressed.");
  ipcRenderer.send('restart');
});

// Controller: App Quit button clicked

quit.addEventListener('click', () => {
  console.log("admin:quit button pressed.");
  ipcRenderer.send('quit');
});

// Controller: Logging Reload button clicked

cfaLoggingReloadBtn.addEventListener('click', () => {
  ipcRenderer.invoke('getKioskLogState');
});

// Controller: Settings:  New CfA Key submitted

formNewInterval.onsubmit = async () => {
  if (formNewInterval.reportValidity()) {
    let obj = { "new-checkin-interval": inputNewInterval.value };
    ipcRenderer.invoke('new-checkin-interval', obj);
  }
};

// Controller: Settings:  New CfA Key submitted

enterCfaKey.onsubmit = async () => {
  if (enterCfaKey.reportValidity()) {
    let obj = { "new-cfa-key": newCfaKey.value };
    ipcRenderer.invoke('new-cfa-key', obj);
  }
};

// Controller: Settings:  Erase CfA Key button clicked

eraseCfaKey.addEventListener('click', () => {
  let obj = { "new-cfa-key": null };
  ipcRenderer.invoke('new-cfa-key', obj);
});

// Controller: Handshake: Test button clicked

cfaHandshakeTest.addEventListener('click', () => {
  ipcRenderer.invoke('handshake');
});

// Controller: Handshake: Disclose control clicked

cfaHandshakeDisclose.addEventListener('click', () => {
  cfaHandshake.classList.toggle('show');
  cfaHandshakeDisclose.classList.toggle('expanded');
})

// Controller: CfA Check-in request ...

cfaCheckIn.addEventListener('click', () => {
  ipcRenderer.invoke('checkin').then((results) => {
    console.log(u.printableJSON(results));
  });
})

// Controller: CfA Check-in Report request ...

cfaSendReport.addEventListener('click', () => {
  ipcRenderer.invoke('checkin-report').then((result) => {
    console.log(u.printableJSON(result));
  });
})

// Controller: Resend Failed Requests

cfaResendFailedRequestsBtn.addEventListener('click', () => {
  ipcRenderer.invoke('sendFailedRequests').then((results) => {
    console.log(u.printableJSON(results));
  });
})

// Controller: Erase Visitor Logs ...

eraseCfaLogging.addEventListener('click', () => {
  ipcRenderer.invoke('resetKioskLogState');
});

// --------*--------*--------*--------

const showHandshakeResults = () => {
  cfaHandshake.classList.add('show');
  cfaHandshakeDisclose.classList.add('expanded');
  console.log(app.kioskStatus.response);
  if (!app.kioskStatus.success) {
    cfaHandshakeReponse.classList.add('failure');
  } else {
    cfaHandshakeReponse.classList.remove('failure');
  }
  cfaHandshakeRequest.innerText = app.kioskStatus.request;
  delete app.kioskStatus.request;
  cfaHandshakeReponse.innerText = u.printableJSON(app.kioskStatus);
}

const updateOnlineStatus = () => {
  app.online = navigator.onLine;
  if (u.runningInElectron()) {
    let obj = { "online": app.online };
    ipcRenderer.invoke('online-status', obj);
  }
}

// Autostart Visitor application countdown clock

let countdownIntervalId;
let countdownClock = 60;

const pointerMoveHandler = () => {
  window.clearInterval(countdownIntervalId);
  window.removeEventListener('pointermove', pointerMoveHandler);
  countdownClockEl.innerText = 'stopped';
  countdownClockEl.classList.add('disabled');
};

const startAutostartCounddownClock = () => {
  if (app.kioskState.working) {
    countdownIntervalId = window.setInterval(() => {
      countdownClock--;
      if (countdownClock > 0) {
        countdownClockEl.innerText = countdownClock;
      } else {
        stopAutoStart();
        countdownClockEl.innerText = '0';
      }
    }, 1000);
    window.addEventListener('pointermove', pointerMoveHandler);
  } else {
    countdownClockEl.innerText = 'disabled';
    countdownClockEl.classList.add('disabled');
  }
}

const stopAutoStart = () => {
  window.clearInterval(countdownIntervalId);
  window.removeEventListener('pointermove', pointerMoveHandler);
  countdownClockEl.innerText = 'disabled';
  countdownClockEl.classList.add('disabled');

};

const cfaKeyHasValidFormat = () => {
  let cfa_key = app.kioskState.cfa_key;
  if (cfa_key === undefined) return false;
  if (typeof cfa_key !== 'string') return false;
  if (cfa_key.length !== 17) return false;
  return true;
};

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

export default admin;
