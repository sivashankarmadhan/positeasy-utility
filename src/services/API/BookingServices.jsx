import { forEach, get, isEmpty, map } from 'lodash';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import APIService from '../apiService';
import handleCallback from './Callback';
import { Query } from './Query';

const API = import.meta.env.VITE_REMOTE_URL;

const BookingServices = {
  getSevenDaysData() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/last-oneweek`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getThirtyDaysData() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/last-onemonth`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getOrderTypeData(options) {
    const query = Query(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/order-type?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductRawMaterials(options) {
    const query = Query(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/raw-products/product-ingredients?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getTodayData() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/today`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getLastTenDaysTransaction() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/recent-transactions`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getTransactionByOrderId(options) {
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

  getYesterdayData() {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/sale/yesterday`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getRAPaymentsData(options) {
    const query = Query(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/payment-mode?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getDashboardPaymentStatusData(todayDate) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/payment-response?date=${todayDate}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getPaymentsReportOfRA(options) {
    const { size, page, sort, storeName, mode } = options;
    let query = Query(options);
    if (options.mode) {
      forEach(options.mode, (value) => {
        query += `&mode=${value}`;
      });
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/transaction-wise?${query}&size=${size}&page=${page}&sort=${sort}&storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPaymentsReportForPdf(options, paymentMode) {
    let query = ObjectToQueryParams(options);

    if (!isEmpty(paymentMode)) {
      forEach(paymentMode, (value) => {
        query += `&mode=${value}`;
      });
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/transaction-wise-pdf${query}&filename=payments-report.pdf`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getPaymentReportSummary(options) {
    let query = Query(options);
    if (options.mode) {
      forEach(options.mode, (value) => {
        query += `&mode=${value}`;
      });
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/summary/transaction-wise?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getOrdersReportOfRA(options) {
    const { size, page, sort, status, storeName } = options;
    let query = Query(options);
    if (status) {
      query += `&status=${status}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/order-wise?${query}&size=${size}&page=${page}&sort=${sort}&storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOrdersReportSummary(options) {
    let query = Query(options);

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/summary/order-wise?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductsReportOfRA(options) {
    const {
      size,
      page,
      counterId,
      categoryWise,
      filter,
      searchProductName,
      endpoint,
      isDayWiseOrDayStock,
      storeName,
      date,
    } = options;
    let query = Query(options);

    if (counterId) {
      query += `&counterId=${counterId}`;
    }
    if (categoryWise) {
      query += `&categoryWise=${categoryWise}`;
    }
    if (filter) {
      query += `&filter=${filter}`;
    }

    if (date) {
      query += `&date=${date}`;
    }

    if (searchProductName) {
      query += `&${isDayWiseOrDayStock ? 'productId' : 'searchProductName'}=${searchProductName}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/${endpoint}/?${query}&size=${size}&page=${page}&storeName=${storeName}`,
          method: 'GET',
        },

        handleCallback(resolve, reject)
      );
    });
  },


  getCustomCodeReportOfRA(options) {
    const {
      size,
      page,
      endpoint,
      date,
      storeId,
      storeName
    } = options;
    let query = Query(options);
    if (storeName) {
      query += `&storeName=${storeName}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/${endpoint}/?${query}&size=${size}&page=${page}`,
          method: 'GET',
        },

        handleCallback(resolve, reject)
      );
    });
  },
  getProductsReportOfRAForOpenOrders(options) {
    const { size, page, counterId, categoryWise, filter, searchProductName, storeName, orderId } =
      options;
    let query = Query(options);

    if (counterId) {
      query += `&counterId=${counterId}`;
    }
    if (categoryWise) {
      query += `&categoryWise=${categoryWise}`;
    }
    if (filter) {
      query += `&filter=${filter}`;
    }

    if (searchProductName) {
      query += `&productId=${searchProductName}`;
    }

    if (storeName) {
      query += `&storeName=${storeName}`;
    }
    if (orderId) {
      query += `&orderId=${orderId}`;
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/on-table/open-requests?${query}&size=${size}&page=${page}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getProductsCategoryOfRA(options) {
    const { size, page, counterId, storeName } = options;
    let query = Query(options);

    if (counterId) {
      query += `&counterId=${counterId}`;
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/category-wise?${query}&size=${size}&page=${page}&storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getMembershipReports(options) {
    const { size, page, contactNumber, name, status } = options;
    let query = Query(options);

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/memberShip/get-memberShipReport?${query}&size=${size}&page=${page}&status=${status}&name=${name}&contactNumber=${contactNumber}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProductsReportOfStock(options) {
    const {
      size,
      page,
      date,
      productId,
      stockIn,
      stockOut,
      filter,
      searchProductName,
      endpoint,
      DayStock,
      storeName,
    } = options;

    // Construct the base query string
    let query = `date=${date || ''}`; // Date is a required parameter
    if (productId) {
      query += `&productId=${productId}`;
    }
    if (stockIn) {
      query += `&counterId=${stockIn}`;
    }
    if (stockOut) {
      query += `&categoryWise=${stockOut}`;
    }
    if (filter) {
      query += `&filter=${filter}`;
    }
    if (searchProductName) {
      query += `&${DayStock ? 'productId' : 'searchProductName'}=${searchProductName}`;
    }

    // Construct the final URL
    const url = `${API}/api/v1/POS/merchant/${endpoint}?${query}&size=${size}&page=${page}&storeName=${storeName}`;

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: url,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },

  getBestSellerData(options) {
    let query = Query(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/product/best-seller?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  fetchGstDetails(options) {
    return new Promise((resolve, reject) => {
      const query = ObjectToQueryParams(options);
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/GST${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  fetchGstSummaryReport(options) {
    return new Promise((resolve, reject) => {
      const query = ObjectToQueryParams(options);
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/summary/GST${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getProfitAndLossReportOfRA(options) {
    const { size, page, storeName } = options;
    const query = Query(options);
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/profit-loss?${query}&size=${size}&page=${page}&storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getCountersReportOfRA(options) {
    const { size, page, counterId, storeName } = options;
    let query = Query(options);

    if (counterId) {
      query += `&counterId=${counterId}`;
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/counter-wise?${query}&size=${size}&page=${page} &storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getTerminalsReportOfRA(options, counter) {
    let query = ObjectToQueryParams(options);

    if (!isEmpty(counter)) {
      map(counter, (e) => {
        query = `${query}&counterId=${get(e, 'id')}`;
      });
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/report/terminal-wise${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPurchaseOrdersReport(options) {
    const { size, page, sort, vendorId, status, storeName } = options;
    console.log(options);
    let query = Query(options);

    if (vendorId) {
      query += `&vendorId=${vendorId}`;
    }
    if (status) {
      query += `&status=${status}`;
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/reports?${query}&size=${size}&page=${page}&sort=${sort}&storeName=${storeName}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getOrderSummaryDetails(options) {
    const { size, page,  storeId,  delStart, delEnd, deliverySort } = options;

    let query = `size=${size}&page=${page}&storeId=${storeId}`;

    if (delStart) {
      query += `&delStart=${delStart}&delEnd=${delEnd}`;
    }

    if (deliverySort) {
      query += `&deliverySort=${deliverySort}`;
    }
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/order/product-summary?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  getPurchaseOrdersReportSummary(options) {
    const { vendorId, status } = options;
    let query = Query(options);

    if (vendorId) {
      query += `&vendorId=${vendorId}`;
    }
    if (status) {
      query += `&status=${status}`;
    }

    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/purchase/summary?${query}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default BookingServices;
