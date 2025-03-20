import APIService from '../apiService';
import handleCallback from './Callback';
const API = import.meta.env.VITE_REMOTE_URL;

const OptionsGroupServices = {
  addOptionsGroup(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/add-optionGroups`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editOptionsGroup(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/edit-optionGroups`,
          method: 'PUT',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addOptions(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/add-options`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editOptions(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/edit-options`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  allOptionsGroup({ page, size }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/group/all-items?page=${page}&size=${size}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  allOptions({ page, size }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/option/all-items?page=${page}&size=${size}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOptionsGroupList() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/optionGroup-names`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOptionsGroupListWithAssociatedItems(storeReference) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/OG/associated-items?storeReference=${storeReference}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  toggleOnlineOptionsGroup(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/OG-toggle`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default OptionsGroupServices;
