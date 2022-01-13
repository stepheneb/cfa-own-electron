/*global app, defaultApp ipcRenderer */

import router from './router.js';
import splash from './modules/render/splash.js';
import u from './modules/utilities.js';

import data from './app.json';

window.app = {};
window.defaultApp = {};

let main = {};

main.setupNewApp = newApp => {
  newApp.splashRendered = false;
  newApp.pageNum = -1;
  newApp.categories.forEach(category => {
    category.pages.forEach(page => {
      if (category.type !== "observation") {
        if (page.image.selectedSourceNumber == undefined) {
          page.image.selectedSourceNumber = 0;
        }
        if (page.image.selectedMainLayers == undefined) {
          page.image.selectedMainLayers = "100";
        }
        page.image.sources.forEach(source => {
          source.defaultValues = {};
          let keys = ['max', 'min', 'brightness', 'contrast', 'scaling', 'filter'];
          source.defaultValues.keys = keys;
          for (let key of keys) {
            source.defaultValues[key] = source[key];
          }
        });
      }
    });
  });
  newApp.telescopeData.telescopes.forEach(telescope => {
    let description = telescope.description;
    if (Array.isArray(description)) {
      telescope.description = description.join('\n');
    }
  });
  return newApp;
};

main.logTouchBegin = () => {
  let datetime = main.getTouchBegin();
  if (u.runningInElectron()) {
    let obj = { "touch_begin": datetime };
    ipcRenderer.invoke('log-touch_begin', obj).then((kioskLogState) => {
      app.kioskLogState = kioskLogState;
    });
  }
}

main.getTouchBegin = () => {
  let datetime = new Date().toISOString();
  if (app.touch_begin) {
    datetime = app.touch_begin;
  } else {
    app.touch_begin = datetime;
  }
  return datetime;
}

let finishMainStart = (kioskState) => {
  Object.assign(defaultApp, main.setupNewApp(u.deepClone(data)));
  Object.assign(app, main.setupNewApp(u.deepClone(data)));
  if (kioskState !== undefined) {
    defaultApp.kioskState = kioskState;
    app.kioskState = kioskState;
  }
  app.logger = true;
  app.email = '';
  app.firstStart = true;
  app.start = true;
  splash.render();
  router.addHashChangeListener();
  setupWindowSizeListener();
  enableCountdownToRestart();
  router.route();
}

main.start = () => {
  if (u.runningInElectron()) {
    ipcRenderer.invoke('getKioskState').then((kioskState) => {
      finishMainStart(kioskState);
    });
  } else {
    finishMainStart();
  }
};

main.restart = () => {
  Object.assign(app, u.deepClone(defaultApp));
  app.logger = true;
  app.email = '';
  app.start = true;
  main.clearContent();
  router.resetHash();
  enableCountdownToRestart();
};

main.startover = () => {
  Object.assign(app, u.deepClone(defaultApp));
  app.logger = true;
  app.email = '';
  app.start = false;
  main.clearContent();
  router.resetHash();
  enableCountdownToRestart();
};

function setupWindowSizeListener() {
  let windowSizeElem = document.getElementById('window-size');
  let status = document.querySelector('p.status');
  let span = windowSizeElem.querySelector('span');
  let width = window.innerWidth;
  let height = window.innerHeight;
  if (width != 1920 || height != 1080) {
    updateWindowSize();
  } else {
    status.classList.remove('correct');
  }

  window.addEventListener('resize', updateWindowSize);

  function updateWindowSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (width == 1920 && height == 1080) {
      status.classList.add('correct');
    } else {
      status.classList.remove('correct');
    }
    span.innerText = `${window.innerWidth} x ${window.innerHeight}`;
    windowSizeElem.classList.remove('changing');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        windowSizeElem.classList.add('changing');
      });
    });
  }
}

main.clearContent = () => {
  let body = document.body;
  u.removeAllChildren(document.getElementById('content'));
  u.removeElement(document.querySelector('div.modal-backdrop'));
  body.classList.remove('nofadeout', 'modal-open');
  body.removeAttribute('style');
  let ctrlBacktic = document.getElementById('ctrl-backtick');
  if (ctrlBacktic) {
    ctrlBacktic.classList.remove('show');
  }
  app.firstStart = false;

};

let startTime = 0;
let restartDuration = 0;

function enableCountdownToRestart() {
  let startingOverElem = document.getElementById('starting-over');
  let values = startingOverElem.querySelector('span.values');
  if (u.runningInElectron() && !app.kioskState.startover_disabled) {
    startTime = performance.now();
    restartDuration = app.defaultRestartDuration;
    let currentDuration = 0;
    let timeRemaining = restartDuration;
    setInterval(function () {
      currentDuration = (performance.now() - startTime) / 1000;
      timeRemaining = Math.ceil(restartDuration - currentDuration);
      console.log(`startover: ${timeRemaining}`);
      if (timeRemaining < 16) {
        startingOverElem.classList.add('changing');
        values.innerText = Math.round(timeRemaining);
      }
      if (currentDuration > restartDuration) {
        currentDuration = 0;
        startingOverElem.classList.remove('changing');
        values.innerText = '';
        main.restart();
      }
    }, 1000);
    window.addEventListener('pointermove', () => {
      startTime = performance.now();
      startingOverElem.classList.remove('changing');
      values.innerText = '';
    });
  }
}

export default main;
