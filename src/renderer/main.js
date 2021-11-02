/*global app, defaultApp */

import router from './router.js';
import splash from './modules/render/splash.js';
import u from './modules/utilities.js';

import data from './app.json';

window.app = {};
window.defaultApp = {};

let main = {};

main.setupNewApp = newApp => {
  newApp.hashRendered = "start";
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

main.start = () => {
  Object.assign(defaultApp, main.setupNewApp(u.deepClone(data)));
  Object.assign(app, main.setupNewApp(u.deepClone(data)));
  app.logger = true;
  app.email = '';
  router.addHashChangeListener();
  setupWindowSizeListener();
  countdownToStartOver();
  router.route();
};

main.restart = () => {
  Object.assign(app, u.deepClone(defaultApp));
  app.splashRendered = true;
  app.logger = true;
  app.email = '';
  splash.showSplash2();
  router.addHashChangeListener();
  countdownToStartOver();
  router.route();
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

let startTime = 0;
let startOverDuration = 0;

function countdownToStartOver() {
  if (u.runningInElectron()) {
    startTime = performance.now();
    startOverDuration = app.defaultStartOverDuration;
    let currentDuration = 0;
    let timeRemaining = startOverDuration;
    setInterval(function () {
      currentDuration = (performance.now() - startTime) / 1000;
      timeRemaining = Math.ceil(startOverDuration - currentDuration);
      console.log(`startover: ${timeRemaining}`);
      if (currentDuration > startOverDuration) {
        currentDuration = 0;
        main.restart();
      }
    }, 1000);
    window.addEventListener('pointermove', () => {
      startTime = performance.now();
    });
  }
}

export default main;
