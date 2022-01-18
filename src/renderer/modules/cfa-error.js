/*jshint esversion: 8 */
/*global app ipcRenderer */

let cfaError = {};

cfaError.log = (kind, body) => {
  delete body.kiosk_id;
  delete body.credential;
  let message = {
    kind: kind,
    body: body
  }
  let obj = { "failed_cfa_request": message };
  ipcRenderer.invoke('log_failed_cfa_request', obj).then((kioskLogState) => {
    app.kioskLogState = kioskLogState;
  });
};

export default cfaError;
