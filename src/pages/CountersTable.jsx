import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { forEach, get, isEmpty, map, reduce, find } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard1';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  ALL_CONSTANT,
  CountersTableColumns,
  CountersTableHeaders,
  USER_AGENTS,
  hideScrollbar,
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
import uuid from 'react-uuid';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import moment from 'moment';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { allConfiguration } from 'src/global/recoilState';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
export default function CountersTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const { isMobile } = useResponsive();
  const [orderAnalytics, setOrderAnalytics] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [bestCounterName, setBestCounterName] = useState(0);
  const [bestCounterSales, setBestCounterSales] = useState(0);
  const [chartData, setChartData] = useState([]);
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
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [isLoading, setIsLoading] = useState(false);

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

  //   const getProductCategoryList = async () => {
  //     if (currentStore === undefined || currentStore === 'undefined') return;
  //     try {
  //       const response = await PRODUCTS_API.getProductCategoryList(currentStore);
  //       if (response) setCategoriesList(response.data);
  //     } catch (e) {
  //       console.log(e);
  //       setCategoriesList([]);
  //     }
  //   };

  //   const getProductCounterList = async () => {
  //     if (currentStore === undefined || currentStore === 'undefined') return;
  //     try {
  //       const response = await PRODUCTS_API.getProductCounterList(currentStore);
  //       if (response) setCounterList(response.data);
  //     } catch (e) {
  //       console.log(e);
  //       setCounterList([]);
  //     }
  //   };

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getCountersReports = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const options = {
        startDateD: IndFormat({ startDate }, isTimeQuery),
        endDateD: IndFormat({ endDate }, isTimeQuery),
        customCode: customCode,
        customerId: customerId,
        category: categorizeCode,
        counterId: get(counter, 'id'),
        size,
        page,
        storeName: storeName,
      };
      setLoading(true);
      const serverResponse = await BookingServices.getCountersReportOfRA(options);
      setLoading(false);

      const totalValues = reduce(
        get(serverResponse, 'data.data', []),
        (acc, val) => acc + get(val, 'total_price', 0),
        0
      );
      if (!isEmpty(get(serverResponse, 'data.data', []))) {
        setFilterTable([...get(serverResponse, 'data.data', [])]);
      } else {
        setFilterTable([]);
      }
      setRowCount(get(serverResponse, 'data.totalItems', 0));
      const arr = map(get(serverResponse, 'data.topThreeProduct', []), (ob) => ob.total_price);
      const sum = arr.reduce(function (previousValue, currentValue) {
        return previousValue + currentValue;
      }, 0);
      setTotal(sum);
      setBestCounterName(get(serverResponse, 'data.topThreeProduct.0.counter_name') || 'Others');
      setBestCounterSales(toFixedIfNecessary(get(serverResponse, 'data.totalCountersSale')));
      setChartData(
        map(get(serverResponse, 'data.topThreeProduct'), (item) => {
          return {
            label: get(item, 'counter_name', 'Others'),
            value: Number(get(item, 'total_price')),
          };
        })
      );
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
    console.log('currentStore', typeof currentStore);
    if (currentStore) getCountersReports();
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

  //   useEffect(() => {
  //     getProductCategoryList();
  //     getProductCounterList();
  //   }, []);

  const columns = CountersTableColumns.map((column) => {
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      ...(column.field === 'Total_price' && {
        type: 'number',
      }),
      ...(column.field === 'total_price'
        ? { valueFormatter: ({ value }) => toFixedIfNecessary(value, 2) }
        : {}),
    };
  });

  const rows =
    !isEmpty(filterTable) &&
    map(
      filterTable,
      ({ counterId, counter_name, total_price, description, expenseAmount, counter_income, purchase_amount }) => {
        return {
          id: uuid(),
          counterId,
          counter_name: counter_name || 'Others',
          purchase_amount: purchase_amount || 0,
          total_price: `${toFixedIfNecessary( convertToRupee(total_price || 0) * 100 ,2) }`,
          description: description || '-',
          expense: toFixedIfNecessary(expenseAmount, 2) || '0',
          counter_income:
            toFixedIfNecessary(((total_price || 0) - ((expenseAmount || 0) + (purchase_amount || 0))), 2) ||
            toFixedIfNecessary(convertToRupee(total_price || 0) * 100, 2),
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
        const url = `${API}/api/v1/POS/merchant/report/counter-wise-csv${query}`;
        const filename = generateFilename('Counters_Report');
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
        await PRODUCTS_API.exportCountersAsCsv(options);
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
        const url = `${API}/api/v1/POS/merchant/report/counter-wise-pdf${query}`;
        const filename = generateFilename('Counters_Report');
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
        await PRODUCTS_API.exportCountersAsPdf(options);
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
        const url = `${API}/api/v1/POS/merchant/download/report/counter-wise-xlsx${query}`;
        const filename = generateFilename('Counters_Report');
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
        await PRODUCTS_API.exportCountersAsExcel(options);
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
              title="CounterReport"
              docTitle="Counter Report"
              headers={CountersTableHeaders}
              columns={CountersTableColumns}
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
              <u>apply filters</u>
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
            titleDcard1={'Best seller'}
            titleDcard2={'Sale amount(₹)'}
            subtitle1card1D={bestCounterName}
            subtitle1card2D={''}
            subtitleDcard2={toFixedIfNecessary(bestCounterSales, 2)}
            subtitle1card3D={'Best seller'}
            chartTitle={'Top 3 seller'}
            chartData={chartData}
            isNotRupee
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
              localeText={{ noRowsLabel: 'No counter  reports found' }}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              autoHeight={true}
              loading={loading}
            />
          </Box>
        }
      </Box>
      {/* <TakeATourWithJoy config={productReportTourConfig} /> */}
    </>
  );
}
