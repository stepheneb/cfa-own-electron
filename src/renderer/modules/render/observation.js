/*jshint esversion: 8 */
/*global app */

import { Modal } from 'bootstrap';
import emailKeyboard from './email-keyboard.js';

import main from '../../main.js';
import { cfaObservationPostUrl } from '../../../cfa.js';
import u from '../utilities.js';
import cfaError from '../cfa-error.js';

let observation = {};

observation.active = (page) => {
  let start = Number.parseInt(page.startdate);
  let end = Number.parseInt(page.enddate);
  let now = u.getMonthDayNow();
  if (app.now) {
    now = Number.parseInt(app.now);
  }
  let visible = false;
  if (start < end) {
    visible = now >= start && now <= end;
  } else {
    visible = (now >= start && now <= 1231) || (now <= end);
  }
  return visible;
};

observation.render = (page, registeredCallbacks) => {
  // let title = "Take your own image tonight";
  let id = "observation";

  let modalId1 = `${id}-modal1`;
  let enterEmailButtonId = `${id}-enter-email-button`;

  let modalId2 = `${id}-modal2`;
  let sendEmailFormId = `${id}-send-email-form`;

  let modalId3 = `${id}-modal3`;

  function aRoboticTelescopeWill() {
    return `A robotic telescope will take your image of the <span class="image-name">${page.title}</span>.`;
  }

  function willTakeYourImageTonight() {
    let tonightStr = "";
    if (page.tonight) {
      tonightStr = " tonight";
    }
    return `MicroObservatory will take your image of the <span class="image-name">${page.title}</span>${tonightStr}.`
  }

  function telescope(wide = true) {
    let label = "MicroObservatory";
    if (wide) {
      label += " Telescope";
    }
    return `
      <div class="image-container telescope">
        <img src='../images/micro-observatory.jpg'>
        <div class='label'>${label}</div>
      </div>
      `;
  }

  function image() {
    return `
      <div class="image-container">
        <img src='../${page.poster}'>
        <div class='label'>${page.title}</div>
      </div>
      `;
  }

  let notRunningInElectron = '';

  if (u.notRunningInElectron()) {
    notRunningInElectron = `
      <p>** Requesting an observation only works in the CfA Kiosk Electron application.</p>
    `;
  }

  let modalHtmls = `
    <div class="modal fade observation" id="${modalId1}" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${modalId1}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId1}-title">${page.category.title}</h5>
            <button id="${modalId1}-button" type="button" class="btn-close" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body one">
            <div class="row">
              <div class="col-left d-flex flex-column justify-content-start">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">${aRoboticTelescopeWill()}</div>
                <div class="context">
                  <p>${page.description}</p>
                  <p>Enter your email to send your telescope observation to yourself.</p>
                </div>
                <div id='column-middle-spacer'></div>
                <button id="${enterEmailButtonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
                  ENTER EMAIL
                </button>
              </div>
              ${image()}
              ${telescope()}
              <div class="about-telescope">
                <div class='title'>MicroObservatory Telescopes</div>
                <p>
                  Built in the 1990s, these five robotic telescopes —
                  from the Center for Astrophysics | Harvard & Smithsonian —
                  allow YOU to take your OWN images of objects in space.
                </p>
                <p>
                  <span class='label'>Location:</span> Arizona, Massachusetts, and Coquimbo, Chille.
                </p>
                <p>
                  Accessible on the Internet at microobservatory.org
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade observation" id="${modalId2}" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${modalId2}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId2}-title">${page.category.title}</h5>
            <button id="${modalId2}-button" type="button" class="btn-close" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body two">
            <div class="row">
              <div class="col-left">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">${willTakeYourImageTonight()}</div>
                <div class="context">
                  <p>${page.description}</p>
                </div>
              </div>
              <div id="enter-email" class="enter-email">
                <form id="${sendEmailFormId}" autocomplete="off">
                  <label for="email">Your Email:</label>
                  <div class='d-flex flex-row justify-content-between align-items-center'>
                    <input id="email" type="email"name="email" value="${app.email}" required minlength="4" maxlength="45" size="30" autocomplete="none"></input>
                    <input id="email-kiosk-id" type="hidden" name='kiosk_id' value="${app.kiosk_id}"></input>
                    <input id="email-observation" type="hidden" name='observation' value="${page.title}"></input>
                    <input id="email-date" type="hidden" name='datetime_when_user_made_request_at_kiosk' value="${new Date().toISOString()}"></input>
                    <input id="email-credential" type="hidden" name='credential' value="1114c7c1d689b28d3e21178c47136be21899050022084b856fea4277966f927"></input>
                    <button type="submit" class="btn btn-outline-primary btn-small page-navigation-button" autocomplete="none" disabled>
                      SEND EMAIL
                    </button>
                  </div>
                </form>
                ${emailKeyboard.render(page, sendEmailFormId, registeredCallbacks)}
              </div>
              ${image()}
              ${telescope(false)}
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="modal fade observation" id="${modalId3}" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${modalId3}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId3}-title">${page.category.title}</h5>
            <button id="${modalId3}-button" type="button" class="btn-close" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body three">
            <div class="row">
              <div class="col-left">
                <div class="salutation">Wait and See!</div>
                <div class="about-your-image">${willTakeYourImageTonight()}</div>
                <div class="context">
                  <p>${page.description}</p>
                </div>
              </div>
              <div class="thanks">
                <div class='salutation'>Thank You!</div>
                <div class='details'>
                  We will send your image to <span id="your-email">yourname@website.com</span>
                </div>
                <div class='details micro-observatory'>
                  You can continue to Observe With NASA<br>using the MicroObservatory Telescope Network<br>at microobservatory.com
                </div>
                ${notRunningInElectron}
              </div>
              ${image()}
              ${telescope(false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  registeredCallbacks.push(callback);

  return [modalHtmls, modalId3];

  function callback() {

    let modal1 = document.getElementById(modalId1);
    let modal2 = document.getElementById(modalId2);
    let modal3 = document.getElementById(modalId3);

    let modal1CloseButton = document.getElementById(modalId1 + '-button');
    let modal2CloseButton = document.getElementById(modalId2 + '-button');
    let modal3CloseButton = document.getElementById(modalId3 + '-button');

    let bsModal1 = new Modal(modal1, {});
    let bsModal2 = new Modal(modal2, {});
    let bsModal3 = new Modal(modal3, {});

    let enterEmailButton = document.getElementById(enterEmailButtonId);

    let sendEmailForm = document.getElementById(sendEmailFormId);

    let yourEmail = document.getElementById('your-email');

    let sendEmailButton = sendEmailForm.querySelector('button[type="submit"]');

    modal1.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal2.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal3.addEventListener('show.bs.modal', function () {
      document.body.classList.add('nofadeout');
    });

    modal1.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    modal2.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    modal3.addEventListener('hide.bs.modal', function () {
      document.body.classList.remove('nofadeout');
    });

    modal1.addEventListener('hidePrevented.bs.modal', function () {
      document.body.classList.remove('nofadeout');
      page.returnToPageMenu();
    });

    modal2.addEventListener('hidePrevented.bs.modal', function () {
      document.body.classList.remove('nofadeout');
      page.returnToPageMenu();
    });

    modal3.addEventListener('hidePrevented.bs.modal', function () {
      document.body.classList.remove('nofadeout');
      page.returnToPageMenu();
    });

    bsModal1.show();

    u.addClickAndContextListener('observation', enterEmailButton, () => {
      bsModal1.hide();
      bsModal2.show();
    });

    let handleSubmit = (e) => {
      e.preventDefault();

      let email = document.getElementById('email');
      let touch_begin = main.getTouchBegin();
      let datetime = new Date().toISOString();

      if (u.runningInElectron()) {
        let body = {
          kiosk_id: app.kioskState.id,
          credential: app.kioskState.cfa_key,
          email: email.value,
          observation_name: page.title,
          observation_id: page.id,
          datetime_when_user_made_request_at_kiosk: datetime,
          touch_begin: touch_begin
        };
        fetch(cfaObservationPostUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            body: JSON.stringify(body)
          })
          .then(response => response.json())
          .then(json => {
            console.log(JSON.stringify(json, null, '\t'));
            app.email = email.value;
          })
          .catch(error => {
            console.error(`Request to send image failed: ${error}`);
            cfaError.log('observation', body);
          });
      }

      yourEmail.innerText = email.value;

      bsModal2.hide();
      bsModal3.show();
    }

    sendEmailForm.onsubmit = async (e) => {
      handleSubmit(e);
    };

    u.addClickAndContextListener('observation', sendEmailButton, (e) => {
      handleSubmit(e);
    })

    u.addClickAndContextListener('observation', modal1CloseButton, hideAll);
    u.addClickAndContextListener('observation', modal2CloseButton, hideAll);
    u.addClickAndContextListener('observation', modal3CloseButton, hideAll);

    function hideAll() {
      bsModal1.hide();
      bsModal2.hide();
      bsModal3.hide();
    }

  }
};

export default observation;
