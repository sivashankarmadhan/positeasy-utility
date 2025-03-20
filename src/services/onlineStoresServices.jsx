import { AppConstants } from 'src/constants/AppConstants';
import APIService from './apiService';
import AuthService from './authService';
import handleCallback from './API/Callback';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
const API = AuthService.getRemoteURL();

const ONLINE_STORES = {
  createOnlineStore(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/add-store`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  createSoundConfig(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/sound-configurations`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  onlineStoreDetails(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/store-settings?storeId=${storeId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStoreAllList() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/list-all`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  toggleFoodDelivery(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/store-toggle`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOnlineStockForCurrentStock() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/download-currentStock`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  requestsFDLogs(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/raised-requests${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  recentFDOrders(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/recent/orders${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getLastPublish(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/last-publish${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStorePublishTime(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/store/publish-time`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default ONLINE_STORES;
