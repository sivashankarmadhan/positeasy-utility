import { get } from 'lodash';
import toast from 'react-hot-toast';
import { USER_AGENTS } from 'src/constants/AppConstants';
import BridgeConstants from 'src/constants/BridgeConstants';
import NativeService from 'src/services/NativeService';

const handleCSVDownload = ({ url, method, headers, data, filename }) => {
  const isAndroidDevice = navigator.userAgent.match(/Android/i);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isAppleDevice =
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;
  if (isAndroid || isAndroidRawPrint || isAppleDevice) {
    const nativeRequest = [
      {
        name: BridgeConstants.DOWNLOAD_ATTACHMENTS,
        data: {
          headers: headers,
          url: url,
          type: 'csv',
          method: method,
          data: data,
          filename,
        },
      },
    ];
    NativeService.sendAndReceiveNativeData(nativeRequest)
      .then((response) => {
        console.log('Native response Print', response);
        const nativeItem = response.filter(
          (responseItem) => responseItem.name === BridgeConstants.DOWNLOAD_ATTACHMENTS
        );
        if (get(nativeItem, '0.data.message') === 'Download Successful') {
          toast.success(get(nativeItem, '0.data.message', 'Download Successfully'));
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
};

export default handleCSVDownload;
