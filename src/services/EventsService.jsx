import { Events } from '@poriyaalar/js-event';
import BridgeConstants from 'src/constants/BridgeConstants';

const EventsService = {
  boot(cb) {
    window.customEventEmitter = new Events();
    window.onReceiveMessage = (nativeData) => {
      window.customEventEmitter.emit(BridgeConstants.NATIVE_DATA, nativeData);
    };
    window.onBackMessage = (nativeData) => {
      window.customEventEmitter.emit(BridgeConstants.BACK_BUTTON, nativeData);
    };
    cb();
  },
};

export default EventsService;
