import handleCallback from './Callback';
import APIService from '../apiService';

const API = import.meta.env.VITE_REMOTE_URL;

const TABLESERVICES_API = {
  getTableList() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/store/all-tables`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  postCreateTable(details) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/create-table`,
          method: 'POST',
          data: details,
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  postTable(details) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/table-reserve`,
          method: 'POST',
          data: details,
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  postEditTableReserve(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/editTable-reserve`,
          method: 'PUT',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },

  postEditTableStatus(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/edit-table-status`,
          method: 'PUT',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },

  deleteCancelReservation(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/cancel-reservation?id=${data}`,
          method: 'DELETE',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  deleteTableImage(tableId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/delete-table?tableId=${tableId}`,
          method: 'DELETE',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  updateTableId(TableBody, id) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/tableOrder/merchantUpdate-table/${id}`,
          method: 'PUT',
          data: TableBody,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default TABLESERVICES_API;
