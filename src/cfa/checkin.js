// const { app } = require('electron');

// const fs = require("fs");
// const path = require('path');

// import { cfaHandshakePostUrl, cfaCheckInPostUrl, cfaObservationPostUrl, cfaSaveAndSendPostUrl } from '../../../cfa.js';

import axios from 'axios';

import { cfaCheckInPostUrl } from './endpoints.js';

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
  try {
    const response = await axios({
      method: 'post',
      url: cfaCheckInPostUrl,
      headers: { 'Content-Type': 'multipart/form-data' },
      data: data,
      timeout: 500,
      responseType: 'json'
    })
    result = JSON.stringify(response.data, null, '  ');
    return result;
  } catch (error) {
    result = `Request to perform handshake failed: ${error}, the Developer Tools console might have more clues.`;
    console.error(result);
  }
}
