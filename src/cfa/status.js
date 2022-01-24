// CfA API error status object creation

export const cfaStatus = {};

cfaStatus.create = (result) => {
  const endpoint = result.endpoint;
  const request = result.request;
  const response = result.response;
  const auth = response.authorization;
  const code = auth.code;
  const success = code == 200;
  const ip_address = auth.ip || '';
  const unablestr = "and won't be able to send saved images or observation requests";
  const pleasecontact = "Please contact an administrator at CfA for help resolving this issue.";
  const software_error = `Kiosk Software Error: The json body of the request sent to the CfA server is malformed/invalid. ${pleasecontact}`;
  const messages = {
    0: 'Network Connection to CfA failed. Make sure the connection to the Internet is working.',
    400: software_error,
    406: software_error,
    402: `Kiosk Not Registered: This kiosk is not registered at CfA ${unablestr}. ${pleasecontact}`,
    403: `Kiosk Credential Invalid: This kiosk is registered at CfA but the Credential is invalid ${unablestr}. ${pleasecontact}`,
    404: `Kiosk IP Address Invalid: This kiosk can communicate correctly to CfA but the IP address does not match the one previously assigned ${unablestr}. ${pleasecontact}`,
    405: `Kiosk Credential Failed: There has been an unknow failure at CfA checking the Credential ${unablestr}. ${pleasecontact}`,
    407: `Observation Already Requested: The visitor associated with this email has already requested this observation.`,
    409: `CfA Error Saving Image Upload: There has been an unknown failure at CfA saving the uploaded image for sending in an email.`,
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
