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
  router.addHashChangeListener();
  router.route();
};

main.restart = () => {
  Object.assign(app, u.deepClone(defaultApp));
  app.splashRendered = true;
  app.logger = true;
  splash.showSplash2();
  router.addHashChangeListener();
  router.route();
};

export default main;
