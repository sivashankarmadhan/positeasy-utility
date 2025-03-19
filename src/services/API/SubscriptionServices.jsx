import { get } from 'lodash';
import APIService from '../apiService';
import handleCallback from './Callback';
const API = import.meta.env.VITE_REMOTE_URL;

const SubscriptionPlan_API = {
  getSubScriptionCard(Toggled) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/subscription/getAllSubscriptions?device=${Toggled}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  initiatePayment(subscriptionId,couponInfo) {
    const url = `${API}/api/v1/merchant/subscription/transaction-request/plink`;

    console.log('subscriptionIddddddd', subscriptionId);

    const payload = {
      subscriptionId,
      couponInfo 
    };

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: url,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(payload),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  SubscriptionCancelTransaction(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/subscription/cancel-transaction`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  SubscriptionVerifyPayment(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/subscription/verify-payment`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  SubscriptionVerifyPaymentLocal(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/subscription/verify-payment/local?paymentId=${get(
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
  getActiveSubscriptionPlanDetails(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/subscription/getStoreSubscriptionStatus`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getCouponValidDetails(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/subscription/view-couponValid?code=${options.code}`, 
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
        handleCallback(resolve, reject)
      );
    });
  },  
};
export default SubscriptionPlan_API;
