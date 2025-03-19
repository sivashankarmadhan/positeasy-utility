import { AppConstants } from 'src/constants/AppConstants';
import APIService from '../apiService';
import handleCallback from './Callback';
const API = import.meta.env.VITE_REMOTE_URL;

const BannerServices = {
  postBannerImage(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/bannerImage`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getBannerImages() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/get-bannerImage`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  deleteBannerImage(id) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/remove-bannerImage?id=${id}`,
          method: 'DELETE',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default BannerServices;
