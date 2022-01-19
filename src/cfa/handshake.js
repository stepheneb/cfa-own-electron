// const { app } = require('electron');

// const fs = require("fs");
// const path = require('path');

// import { cfaHandshakePostUrl, cfaCheckInPostUrl, cfaObservationPostUrl, cfaSaveAndSendPostUrl } from '../../../cfa.js';

import axios from 'axios';

import { kioskdb } from '../kioskdb';
import { cfaHandshakePostUrl } from './endpoints';

export const handshake = {};

handshake.query = async () => {
  let kioskState = await kioskdb.init();
  let data = {
    kiosk_id: kioskState.id,
    credential: kioskState.cfa_key,
  };

  let request = JSON.stringify(data, null, '  ');
  let result = '';

  let makeResponse = (success, request, result) => {
    return {
      success: success,
      request: request,
      response: result
    }
  }

  try {
    const response = await axios({
      method: 'post',
      url: cfaHandshakePostUrl,
      data: data,
      timeout: 500,
      responseType: 'json'
    })
    result = JSON.stringify(response.data, null, '  ');
    return makeResponse(true, request, result);
  } catch (error) {
    result = `Request to perform handshake failed: ${error}, the Developer Tools console might have more clues.`;
    console.error(result);
    return makeResponse(false, request, result);
  }
}
