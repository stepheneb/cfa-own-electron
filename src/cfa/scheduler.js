import { admin, sendCommand, finishWithHandshake } from '../main.js'
import { kioskdb } from '../kioskdb.js'
import { checkin } from './checkin.js'

export const scheduler = {};

const one_second = 1000;
let timerId = null;

scheduler.start = async () => {
  let kioskState = await kioskdb.read()
  let checkinInterval = kioskState.checkin_interval;
  const checkinIntervalInSeconds = 60 * checkinInterval;
  let second_count = checkinIntervalInSeconds;
  if (timerId) {
    clearInterval(timerId);
  }
  timerId = setInterval(() => {
    second_count--
    if (admin) {
      sendCommand('checkinTimerTick', second_count);
    }
    if (second_count <= 0) {
      second_count = checkinIntervalInSeconds;
      checkin.sendBoth().then(result => {
        if (admin) {
          sendCommand('checkinTimerTick', second_count);
          console.log("checkin.sendBoth()");
        } else {
          sendCommand('webConsoleLog', result);
        }
        finishWithHandshake();
      })
    }
  }, one_second)
}

scheduler.stop = () => {
  if (timerId) {
    clearInterval(timerId);
  }
}
