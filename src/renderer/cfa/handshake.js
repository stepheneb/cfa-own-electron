/*jshint esversion: 8 */
/*global app  */

import u from '../modules/utilities.js';

import { cfaHandshakePostUrl } from '../../cfa/endpoints';

export const handshake = {};

// How to use ...
//
// let cfaConnect = await handshake.query();
// if (cfaConnect.success) {
//   ... can reach CfA and authenticated successfully
// } else {
//   .. CfA communication error
// }

handshake.query = async () => {

  let makeResponse = (success, request, result) => {
    return {
      success: success,
      request: request,
      response: result
    }
  }

  let data = {
    kiosk_id: app.kioskState.id,
    credential: app.kioskState.cfa_key
  };

  let request = u.printableJSON(data);
  let response;

  try {
    response = await fetch(cfaHandshakePostUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
    let success = response.code == 200;
    console.log(u.printableJSON(response));
    return makeResponse(success, request, response);
  } catch (error) {
    response = {
      code: 0,
      message: `Request to perform handshake failed: ${error}. Possibly a networking error.  The Developer Tools console might have more clues.`
    }
    console.error(u.printableJSON(response));
    return makeResponse(false, request, response);
  }
}
