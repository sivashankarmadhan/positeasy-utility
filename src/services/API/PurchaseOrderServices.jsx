import { forEach } from 'lodash';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import APIService from '../apiService';
import handleCallback from './Callback';

const API = import.meta.env.VITE_REMOTE_URL;

const PurchaseOrderServices = {
  addPurchaseOrder(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/create-order`,
          method: 'POST',
          data: data,
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
          url: `${API}/api/v1/POS/merchant/purchase/all-orders${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getAllVendorsPurchaseOrders(options, selectedStatusList) {
    let query = ObjectToQueryParams(options);
    if (selectedStatusList) {
      forEach(selectedStatusList, (value) => {
        query += `&status=${value}`;
      });
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/all-orders${query}&flow_type=VENDORS`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllPurchaseBills(options, selectedStatusList) {
    let query = ObjectToQueryParams(options);
    if (selectedStatusList) {
      forEach(selectedStatusList, (value) => {
        query += `&status=${value}`;
      });
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/all-bills${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPurchaseOrderDetails(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/order-details${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPurchaseOrderId() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/last-order`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getLogReceiverData({referenceId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/get-logs-Receiver?referenceId=${referenceId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getLogRequestData({referenceId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/get-logs-Request?referenceId=${referenceId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPurchaseLastOrder() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/last-purchaseOrder`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updatePurchaseOrderStatus(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/update-status`,
          method: 'PUT',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  payBillsFotPurchaseOrder(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/pay-bills`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deletePurchase(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/remove-purchase${query}`,
          method: 'DELETE',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  productListForStock() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-inventory`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateStockProduct(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/updateProduct-stock`,
          method: 'PUT',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  productListForPurchase() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/all-products`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  productStoreListForPurchase({storeId}) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/all-products?storeId=${storeId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  rawMaterialListForStock(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/stock-inventory${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  stockHistory(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/stock-history${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editProductStock(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/edit-purchase`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addToProductStock(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/add-to-productStock`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addToStoreProductStock(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/add-to-productStock`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addToRawMaterialStock(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/add-to-rawStock`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addToStoreRawMaterialStock(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/add-to-rawStock`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportPurchaseOrderAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/download-pdf${query}&filename=purchase-order-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportPurchaseStoreOrderAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/intent/download-pdf${query}&filename=purchase-store-order-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default PurchaseOrderServices;
