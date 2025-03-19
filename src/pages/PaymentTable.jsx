import {
  Box,
  Chip,
  useTheme,
  Dialog,
  Paper,
  Typography,
  Button,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import { find, forEach, get, isEmpty, map, filter } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import DrawerTransaction from '../components/DrawerTransaction';
import ReportAndAnalyticsCard from '../components/ReportAndAnalyticsCard';
import TakeATourWithJoy from '../components/TakeATourWithJoy';
import {
  ALL_CONSTANT,
  PaymentModeTypeConstants,
  PaymentTableColumns,
  PaymentTableHeaders,
  ROLES_DATA,
  USER_AGENTS,
  hideScrollbar,
  PaymentSortTable,
  PaymentStatusConstants,
} from '../constants/AppConstants';
import { ErrorConstants } from '../constants/ErrorConstants';
import { SuccessConstants } from '../constants/SuccessConstants';
import { paymentsReportTourConfig } from '../constants/TourConstants';
import {
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  storeLogo,
  reportSummaryState,
  stores,
} from '../global/recoilState';
import { convertToRupee } from '../helper/ConvertPrice';
import { getCurrentDate } from '../helper/FormatTime';
import StyledDataGrid from '../helper/StyledDataGrid';
import triggerPrint from '../helper/triggerPrint';
import BookingServices from '../services/API/BookingServices';
import AuthService from '../services/authService';
import PAYMENT_API from '../services/payment';
import PRODUCTS_API from '../services/products';
import { toFixedIfNecessary, formatAmountToIndianCurrency } from '../utils/formatNumber';
import { fDates, IndFormat, timeFormat, formatIndDateWithOutUtc } from '../utils/formatTime';
import FilterComponent from './FilterComponent';
import PaymentKebabMenu from './PaymentKebabMenu';
import { currentEndDate, currentStartDate } from '../global/recoilState';
import ObjectToQueryParams from '../utils/ObjectToQueryParams';
import { generateFilename } from '../helper/generateFilename';
import handleCSVDownload from '../utils/handleCSVDownload';
import CachedIcon from '@mui/icons-material/Cached';
import statusColor from '../utils/statusColor';
import moment from 'moment';
import ObjectStorage from '../modules/ObjectStorage';
import { StorageConstants } from '../constants/StorageConstants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
export default function PaymentTable() {
  const currentSelectedRole = () => AuthService.getCurrentRoleInLocal();
  const role = currentSelectedRole();
  const theme = useTheme();
  const [successfullOrders, setSuccessfullOrders] = useState(0);
  const [successfullPayment, setSuccessfullPayment] = useState(0);
  const [paymentModewise, setPaymentModeWise] = useState([{ label: '', value: 0 }]);
  const [openDelete, setOpenDelete] = useState(false);
  const [delParam, setDelParam] = useState('');
  const [filterTable, setFilterTable] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [customCode, setCustomCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [currentCustomCode, setCurrentCustomCode] = useState({ label: '', id: '' });
  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', id: '' });
  const [currentRowId, setCurrentRowId] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState('');
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const logo = useRecoilValue(storeLogo);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const [isDesc, setIsDesc] = useState(true);
  const [paymentMode, setPaymentMode] = useState('');
  const [loading, setLoading] = useState();
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const additionalDiscountConfig = get(configuration, 'billingSettings.additionalDiscount', false);
  const additionalChargesConfig = get(configuration, 'billingSettings.additionalCharges', false);
  const packingChargesConfig = get(configuration, 'billingSettings.packingCharges', false);
  const deliveryChargesConfig = get(configuration, 'billingSettings.deliveryCharges', false);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isSinglePage = size >= rowCount;

  const [isLoading, setIsLoading] = useState(false);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const isMobile = useMediaQuery('(max-width:600px)');

  const handleCustomCode = (e) => {
    setCustomCode(get(e, 'id'));
    setCurrentCustomCode(e);
  };
  const handleCloseDeleteDrawer = () => {
    setOpenDelete(false);
    setDelParam('');
  };
  const handleCustomerId = (e) => {
    setCustomerId(get(e, 'id'));
    setCurrentCustomerCode(e);
  };
  const getPaymentReports = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const options = {
        startDateD: IndFormat({ startDate }, isTimeQuery),
        endDateD: IndFormat({ endDate }, isTimeQuery),
        customCode: customCode,
        customerId: customerId,
        size,
        page,
        sort: isDesc ? 'latest' : 'oldest',
        storeName: storeName,
        mode: !isEmpty(paymentMode) ? paymentMode : null
      };
      setLoading(true);
      const paymentSummaryResponse = await BookingServices.getPaymentReportSummary(options);
      const paymentReportReponse = await BookingServices.getPaymentsReportOfRA(options);
      setLoading(false);
      const formatSplit = map(get(paymentSummaryResponse, 'data.data', []), (e) => {
        return { label: get(e, 'mode') ?? 'Others', value: convertToRupee(get(e, 'paidAmount')) };
      });
      setPaymentModeWise(formatSplit);
      setFilterTable(get(paymentReportReponse, 'data.paymentData', []));
      setRowCount(get(paymentReportReponse, 'data.totalItems', 0));
      setSuccessfullOrders(get(paymentSummaryResponse, 'data.totalPayments', 0));
      setSuccessfullPayment(convertToRupee(get(paymentSummaryResponse, 'data.totalAmount', 0)));
    } catch (e) {
      console.log('check event', e);
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const options = { orderId: orderId };
      const response = await PAYMENT_API.deleteOrder(options);
      if (response) {
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
        getPaymentReports();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const printPdf = async () => {
    try {
      const currentPage = 1;
      const options = {
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
      };
      const paymentReportReponse = await BookingServices.getPaymentsReportForPdf(options);
      if (!isEmpty(get(paymentReportReponse, 'data.paymentData', []))) {
        const data = map(get(paymentReportReponse, 'data.paymentData', []), (e) => ({
          ...e,
          paidAmount: e['payments.paidAmount'] ? e['payments.paidAmount'] : 0,
          reason: e['payments.reason'] ? e['payments.reason'] : 0,
        }));

        const props = {
          heading: PaymentTableHeaders,
          paymentRows: data?.reverse(),
          startDate: IndFormat({ startDate }),
          endDate: moment(IndFormat({ endDate })).subtract(1, 'd'),
          title: 'PaymentReport',
          docTitle: 'Payment Report',
          columns: filter(PaymentTableColumns, (_column) => {
            if (get(_column, 'field') === 'additionalDiscount' && !additionalDiscountConfig) {
              return false;
            } else if (get(_column, 'field') === 'additionalCharges' && !additionalChargesConfig) {
              return false;
            } else if (get(_column, 'field') === 'packingCharges' && !packingChargesConfig) {
              return false;
            } else if (get(_column, 'field') === 'deliveryCharges' && !deliveryChargesConfig) {
              return false;
            }
            return true;
          }),
          logo: logo,
        };
        triggerPrint(props);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  const getChartAmountData = (serverResponse, type) => {
    let upiData = 0;
    let totalAmount = convertToRupee(get(serverResponse, 'data.paymentTypeData.totalAmount', 0));
    forEach(get(serverResponse, 'data.paymentTypeData.splitData', []), (_res) => {
      if (get(_res, 'type') === type) {
        upiData = convertToRupee(get(_res, 'paidAmount', 0)) / totalAmount;
      }
    });
    return Number(toFixedIfNecessary(upiData * 100, 2));
  };
  const [openPayment, setOpenPayment] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const handleOpenDetails = (id) => {
    setOpenDetails(true);
    setCurrentRowId(id);
  };

  const handleOpenPayment = (id) => {
    setOpenPayment(true);
    setCurrentPaymentId(id);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setCurrentRowId('');
  };

  const handleClosePayment = () => {
    setOpenPayment(false);
    setCurrentPaymentId('');
  };

  const handlePaymentRefresh = async (paymentId) => {
    try {
      const options = { transactionId: paymentId };
      await PAYMENT_API.verifyPayment(options);
      toast.success(SuccessConstants.FETCH_SUCCESSFULLY);
      getPaymentReports();
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_FETCH);
    }
  };

  useEffect(() => {
    if (currentStore) getPaymentReports();
  }, [
    startDate,
    endDate,
    currentStore,
    currentTerminal,
    customCode,
    customerId,
    page,
    size,
    isDesc,
    paymentMode,
  ]);

  const noFilterableFields = ['date', 'paymentId', 'time'];
  const noSortableFields = PaymentSortTable;

  const noMenuOptionFields = ['paymentId', 'time'];
  const columns = PaymentTableColumns.map((column) => {
    const minWidthData =
      column.field === 'paymentId' || column.field === 'date'
        ? 240
        : column.field === 'orderAmount' || column.field === 'paidAmount'
        ? 150
        : column.field === 'reason'
        ? 160
        : column.field === 'roundOff'
        ? 170
        : column.field === 'additionalDiscount' ||
          column.field === 'additionalCharges' ||
          column.field === 'packingCharges' ||
          column.field === 'deliveryCharges'
        ? 200
        : 145;
    return {
      headerName: column.title,
      field: column.field,

      ...(column.field === 'paymentId' && {
        renderCell: (params) => (
          <Typography
            onClick={() => handleOpenDetails(params.row.id)}
            sx={{
              textDecoration: 'underline !important',
              color: `${theme.palette.primary.main} !important`,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {get(params, 'value')}
          </Typography>
        ),
      }),

      minWidth: minWidthData,
      // ...(column.field === 'date' || column.field === 'time' ? { maxWidth: 150 } : {}),
      filterable: !noFilterableFields.includes(column.field),
      sortable: !noSortableFields.includes(column.field),
      disableColumnMenu: noMenuOptionFields.includes(column.field),
      headerClassName: 'super-app-theme--header',

      ...((column.field === 'orderAmount' ||
        column.field === 'orderId' ||
        column.field === 'roundOff') && { type: 'number' }),

      ...(column.field === 'orderAmount' && {
        valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
      }),
      ...(column.field === 'paidAmount' && { type: 'number' }),
      ...(column.field === 'paidAmount' && {
        valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
      }),

      ...(column.field === 'date' && {
        valueFormatter: ({ value }) => formatIndDateWithOutUtc(value),
      }),

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
            label={`${params.value}`}
          />
        ),
      }),
    };
  });
  const columnsD = [
    ...filter(columns, (_column) => {
      if (get(_column, 'field') === 'additionalDiscount' && !additionalDiscountConfig) {
        return false;
      } else if (get(_column, 'field') === 'additionalCharges' && !additionalChargesConfig) {
        return false;
      } else if (get(_column, 'field') === 'packingCharges' && !packingChargesConfig) {
        return false;
      } else if (get(_column, 'field') === 'deliveryCharges' && !deliveryChargesConfig) {
        return false;
      }
      return true;
    }),
    {
      headerName: '',
      headerClassName: 'super-app-theme--header',
      field: 'details',
      width: 120,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <>
          {/* <Chip
            size="small"
            onClick={() => handleOpenDetails(params.row.id)}
            variant="outlined"
            color="info"
            label="View Details"
            sx={{ cursor: 'pointer' }}
          /> */}
        </>
      ),
    },
    {
      headerName: '',
      headerClassName: 'super-app-theme--header',
      field: 'refresh',
      width: 120,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <>
          {!params.row.reason === 'MERCHANT BILLING' && (
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => handlePaymentRefresh(params.row.id)}
                sx={{
                  cursor: 'pointer',
                  color: theme.palette.primary.main,
                }}
              >
                <CachedIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  // if (role === ROLES_DATA.master.role)
  //   columnsD.push({
  //     headerName: '',
  //     headerClassName: 'super-app-theme--header',
  //     field: 'edit',
  //     width: 120,
  //     filterable: false,
  //     sortable: false,
  //     disableColumnMenu: true,
  //     renderCell: (params) => (
  //       <>
  //         <PaymentKebabMenu
  //           params={params}
  //           handleOpenDeleteDrawer={() => {
  //             setDelParam(get(params, 'row.orderId'));
  //             setOpenDelete(true);
  //           }}
  //         />
  //       </>
  //     ),
  //   });

  const rows =
    !isEmpty(filterTable) &&
    map(filterTable, (data) => ({
      id: get(data, 'paymentId'),
      paymentId: get(data, 'paymentId'),
      orderId: get(data, 'booking.orderId'),
      // date: `${get(data, 'date')} ${get(data, 'time')}`,
      date: get(data, 'paidOn'),
      ...(additionalDiscountConfig
        ? { additionalDiscount: convertToRupee(get(data, 'additionalDiscount')) }
        : {}),

      ...(additionalChargesConfig
        ? { additionalCharges: convertToRupee(get(data, 'additionalCharges')) }
        : {}),
      ...(packingChargesConfig
        ? { packingCharges: convertToRupee(get(data, 'packingCharges')) }
        : {}),
      ...(deliveryChargesConfig
        ? { deliveryCharges: convertToRupee(get(data, 'deliveryCharges')) }
        : {}),
      roundOff: convertToRupee(get(data, 'booking.roundOff')),
      orderAmount:toFixedIfNecessary( get(data, 'booking.orderAmount') / 100, 2),
      paidAmount: toFixedIfNecessary(get(data, 'paidAmount') / 100, 2),
      paymentMode: get(data, 'mode'),
      reason: get(data, 'reason'),
      paymentStatus: get(data, 'paymentStatus'),
      type: get(data, 'booking.type'),
    }));

  const pdfDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        sort: isDesc ? 'latest' : 'oldest',
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/transaction-wise-pdf${query}`;
        const filename = generateFilename('Payment_Report');
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
        await BookingServices.getPaymentsReportForPdf(options, paymentMode);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    } finally {
      setIsLoading(false);
    }
  };

  const csvDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
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
        const url = `${API}/api/v1/POS/merchant/report/transaction-wise-csv${query}`;
        const filename = generateFilename('Payment_Report');
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
        await PRODUCTS_API.exportPaymentsAsCsv(options, paymentMode);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
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
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        sort: isDesc ? 'latest' : 'oldest',
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/transaction-wise-xlsx${query}`;
        const filename = generateFilename('Payment_Report');
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
        await PRODUCTS_API.exportPaymentsAsExcel(options, paymentMode);
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
              filterTable={filterTable}
              title="PaymentReport"
              docTitle="Payment Report"
              headers={PaymentTableHeaders}
              columns={PaymentTableColumns}
              printPdf={pdfDownload}
              csvDownload={csvDownload}
              excelDownload={excelDownload}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              isDesc={isDesc}
              setIsDesc={setIsDesc}
              isDisabledCustomCodeAndCustomer
              paymentMode={paymentMode}
              setPaymentMode={setPaymentMode}
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
              <u> apply filters</u>
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
            titleDcard1={'Successful Payments'}
            titleDcard2={'Payment(₹)'}
            subtitleDcard1={toFixedIfNecessary(successfullOrders, 2)}
            subtitleDcard2={toFixedIfNecessary(successfullPayment, 2)}
            chartTitle={'Type'}
            chartData={paymentModewise}
            title="PaymentReport"
          />
        )}
        {
          <Box
            sx={{
              height: isMobile ? 'calc(100vh - 14rem)' : 'calc(100vh - 17rem)',
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
              localeText={{ noRowsLabel: 'No payment  reports found' }}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              autoHeight={true}
              loading={loading}
            />
          </Box>
        }
      </Box>
      {currentRowId && (
        <DrawerTransaction
          handleOpen={handleOpenDetails}
          open={openDetails}
          handleClose={handleCloseDetails}
          row={find(filterTable, (d) => d.paymentId === currentRowId)}
        />
      )}
      <TakeATourWithJoy config={paymentsReportTourConfig} />
      <Dialog open={openDelete} onClose={handleCloseDeleteDrawer}>
        <Paper
          sx={{
            p: 2,
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            {` Are you sure you want to delete this order ${delParam}  ? This action cannot be undone.`}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseDeleteDrawer} sx={{ mr: 2 }} variant="text">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleCloseDeleteDrawer();
                deleteOrder(delParam);
              }}
              variant="contained"
            >
              Delete
            </Button>
          </div>
        </Paper>
      </Dialog>
    </>
  );
}
