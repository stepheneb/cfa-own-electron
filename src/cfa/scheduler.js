import { admin, sendCommand } from '../main.js'
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
      checkin.sendBoth();
      second_count = checkinIntervalInSeconds;
      if (admin) {
        sendCommand('checkinTimerTick', second_count);
        console.log("checkin.sendBoth()");
      }
    }
  }, one_second)
}

scheduler.stop = () => {
  clearInterval(timerId);
}
