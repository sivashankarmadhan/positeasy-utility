import APIService from '../apiService';
import handleCallback from './Callback';
const API = import.meta.env.VITE_REMOTE_URL;

const ExpenseServices = {
  getExpenseItemList() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/expense-names`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getCategoryList() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/expense-category`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default ExpenseServices;
