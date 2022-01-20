import axios from 'axios';

import { kiosklog } from '../kiosklog';
import { endpoints } from './endpoints.js';

export const checkin = {};

checkin.send = async (kioskState, kioskLogState) => {
  let data = {
    kiosk_id: kioskState.id,
    credential: kioskState.cfa_key,
    datetime: new Date().toISOString(),
    report: {
      touch_begins: kioskLogState.touch_begins,
    }
  };
  let result = '';
  try {
    const response = await axios({
      method: 'post',
      url: endpoints.cfaCheckInPostUrl,
      headers: { 'Content-Type': 'multipart/form-data' },
      data: data,
      timeout: 500,
      responseType: 'json'
    })
    result = JSON.stringify(response.data, null, '  ');
    kiosklog.resetTouchBegins();
    return result;
  } catch (error) {
    result = `Request to perform handshake failed: ${error}, the Developer Tools console might have more clues.`;
    console.error(result);
    return result;
  }
}
