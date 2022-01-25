import axios from 'axios';

import { kioskdb } from '../kioskdb';
import { kiosklog } from '../kiosklog';
import { failedRequests } from './failed-requests';
import { endpoints } from './endpoints.js';
import u from '../renderer/modules/utilities.js';

export const checkin = {};

checkin.sendBoth = async (kioskState, kioskLogState) => {
  kioskLogState = await kiosklog.save(kioskLogState);
  let reportResult = await checkin.sendReport(kioskState, kioskLogState);
  kioskState = await kioskdb.read();
  kioskLogState = await kiosklog.save(kioskLogState);
  let resendResults = await failedRequests.send(kioskState, kioskLogState);
  return {
    report: reportResult,
    resend: resendResults
  }
}

checkin.sendReport = async (kioskState, kioskLogState) => {
  kioskState = await kioskdb.save(kioskState);
  kioskLogState = await kiosklog.save(kioskLogState);

  let data = {
    kiosk_id: kioskState.id,
    credential: kioskState.cfa_key,
    datetime: new Date().toISOString(),
    report: {
      touch_begins: kioskLogState.touch_begins,
      failed_cfa_requests: u.deepClone(kioskLogState.failed_cfa_requests),
    }
  };

  const returnResultObj = (result) => {
    return {
      name: "checkin.sendReport",
      results: result
    }
  }
  try {
    const response = await axios({
      method: 'post',
      url: endpoints.cfaCheckInPostUrl,
      headers: { 'Content-Type': 'multipart/form-data' },
      data: data,
      timeout: 500,
      responseType: 'json'
    })
    let auth = response.data.authorization;
    let success = auth.code == 200;
    let result = {
      request: data,
      authorization: auth
    }
    console.log(u.printableJSON(result));
    if (success) {
      kioskLogState.touch_begins = [];
      await kiosklog.save(kioskLogState);
    }
    return returnResultObj(result);
  } catch (error) {
    console.log(u.printableJSON(data));
    let auth = {
      code: 0,
      message: `Request to perform checkin failed: ${error}, the Developer Tools console might have more clues.`
    }
    let result = {
      request: data,
      authorization: auth
    }
    console.error(u.printableJSON(result));
    return returnResultObj(result);
  }
}
