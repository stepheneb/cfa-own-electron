// const { app } = require('electron');

// const fs = require("fs");
// const path = require('path');

// import { cfaHandshakePostUrl, cfaCheckInPostUrl, cfaObservationPostUrl, cfaSaveAndSendPostUrl } from '../../../cfa.js';

import axios from 'axios';

import { cfaCheckInPostUrl } from './cfa.js';

export const checkin = {};

checkin.send = async (kioskState, kioskLogState) => {

  // const axiosPost = axios.create({
  //   baseURL: cfaCheckInPostUrl,
  //   method: 'post',
  //   timeout: 1000,
  //   headers: { 'Content-Type': 'multipart/form-data' }
  // });

  let data = {
    kiosk_id: kioskState.id,
    credential: kioskState.cfa_key,
    datetime: new Date().toISOString(),
    report: {
      touch_begins: kioskLogState.touch_begins,
    }
  };
  let result = '';

  axios({
      method: 'post',
      url: cfaCheckInPostUrl,
      headers: { 'Content-Type': 'multipart/form-data' },
      data: data,
      timeout: 500,
      responseType: 'json'
    }).then(response => response.data)
    .then(json => {
      result = JSON.stringify(json, null, '  ');
      console.log(result);
    })
    .catch(error => {
      result = `Request to perform handshake failed: ${error}, the Developer Tools console might have more clues.`;
      console.error(result);
    });

  // axios() {
  //   url: cfaCheckInPostUrl,
  //   method: 'post',
  //   headers: { 'Content-Type': 'multipart/form-data' },
  //   timeout: 500,
  //   data: data
  // }    .then(function (response) {
  //       console.log(response);
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });

  // fetch(cfaCheckInPostUrl, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     },
  //     body: JSON.stringify(request)
  //   })
  //   .then(response => response.json())
  //   .then(json => {
  //     response = JSON.stringify(json, null, '  ');
  //     console.log(response);
  //   })
  //   .catch(error => {
  //     response = `Request to perform handshake failed: ${error}, the Developer Tools console might have more clues.`;
  //     console.error(response);
  //   });
}
