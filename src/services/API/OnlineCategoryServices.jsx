import APIService from '../apiService';
import handleCallback from './Callback';
const API = import.meta.env.VITE_REMOTE_URL;

const OnlineCategoryServices = {
  addCategory(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/add-category`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editCategory(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/edit-category`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  toggleCategory(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/toggle-category`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  allCategories({ storeReference, size, page }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/all-categories?storeReference=${storeReference}&size=${size}&page=${page}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  categoryTiming(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/category-timing`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  categoryTimingTitleList({ storeReference }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/category-sessionTitle?storeReference=${storeReference}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default OnlineCategoryServices;
