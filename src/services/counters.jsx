import APIService from './apiService';
import handleCallback from './API/Callback';
import AuthService from './authService';
const API = AuthService.getRemoteURL();
const COUNTERS_API = {
  updateCounter(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/update-counterInfo`,
          data: JSON.stringify(options),
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addCounter(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/add-counter`,
          method: 'POST',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getAllCounters() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/view-allCounters`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  removeCounter(counterId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove-counter?counterId=${counterId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  linkCounter(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/link-counter`,
          data: JSON.stringify(options),
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  unlinkCounter(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/unlink-counter`,
          data: JSON.stringify(options),
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
}

export default COUNTERS_API;
