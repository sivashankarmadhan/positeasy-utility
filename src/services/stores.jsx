import APIService from './apiService';
import handleCallback from './API/Callback';
import AuthService from './authService';
const API = AuthService.getRemoteURL();

const STORES_API = {
  getStoresMaster() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/merchant-access`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStoresMasterDetails(selectedStore) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/all-details?storeId=${selectedStore}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getMembershipCustomer({storeId, page, size, contactNumber}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/memberShip/get-memberShip?storeId=${storeId}&contactNumber=${contactNumber}&page=${page}&size=${size}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStoresManager() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/manager-access`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStoresManagerDetails(selectedStore) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/manager/all-details?storeId=${selectedStore}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getManagerAllList() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/view-all`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getManagerAllDetails(selectedStore) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/all-managers?storeId=${selectedStore}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStoresByStoreId(selectedStore) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/individual-stores?storeId=${selectedStore}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getLastTerminalId(selectedStore) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/last-terminal?storeId=${selectedStore}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateMerchantDetails(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/upgrade-details`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
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
  updateStaff(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/upd-staff`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  removeStaff(staffId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove-staff?staffId=${staffId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  storeDelete(selectedStore,selectStoreName) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/auth/storedelete?storeName=${selectStoreName}&storeId=${selectedStore}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getStaffs() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/all-staffs`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPaidTerminals() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/paid-terminals`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getTerminalsByStaffId(staffId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/staff-terminals?staffId=${staffId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAccountInfo({ storeId, terminalId }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/account-info?storeId=${storeId}&terminalId=${terminalId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOtherAccountInfo() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/other/account-info`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  passKey(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/regenerate-key/message`,
          data: JSON.stringify(options),
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  regenerateBillingKey(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/regenerate-key`,
          data: JSON.stringify(options),
          method: 'PUT',
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
          url: `${API}/api/v1/POS/merchant/stores/regenerate-key`,
          data: JSON.stringify(options),
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  sendEstimate(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/billing-estimator`,
          method: 'POST',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateEstimate(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/update-estimator`,
          data: JSON.stringify(options),
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getEstimate() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/view-estimator`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllEstimates(options) {
    const { size, page, status } = options;
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/all-estimators?status=${status}&size=${size}&page=${page}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  removeEstimate(estimateId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove-estimator?estimateId=${estimateId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  billingSyncup(content) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/billing/sync-check?content=${content}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  markAttendance(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/mark-attendance`,
          method: 'POST',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
};
export default STORES_API;
