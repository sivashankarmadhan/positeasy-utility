import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { find, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  ALL_CONSTANT,
  hideScrollbar,
  ProductSortTable,
  ProductTableColumns,
  ProductTableColumnsForDayWise,
  ProductTableColumnsForStockDayWise,
  ProductTableHeaders,
  USER_AGENTS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { productReportTourConfig } from 'src/constants/TourConstants';
import {
  allCategories,
  currentDate,
  currentEndDate,
  currentStartDate,
  currentStoreId,
  currentTerminalId,
  reportSummaryState,
  storeLogo,
  stores,
  allConfiguration,
} from 'src/global/recoilState';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { generateFilename } from 'src/helper/generateFilename';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import BookingServices from 'src/services/API/BookingServices';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { DateTimes, IndFormat } from 'src/utils/formatTime';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import FilterComponent from './FilterComponent';
import ProductTableOpenOrders from './ProductTableOpenOrders';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard1';

const tabsOptions = [
  {
    label: 'Over All',
    value: 'overAll',
  },
  {
    label: 'Day Wise',
    value: 'dayWise',
  },
  {
    label: 'Daily Stock ',
    value: 'stockDayWise',
  },
  {
    label: 'Open Orders',
    value: 'openOrders',
  },
];

export default function ProductTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
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
  const [date, setDate] = useRecoilState(currentDate);
  const isSinglePage = size >= rowCount;
  const [counter, setCounter] = useState({});
  const [productName, setProductName] = useState(null);
  const [totalProductSaleParcel, setTotalProductSaleAndParcel] = useState(0);
  const [categorySort, setCategorySort] = useState(false);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [productWiseSort, setProductWiseSort] = useState('soldquantity');
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState(get(tabsOptions, '0.value'));
  const [productList, setProductList] = useState();

  const isDayWise = selectedTab === get(tabsOptions, '1.value');
  const DayStock = selectedTab === get(tabsOptions, '2.value');

  const isOpenOrders = selectedTab === tabsOptions[3].value;

  console.log('DayStock', DayStock);

  const isDayWiseOrDayStock =
    selectedTab === get(tabsOptions, '1.value') || selectedTab === get(tabsOptions, '2.value');

  const isHideCategory = isDayWiseOrDayStock;
  const isHideCounter = isDayWiseOrDayStock;
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

  const getProductCategoryList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const response = await PRODUCTS_API.getProductCategoryList();
      if (response) setCategoriesList(response.data);
    } catch (e) {
      console.log(e);
      setCategoriesList([]);
    }
  };

  const getProductCounterList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const response = await PRODUCTS_API.getProductCounterList(currentStore);
      if (response) setCounterList(response.data);
    } catch (e) {
      console.log(e);
      setCounterList([]);
    }
  };

  const getProductList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      if (DayStock) {
        const stockType = 'PRODUCTS';
        setLoading(true);
        const response = await PRODUCTS_API.getProductName({ stockType });
        setLoading(false);
        if (response && response.data) {
          setProductList(response.data);
        } else {
          setProductList([]);
        }
      } else {
        setLoading(true);
        const response = await PRODUCTS_API.getProductList(currentStore);
        setLoading(false);
        if (response && response.data) {
          setProductList(response.data);
        } else {
          setProductList([]);
        }
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      setProductList([]); // Ensure that productList is cleared in case of an error
    }
  };

  // useEffect(() => {
  //   if (DayStock) {
  //     getProductName(DayStock);
  //   }
  // }, [DayStock, currentStore]);

  useEffect(() => {
    getProductList();
  }, [currentStore, currentStore, selectedTab]);

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
      const options = {
        ...(DayStock
          ? { date: DateTimes(date) }
          : {
              startDateD: IndFormat({ startDate }, isTimeQuery),
              endDateD: IndFormat({ endDate }, isTimeQuery),
            }),
        customCode: customCode,
        customerId: customerId,
        category: categorizeCode,
        counterId: get(counter, 'id'),
        size,
        page,
        categoryWise: categorySort,
        filter: productWiseSort,
        searchProductName: isDayWiseOrDayStock ? get(productName, 'id') : get(productName, 'label'),
        endpoint: DayStock
          ? 'get-stock-count'
          : isDayWise
          ? 'report/dayWise-product'
          : 'report/product-wise',
        isDayWiseOrDayStock,
        DayStock,

        storeName: storeName,
      };
      setLoading(true);
      const serverResponse = await BookingServices.getProductsReportOfRA(options);
      setLoading(false);
      setFilterTable(get(serverResponse, 'data.data', []));
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
      setFilterTable([]);
      setBestSellerPrice(0);
      setRowCount(0);
      console.log(e);
      setLoading(true);
    }
  };

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  useEffect(() => {
    if (isOpenOrders) return;
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
    selectedTab,
    date,
  ]);

  useEffect(() => {
    if (isOpenOrders) return;
    getProductCategoryList();
    getProductCounterList();
  }, [storeName]);
  const noSortableFields = ProductSortTable;

  let columns = ProductTableColumns.map((column) => {
    const minWidthData =
      column.field === 'name' ||
      column.field === 'category' ||
      column.field === 'counter_name' ||
      column.field === 'parcelCharges'
        ? 180
        : column.field === 'price' || column.field === 'Total_price'
        ? 150
        : 180;
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      ...(column.field === 'date' ? { maxWidth: 120 } : {}),
      headerClassName: 'super-app-theme--header',
      sortable: !noSortableFields.includes(column.field),
      ...((column.field === 'price' ||
        column.field === 'Total_price' ||
        column.field === 'sold_quantity' ||
        column.field === 'Total_price' ||
        column.field === 'parcelCharges') && {
        type: 'number',
      }),

      ...(column.field === 'price' || column.field === 'Total_price'
        ? { valueFormatter: ({ value }) => toFixedIfNecessary(value, 2) }
        : {}),
    };
  });

  if (isDayWise) {
    columns = ProductTableColumnsForDayWise.map((column) => {
      const minWidthData =
        column.field === 'name' ||
        column.field === 'category' ||
        column.field === 'counter_name' ||
        column.field === 'parcelCharges'
          ? 180
          : column.field === 'price' || column.field === 'Total_price'
          ? 150
          : 180;
      return {
        headerName: column.title,
        field: column.field,
        flex: 1,
        minWidth: minWidthData,
        ...(column.field === 'date' ? { maxWidth: 120 } : {}),
        headerClassName: 'super-app-theme--header',
        sortable: !noSortableFields.includes(column.field),
        ...((column.field === 'price' ||
          column.field === 'Total_price' ||
          column.field === 'sold_quantity' ||
          column.field === 'Total_price' ||
          column.field === 'parcelCharges') && {
          type: 'number',
        }),
      };
    });
  } else if (DayStock) {
    columns = ProductTableColumnsForStockDayWise.map((column) => {
      const minWidthData =
        column.field === 'name' ||
        column.field === 'category' ||
        column.field === 'counter_name' ||
        column.field === 'parcelCharges'
          ? 180
          : column.field === 'price' || column.field === 'Total_price'
          ? 150
          : 180;
      return {
        headerName: column.title,
        field: column.field,
        flex: 1,
        minWidth: minWidthData,
        ...(column.field === 'date' ? { maxWidth: 120 } : {}),
        headerClassName: 'super-app-theme--header',
        sortable: !noSortableFields.includes(column.field),
        ...((column.field === 'price' ||
          column.field === 'Total_price' ||
          column.field === 'sold_quantity' ||
          column.field === 'Total_price' ||
          column.field === 'parcelCharges') && {
          type: 'number',
        }),
        ...((column.field === 'StockIn' || column.field === 'StockOut') && {
          renderCell: ({ value }) => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {value}
              {value < 0 && (
                <Box
                  sx={{
                    marginLeft: 1, // Add space between value and warning message
                    fontSize: '0.7rem', // Smaller font size
                    color: 'red', // Optional: Adjust color if needed
                  }}
                >
                  ⚠️ Reverse stock enabled
                </Box>
              )}
            </Box>
          ),
        }),
      };
    });
  }

  let rows =
    !isEmpty(filterTable) &&
    map(
      filterTable,
      ({
        productId,
        name,
        category,
        sold_quantity,
        price,
        parcelCharges,
        packingCharges,
        unit,
        unitName,
        counter_name,
        totalPrice,
      }) => {
        const actualParcelCharges = Number(parcelCharges) || 0 + Number(packingCharges) || 0;
        return {
          id: productId,
          name,
          category,
          counter_name: counter_name || '-',
          Total_price: `${toFixedIfNecessary(totalPrice || 0, 2) }`,
          sold_quantity,
          unit: unit ? `${unit}${unitName}` : '-',
          price: convertToRupee(price || 0) / sold_quantity,
          total: convertToRupee(price || 0),
          parcelCharges: toFixedIfNecessary(actualParcelCharges, 2) || 0,
          productId,
        };
      }
    );

  const selectedProduct = find(productList, (_item) => {
    return get(_item, 'productId') === get(productName, 'id');
  });

  console.log('productList', productList, productName, selectedProduct);

  if (isDayWise) {
    rows = map(filterTable, (_item, _index) => {
      return {
        date: get(_item, 'date'),
        id: _index + 1,
        sold_quantity: get(_item, 'quantity_sold'),
        price: get(selectedProduct, 'price'),
        category: get(selectedProduct, 'category'),
        productId: get(_item, 'productId'),
        name: get(selectedProduct, 'name'),
      };
    });
  } else if (DayStock) {
    rows = map(filterTable, (_item, _index) => {
      return {
        date: get(_item, 'date'),
        id: _index + 1,
        sold: Math.abs(get(_item, 'sold')),
        StockOut: get(_item, 'StockOut') || 0,
        StockIn: get(_item, 'StockIn') || 0,
        productId: get(_item, 'productId'),
        name: get(_item, 'name'),
        todayInStock: get(_item, 'todayInStock'),
        todayOutStock: get(_item, 'todayOutStock'),
        todayWastageStock: get(_item, 'todayWastageStock'),
      };
    });
  }

  const csvDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        ...(DayStock
          ? { date: DateTimes(date) }
          : { startDate: IndFormat({ startDate }), endDate: IndFormat({ endDate }) }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        ...(get(counter, 'id') ? { counterId: get(counter, 'id') } : {}),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        ...(productName
          ? isDayWiseOrDayStock
            ? { productId: get(productName, 'id') }
            : { searchProductName: get(productName, 'label') }
          : {}),
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
        const url = `${API}/api/v1/POS/merchant/report/${
          DayStock ? (isDayWise ? 'day-wise/product-csv' : 'product-wise-csv') : 'stockCount-csv'
        }${query}`;
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
        await PRODUCTS_API.exportProductsAsCsv(options, isDayWise, DayStock);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };

  const pdfDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        ...(DayStock
          ? { date: DateTimes(date) }
          : { startDate: IndFormat({ startDate }), endDate: IndFormat({ endDate }) }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        ...(get(counter, 'id') ? { counterId: get(counter, 'id') } : {}),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        ...(productName
          ? isDayWiseOrDayStock
            ? { productId: get(productName, 'id') }
            : { searchProductName: get(productName, 'label') }
          : {}),
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
        const url = `${API}/api/v1/POS/merchant/report/${
          DayStock ? (isDayWise ? 'day-wise/product-pdf' : 'product-wise-pdf') : 'stockCount-pdf'
        }${query}`;
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
        await PRODUCTS_API.exportProductsAsPdf(options, isDayWise, DayStock);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    } finally {
      setIsLoading(false);
    }
  };

  const excelDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        ...(DayStock
          ? { date: DateTimes(date) }
          : { startDate: IndFormat({ startDate }), endDate: IndFormat({ endDate }) }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        ...(get(counter, 'id') ? { counterId: get(counter, 'id') } : {}),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        ...(productName
          ? isDayWiseOrDayStock
            ? { productId: get(productName, 'id') }
            : { searchProductName: get(productName, 'label') }
          : {}),
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
        const url = `${API}/api/v1/POS/merchant/report/${
          DayStock ? (isDayWise ? 'day-wise/product-xlsx' : 'product-wise-xlsx') : 'stockCount-xlsx'
        }${query}`;
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
        await PRODUCTS_API.exportProductsAsExcel(options, isDayWise, DayStock);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
      console.log('err', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatProductList = map(productList, (e) => {
    return {
      label: get(e, 'name'),
      id: get(e, 'productId'),
    };
  });

  useEffect(() => {
    if (isDayWise) {
      const defaultProductName = get(formatProductList, '0');
      setProductName(defaultProductName);
    } else {
      setProductName('');
    }
  }, [selectedTab, productList]);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Tabs
        sx={{
          width: '25rem',
          mb: 1,
          '& .MuiTabs-scroller': {
            borderBottom: '2px solid #ecebeb',
          },
          '& .MuiButtonBase-root': {
            color: '#a6a6a6',
          },
        }}
        value={selectedTab}
        onChange={(event, newValue) => {
          setSelectedTab(newValue);
        }}
        indicatorColor="primary"
      >
        {map(tabsOptions, (_tab) => {
          return <Tab value={get(_tab, 'value')} label={get(_tab, 'label')} />;
        })}
      </Tabs>

      {isOpenOrders ? (
        <ProductTableOpenOrders productList={productList} />
      ) : (
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
                  columns={columns}
                  printPdf={pdfDownload}
                  csvDownload={csvDownload}
                  excelDownload={excelDownload}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  date={setDate}
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
                  isHideCategory={isHideCategory}
                  isHideCounter={isHideCounter}
                  DayStock={DayStock}
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
              height: isMobile
                ? `calc(100vh - ${isDayWiseOrDayStock ? '14rem' : '14rem'})`
                : `calc(100vh - ${isDayWiseOrDayStock ? '17rem' : '10rem'})`,
              overflow: 'auto',
              ...hideScrollbar,
            }}
          >
            {!isDayWiseOrDayStock && (
              <ReportAndAnalyticsCard
                total={total}
                titleDcard1={isDayWise ? 'Product name' : 'Best selling product'}
                subtitle1card1D={
                  <Box>
                    <Box>{bestSellerName}</Box>
                    <Box
                      sx={{
                        color: '#A9A9A9',
                        fontSize: '15px',
                      }}
                    >
                      Sold Quantity :{bestSellerQuantity}
                    </Box>
                  </Box>
                }
                subtitle1card2D={''}
                titleDcard2={'Total product sale'}
                subtitleDcard2={{
                  name1: 'Total Amount',
                  value1: toFixedIfNecessary(get(totalProductSaleParcel, 'totalProductSale'), 2),
                  name2: 'Product amount',
                  value2:
                    toFixedIfNecessary((Number(get(totalProductSaleParcel, 'totalProductSale')) || 0) -
                    (Number(get(totalProductSaleParcel, 'totalParcelPrice')) || 0),2),
                  name3: 'Parcel amount',
                  value3: toFixedIfNecessary(get(totalProductSaleParcel, 'totalParcelPrice') ,2),
                }}
                subtitle1card3D={'Best seller'}
                chartTitle={'Top 3 selling products'}
                chartData={chartData}
                isNotRupee
                customMinHeight={'10.1rem'}
              />
            )}

            {/* {!isDayWiseOrDayStock && (
          <ReportAndAnalyticsCard
            total={total}
            titleDcard1={isDayWiseOrDayStock ? 'Product name' : 'Best selling product'}
            subtitle1card1D={
              <Box>
                <Box>{bestSellerName}</Box>
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
              height: isMobile
                ? `calc(100vh - ${isDayWise ? '14rem' : '14rem'})`
                : `calc(100vh - ${isDayWise ? '17rem' : '10rem'})`,
              overflow: 'auto',
              ...hideScrollbar,
            }}
            subtitle1card3D={'Best seller'}
            chartTitle={'Top 3 selling products'}
            chartData={chartData}
            isNotRupee
            customMinHeight={'10.1rem'}
          />
        )} */}
            {/* <TableContainer className="step5" component={Paper} sx={{ height: '80%' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                '& .MuiTableCell-head': {
                  background: theme.palette.primary.lighter,
                },
              }}
            >
              {map(ProductTableHeaders, (e, index) => (
                <TableCell
                  align={index === 0 ? 'left' : 'center'}
                  sx={{ color: theme.palette.primary.main }}
                >
                  {e}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(filterTable, (row, index) => (
              <ProductTableRow row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}

            <Box
              sx={{
                height: isDayWiseOrDayStock
                  ? isMobile
                    ? 'calc(100vh - 4rem)'
                    : 'calc(100vh - 12rem)'
                  : isMobile
                  ? 'calc(100vh - 14rem)'
                  : 'calc(100vh - 15rem)',
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
                autoHeight={true}
                loading={loading}
              />
            </Box>
            <TakeATourWithJoy config={productReportTourConfig} />
          </Box>
        </>
      )}
    </>
  );
}
