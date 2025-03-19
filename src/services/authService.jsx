import get from 'lodash/get';
import { CustomCodeTypes, OrderTypeConstants, ROLES_DATA } from 'src/constants/AppConstants';
import { ROLE_STORAGE, StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import GlobalStorageService from './GlobalStorageService';
import Navigation from './NavigationService';
const AuthService = {
  _getAccessToken() {
    return get(ObjectStorage.getItem(StorageConstants.ACCESS_TOKEN), 'token');
  },
  _getRefreshToken() {
    return get(ObjectStorage.getItem(StorageConstants.REFRESH_TOKEN), 'token');
  },
  logout() {
    ObjectStorage.removeItem(StorageConstants.ACCESS_TOKEN);
    ObjectStorage.removeItem(StorageConstants.REFRESH_TOKEN);
    ObjectStorage.removeItem(StorageConstants.MERCHANT_DETAILS);
    ObjectStorage.removeItem(StorageConstants.STORES_FULL_DETAILS);
    // ObjectStorage.removeItem(StorageConstants.SELECTED_DATES);
    ObjectStorage.removeItem(ROLE_STORAGE.ROLE);
    Navigation.navigateToLogin();
  },

  _billingLogout() {
    ObjectStorage.removeItem(StorageConstants.BILLING_KEY_STATUS);
  },
  _getMerchantDetails() {
    return get(ObjectStorage.getItem(StorageConstants.MERCHANT_DETAILS), 'data');
  },
  goto404() {
    window.location.href = '*';
  },
  _getMerchantId() {
    return get(ObjectStorage.getItem(StorageConstants.MERCHANT_DETAILS), 'data.merchantId');
  },
  getBillingKey() {
    return get(ObjectStorage.getItem(StorageConstants.BILLING_KEY_STATUS), 'key');
  },
  getCustomCodeMode() {
    return get(ObjectStorage.getItem(StorageConstants.CUSTOM_CODE_MODE), 'value', false);
  },
  getCustomerCodeMode() {
    return get(ObjectStorage.getItem('CustomerCodeMode'), 'value', false);
  },
  getPrintMode() {
    return get(ObjectStorage.getItem(StorageConstants.PRINT_MODE), 'value', false);
  },
  getCustomerCodeType() {
    return get(ObjectStorage.getItem('CustomerCodeType'), 'value', CustomCodeTypes.FREETEXT);
  },
  getCustomerCodes() {
    return ObjectStorage.getItem('CustomerCodes') || [];
  },
  getCustomCodes() {
    return ObjectStorage.getItemArray(StorageConstants.CUSTOM_CODES) || [];
  },
  getBillingKeyStatus() {
    return get(ObjectStorage.getItem(StorageConstants.BILLING_KEY_STATUS), 'value', false);
  },
  getDeviceId() {
    return get(ObjectStorage.getItem(StorageConstants.DEVICE_UNIQUE_ID), 'id');
  },
  getCurrentRoleInWindow() {
    return GlobalStorageService.getItem(ROLE_STORAGE.ROLE);
  },
  getCurrentRoleInLocal() {
    return get(ObjectStorage.getItem(ROLE_STORAGE.ROLE), 'role', ROLES_DATA.master.role);
  },
  getTokenDetails() {
    if (this._getAccessToken())
      return JSON.parse(window.atob(this._getAccessToken().split('.')[1]));
    else return {};
  },
  getRemoteURL() {
    return import.meta.env.VITE_REMOTE_URL;
  },
  getShopName() {
    return get(
      ObjectStorage.getItem(StorageConstants.MERCHANT_DETAILS),
      'data.storeName',
      import.meta.env.REACT_APP_SHOP_NAME
    );
  },
  getAddress() {
    return get(
      ObjectStorage.getItem(StorageConstants.MERCHANT_DETAILS),
      'data.address',
      import.meta.env.REACT_APP_SHOP_ADDRESS
    );
  },
  getOrderTypes() {
    return ObjectStorage.getItem(StorageConstants.ORDER_TYPES) || {};
  },
  getSelectedUSBPrinter() {
    return ObjectStorage.getItem(StorageConstants.SELETED_USB_PRINTER) || {};
  },
  getSelectedBLEPrinter() {
    return ObjectStorage.getItem(StorageConstants.SELETED_BLE_PRINTER) || {};
  },
  getSelectedLANPrinter() {
    return ObjectStorage.getItem(StorageConstants.SELETED_LAN_PRINTER) || {};
  },
  getSelectedKOTUSBPrinter() {
    return ObjectStorage.getItem(StorageConstants.SELETED_KOT_USB_PRINTER) || {};
  },

  getSelectedKOTLANPrinter() {
    return ObjectStorage.getItem(StorageConstants.SELETED_KOT_LAN_PRINTER) || {};
  },
  getSelectedKOTBLEPrinter() {
    return ObjectStorage.getItem(StorageConstants.SELETED_KOT_BLE_PRINTER) || {};
  },
  getSelectedStoreId() {
    const selectedStoreAndTerminal = ObjectStorage.getItem(
      StorageConstants.SELECTED_STORE_AND_TERMINAL
    );
    return get(selectedStoreAndTerminal, 'storeId');
  },
  getSelectedTerminal() {
    const selectedStoreAndTerminal = ObjectStorage.getItem(
      StorageConstants.SELECTED_STORE_AND_TERMINAL
    );
    return get(selectedStoreAndTerminal, 'terminalId');
  },
};

export default AuthService;
