import { AppTypes, DEVICE_TYPES } from 'src/constants/AppConstants';

export const getAppType = (deviceType) => {
  if (!deviceType) return DEVICE_TYPES.UNKNOWN;
  if (deviceType === DEVICE_TYPES.ANDROID_MOBILE || deviceType === DEVICE_TYPES.ANDROID_TABLET)
    return AppTypes.ANDROID_APK_MERCHANT;
  else if (deviceType === DEVICE_TYPES.IPAD || deviceType === DEVICE_TYPES.IPHONE)
    return AppTypes.IPAD_OR_IOS_APPSTORE_MERCHANT;
  else if (deviceType === DEVICE_TYPES.LINUX_DESKTOP || deviceType === DEVICE_TYPES.LINUX)
    return AppTypes.DESKTOP_LINUX;
  else if (deviceType === DEVICE_TYPES.WINDOWS_DESKTOP) return AppTypes.DESKTOP_WINDOWS;
  else if (deviceType === DEVICE_TYPES.ANDROID_IOS) return AppTypes.ANDROID_IOS;
  else return AppTypes.WEB_MERCHANT;
};
