import {
  Box,
  Button,
  Dialog,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { find, get, isEmpty, isUndefined, map, compact } from 'lodash';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard1';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  ALL_CONSTANT,
  ExpenseCategoryColumns,
  ExpenseTableColumns,
  ExpenseTableHeaders,
  USER_AGENTS,
  hideScrollbar,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { expenseReportTourConfig } from 'src/constants/TourConstants';
import {
  currentStoreId,
  currentTerminalId,
  reportSummaryState,
  allCategories,
} from 'src/global/recoilState';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { getCurrentDate } from 'src/helper/FormatTime';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import transformCase from 'src/helper/tranformCase';
import PRODUCTS_API from 'src/services/products';
import HandleExpenseDrawer from '../sections/Expense/HandleExpenseDrawer';
import ExpenseReportKebab from './ExpenseReportKebab';
import FilterComponent from './FilterComponent';
import triggerPrint from 'src/helper/triggerPrint';
import { storeLogo } from 'src/global/recoilState';
import {
  fDates,
  fDatesWithTimeStamp,
  fDatesWithTimeStampWithDayjs,
  formatDate,
  IndFormat,
} from 'src/utils/formatTime';
import ExpenseServices from 'src/services/API/ExpenseServices';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';
import { currentEndDate, currentStartDate, stores } from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import dayjs from 'dayjs';
import moment from 'moment';
import { allConfiguration } from 'src/global/recoilState';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';

export default function ExpenseCategoryWise({ categoriesList }) {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const { isMobile } = useResponsive();
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const [tableData, setTableData] = useState([]);
  const [top3, setTop3] = useState([{ label: '', value: '' }]);

  const [highest, setHighest] = useState(0);
  const [topExpense, setTopExpense] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [customCode, setCustomCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [currentCustomCode, setCurrentCustomCode] = useState({ label: '', id: '' });
  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', id: '' });
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);

  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);

  const [categorizeCode, setCategorizeCode] = useState('');
  const [currentCategorizeCode, setCurrentCategorizeCode] = useState({ label: '', id: '' });

  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isSinglePage = size >= rowCount;
  const [isDesc, setIsDesc] = useState(true);

  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);

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

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getExpensecategoryWise = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const options = {
        startDateD: IndFormat({ startDate }, isTimeQuery),
        endDateD: IndFormat({ endDate }, isTimeQuery),
        category: categorizeCode,
        size,
        page,
        sort: isDesc ? 'latest' : 'oldest',
        storeName: storeName,
      };
      setLoading(true);
      const categoryData = await PRODUCTS_API.getExpensecategoryWise(options);

      setLoading(false);

      setTableData(get(categoryData, 'data.data', []));

      const localTableData = get(categoryData, 'data.data', []);

      setRowCount(get(categoryData, 'data.totalItems', 0));
      const sortedExpenses = get(categoryData, 'data.data', []).sort((a, b) => {
        return Number(b.collectedAmount) - Number(a.collectedAmount);
      });

      const topThreeExpenses = sortedExpenses.slice(0, 3).map((expense) => ({
        label: get(expense, 'category', 'N/A'),
        value: Number(get(expense, 'collectedAmount', 0)) / 100,
      }));

      setTop3(topThreeExpenses);
      const firstExpenseData = localTableData.length > 0 ? localTableData[0] : null;

      setTopExpense(firstExpenseData);

      const totalExpenses = localTableData.reduce((total, item) => {
        return total + Number(get(item, 'collectedAmount', 0)) / 100;
      }, 0);

      setHighest(totalExpenses);
    } catch (error) {
      setLoading(false);
    }
  };
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  useEffect(() => {
    if (currentStore) getExpensecategoryWise();
  }, [startDate, endDate, currentStore, currentTerminal, size, page, categorizeCode, isDesc]);

  const columns = ExpenseCategoryColumns.map((column) => {
    const minWidthData =
      (column.field === column.field) === 'category'
        ? 200
        : column.field === 'totalOrder'
        ? 200
        : column.field === 'collectedAmount'
        ? 170
        : 100;
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,

      ...(column.field === 'collectedAmount' && {
        type: 'number',
        valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
      }),
    };
  });
  const columnsD = [
    ...columns,
    {
      headerName: '',
      headerClassName: 'super-app-theme--header',
      field: 'updateAndDelete',
      width: 120,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
    },
  ];

  const rows =
    !isEmpty(tableData) &&
    map(tableData, ({ category, collectedAmount, totalOrder }, index) => ({
      id: index + 1,
      category,
      totalOrder,
      collectedAmount: `${toFixedIfNecessary(convertToRupee(collectedAmount), 2)}`,
    }));

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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report-expenseCategoryWiseCsv${query}`;
        const filename = generateFilename('Expense_Report');
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
        await PRODUCTS_API.exportExpensesCategoryAsCsv(options);
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
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(categorizeCode ? { category: categorizeCode } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report-expenseCategoryWisePdf${query}`;
        const filename = generateFilename('Expense_Report');
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
        await PRODUCTS_API.exportExpensesCategoryAsPdf(options);
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report-expenseCategoryWiseXlsx${query}`;
        const filename = generateFilename('Expense_Report');
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
        await PRODUCTS_API.exportExpensesAsCategoryExcel(options);
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
              currentCustomCode={currentCustomCode}
              currentCustomerId={currentCustomerId}
              currentCategorizeCode={currentCategorizeCode}
              categoriesList={categoriesList}
              filterTable={tableData}
              title="ExpenseReport"
              docTitle="Expense Report"
              headers={ExpenseTableHeaders}
              columns={ExpenseTableColumns}
              printPdf={pdfDownload}
              excelDownload={excelDownload}
              handleCategorizeCode={handleCategorizeCode}
              isDisabledCustomCodeAndCustomer
              csvDownload={csvDownload}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              isDesc={isDesc}
              setIsDesc={setIsDesc}
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
            total={highest}
            titleDcard1={'High Expense(₹)'}
            titleDcard2={'Total Expenses(₹)'}
            subtitle1card1D={topExpense ? get(topExpense, 'category', '') : ''}
            subtitle1card2D={toFixedIfNecessary(get(topExpense, 'collectedAmount', 0) / 100, 2)}
            subtitle1card3D={''}
            subtitleDcard2={formatAmountToIndianCurrency(highest)}
            chartTitle={'Top 3 High Expenses'}
            chartData={top3}
          />
        )}
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
              columns={columnsD}
              initialState={{
                pagination: { paginationModel: { pageSize: size, page: page - 1 } },
              }}
              pageSizeOptions={[10, 50, 100]}
              disableRowSelectionOnClick
              onPaginationModelChange={handlePagination}
              paginationMode="server"
              localeText={{ noRowsLabel: 'No   expense reports found' }}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              autoHeight={true}
              loading={loading}
            />
          </Box>
        }
      </Box>

      <TakeATourWithJoy config={expenseReportTourConfig} />
    </>
  );
}
