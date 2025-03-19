import { Box, Chip, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import { Button } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { find, forEach, get, isEmpty, map, reduce } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard1';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  ALL_CONSTANT,
  ProductTableColumns,
  ProductTableHeaders,
  USER_AGENTS,
  hideScrollbar,
  ProductSortTable,
  ProductTableColumnsForDayWise,
  ProductTableColumnsOpenOrders,
} from 'src/constants/AppConstants';
import { productReportTourConfig } from 'src/constants/TourConstants';
import { allCategories, currentStoreId, currentTerminalId, stores } from 'src/global/recoilState';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { getCurrentDate } from 'src/helper/FormatTime';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import BookingServices from 'src/services/API/BookingServices';
import FilterComponent from './FilterComponent';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import triggerPrint from 'src/helper/triggerPrint';
import { storeLogo, reportSummaryState } from 'src/global/recoilState';
import PRODUCTS_API from 'src/services/products';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import { IndFormat } from 'src/utils/formatTime';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import moment from 'moment';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import statusColor from 'src/utils/statusColor';

export default function ProductTableOpenOrders({ productList }) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const [orderAnalytics, setOrderAnalytics] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [bestSellerName, setBestSellerName] = useState(0);
  const [bestSellerQuantity, setBestSellerQuantity] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [bestSellerPrice, setBestSellerPrice] = useState(0);
  const [filterTable, setFilterTable] = useState([]);
  const [pdfTable, setPdfTable] = useState([]);
  const [total, setTotal] = useState(0);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const transactionData = orderAnalytics.data;
  const [customCode, setCustomCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [categorizeCode, setCategorizeCode] = useState('');
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [currentCustomCode, setCurrentCustomCode] = useState({ label: '', id: '' });
  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', id: '' });
  const [currentCategorizeCode, setCurrentCategorizeCode] = useState({ label: '', id: '' });
  const [categoriesList, setCategoriesList] = useRecoilState(allCategories);
  const [counterList, setCounterList] = useState([]);
  const logo = useRecoilValue(storeLogo);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const isSinglePage = size >= rowCount;
  const [counter, setCounter] = useState({});
  const [productName, setProductName] = useState(null);
  const [totalProductSaleParcel, setTotalProductSaleAndParcel] = useState(0);
  const [categorySort, setCategorySort] = useState(false);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [productWiseSort, setProductWiseSort] = useState('soldquantity');
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);

  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState();

  const handleCustomCode = (e) => {
    setCustomCode(get(e, 'id'));
    setCurrentCustomCode(e);
  };
  const handleCategorizeCode = (e) => {
    setCategorizeCode(get(e, 'id'));
    setCurrentCategorizeCode(e);
  };
  const handleCustomerId = (e) => {
    setCustomerId(get(e, 'id'));
    setCurrentCustomerCode(e);
  };
  const handleChangeCounter = (e) => {
    setCounter(e);
  };

  // const getProductCategoryList = async () => {
  //   if (currentStore === undefined || currentStore === 'undefined') return;
  //   try {
  //     const response = await PRODUCTS_API.getProductCategoryList();
  //     if (response) setCategoriesList(response.data);
  //   } catch (e) {
  //     console.log(e);
  //     setCategoriesList([]);
  //   }
  // };

  // const getProductCounterList = async () => {
  //   if (currentStore === undefined || currentStore === 'undefined') return;
  //   try {
  //     const response = await PRODUCTS_API.getProductCounterList(currentStore);
  //     if (response) setCounterList(response.data);
  //   } catch (e) {
  //     console.log(e);
  //     setCounterList([]);
  //   }
  // };

  // const getProductList = async () => {
  //   if (currentStore === undefined || currentStore === 'undefined') return;
  //   try {
  //     const response = await PRODUCTS_API.getProductList(currentStore);
  //     if (response) setProductList(response.data);
  //   } catch (e) {
  //     console.log(e);
  //     setProductList([]);
  //   }
  // };

  // useEffect(() => {
  //   getProductList();
  // }, [currentStore, currentStore]);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getProductReports = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      setLoading(true);
      const options = {
        startDateD: IndFormat({ startDate }),
        endDateD: IndFormat({ endDate }),
        // customCode: customCode,
        // customerId: customerId,
        // category: categorizeCode,
        // counterId: get(counter, 'id'),
        size,
        page,
        // categoryWise: categorySort,
        // filter: productWiseSort,
        searchProductName: get(productName, 'id'),
        orderId,
        // storeName: storeName,
      };
      const serverResponse = await BookingServices.getProductsReportOfRAForOpenOrders(options);

      setFilterTable(get(serverResponse, 'data.orderData', []));
      setBestSellerPrice(get(serverResponse, 'data.data[0].price', 0));
      setRowCount(get(serverResponse, 'data.totalItems', 0));
      const arr = map(get(serverResponse, 'data.topThreeProduct', []), (ob) => ob.sold_quantity);
      const sum = arr.reduce(function (previousValue, currentValue) {
        return previousValue + currentValue;
      }, 0);
      setTotal(sum);
      setBestSellerName(get(serverResponse, 'data.topThreeProduct.0.name', ''));
      setBestSellerQuantity(get(serverResponse, 'data.topThreeProduct.0.sold_quantity', 0));
      setChartData(
        map(get(serverResponse, 'data.topThreeProduct'), (item) => {
          return { label: get(item, 'name'), value: Number(get(item, 'sold_quantity')) };
        })
      );
      setTotalProductSaleAndParcel({
        totalProductSale: get(serverResponse, 'data.totalProductSale', 0),
        totalParcelPrice: get(serverResponse, 'data.totalParcelPrice', 0),
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  useEffect(() => {
    console.log('currentStore', typeof currentStore);
    if (currentStore) getProductReports();
  }, [
    startDate,
    endDate,
    currentStore,
    currentTerminal,
    customCode,
    customerId,
    categorizeCode,
    counter,
    categorySort,
    page,
    size,
    productWiseSort,
    productName,
    orderId,
  ]);

  // useEffect(() => {
  //   getProductCategoryList();
  //   getProductCounterList();
  // }, []);

  const noSortableFields = ProductSortTable;

  let columns = ProductTableColumnsOpenOrders.map((column) => {
    const minWidthData =
      column.field === 'quantity' || column.field === 'orderId'
        ? 130
        : column.field === 'type' || column.field === 'name' || column.field === 'category'
        ? 180
        : 180;
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      ...(column.field === 'date' ? { maxWidth: 120 } : {}),
      headerClassName: 'super-app-theme--header',
      sortable: !noSortableFields.includes(column.field),
      ...((column.field === 'orderAmount' || column.field === 'quantity') && {
        type: 'number',
      }),
      ...(column.field === 'orderAmount'
        ? { valueFormatter: ({ value }) => toFixedIfNecessary((Number(value) || 0) / 100, 2) }
        : {}),
      ...(column.field === 'paymentStatus' && {
        renderCell: (params) => (
          <Chip
            size="small"
            color={statusColor(params.value)}
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
            }}
            label={`${get(params, 'value', 'Status not found')}`}
          />
        ),
      }),
    };
  });

  let rows =
    !isEmpty(filterTable) &&
    map(filterTable, (_data, _index) => {
      const { orderId, name, category, type, orderAmount, paymentStatus } = _data || {};
      return {
        id: _index + 1,
        orderId,
        name: _data['productOrders.productInfo']?.name,
        category: _data['productOrders.productInfo']?.category,
        quantity: _data['productOrders.quantity'],
        type,
        orderAmount,
        paymentStatus,
      };
    });

  const selectedProduct = find(productList, (_item) => {
    return get(_item, 'productId') === get(productName, 'id');
  });

  console.log('productList', productList, productName, selectedProduct);

  const csvDownload = async () => {
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        ...(get(counter, 'id') ? { counterId: get(counter, 'id') } : {}),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        ...(productName ? { productId: get(productName, 'id') } : {}),
        filter: productWiseSort,
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/${'day-wise/product-csv'}${query}`;
        const filename = generateFilename('Product_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportProductsAsCsv(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    }
  };

  const pdfDownload = async () => {
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        ...(get(counter, 'id') ? { counterId: get(counter, 'id') } : {}),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        ...(productName ? { productId: get(productName, 'id') } : {}),
        filter: productWiseSort,
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/${'day-wise/product-pdf'}${query}`;
        const filename = generateFilename('Product_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportProductsAsPdf(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    }
  };

  const excelDownload = async () => {
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        ...(get(counter, 'id') ? { counterId: get(counter, 'id') } : {}),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        ...(productName ? { productId: get(productName, 'id') } : {}),
        filter: productWiseSort,
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/${'day-wise/product-xlsx'}${query}`;
        const filename = generateFilename('Product_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportProductsAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
      console.log('err', err);
    }
  };

  const formatProductList = map(productList, (e) => {
    return {
      label: get(e, 'name'),
      id: get(e, 'productId'),
    };
  });

  return (
    <>
      <Box xs display="flex" alignItems="center">
        {reportSummary && (
          <Box my={2} className="step1">
            <FilterComponent
              handleCustomCode={handleCustomCode}
              handleCustomerId={handleCustomerId}
              handleCategorizeCode={handleCategorizeCode}
              currentCustomCode={currentCustomCode}
              currentCustomerId={currentCustomerId}
              currentCategorizeCode={currentCategorizeCode}
              categoriesList={categoriesList}
              filterTable={filterTable}
              title="ProductReport"
              docTitle="Product Report"
              headers={ProductTableHeaders}
              columns={ProductTableColumns}
              // printPdf={pdfDownload}
              // csvDownload={csvDownload}
              // excelDownload={excelDownload}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              isDisabledCustomCodeAndCustomer
              handleChangeCounter={handleChangeCounter}
              counter={counter}
              counterList={counterList}
              categorySort={categorySort}
              setCategorySort={setCategorySort}
              productWiseSort={productWiseSort}
              setProductWiseSort={setProductWiseSort}
              productName={productName}
              setProductName={setProductName}
              productList={map(productList, (e) => {
                return {
                  label: get(e, 'name'),
                  id: get(e, 'productId'),
                };
              })}
              isHideCategory
              // isHideProductName
              isHideFilter
              orderId={orderId}
              setOrderId={setOrderId}
              isOrderId
            />
          </Box>
        )}
      </Box>
      {isMobile ? (
        <Box xs display="flex" flex="row" justifyContent="center" alignItems="center">
          {reportSummary ? (
            <Box
              xs
              display="flex"
              flexDirection="row"
              alignItems="center "
              mb={4}
              fontWeight="bold"
              color="#5A0B45"
              onClick={() => {
                setReportSummary((prev) => !prev);
              }}
            >
              <u>apply filters </u>
              <ExpandLessIcon size={18} />
            </Box>
          ) : (
            <Box
              xs
              display="flex"
              flexDirection="row"
              alignItems="center"
              mb={4}
              fontWeight="bold"
              color="#5A0B45"
              onClick={() => {
                setReportSummary((prev) => !prev);
              }}
            >
              <u>apply filters</u>
              <ExpandMoreIcon size={18} />
            </Box>
          )}
        </Box>
      ) : (
        ''
      )}
      <Box
        sx={{
          height: isMobile ? `calc(100vh - 14rem)` : `calc(100vh - 17rem)`,
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        {
          <Box
            sx={{
              height: isMobile ? 'calc(100vh - 4rem)' : 'calc(100vh - 12rem)',
              width: '100%',
              '& .MuiDataGrid-columnHeaders': {
                minHeight: '60px !important',
                maxHeight: '70px !important',
              },
              '& .super-app-theme--header': {
                backgroundColor: theme.palette.primary.lighter,
                color: theme.palette.primary.main,
              },
              '& .MuiTypography-root': {
                textDecoration: 'none',
                color: '#212b36',
                fontSize: '14px',
              },
            }}
          >
            <StyledDataGrid
              sx={{
                '& .MuiTablePagination-actions': {
                  display: isSinglePage ? 'none' : 'block',
                },
              }}
              className="step5"
              rows={rows}
              rowCount={rowCount}
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: size, page: page - 1 } },
              }}
              pageSizeOptions={[10, 50, 100]}
              disableRowSelectionOnClick
              onPaginationModelChange={handlePagination}
              paginationMode="server"
              localeText={{ noRowsLabel: 'No product  reports found' }}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              componentsProps={{
                filterPanel: { sx: { maxWidth: '90vw' } },
              }}
              loading={loading}
            />
          </Box>
        }
      </Box>
      <TakeATourWithJoy config={productReportTourConfig} />
    </>
  );
}
