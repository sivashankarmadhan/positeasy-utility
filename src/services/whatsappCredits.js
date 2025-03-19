import { AppConstants } from 'src/constants/AppConstants';
import APIService from './apiService';
import AuthService from './authService';
import handleCallback from './API/Callback';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { get } from 'lodash';
const API = AuthService.getRemoteURL();

const WHATSAPP_CREDITS = {
  getBalance() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/current-balance`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getRechargeHistory(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/recharge-history${query}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getMessageHistory(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/message-history${query}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  creditRequest(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/credit-request`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  verifyPayment(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/verify-payment`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  verifyPaymentLocal(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/verify-payment/local?paymentId=${get(
            options,
            'paymentId'
          )}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  cancelTransaction(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/cancel-transaction`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
};
export default WHATSAPP_CREDITS;
