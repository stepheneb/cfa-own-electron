import axios from 'axios';

import u from '../renderer/modules/utilities.js';
import { kioskdb } from '../kioskdb';

import { endpoints } from './endpoints.js';

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
      url: endpoints.cfaHandshakePostUrl,
      data: data,
      timeout: 500,
      responseType: 'json'
    })
    let result = jsonResponse.data;
    const success = result.authorization.code == 200;
    console.log(u.printableJSON(result));
    return makeResponse(success, request, result);
  } catch (error) {
    const response = {
      code: 0,
      message: `Request to perform handshake failed: ${error}. Possibly a networking error.  The Developer Tools console might have more clues.`
    }
    console.error(u.printableJSON(response));
    return makeResponse(false, request, response);
  }
}
