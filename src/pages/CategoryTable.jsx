import { Box, useMediaQuery, useTheme } from '@mui/material';
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
  CategoryTableColumns,
} from 'src/constants/AppConstants';
import { productReportTourConfig } from 'src/constants/TourConstants';
import { allCategories, currentStoreId, currentTerminalId, stores } from 'src/global/recoilState';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { getCurrentDate } from 'src/helper/FormatTime';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import BookingServices from 'src/services/API/BookingServices';
import FilterComponent from './FilterComponent';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import triggerPrint from 'src/helper/triggerPrint';
import { storeLogo } from 'src/global/recoilState';
import { reportSummaryState } from 'src/global/recoilState';
import PRODUCTS_API from 'src/services/products';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import { allConfiguration } from 'src/global/recoilState';
import { IndFormat } from 'src/utils/formatTime';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import moment from 'moment';
import uuid from 'react-uuid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
export default function CategoryTable() {
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
  const [categoryWise, setCategoriesWise] = useState([]);
  const logo = useRecoilValue(storeLogo);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const isSinglePage = size >= rowCount;
  const [counter, setCounter] = useState({});
  const [totalProductSale, setTotalProductSale] = useState(0);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);

  const [isLoading, setIsLoading] = useState(false);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);
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

  const getProductReports = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const options = {
        startDateD: IndFormat({ startDate }, isTimeQuery),
        endDateD: IndFormat({ endDate }, isTimeQuery),
        customCode: customCode,
        customerId: customerId,
        category: categorizeCode,
        counterId: get(counter, 'id'),
        storeName: storeName,
        size,
        page,
      };
      setLoading(true);
      const serverResponse = await BookingServices.getProductsCategoryOfRA(options);
      setLoading(false);
      setFilterTable(get(serverResponse, 'data.data', []));
      setBestSellerPrice(get(serverResponse, 'data.data[0].price', 0));
      setRowCount(get(serverResponse, 'data.totalItems', 0));
      const arr = map(get(serverResponse, 'data.topThreeProduct[0]', []), (ob) => ob.sold_quantity);
      const sum = arr.reduce(function (previousValue, currentValue) {
        return previousValue + currentValue;
      }, 0);
      setTotal(sum);
      setBestSellerName(get(serverResponse, 'data.topThreeProduct.0.name', ''));
      setBestSellerQuantity(get(serverResponse, 'data.topCategorySale', 0));
      setChartData(
        map(get(serverResponse, 'data.topThreeProduct'), (item) => {
          return { label: get(item, 'name'), value: Number(get(item, 'totalProductSale')) };
        })
      );
      setTotalProductSale(get(serverResponse, 'data.totalSales', 0));
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  useEffect(() => {
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
    page,
    size,
  ]);

  useEffect(() => {
    getProductCategoryList();
    getProductCounterList();
  }, [storeName]);
  const noSortableFields = ProductSortTable;

  const columns = CategoryTableColumns.map((column) => {
    const minWidthData =
      column.field === 'name' || column.field === 'category' || column.field === 'counter_name'
        ? 180
        : column.field === 'price' || column.field === 'total'
        ? 150
        : 100;
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      ...(column.field === 'date' ? { maxWidth: 120 } : {}),
      headerClassName: 'super-app-theme--header',
      sortable: !noSortableFields.includes(column.field),
      ...((column.field === 'price' ||
        column.field === 'total' ||
        column.field === 'sold_quantity' ||
        column.field === 'Total_product_sale' ||
        column.field === 'parcelCharges' ||
        column.field === 'Gst' ||
        column.field === 'Total_price') && {
        type: 'number',
      }),

      ...(column.field === 'price' || column.field === 'total'
        ? { valueFormatter: ({ value }) => toFixedIfNecessary(value, 2) }
        : {}),
    };
  });

  const rows =
    !isEmpty(filterTable) &&
    map(
      filterTable,
      ({
        name,
        parcelCharges,
        sold_quantity,
        price,
        unit,
        unitName,
        counter_name,
        totalProductSale,
        Gst,
      }) => {
        return {
          id: uuid(),
          name,
          parcelCharges,
          counter_name: counter_name || '-',
          Total_product_sale:`${toFixedIfNecessary(totalProductSale || 0, 2)}`,
          sold_quantity,
          Gst:`${toFixedIfNecessary(Gst || 0, 2)}`,
          unit: unit ? `${unit}${unitName}` : '-',
          price: convertToRupee(price || 0) / sold_quantity,
          total: convertToRupee(price || 0),
        };
      }
    );
    
  const csvDownload = async () => {
    try {
      setIsLoading(true);
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/product-wise-csv${query}`;
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
        await PRODUCTS_API.exportCategaryAsCsv(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };

  const pdfDownload = async () => {
    setIsLoading(true);
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/category-wise-pdf${query}`;
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
        await PRODUCTS_API.exportCategoryAsPdf(options);
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
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        ...(get(counter, 'id') ? { counterId: get(counter, 'id') } : {}),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/category-wise-xlsx${query}`;
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
        await PRODUCTS_API.exportCategoryAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
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
            printPdf={pdfDownload}
            csvDownload={csvDownload}
            excelDownload={excelDownload}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            isDisabledCustomCodeAndCustomer
            handleChangeCounter={handleChangeCounter}
            counter={counter}
            counterList={counterList}
            categoryWise={categoryWise}
           
          />
        </Box>
      )}
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
          height: isMobile ? 'calc(100vh - 14rem)' : 'calc(100vh - 10rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        {loading ? (
          <ReportCardSkeletonLoader />
        ) : (
          <ReportAndAnalyticsCard
            total={total}
            titleDcard1={'Best selling category'}
            titleDcard2={'Total category sale(₹)'}
            subtitle1card1D={
              <Box>
                <Box>{bestSellerName}</Box>
                <Box
                  sx={{
                    color: '#A9A9A9',
                    fontSize: '15px',
                  }}
                >
                  Collected Amount : {toFixedIfNecessary(bestSellerQuantity, 2)}
                </Box>
              </Box>
            }
            subtitle1card2D={''}
            subtitleDcard2={toFixedIfNecessary(totalProductSale, 2)}
            subtitle1card3D={'Best seller'}
            chartTitle={'Top 3 selling category'}
            chartData={chartData}
          />
        )}
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
        {
          <Box
            sx={{
              height: isMobile ? 'calc(100vh - 14rem)' : 'calc(100vh - 19rem)',
              width: '100%',
              '& .MuiDataGrid-columnHeaders': {
                minHeight: '60px !important',
                maxHeight: '70px !important',
              },
              '& .super-app-theme--header': {
                backgroundColor: theme.palette.primary.lighter,
                color: theme.palette.primary.main,
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
        }
      </Box>
      <TakeATourWithJoy config={productReportTourConfig} />
    </>
  );
}
