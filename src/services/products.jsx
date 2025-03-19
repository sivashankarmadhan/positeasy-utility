import { forEach, get, isEmpty } from 'lodash';
import { StockMonitorConstants } from 'src/constants/AppConstants';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import handleCallback from './API/Callback';
import { Query } from './API/Query';
import APIService from './apiService';
import AuthService from './authService';
const API = AuthService.getRemoteURL();

const PRODUCTS_API = {
  getProducts() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/products/full-view`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateOrderStatus(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/update/order-status`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductName(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-nameList${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getStaffName() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/get-attendance-name`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getProductCategoryList(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/product-categories`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getInventoryProductCategoryList(options) {
    let query = '';
    if (get(options, 'status')) {
      forEach(get(options, 'status'), (value) => {
        query += `&status=${value}`;
      });
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/list-category?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductCategoryWise(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/category-wise`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getProductCounterList(storeId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/view-allCounters?storeId=${storeId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductList() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/get-products`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getInventoryProducts(options) {
    const { page, size, category, stockMonitor, status, prodName, counterId } = options;
    let query = '';
    if (status) {
      forEach(status, (value) => {
        query += `&status=${value}`;
      });
    }
    if (stockMonitor) {
      forEach(stockMonitor, (value) => {
        if (value === StockMonitorConstants.ENABLED) query += `&stockMonitor=true`;
        if (value === StockMonitorConstants.DISABLED) query += `&stockMonitor=false`;
      });
    }
    if (category) {
      forEach(category, (value) => {
        query += `&category=${value}`;
      });
    }
    if (counterId) {
      forEach(counterId, (value) => {
        query += `&counterId=${value}`;
      });
    }
    if (prodName) {
      query += `&prodName=${prodName}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/products-inventory?page=${page}&size=${size}${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getBillingProducts() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/products-billing`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getProductsStausWise(options, sortingOrder) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/products/status-wise?${
            options !== undefined ? `status=${options}&sort=${sortingOrder}` : ''
          }`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductUnitDetails(shortCode) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/product-units?shortCode=${shortCode}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStocks() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-inventory`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStockReport(options) {
    const { size, page, name, stockType, storeName } = options;
    let query = Query(options);

    if (stockType) {
      query += `&stockType=${stockType}`;
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-details?${
            name
              ? `${query}&size=${size}&page=${page}&name=${name}&storeName=${storeName}`
              : `${query}&size=${size}&page=${page}&storeName=${storeName}`
          }`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAttendanceReport(options) {
    const { size, page, accessId, attendance, storeName } = options;
    const query = Query(options);
    let addData = '';
    if (accessId) {
      addData = addData + `&accessId=${accessId}`;
    }
    if (attendance) {
      addData = addData + `&attendance=${attendance}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/get-attendance-reports?${`${query}&size=${size}&page=${page}&${addData}&storeName=${storeName}`}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getStockSummary(options) {
    const { size, page, name, stockType, storeName } = options;
    let query = Query(options);
    return new Promise((resolve, reject) => {
      if (stockType) {
        query += `&stockType=${stockType}`;
      }
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-summary?${
            name
              ? `${query}&size=${size}&page=${page}&name=${name}&storeName=${storeName}`
              : `${query}&size=${size}&page=${page}&storeName=${storeName}`
          }`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  // getAttendanceReport(options) {
  //   const { size, page, accessId, attendance } = options;
  //   const query = Query(options);
  //   let addData = '';
  //   if (accessId) {
  //     addData = addData + `&accessId=${accessId}`;
  //   }
  //   if (attendance) {
  //     addData = addData + `&attendance=${attendance}`;
  //   }
  //   return new Promise((resolve, reject) => {
  //     APIService.request(
  //       {
  //         url: `${API}/api/v1/POS/merchant/get-attendance-reports?${`${query}&size=${size}&page=${page}&${addData}`}`,
  //         method: 'GET',
  //         headers: { 'Content-Type': 'application/json' },
  //       },
  //       handleCallback(resolve, reject)
  //     );
  //   });
  // },
  // getAttendanceReport(options) {
  //   const { size, page, accessId, attendance } = options;
  //   const query = Query(options);
  //   let addData = '';
  //   if (accessId) {
  //     addData = addData + `&accessId=${accessId}`;
  //   }
  //   if (attendance) {
  //     addData = addData + `&attendance=${attendance}`;
  //   }
  //   return new Promise((resolve, reject) => {
  //     APIService.request(
  //       {
  //         url: `${API}/api/v1/POS/merchant/get-attendance-reports?${`${query}&size=${size}&page=${page}&${addData}`}`,
  //         method: 'GET',
  //         headers: { 'Content-Type': 'application/json' },
  //       },
  //       handleCallback(resolve, reject)
  //     );
  //   });
  // },
  getAttendanceSummary(options) {
    const { accessId } = options;
    const query = Query(options);
    let addData = '';
    if (accessId) {
      addData = addData + `&accessId=${accessId}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/summary/attendance?${`${query}&${addData}`}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getEndShiftReports(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/shift-billing${query}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getS3Link(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/s3/product-image`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteCategory(categoryId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/del-expensecategory?storeId=Store1s&categoryId=${categoryId}`,
          method: 'DELETE',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  addProduct(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/add-product`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addPurchaseCategory(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/expense-category`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  editPurchaseCategory(options, categoryId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/update-expensecategory?categoryId=${categoryId}`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getExpenseCategory() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/expenseCategoryGet`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getPurchaseCategory(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/expense-getcategory${query}`,
          method: 'GET',
          // headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  addPartnerInventory(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/upload/inventory-file`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  importInventory(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/product/import-inventory`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addPartnerReport(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stores/upload/order-file`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addProductUnitWise(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/add-product/unit-wise`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateProduct(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/patch-product`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-update`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateStockAlert(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/product-update-StockAlert`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateRawProductAlert(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/updaterawproductAlert`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  monitorOff(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/turn-off/monitor`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  resetStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-reset`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateProductStatus(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/change-status`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteProduct(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove-product`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteAddon(addOnId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove-addons?addOnId=${addOnId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addExpenses(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/daily-expense`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getExpenseByDate(options) {
    const { size, page, sort, storeName } = options;
    let query = Query(options);

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/expense-stats?${query}&size=${size}&page=${page}&sort=${sort}&storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getExpensecategoryWise(options) {
    const { size, page, sort, storeName } = options;
    let query = Query(options);

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report-expenseCategoryWise?${query}&size=${size}&page=${page}&sort=${sort}&storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getExpenseSummary(options) {
    let query = Query(options);

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/summary/expense-stats?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getLastTenExpenses({ page, size }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/recent-expense?page=${page}&size=${size}`,

          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getImage(src) {
    return new Promise((resolve, reject) => {
      APIService.fetchImage(
        src,
        {
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAddons(status, sorting) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/addons`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAddonsStatusWise(options) {
    let query = '';
    const { storeId, status, page, size, prodName } = options;
    if (prodName) {
      query += `&addOnName=${prodName}`;
    }
    if (status) {
      forEach(status, (value) => {
        query += `&status=${value}`;
      });
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/addons/status-wise?storeId=${storeId}&${
            options !== undefined ? `size=${size}&page=${page}${query}` : ''
          }`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getAddonsById(productId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/product-addons?productId=${productId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addAddon(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/add-addons`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateAddon(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/patch-addons`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateAddonStatus(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/change-addOnStatus`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  linkAddon(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/link-addons`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deLinkAddon(addOnId, productId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/delink/product-addons?addOnId=${addOnId}&productId=${productId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deLinkAddonOnAll(addOnId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/delink-addons?addOnId=${addOnId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  checkStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-check`,
          method: 'POST',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  deleteExpense(expenseId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/remove/daily-expense?expenseId=${expenseId}`,
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateExpense(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/edit/daily-expense`,
          method: 'PUT',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  checkProductIdAvailability(productId) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/productId-check?productId=${productId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOrdersList(options, { orderStatus, paymentTypes }) {
    let query = ObjectToQueryParams(options);
    if (!isEmpty(paymentTypes)) {
      forEach(paymentTypes, (e) => {
        query += `&type=${e}`;
      });
    }
    if (!isEmpty(orderStatus)) {
      forEach(orderStatus, (e) => {
        query += `&status=${e}`;
      });
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/get-billPayments${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOrderDetails(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/order-details${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPaymentDetails({ paymentId }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/payment-details?paymentId=${paymentId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postPayment(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/balance-payment`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postRefundPayment(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/payment/staff/initiate-refund`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
  creditPayment(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/store-credit/payment`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getCustomerOrders({ customerId }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/all-orders?customerId=${customerId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getCustomerDetails({ customerId }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/get-customer?customerId=${customerId}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getSales({ date, startDate, endDate }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/custom-range?startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getSalesForOneDay({ date, startDate, endDate }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/custom-day?startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPayments({ date, startDate, endDate }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/payment/custom-range?startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPaymentsForOneDay({ date, startDate, endDate }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/payment/custom-day?startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getRecentTransactions(status) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/dashboard/recent-orders?paymentStatus=${status}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getTrendingProducts(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/dashboard/trending-products${query}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getTrendingPrice(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/dashboard/trending-products/amount${query}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getTrendingCategories({ storeId, startDate, endDate }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/dashboard/trending-categories?storeId=${storeId}&startDate=${startDate}&endDate=${endDate}`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPreviewOrderId() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/last-order`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postBulkOfflineOrders(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/shift-wise/transaction-billing`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  putBulkSession(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/update-session`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  addEditCustomerOnBill(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/update/customer`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  postHoldOn(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/hold-booking`,
          method: 'POST',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportOrdersAsCsv(options, csvColumns) {
    let query = ObjectToQueryParams(options);
    forEach(csvColumns, (_value, _key) => {
      if (_value) {
        query += `&column=${_key}`;
      }
    });
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/order-wise-csv${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportOrdersAsExcel(options, csvColumns) {
    let query = ObjectToQueryParams(options);
    forEach(csvColumns, (_value, _key) => {
      if (_value) {
        query += `&column=${_key}`;
      }
    });
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/order-wise-xlsx${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportOrdersAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/order-wise-pdf${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportOrdersSummaryAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/delivery-summary-PDF${query}&filename=Delivery-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportTerminalsReportAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/terminal-wise-csv${query}&filename=terminals-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportPaymentsAsCsv(options, paymentMode) {
    let query = ObjectToQueryParams(options);

    if (!isEmpty(paymentMode)) {
      forEach(paymentMode, (value) => {
        query += `&mode=${value}`;
      });
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/transaction-wise-csv${query}&filename=payments-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportPaymentsAsExcel(options, paymentMode) {
    let query = ObjectToQueryParams(options);

    if (!isEmpty(paymentMode)) {
      forEach(paymentMode, (value) => {
        query += `&mode=${value}`;
      });
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/transaction-wise-xlsx${query}&filename=payments-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCategaryAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/category-wise-csv${query}&filename=category-report.csv `,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportMembershipAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/memberShip/report-memberShipCsv${query}&filename=membership-report.csv `,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCategoryAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/category-wise-pdf${query}&filename=category-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportMembershipAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/memberShip/report-memberShipPdf${query}&filename=membership-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCategoryAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/category-wise-xlsx${query}&filename=category-report.xlsx `,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportMembershipAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/memberShip/report-memberShipXlsx${query}&filename=membership-report.xlsx `,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCustomCodeAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/customCode-pdf${query}&filename=custom-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCustomAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/customCode-xlsx${query}&filename=custom-report.xlsx `,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCustomCodeAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/customCode-csv${query}&filename=custom-report.csv `,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportProductsAsCsv(options, isDayWise, DayStock) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/${
            DayStock ? 'stockCount-csv' : isDayWise ? 'day-wise/product-csv' : 'product-wise-csv'
          }${query}&filename=products-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportProductsAsPdf(options, isDayWise, DayStock) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/${
            DayStock ? 'stockCount-pdf' : isDayWise ? 'day-wise/product-pdf' : 'product-wise-pdf'
          }${query}&filename=products-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportProductsAsExcel(options, isDayWise, DayStock) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/${
            DayStock ? 'stockCount-xlsx' : isDayWise ? 'day-wise/product-xlsx' : 'product-wise-xlsx'
          }${query}&filename=products-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCountersAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/counter-wise-csv${query}&filename=counters-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportCountersAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/counter-wise-pdf${query}&filename=counters-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportCountersAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/counter-wise-xlsx${query}&filename=counters-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  wastageExpensesAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/wastage-csv${query}&filename=wastage-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportExpensesAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/expense-stats-csv${query}&filename=expense-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportExpensesCategoryAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report-expenseCategoryWiseCsv${query}&filename=expense-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportExpensesAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/expense-pdf${query}&filename=expense-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportExpensesCategoryAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report-expenseCategoryWisePdf${query}&filename=expense-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  wastageExpensesAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/wastage-xlsx${query}&filename=wastage-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportExpensesAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/expense-stats-xlsx${query}&filename=expense-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportExpensesAsCategoryExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report-expenseCategoryWiseXlsx${query}&filename=expense-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportGstAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/GST-csv${query}&filename=gst-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportGstAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/GST-pdf${query}&filename=gst-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportGstAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/GST-xlsx${query}&filename=gst-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportProfitLossAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/profit-loss-csv${query}&filename=profit-loss-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportProfitLossAsPdf(options) {
    const query = ObjectToQueryParams(options);
    console.log('query', query);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/profit-loss-pdf${query}&filename=profit-loss-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportProfitLossAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/profit-loss-xlsx${query}&filename=profit-loss-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportStocksAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/stocks-csv${query}&filename=stocks-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportStocksAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/stocks-xlsx${query}&filename=stocks-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportStocksAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/stocks-pdf${query}&filename=stocks-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  wastagePdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/getwastage-pdf${query}&filename=wastage-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportStocksSummaryAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/stocks-summary-pdf${query}&filename=stocks-summary-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportStocksSummaryAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/stocks-summary-csv${query}&filename=stocks-summary-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportStocksSummaryAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/stocks-summary-xlsx${query}&filename=stocks-summary-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportAttendanceAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/attendance-pdf${query}&filename=attendance-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportAttendanceAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/attendance-csv${query}&filename=attendance-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportAttendanceAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/attendance-xlsx${query}&filename=attendance-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportTerminalOrdersAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/terminal-wise-pdf${query}&filename=terminals-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportTerminalOrdersAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/terminal-wise-xlsx${query}&filename=terminal-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportShiftWiseAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/shift-wise-pdf${query}&filename=shift-wise-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportShiftWiseAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/shift-wise-xlsx${query}&filename=shift-wise--report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportShiftWiseAsCsv(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/shift-wise-csv${query}&filename=shift-wise--report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportCustomersAsCsv() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/customer/export-all?testData=test&filename=customers-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  orderBillEdit(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/order/edit-bill`,
          method: 'PUT',
          data: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  updateRawMaterialStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/stock-update`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  resetRawMaterialStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/stock-reset`,
          method: 'POST',
          data: JSON.stringify(options),
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  rawValue(options) {
    const query = ObjectToQueryParams(options);

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/get-rawValueExist${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportRawMaterialListAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/stock-inventory-PDF${query}&filename=raw-material-list.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportRawMaterialListAsExcel(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/stock-inventory-xlsx${query}&filename=raw-material-list.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  exportPurchaseOrdersAsCsv(options, csvColumns) {
    let query = ObjectToQueryParams(options);
    forEach(csvColumns, (_value, _key) => {
      if (_value) {
        query += `&column=${_key}`;
      }
    });
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/purchase-csv${query}&filename=purchase-orders-report.csv`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportPurchaseOrdersAsExcel(options, csvColumns) {
    let query = ObjectToQueryParams(options);
    forEach(csvColumns, (_value, _key) => {
      if (_value) {
        query += `&column=${_key}`;
      }
    });
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/purchase-xlsx${query}&filename=purchase-orders-report.xlsx`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportPurchaseOrdersAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/purchase-PDF${query}&filename=purchase-orders-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportInventoryListAsPdf(options) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/stock-inventory-PDF${query}&filename=stock-inventory-list.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  exportS3Link(options, timeout) {
    const query = ObjectToQueryParams(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/S3Link${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject),
        timeout
      );
    });
  },
  bulkOrdersDelete(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/order-delete/stock`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  bulkOrdersDeleteWithStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/order-delete/with-stock`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getWastage(options) {
    const { size, page, name, storeName, stockType } = options;
    let query = Query(options);

    if (stockType) {
      query += `&stockType=${stockType}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/getallwastage?${
            name
              ? `${query}&size=${size}&page=${page}&name=${name}&storeName=${storeName}`
              : `${query}&size=${size}&page=${page}&storeName=${storeName}`
          }`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
        handleCallback(resolve, reject)
      );
    });
  },
  bulkOrdersDeleteWithoutStock(options) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/order-delete/without-stock`,
          method: 'PUT',
          data: JSON.stringify(options),
        },
        handleCallback(resolve, reject)
      );
    });
  },
  verifyRefund(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/payment/staff/verify-refund`,
          method: 'POST',
          data: data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};
export default PRODUCTS_API;
