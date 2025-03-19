import { TerminalTypes } from 'src/constants/AppConstants';
import APIService from './apiService';
import AuthService from './authService';
import { getDeviceType } from 'src/helper/getDeviceType';
import { getAppType } from 'src/helper/getAppType';
import handleCallback from './API/Callback';
const API = AuthService.getRemoteURL();
const deviceType = getDeviceType();

const Auth_API = {
  masterSignin(options) {
    return new Promise((resolve, reject) => {
      APIService.fetch(
        `${API}/api/v1/POS/auth/merchant/signin`,
        {
          method: 'POST',
          body: JSON.stringify(options),
          headers: {
            'Content-Type': 'application/json',
            deviceid: AuthService.getDeviceId(),
            deviceInfo: deviceType,
            appType: getAppType(deviceType),
            terminalType: TerminalTypes.MERCHANT,
          },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  managerSignin(options) {
    return new Promise((resolve, reject) => {
      APIService.fetch(
        `${API}/api/v1/POS/auth/manager-signin`,
        {
          method: 'POST',
          body: JSON.stringify(options),
          headers: {
            'Content-Type': 'application/json',
            deviceid: AuthService.getDeviceId(),
            deviceInfo: deviceType,
            appType: getAppType(deviceType),
            terminalType: TerminalTypes.MERCHANT,
          },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  signin(options) {
    return new Promise((resolve, reject) => {
      APIService.fetch(
        `${API}/api/v1/POS/auth/merchant/terminal-signin`,
        {
          method: 'POST',
          body: JSON.stringify(options),
          headers: {
            'Content-Type': 'application/json',
            deviceid: AuthService.getDeviceId(),
            deviceInfo: deviceType,
            appType: getAppType(deviceType),
            terminalType: TerminalTypes.MERCHANT,
          },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  signup(options) {
    console.log('API', API);
    return new Promise((resolve, reject) => {
      APIService.fetch(
        `${API}/api/v1/POS/auth/merchant/signup`,
        {
          method: 'POST',
          body: JSON.stringify(options),
          headers: {
            'Content-Type': 'application/json',
            deviceid: AuthService.getDeviceId(),
            deviceInfo: JSON.stringify({
              platform: window.navigator.platform,
              userAgent: window.navigator.userAgent,
            }),
            terminalType: TerminalTypes.MERCHANT,
          },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  refresh(refreshToken) {
    return new Promise((resolve, reject) => {
      APIService.fetch(
        `${API}/api/v1/POS/auth/refresh-access`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${refreshToken}`,
            deviceid: AuthService.getDeviceId(),
            deviceInfo: deviceType,
            appType: getAppType(deviceType),
            terminalType: TerminalTypes.MERCHANT,
          },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  masterUpdatePassword(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/password-update`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updatePassword(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant-terminal/password-update`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  removeAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/remove-access`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },


  createTerminal(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/create-terminal`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  removeUnpaidTerminal(options) {
    const { terminalNumber, terminalId, storeId } = options;
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/remove/unpaid-terminal?terminalNumber=${terminalNumber}&terminalId=${terminalId}&storeId=${storeId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  removeManagerAccount(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/remove/manager-account`,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  removeManagerAccountFromManager(options) {
    const { terminalNumber, storeId } = options;
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/delete/my-account?terminalNumber=${terminalNumber}&storeId=${storeId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  createStores(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/create-newStore`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  logout(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant-key/signout`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  createNewAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/create-newAccess`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  createManagerAccount(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/create/manager-account`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateManagerAccountAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/manager/access-update`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  createMasterAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/create-newManagerAccess`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateStaffAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/upgrade-staffAccess`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  switchAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/switch-access`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  checkMultiManager(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/multi-managercheck`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  checkTerminalAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/terminal-access/check`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  checkMultiAccess(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/multi-access/check`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  sendResetEmail(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/merchant/forgot-password`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  sendNewPassword(options, token) {
    return new Promise((resolve, reject) => {
      APIService.fetch(
        `${API}/api/v1/POS/auth/merchant/reset-password/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
};
export default Auth_API;
