/*jshint esversion: 8 */
/*eslint no-useless-escape: "off"*/

import Keyboard from 'simple-keyboard';
import svg from './svg.js';

let emailKeyboard = {};

emailKeyboard.render = (page, sendEmailFormId, registeredCallbacks) => {
  let emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  let keyboard = null;
  let submitButton = null;

  registeredCallbacks.push(callback);
  return '<div class="simple-keyboard"></div>';

  function callback() {
    let email = document.getElementById('email');
    submitButton = document.getElementById(sendEmailFormId).querySelector('button[type="submit"]');

    keyboard = new Keyboard({
      onChange: input => onChange(input),
      onKeyPress: button => onKeyPress(button),
      useButtonTag: true,
      physicalKeyboardHighlightPress: true
    });

    checkEmail(email.value);

    // function disabledKeys() {
    //   let keys = ['{enter}', '{tab}', '{space}', '(', ')'];
    //   return keys.map((disabledKey) => {
    //     return {
    //       attribute: "disabled",
    //       value: "true",
    //       buttons: `${disabledKey}`
    //     };
    //   });
    // }
    //
    // keyboard.setOptions({
    //   buttonAttributes: disabledKeys()
    // });

    keyboard.setOptions({
      layout: {
        'default': [
          '~ 1 2 3 4 5 6 7 8 9 0 _',
          'q w e r t y u i o p {bksp}',
          'a s d f g h j k l \' @ .com',
          '{shift} z x c v b n m . ? /',
        ],
        'shift': [
          '` ! # $ % ^ & * { } - +',
          'Q W E R T Y U I O P {bksp}',
          'A S D F G H J K L = @ .com',
          '{shift} Z X C V B N M . ? |',
        ]
      },
      display: {
        "{shift}": `${svg.keyboardShift}`,
        "{bksp}": `${svg.keyboardBackspace}`
      },
      buttonTheme: [{
          class: 'dot-com',
          buttons: '.com'
        },
        {
          class: 'special',
          buttons: '{bksp}'
        },
        {
          class: 'special',
          buttons: '{shift}'
        }
      ]
    });

    function checkEmail(input) {
      submitButton.disabled = !emailRegex.test(input);
    }

    // update simple-keyboard when input is changed directly
    document.querySelector("input#email").addEventListener("input", event => {
      checkEmail(event.target.value);
      keyboard.setInput(event.target.value);
    });

    function onChange(input) {
      checkEmail(input);
      document.querySelector("input#email").value = input;
      // console.log("Input changed", input);
    }

    function onKeyPress(button) {
      // console.log("Button pressed", button);
      // handle the shift and caps lock buttons
      if (button === "{shift}" || button === "{lock}") handleShift();
    }

    function handleShift() {
      let currentLayout = keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";

      keyboard.setOptions({
        layoutName: shiftToggle
      });
    }
  }
};

export default emailKeyboard;
