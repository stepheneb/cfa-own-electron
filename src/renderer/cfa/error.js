/*jshint esversion: 8 */
/*global app ipcRenderer */

import { v4 as uuidv4 } from 'uuid';

const cfaError = {};

cfaError.log = (kind, request, authorization) => {
  delete request.kiosk_id;
  delete request.credential;
  let message = {
    kind: kind,
    uuid: uuidv4(),
    body: request,
    authorization: authorization
  }
  let obj = { "failed_cfa_request": message };
  ipcRenderer.invoke('log_failed_cfa_request', obj).then((kioskLogState) => {
    app.kioskLogState = kioskLogState;
  });
};

export default cfaError;
