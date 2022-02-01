/*jshint esversion: 6 */
/*global app  */

// Splash page

import renderMenu from './menu.js';

import main from '../../main.js';
import u from '../utilities';

let splash = {};

let splashElem = document.getElementById('splash');
let splash2Elem = document.getElementById('splash2');

let ctrlBacktick = () => {
  let html = '';
  if (u.runningInElectron()) {
    html = `
      <div id='ctrl-backtick' class='show'>
        <p>Press control-backtick to open the admin window.</p>
        <p class='status'></p>
      </div>
    `;
  }
  return html;
};

let renderSplash = () => {
  splashElem.innerHTML = `
      <img id='splash-background-img' src="../images/splash.jpg"></img>
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

  if (u.runningInElectron()) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const ctrlBacktick = document.getElementById('ctrl-backtick');
        const status = ctrlBacktick.querySelector('.status');
        if (!app.kioskState.working) {
          status.classList.add('problem');
          status.innerText = 'CfA Communication: not enabled';
        }
      }, 0);
    });
  }

  u.addClickAndContextListener('splash', splashElem, () => {
    if (u.runningInElectron()) {
      main.logTouchBegin();
    }
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
  u.addClickAndContextListener('splash', splash2ContinueButton, () => {
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
    let backgroundImage = document.getElementById('splash-background-img');
    let shift = (Math.random() * 20 - 10).toFixed() + 'px'
    let scalestr = `transform: scale(1.1) translate(${shift}, ${shift})`;
    // trigger a dom reflow which re-runs the css fadein animation
    splashElem.style = 'animation: none; opacity: 0';
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        splashElem.style = '';
      }, 0);
    });

    backgroundImage.style = scalestr;
    if (app.start) {
      splashElem.style.display = "block";
      splash2Elem.style.display = "none";
    } else {
      splashElem.style.display = "none";
      splash2Elem.style.display = "block";
    }
  } else {
    splashElem.style.display = "none";
    splash2Elem.style.display = "block";
  }
};

export default splash;
