// CfA API error status object creation

import { oneline } from './oneline.js';

export const cfaStatus = {};

cfaStatus.create = (result) => {
  const endpoint = result.endpoint;
  const request = result.request;
  const response = result.response;
  const auth = response.authorization;
  let code = auth.code;
  let cfaDbError = '';
  if (code >= 600 && code < 700) {
    cfaDbError = `: ${code},`;
    code = 600;
  }
  const success = code == 200;
  const ip_address = auth.ip || '';
  const unablestr = "and won't be able to send saved images or observation requests";
  const pleasecontact = "Please contact an administrator at CfA for help resolving this issue.";
  const software_error = `Kiosk Software Error: The json body of the request sent to the CfA server is malformed/invalid. ${pleasecontact}`;
  const messages = {
    0: 'Network Connection to CfA failed: make sure the connection to the Internet is working.',

    402: oneline`
    Kiosk Not Registered: this kiosk is not registered at CfA ${unablestr}. ${pleasecontact}`,

    403: oneline`
    Kiosk Credential Invalid: this kiosk is registered at CfA but the Credential
    is invalid ${unablestr}. ${pleasecontact}`,

    404: oneline`
    Kiosk IP Address Changed: this kiosk is registered at CfA and the credential is valid but
    the current IP address does not match the previous one that was assigned ${unablestr}.
    ${pleasecontact}`,

    405: oneline`
    Kiosk Credential Failed: there has been an unknown failure at the CfA server checking the
    Credential ${unablestr}. ${pleasecontact}`,

    407: oneline`
    Observation Already Requested: the visitor associated with this email has already
    requested this observation.`,

    400: software_error,
    406: software_error,

    409: oneline`
    CfA Error Saving Image Upload: there has been an unknown failure at CfA saving the
    uploaded image for sending in an email.`,

    600: oneline`
    CfA Server Error: a database error${cfaDbError} occured on the the CfA server reported an internal database error.`,

  }
  const status = {
    success: success,
    code: code,
    ip_address: ip_address,
    message: '',
    endpoint: endpoint,
    request: request,
    response: response
  }
  if (success) {
    status.message = 'ok';
  } else {
    let new_mesg = messages[code];
    if (new_mesg) {
      status.message = new_mesg;
    } else {
      status.message = `Software Error: Possible internal error or unknown authorization response code: ${code}`;
    }
  }
  return status;
}
