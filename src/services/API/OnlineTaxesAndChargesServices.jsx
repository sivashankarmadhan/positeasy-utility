import APIService from '../apiService';
import handleCallback from './Callback';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
const API = import.meta.env.VITE_REMOTE_URL;

const OnlineTaxesAndChargesServices = {
  getTaxesAndChargesList(options) {
    let query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/all-TaxesAndCharges${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addTax(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/create-Group`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editTax(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/edit-Group`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  toggleTax(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/group-toggle`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default OnlineTaxesAndChargesServices;
