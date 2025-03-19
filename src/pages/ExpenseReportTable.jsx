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
import ExpenseCategoryWise from './ExpenseCategoryWise';
const tabsOptions = [
  {
    label: 'Over All',
    value: 'overAll',
  },
  {
    label: 'Category Wise',
    value: 'categoryWise',
  },
];
export default function ExpenseReportTable() {
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
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState('');
  const [openMenu, setOpenMenuActions] = useState(null);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const logo = useRecoilValue(storeLogo);
  const [categorizeCode, setCategorizeCode] = useState('');
  const [currentCategorizeCode, setCurrentCategorizeCode] = useState({ label: '', id: '' });
  const [categoryList, setCategoryList] = useState([]);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isSinglePage = size >= rowCount;
  const [isDesc, setIsDesc] = useState(true);
  const [selectedTab, setSelectedTab] = useState(get(tabsOptions, '0.value'));
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);

  const expenseCategoryWise = selectedTab === get(tabsOptions, '1.value');

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
  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  const getCategoryList = async () => {
    try {
      const response = await PRODUCTS_API.getExpenseCategory();
      setCategoryList(compact(get(response, 'data') || []));
    } catch (error) {
      toast.error(error?.errorResponse?.message ?? ErrorConstants.SOMETHING_WRONG);
    }
  };

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getExpenseDashboard = async () => {
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
      const dashboardData = await PRODUCTS_API.getExpenseByDate(options);
      const expenseSummary = await PRODUCTS_API.getExpenseSummary(options);
      setLoading(false);

      setTableData(get(dashboardData, 'data.data', []));

      setRowCount(get(dashboardData, 'data.totalItems', 0));
      setTop3(
        map(get(expenseSummary, 'data.topThreeExpense'), (e) => {
          return {
            label: get(e, 'name', ''),
            value: Number(get(e, 'amountSpent', 0)) / 100,
          };
        })
      );
      setTopExpense(get(expenseSummary, 'data.topExpense.0'));
      setHighest(Number(get(expenseSummary, 'data.totalExpense.0.expenseAmount', 0)) / 100);
    } catch (error) {
      setLoading(false);
      setTableData([]);
    }
  };
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  useEffect(() => {
    if (currentStore && selectedTab === get(tabsOptions, '0.value')) getExpenseDashboard();
  }, [
    startDate,
    endDate,
    currentStore,
    currentTerminal,
    size,
    page,
    categorizeCode,
    isDesc,
    selectedTab,
  ]);

  const columns = ExpenseTableColumns.map((column) => {
    const minWidthData =
      column.field === 'additionalInfo' || column.field === 'name' || column.field === 'category'
        ? 200
        : column.field === 'date'
        ? 200
        : column.field === 'paymentType' || column.field === 'amountSpent'
        ? 170
        : 100;
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      ...(column.field === 'date'
        ? {
            maxWidth: 150,
            valueFormatter: ({ value }) => fDatesWithTimeStamp(value),
          }
        : {}),
      headerClassName: 'super-app-theme--header',

      ...(column.field === 'amountSpent' && {
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
      renderCell: (params) => (
        <ExpenseReportKebab
          params={params}
          handleEdit={handleEdit}
          handleOpenDeleteDrawer={handleOpenDeleteDrawer}
        />
      ),
    },
  ];

  const rows =
    !isEmpty(tableData) &&
    map(
      tableData,
      ({ expenseId, dateTz, name, category, paymentType, amountSpent, additionalInfo }) => ({
        id: expenseId,
        date: `${dateTz?.split?.('T')?.[0]} ${dateTz?.split?.('T')[1]?.split?.('.')?.[0]}`,
        name: name,
        category,
        paymentType,
        amountSpent: `${toFixedIfNecessary(convertToRupee(amountSpent), 2)}`,
        additionalInfo,
      })
    );

  const handleOpenDeleteDrawer = (id) => {
    setCurrentExpenseId(id);
    setOpenDelete(true);
  };

  const handleCloseDeleteDrawer = () => {
    setOpenDelete(false);
    setCurrentExpenseId('');
  };

  const handleEdit = (id) => {
    setCurrentExpenseId(id);
    setOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await PRODUCTS_API.deleteExpense(currentExpenseId);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        getExpenseDashboard();
        handleCloseDeleteDrawer();
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_DELETE);
    }
  };
  const handleCloseDrawer = () => {
    setOpen(false);
    setCurrentExpenseId('');
  };
  useEffect(() => {
    if (currentStore) {
      getCategoryList();
    }
  }, [currentStore]);

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
        const url = `${API}/api/v1/POS/merchant/report/expense-stats-csv${query}`;
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
        await PRODUCTS_API.exportExpensesAsCsv(options);
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
        const url = `${API}/api/v1/POS/merchant/report/expense-pdf${query}`;
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
        await PRODUCTS_API.exportExpensesAsPdf(options);
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
        const url = `${API}/api/v1/POS/merchant/report/expense-stats-xlsx${query}`;
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
        await PRODUCTS_API.exportExpensesAsExcel(options);
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
      <Tabs
        sx={{
          width: '12rem',
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
      {expenseCategoryWise ? (
        <ExpenseCategoryWise categoriesList={categoryList} />
      ) : (
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
                  categoriesList={categoryList}
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
                subtitle1card1D={transformCase(get(topExpense, 'name', ''))}
                subtitle1card2D={toFixedIfNecessary(get(topExpense, 'amountSpent', 0) / 100, 2)}
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
          <HandleExpenseDrawer
            expense={find(tableData, (d) => d.expenseId === currentExpenseId)}
            openDrawer={open}
            handleCloseDrawer={handleCloseDrawer}
            handleDelete={handleDelete}
            getExpenseDashboard={getExpenseDashboard}
          />
          <Dialog open={openDelete}>
            <Paper
              sx={{
                p: 2,
              }}
            >
              <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Are you sure you want to delete this expense? This action cannot be undone.
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseDeleteDrawer} sx={{ mr: 2 }} variant="text">
                  Cancel
                </Button>
                <Button onClick={handleDelete} variant="contained">
                  Delete
                </Button>
              </div>
            </Paper>
          </Dialog>
          <TakeATourWithJoy config={expenseReportTourConfig} />
        </>
      )}
    </>
  );
}
