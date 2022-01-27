import axios from 'axios';

import u from '../renderer/modules/utilities.js';

import { endpoints } from './endpoints.js';
import { cfaStatus } from './status';

export const handshake = {};

handshake.query = async (kioskState) => {

  let makeStatus = (success, endpoint, request, response) => {
    return cfaStatus.create({
      success: success,
      endpoint: endpoint,
      request: request,
      response: response
    });
  }

  let data = {
    kiosk_id: kioskState.id,
    credential: kioskState.cfa_key,
    checkin_interval: kioskState.checkin_interval,
    checkin_interval_enabled: kioskState.checkin_interval_enabled
  };

  let request = u.printableJSON(data);

  let endpoint = endpoints.cfaHandshakePostUrl;

  try {
    const result = await axios({
      method: 'post',
      url: endpoint,
      data: data,
      timeout: 1000,
      responseType: 'json'
    })
    let response = result.data;
    console.log(u.printableJSON(response));
    const success = response.authorization.code == 200;
    return makeStatus(success, endpoint, request, response);
  } catch (error) {
    const response = {
      authorization: {
        code: 0,
        message: `Request to perform handshake failed: ${error}. Possibly a networking error.  The Developer Tools console might have more clues.`
      }
    }
    console.error(u.printableJSON(response));
    return makeStatus(false, endpoint, request, response);
  }
}
