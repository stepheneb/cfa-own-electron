/*jshint esversion: 6 */
/*global app  */

// Splash page

import renderMenu from './menu.js';
import u from '../utilities';

let splash = {};

let splashElem = document.getElementById('splash');
let splash2Elem = document.getElementById('splash2');

let ctrlBacktick = () => {
  let html = '';
  if (u.runningInElectron()) {
    html = `
      <div id='ctrl-backtick' class='show'>
        Press control-backtick to open the admin window.
      </div>
    `;
  }
  return html;
};

let renderSplash = () => {
  splashElem.innerHTML = `
      <img src="../images/splash.jpg"></img>
      <div id="splash-center">
        <div class="title-container">
          <div class="title1">${app.splash.title1}</div>
          <div class="title2">${app.splash.title2}</div>
        </div>
        ${ctrlBacktick()}
      </div>
      <div id="splash-footer" class="fixed-bottom d-flex flex-row justify-content-center">
        <div class="ps-1 pe-1">
          <div class="start text align-self-center p-2">${app.splash.begin}</div>
        </div>
      </div>
    `;
  splashElem.style.zIndex = "100";
  splashElem.style.display = "block";
  splashElem.addEventListener('click', () => {
    splashElem.style.display = "none";
    splash2Elem.style.display = "block";
    app.start = false;
  });
};

let renderSplash2 = () => {
  let splash2ContentId = 'splash2-content';
  let splash2ContinueID = 'splash2-continue';
  let splash2ContentHtml = `
      <div id="${splash2ContentId}">
        <div class='title'>${app.splash2.title}</div>
        <div class='intro'>
          <header>${app.splash2.header}</header>
          <p>${app.splash2.intro1}</p>
          <p>${app.splash2.intro2}</p>
        </div>
        <button id="${splash2ContinueID}" type="submit" class="col-3 btn btn-outline-primary btn-small page-navigation-button">
          ${app.splash2.continue}
        </button>
      </div>
      `;

  splash2Elem.innerHTML = `
        <img src="../images/splash2.jpg"></img>
        ${splash2ContentHtml}
      `;

  let splash2ContinueButton = document.getElementById(splash2ContinueID);
  splash2ContinueButton.addEventListener('click', () => {
    splash2Elem.style.display = "none";
    renderMenu.page();
  });
};

splash.render = () => {
  if (!app.splashRendered) {
    renderSplash();
    renderSplash2();
  }
  app.splashRendered = true;
};

splash.hide = () => {
  splashElem.style.display = "none";
  splash2Elem.style.display = "none";
};

splash.show = () => {
  if (app.start) {
    splashElem.style.display = "block";
    splash2Elem.style.display = "none";
  } else {
    splashElem.style.display = "none";
    splash2Elem.style.display = "block";
  }
};

export default splash;
