import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import APIService from '../apiService';
import handleCallback from './Callback';

const API = import.meta.env.VITE_REMOTE_URL;

const VendorServices = {
  addVendor(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/add-vendor`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  allVendors(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/view-allvendors${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  removeVendor(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/remove-vendor${query}`,
          method: 'DELETE',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getVendor(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/get-vendor${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editVendor(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/edit-vendor`,
          method: 'PUT',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getVendorNames() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/get-vendorNames`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getVendorPurchaseOrdersList(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/get-vendorPurchases${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default VendorServices;
