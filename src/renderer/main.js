/*global app, defaultApp */

import router from './router.js';

import data from './app.json';

window.app = {};
window.defaultApp = {};

let main = {};

main.start = () => {
  let setupNewApp = newApp => {
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
    return newApp;
  };

  Object.assign(defaultApp, setupNewApp(data));
  Object.assign(app, setupNewApp(data));
  app.logger = true;
  router.addHashChangeListener();
  router.route();

};

export default main;
