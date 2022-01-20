/*jshint esversion: 8 */
/*global app  */

import { Modal } from 'bootstrap';
import emailKeyboard from './email-keyboard.js';
import telescopes from './telescopes.js';

import { endpoints } from '../../../cfa/endpoints.js';

import main from '../../main.js';
import u from '../utilities.js';
import cfaError from '../../cfa/error.js';

let saveandsend = {};

saveandsend.render = (page, registeredCallbacks) => {
  let title = "Save + Send";
  let id = "save-and-send";

  let modalId1 = `${id}-modal1`;
  let enterEmailButtonId = `${id}-enter-email-button`;

  let modalId2 = `${id}-modal2`;
  let sendEmailFormId = `${id}-send-email-form`;

  let modalId3 = `${id}-modal3`;

  let saveAndSendButtonId = `${id}-button`;

  let saveAndSendButtonhtml = `
    <button id="${saveAndSendButtonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
      ${title}
    </button>`;

  let theStr = '';
  if (page.the) {
    theStr = 'the ';
  }

  let downloadYourImage = '';

  if (u.notRunningInElectron()) {
    downloadYourImage = `
      <p>** Sending an image only works in the CfA Kiosk Electron application. Try downloading instead.</p>
      <a id="download-image" download="${page.title}" type="button" class="btn btn-success"
        disabled>Download your <span>${page.title}</span> image</a>
      <div id="download-stats" class='stats'></div>
    `;
  }

  function image() {
    return `
      <div class="image-container save-and-send"></div>
    `;
  }

  function saveAndSendText(page) {
    let text, name, key, scope;
    if (page.saveandsendtext1) {
      key = page.image.about.telescopes[0];
      scope = telescopes.find(key);
      name = telescopes.longName(scope);
      text = page.saveandsendtext1 + name + page.saveandsendtext2
    } else {
      text = page.saveandsendtext;
    }
    return text
  }

  let modalHtmls = `
    <div class="modal fade save-and-send" id="${modalId1}" tabindex="-1" aria-labelledby="${modalId1}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId1}-title">${page.category.title}</h5>
          </div>
          <div class="modal-body one">
            <div class="row">
              <div class="col-left d-flex flex-column justify-content-start">
                <div class="salutation">Great Job!</div>
                <div class="about-your-image">
                  Here’s your image of ${theStr}<span class="image-name pe-2"> ${page.image.name}.</span>
                </div>
                <div class="context">
                  <p>${saveAndSendText(page)}</p>
                  <p>Enter your email to send your astrophoto creation to yourself.</p>
                </div>
                <div id='column-middle-spacer'></div>
                <button id="${enterEmailButtonId}" type="button" class="btn btn-outline-primary btn-small page-navigation-button">
                  ENTER EMAIL
                </button>
              </div>
              ${image()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade save-and-send" id="${modalId2}" tabindex="-1" aria-labelledby="${modalId2}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId2}-title">${page.category.title}</h5>
          </div>
          <div class="modal-body two">
            <div class="row">
              <div class="col-left">
                <div class="salutation">Great Job!</div>
                <div class="about-your-image">
                  Here’s your image of ${theStr}<span class="image-name pe-2"> ${page.image.name}.</span>
                </div>
                <div class="context">
                  <p>${saveAndSendText(page)}</p>
                  <p>Enter your email to send your astrophoto creation to yourself.</p>
                </div>
              </div>
              <div id="enter-email" class="enter-email">
                <form id="${sendEmailFormId}" autocomplete="off">
                  <label for="email">Your Email:</label>
                  <div class='d-flex flex-row justify-content-between align-items-center'>
                    <input id="email" type="email"name="email" value="${app.email}" required minlength="4" maxlength="45" size="30" autocomplete="none"></input>
                    <input id="email-kiosk-id" type="hidden" name='kiosk_id' value="${app.kiosk_id}"></input>
                    <input id="email-astronomical-object" type="hidden" name='astronomical-object' value="${page.title}"></input>
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
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="modal fade save-and-send" id="${modalId3}" tabindex="-1" aria-labelledby="${modalId3}-title" aria-hidden="true">
      <div class="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId3}-title">${page.category.title}</h5>
          </div>
          <div class="modal-body three">
            <div class="row">
              <div class="col-left">
                <div class="salutation">Great Job!</div>
                <div class="about-your-image">
                  Here’s your image of ${theStr}<span class="image-name pe-2"> ${page.image.name}.</span>
                </div>
                <div class="context">
                  <p>${saveAndSendText(page)}</p>
                </div>
              </div>
              <div class="thanks">
                <div class='salutation'>Thank You!</div>
                <div class='details'>
                  We will send your image to <span id="your-email">yourname@website.com</span>
                </div>
                <div id='post-request-note' class='post-request-note'>
                  ${downloadYourImage}
                </div>
              </div>
              ${image()}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  registeredCallbacks.push(callback);

  return [saveAndSendButtonhtml, modalHtmls];

  function callback(page) {

    let modal1 = document.getElementById(modalId1);
    let modal2 = document.getElementById(modalId2);
    let modal3 = document.getElementById(modalId3);

    let postRequestNote = document.getElementById('post-request-note');

    // let modal1CloseButton = document.getElementById(modalId1 + '-button');
    // let modal2CloseButton = document.getElementById(modalId2 + '-button');
    // let modal3CloseButton = document.getElementById(modalId3 + '-button');

    let bsModal1 = new Modal(modal1, {});
    let bsModal2 = new Modal(modal2, {});
    let bsModal3 = new Modal(modal3, {});

    let saveAndSendButton = document.getElementById(saveAndSendButtonId);

    let enterEmailButton = document.getElementById(enterEmailButtonId);

    let sendEmailForm = document.getElementById(sendEmailFormId);

    let yourEmail = document.getElementById('your-email');

    let sendEmailButton = sendEmailForm.querySelector('button[type="submit"]');

    u.addClickAndContextListener('saveAndSend', saveAndSendButton, function () {
      bsModal1.show();
      page.canvasImages.renderSaveAndSend();
    });

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

    u.addClickAndContextListener('saveAndSend', enterEmailButton, () => {
      bsModal1.hide();
      bsModal2.show();
    });

    let handleSubmit = (e) => {
      e.preventDefault();

      let generateImageName = (type) => {
        let uuid = u.UUID.generate();
        return `${page.id}-${uuid}.${type}`;
      };

      let email = document.getElementById('email');
      let imageData = page.canvasImages.image.jpgDataUrl;
      let imageFilename = generateImageName('jpg');
      let touch_begin = main.getTouchBegin();
      let datetime = new Date().toISOString();

      if (u.runningInElectron()) {
        let body = {
          credential: app.kioskState.cfa_key,
          email: email.value,
          imageFilename: imageFilename,
          img_data: imageData,
          activity_name: page.title,
          category_name: page.category.title,
          activity_path: `${page.type}/${page.id}`,
          kiosk_id: app.kioskState.id,
          touch_begin: touch_begin,
          datetime_when_user_made_request_at_kiosk: datetime
        };
        fetch(endpoints.cfaSaveAndSendPostUrl, {
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
            postRequestNote.innerText = '';
          })
          .catch(error => {
            console.error(`Request to send image failed: ${error}`);
            cfaError.log('save-and-send', body);
            postRequestNote.innerText = 'Technical issues: possible delay.';
          });
      }

      yourEmail.innerText = email.value;

      bsModal2.hide();
      bsModal3.show();

    }

    sendEmailForm.onsubmit = async (e) => {
      handleSubmit(e);
    };

    u.addClickAndContextListener('saveAndSend', sendEmailButton, (e) => {
      handleSubmit(e);
    })

  }
};

export default saveandsend;
