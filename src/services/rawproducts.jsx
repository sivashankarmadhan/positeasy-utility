import { forEach } from 'lodash';
import handleCallback from './API/Callback';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import APIService from './apiService';
import AuthService from './authService';
const API = AuthService.getRemoteURL();

const RAW_PRODUCTS_API = {
  getProducts(options) {
    const { page, size, status, prodName, category } = options;
    let query = '';
    if (status) {
      forEach(status, (value) => {
        query += `&status=${value}`;
      });
    }
    if (prodName) {
      query += `&prodName=${prodName}`;
    }

    if (category) {
      forEach(category, (value) => {
        query += `&category=${value}`;
      });
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/inventory?page=${page}&size=${size}${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStocks() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/stock-inventory`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getCategories() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/categories`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getLinkedProduct(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/ProductsByRawMaterial${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getBatches() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/batch-names`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  productIDAvailability(productId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/id-check?productId=${productId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  batchIDAvailability(batchId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/id-batch-check?batchId=${batchId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addProduct(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/add-product`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateProductStatus(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/change-status`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateProduct(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/edit-product`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteProduct(options) {
    const { productId } = options;
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/remove-product?productId=${productId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteIntegration(id) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/merchant/integration/delete?id=${id}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteSelectedProduct(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove-selected-product`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/stock-update`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  changeStatus(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/change-status`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getIngredients(productId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/product-ingredients?productId=${productId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addIngredients(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/add-ingredients`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateIngredients(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/upgrade-ingredients`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  removeIngredients(productId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/remove-productIng?productId=${productId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
};
export default RAW_PRODUCTS_API;
