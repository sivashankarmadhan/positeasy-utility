import { AppConstants } from 'src/constants/AppConstants';
import APIService from './apiService';
import AuthService from './authService';
import handleCallback from './API/Callback';
const API = AuthService.getRemoteURL();
export const S3Service = {
  sendFile(options) {
    return new Promise((resolve, reject) => {
      fetch(options.s3URL, {
        method: 'PUT',
        headers: {
          'Content-Type': options.file.type,
          'Cache-Control': 'max-age=3600',
        },
        body: options.file,
      })
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  },
  getCountersLink() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/s3/counter-image?format=jpeg`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStaffPhotoURL() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/s3/staff-image?format=png`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPurchaseCategoryImageLink() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/s3/expenseCategory-image?format=png`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getLink() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/s3/product-image?format=jpeg`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};
