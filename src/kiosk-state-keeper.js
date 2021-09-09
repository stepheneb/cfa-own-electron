import settings from 'electron-settings';
import { v4 as uuidv4 } from 'uuid';

export const kioskStateKeeper = async () => {

  let kioskState = {};

  const restoreState = async () => {
    let kiosk_id;
    // Restore from appConfig
    if (await settings.has(`kiosk_id`)) {
      kiosk_id = await settings.get(`kiosk_id`);
    } else {
      kiosk_id = uuidv4();
      await settings.set(`kiosk_id`, kiosk_id);
    }
    kioskState.kiosk_id = kiosk_id;
  };

  await restoreState();

  return kioskState;

};
