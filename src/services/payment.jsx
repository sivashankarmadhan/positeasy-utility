import { AppConstants } from 'src/constants/AppConstants';
import APIService from './apiService';
import AuthService from './authService';
import handleCallback from './API/Callback';
const API = AuthService.getRemoteURL();

const PAYMENT_API = {
  getPaymentLink(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/payment/transaction-request`,
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
          url: `${API}/api/v1/POS/payment/verify-payment`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  transactionResponse(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/payment/transaction-response`,
          method: 'POST',
          body: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  makeOrder(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/transaction-billing`,
          method: 'POST',
          data: JSON.stringify(options),
          customHeaders: { key: AuthService.getBillingKey() },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteOrder(options) {
    const { orderId, paymentId } = options;
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove-billing?orderId=${orderId}&paymentId=${paymentId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
};
export default PAYMENT_API;
