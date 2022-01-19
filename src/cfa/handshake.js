// const { app } = require('electron');

// const fs = require("fs");
// const path = require('path');

// import { cfaHandshakePostUrl, cfaCheckInPostUrl, cfaObservationPostUrl, cfaSaveAndSendPostUrl } from '../../../cfa.js';

import axios from 'axios';

import u from '../renderer/modules/utilities.js';
import { kioskdb } from '../kioskdb';
import { cfaHandshakePostUrl } from './endpoints';

export const handshake = {};

handshake.query = async () => {
  let kioskState = await kioskdb.init();

  let makeResponse = (success, request, result) => {
    return {
      success: success,
      request: request,
      response: result
    }
  }

  let data = {
    kiosk_id: kioskState.id,
    credential: kioskState.cfa_key,
  };

  let request = u.printableJSON(data);

  try {
    const jsonResponse = await axios({
      method: 'post',
      url: cfaHandshakePostUrl,
      data: data,
      timeout: 500,
      responseType: 'json'
    })
    const success = jsonResponse.code == 200;
    console.log(u.printableJSON(jsonResponse));
    return makeResponse(success, request, jsonResponse);
  } catch (error) {
    const response = {
      code: 0,
      message: `Request to perform handshake failed: ${error}. Possibly a networking error.  The Developer Tools console might have more clues.`
    }
    console.error(u.printableJSON(response));
    return makeResponse(false, request, response);
  }
}
