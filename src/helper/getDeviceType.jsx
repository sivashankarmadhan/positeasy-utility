import { DEVICE_TYPES } from 'src/constants/AppConstants';

export const getDeviceType = () => {
  const userAgent = window.navigator.userAgent;
  const mobileRegex = /Mobi/i;
  const tabletRegex = /Tablet/i;
  const ipadRegex = /iPad/i;
  const macRegex = /Macintosh/i;
  const iphoneRegex = /iPhone/i;
  const linuxRegex = /Linux/i;
  const electronRegex = /Electron/i;
  const windowsRegex = /Windows|windows/i;
  const reactNativeRegex = /REACT_NATIVE_AGENT/i;

  if (mobileRegex.test(userAgent) && !iphoneRegex.test(userAgent)) {
    return DEVICE_TYPES.ANDROID_MOBILE;
  } else if (tabletRegex.test(userAgent) && !ipadRegex.test(userAgent)) {
    return DEVICE_TYPES.ANDROID_TABLET;
  } else if (ipadRegex.test(userAgent)) {
    return DEVICE_TYPES.IPAD;
  } else if (macRegex.test(userAgent) && !electronRegex.test(userAgent)) {
    return DEVICE_TYPES.MAC;
  } else if (macRegex.test(userAgent) && electronRegex.test(userAgent)) {
    return DEVICE_TYPES.MAC_DESKTOP_APP;
  } else if (iphoneRegex.test(userAgent)) {
    return DEVICE_TYPES.IPHONE;
  } else if (linuxRegex.test(userAgent) && !electronRegex.test(userAgent)) {
    return DEVICE_TYPES.LINUX;
  } else if (linuxRegex.test(userAgent) && !electronRegex.test(userAgent)) {
    return DEVICE_TYPES.LINUX_DESKTOP;
  } else if (windowsRegex.test(userAgent)) {
    return DEVICE_TYPES.WINDOWS_DESKTOP;
  } else if (reactNativeRegex.test(userAgent)) {
    return DEVICE_TYPES.ANDROID_IOS;
  } else {
    return DEVICE_TYPES.UNKNOWN;
  }
};
