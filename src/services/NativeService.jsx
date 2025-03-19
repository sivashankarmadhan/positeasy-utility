import { get } from 'lodash';
import BridgeConstants from 'src/constants/BridgeConstants';
import NativeInterface from 'src/Interfaces/NativeInterface';
const timeout = import.meta.env.REACT_APP_NATIVE_SERVICE_TIMEOUT ?? 60000;
const NativeService = {
  sendAndReceiveNativeData: (nativeRequest) => {
    return new Promise((resolve, reject) => {
      NativeService.getNativeData(nativeRequest, timeout)
        .then((nativeData) => {
          resolve(nativeData);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  getNativeData(nativeRequest, timeout) {
    // console.log('nativeRequest', { ...nativeRequest[0] });
    return new Promise((resolve, reject) => {
      const response = [];
      let requestCount = 0;
      const unsubscribe = window.customEventEmitter.subscribe(
        BridgeConstants.NATIVE_DATA,
        (nativeData) => {
          console.log('nativeData--->', nativeData);
          const responseKeyName = get(nativeRequest[requestCount], 'responseKeyName');
          if (nativeData) {
            const { data, error, name } = nativeData;
            if (error) {
              if (
                (responseKeyName && [name].includes(responseKeyName)) ||
                [name].includes(nativeRequest[requestCount].name)
              ) {
                unsubscribe();
                reject(error);
              }
            }
            if (
              (responseKeyName && [name].includes(responseKeyName)) ||
              [name].includes(nativeRequest[requestCount].name)
            ) {
              response.push({ name: nativeRequest[requestCount].name, data });
              if (requestCount < nativeRequest.length - 1) {
                requestCount += 1;
                NativeInterface.postMessage({ ...nativeRequest[requestCount] });
              } else {
                unsubscribe();
                resolve(response);
              }
            }
          }
        }
      );
      NativeInterface.postMessage({ ...nativeRequest[0] });

      // handle non-acknowledging command
      if (!get(nativeRequest[0], 'isAckRequired', true)) {
        response.push({ name: nativeRequest[requestCount].name, data: {} });
        if (requestCount < nativeRequest.length - 1) {
          requestCount += 1;
          NativeInterface.postMessage({ ...nativeRequest[requestCount] });
        } else {
          unsubscribe();
          resolve(response);
        }
      }

      if (timeout) {
        setTimeout(() => {
          unsubscribe();
          reject(new Error(BridgeConstants.BRIDGE_TIMEOUT_ERR));
        }, timeout);
      }
    });
  },
};
export default NativeService;
