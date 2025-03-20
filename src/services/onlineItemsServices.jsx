import { AppConstants } from 'src/constants/AppConstants';
import APIService from './apiService';
import AuthService from './authService';
import handleCallback from './API/Callback';
const API = AuthService.getRemoteURL();

const ONLINE_ITEMS = {
  createOnlineItem(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/add-items`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  toggleOnlineItems(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/item-toggle`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllOnlineCategoryList(storeReference) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/category-names?storeReference=${storeReference}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllOnlineCategoryListForItems(storeReference) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/associate/category-names?storeReference=${storeReference}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAllParentOnlineCategoryList(storeReference) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/parent/category-names?storeReference=${storeReference}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  publishFD(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/catalogue-publish`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  FDImportCurrentStock(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/import-currentStock`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postCategoryAssociateItem(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/category/associate-item`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postCategoryDissociateItem(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/category/dissociate-item`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default ONLINE_ITEMS;
