import { ALL_CONSTANT, ROLES_DATA } from 'src/constants/AppConstants';
import terminalQuery from 'src/utils/terminalQuery';
import APIService from '../apiService';
import AuthService from '../authService';
import handleCallback from './Callback';
import ObjectToQueryParams from '../../utils/ObjectToQueryParams';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import getTerminalsByStoreId from 'src/helper/getTerminalsByStoreId';
import { get } from 'lodash';
import getFirstTerminalIdInAll from 'src/helper/getFirstTerminalId';

const API = import.meta.env.VITE_REMOTE_URL;

const SettingServices = {
  getConfiguration() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/get-configurations`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getViewConfiguration() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/view-configurations`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPrintConfiguration() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/printer-settings?terminalId=${getFirstTerminalIdInAll()}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getMemberShipConfiguration(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/account-info?storeId=${storeId}&terminalId=${getFirstTerminalIdInAll()}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  postPrintMode(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/print-configuration`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addIntegration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/add`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  regenrateApiKey(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/regenerate-key`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addWebhooksProductIntegration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/webhook/health-check`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addWebhooksProductConfigIntegration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/add-webhooks`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStoreInventory() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/store/inventory`,
          method: 'GET',
          // data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteIntegration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/turn-off?storeId=${data?.storeId}&id=${data?.id}`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  turnOffIntegration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/turn-off?storeId=${data?.storeId}&id=${data?.id}`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  turnOnIntegration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/turn-on?storeId=${data?.storeId}&id=${data?.id}`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getIntegration() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/store-wise`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  postCustomerData(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/add-customer`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateCustomer(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/edit-details`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  removeCustomer(customerId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/remove?customerId=${customerId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getCustomerData() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/view-allcustomers`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  fetchCustomerList(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/view-allListings${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postCustomCode(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/add-customcode`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editCustomCode(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/edit/custom-code`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  removeCustomCode(customCode) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/remove/custom-code?customCode=${customCode}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  postConfiguration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/configurations`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postScanQrConfiguration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/on-table/update-settings`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postMemberConfiguration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/memberShip/memberShipInfo`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getScanQrConfiguration() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/on-table/settings`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postEbillConfiguration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/order-settings`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  sendEbilling(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/send-transactionBill`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  sendEbillPrint(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/ebill-configuration`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getEbillSetting(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/ebill-settings`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getEbillConfiguration(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/settings?storeId=${storeId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getCustomCodesData() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/all-customCodes`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateGst(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/update-GST`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getNotificationConfiguration() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/view-notifications`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateNotificationConfiguration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/update/mail-storewise`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateNotificationisReview(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/notifications`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  turnOnReverseStock() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/reverseStock-on`,
          method: 'PUT',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  turnOffReverseStock() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/reverseStock-off`,
          method: 'PUT',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  UpdateWhatsappMsg(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/order-settings`,
          method: 'POST',
          data: JSON.stringify(data),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  UpdateWhatsappDaily(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/sale-settings`,
          method: 'POST',
          data: JSON.stringify(data),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  UpdateGstSummaryMonthly(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/pos/merchant/update-gstNotification`,
          method: 'POST',
          data: JSON.stringify(data),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getGstSummaryMonthlyDetails(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/pos/merchant/get-gstNotification?storeId=${storeId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getWhatsappDetails() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/whatsapp/settings`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postTerminalConfiguration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/terminal-settings`,
          method: 'POST',
          data: JSON.stringify(data),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getTerminalConfiguration(storeId, terminalId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/get/terminal-settings?storeId=${storeId}&terminalId=${terminalId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postEndShiftEmail(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/mail-notifications`,
          method: 'PUT',
          data: JSON.stringify(data),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postEndShiftWhatsapp(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/msg-notifications`,
          method: 'PUT',
          data: JSON.stringify(data),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postlowStockWhatsapp(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/lowStockmsg`,
          method: 'PUT',
          data: JSON.stringify(data),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  customerCreditBulkClose(option) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer-creditbill`,
          method: 'POST',
          data: JSON.stringify(option),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  merchantWiseConfiguration(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/merchantstorewise-customer`,
          method: 'POST',
          data: data,
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getMerchantWiseCustomerConfiguration() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/view-allcustomers-merchantwise`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getNamesAndNumbersOfCustomers() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/staff/getnames-numbers`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default SettingServices;
