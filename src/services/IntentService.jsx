import APIService from './apiService';
import handleCallback from './API/Callback';
import AuthService from './authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { forEach } from 'lodash';
const API = AuthService.getRemoteURL();

const INTENT_API = {
  getIntentStoreAllList(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/get-storeSort?storeId=${storeId}`,
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
          url: `${API}/api/v1/POS/merchant/intent/get-allStores`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getIntentConfig({storeId, terminalId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/intent-settings?storeId=${storeId}&terminalId=${terminalId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStoreReference() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/get-storeReference`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllPurchaseOrders(options, selectedStatusList) {
    let query = ObjectToQueryParams(options);
    if (selectedStatusList) {
      forEach(selectedStatusList, (value) => {
        query += `&status=${value}`;
      });
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/get-orders${query}&flow_type=STORES`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllPurchaseOrdersReceives(options, selectedStatusList) {
    let query = ObjectToQueryParams(options);
    if (selectedStatusList) {
      forEach(selectedStatusList, (value) => {
        query += `&status=${value}`;
      });
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/all-orders${query}&flow_type=STORES`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPurchaseLogs({size, page, referenceId, storeId}) {

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/get-logs?referenceId=${referenceId}&size=${size}&page=${page}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllManagerApproval({size, page, referenceId, storeId}) {

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/get-allOrders?size=${size}&page=${page}&storeId=${storeId}&flow_type=STORES&receiverReference=${referenceId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  addPurchaseIntentOrder(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/create-order`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addDirectPurchaseIntentOrder(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/create-order-staff`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },

  addPurchaseSettings(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/configurations`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addPurchaseStatus(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/update-status`,
          method: 'PUT',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateReceivePurchaseStatus(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/approveReject-receiver`,
          method: 'PUT',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },

  addStaff(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/add-staff`,
          method: 'POST',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getPurchaseNumber({size, page, referenceId, storeId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/purchase-number?storeId=Store1s&startDate=2025-01-24&endDate=2025-01-24`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getReturnNumber({size, page, referenceId, storeId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/return-number?storeId=Store1s&startDate=2025-01-24&endDate=2025-01-24`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getSaleNumber({size, page, referenceId, storeId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/sale-number?storeId=Store1s&startDate=2025-01-24&endDate=2025-01-24`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getVendorPurchase({size, page, referenceId, storeId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/vendor-purchase?storeId=Store1s&startDate=2025-01-24&endDate=2025-01-24`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductPurchasedCount({size, page, referenceId, storeId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/product-purchased?storeId=Store1s&startDate=2025-01-24&endDate=2025-01-24`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductMonthlySale({size, page, referenceId, storeId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/product-monthlySales?storeId=Store1s&startDate=2025-01-24&endDate=2025-01-24`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  
};
export default INTENT_API;
