import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import u from '../renderer/modules/utilities.js';

import { kiosklog } from '../kiosklog';
import { images } from './images';

import { endpoints } from './endpoints.js';

export const failedRequests = {};

failedRequests.send = (kioskState, kioskLogState) => {
  let requests = u.deepClone(kioskLogState.failed_cfa_requests);
  const axiosRateLimited = rateLimit(axios.create(), { maxRequests: 3, perMilliseconds: 1000, maxRPS: 3 });

  console.log('axiosRateLimited', axiosRateLimited.getMaxRPS()) // 3

  let makeResponse = (success, request, result) => {
    return {
      success: success,
      request: request,
      response: result
    }
  }

  const reSendRequest = (failedRequest) => {
    return new Promise(function (resolve, reject) {
      let endpoint;
      let saveAndSend = failedRequest.kind == 'save-and-send';
      let observation = failedRequest.kind == 'observation';
      if (saveAndSend) {
        endpoint = endpoints.cfaSaveAndSendPostUrl;
      } else {
        endpoint = endpoints.cfaObservationPostUrl;
      }
      let data = u.deepClone(failedRequest.body);
      data.kiosk_id = kioskState.id
      data.credential = kioskState.cfa_key

      if (saveAndSend) {
        let img_data = images.load(data.imageBase64Path).toString();
        data.img_data = img_data;
        delete data.imageBase64Path
      }
      let request = {};

      axiosRateLimited({
          method: 'post',
          url: endpoint,
          data: data,
          timeout: 2000,
          responseType: 'json'
        })
        .then(result => {
          let response = result.data;
          let code = response.authorization.code;
          let success = code == 200;
          const status = makeResponse(success, request, response);
          if (success || observation && code == 407) {
            let uuid = failedRequest.uuid;
            let index = kioskLogState.failed_cfa_requests.findIndex(item => item.uuid = uuid);
            if (index >= 0) {
              kioskLogState.failed_cfa_requests.splice(index, 1);
              if (saveAndSend) {
                images.erase(failedRequest.body.imageBase64Path);
              }
            }
            resolve(status);
          } else {
            reject(status);
          }
        })
        .catch(error => {
          const problem = {
            code: 0,
            message: `${failedRequest.kind} Image request failed: ${error}. Possibly a networking error.  The Developer Tools console might have more clues.`
          }
          // console.error(u.printableJSON(response));
          let status = makeResponse(false, request, problem);
          reject(status);
        })
    })
  }

  const start = async () => {
    let allResults;
    await Promise.allSettled(requests.map(failedRequest => reSendRequest(failedRequest)))
      .then((results) => {
        console.log(u.printableJSON(results));
        console.log('kioskLogState');
        console.log(kioskLogState);
        allResults = results.map((result) => {
          if (result.status == 'rejected') {
            if (result.reason.response) {
              return result.reason.response;
            } else {
              return {
                code: 0,
                message: result.reason.toString()
              }
            }
          } else {
            return result.value.response
          }
        });
      })
    kioskLogState = await kiosklog.save(kioskLogState);
    return {
      name: 'failedRequests.send',
      results: allResults
    };
  }
  return start();
}
