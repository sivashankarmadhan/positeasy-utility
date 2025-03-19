import APIService from '../apiService';
import handleCallback from './Callback';
const API = import.meta.env.VITE_REMOTE_URL;

const StoreServices = {
  getRemainingDaysForExpiry(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/trial-expiry`,
          method: 'GET',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postOutletAddress(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/outlet-address`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateMerchantId(merchantId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/payment/phonepe-health?mId=${merchantId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateEditedId(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/payment/store-wise/phonepe-account`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getMerchantIdFromPhonePeAccount() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/payment/phonepe-account`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default StoreServices;
