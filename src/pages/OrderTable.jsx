import {
  Box,
  Chip,
  Tooltip,
  useTheme,
  Paper,
  Dialog,
  Typography,
  Button,
  useMediaQuery,
  Stack,
  Tab,
  Tabs,
  Checkbox,
} from '@mui/material';
import { IconButton } from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import OrderKebabMenu from './OrderKebabMenu';
import { styled } from '@mui/material/styles';
import { filter, find, forEach, get, groupBy, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { toFixedIfNecessary, formatAmountToIndianCurrency } from 'src/utils/formatNumber';
import DrawerTransaction from 'src/components/DrawerTransactionOrder';
import { formatIndDateWithOutUtc } from 'src/utils/formatTime';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  OrderTableColumns,
  OrderTableHeaders,
  OrderTypeConstants,
  PaymentStatusConstants,
  hideScrollbar,
  ORDER_STATUS,
  OrderSortTable,
  USER_AGENTS,
  ALL_CONSTANT,
} from 'src/constants/AppConstants';
import { reduce } from 'lodash';
import { orderReportTourConfig } from 'src/constants/TourConstants';
import {
  alertDialogInformationState,
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  orderTypeConfiguration,
  reportSummaryState,
  stores,
} from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { getCurrentDate } from 'src/helper/FormatTime';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import BookingServices from 'src/services/API/BookingServices';
import FilterComponent from './FilterComponent';
import triggerPrint from 'src/helper/triggerPrint';
import { storeLogo } from 'src/global/recoilState';
import { fDates, IndFormat, fDatesWithTimeStamp } from 'src/utils/formatTime';
import { ROLES_DATA } from 'src/constants/AppConstants';
import PAYMENT_API from 'src/services/payment';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import PRODUCTS_API from 'src/services/products';
import { ErrorConstants } from 'src//constants/ErrorConstants';
import toast from 'react-hot-toast';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import { generateFilename } from 'src/helper/generateFilename';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import statusColor from 'src/utils/statusColor';
import moment from 'moment';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import isSingleDate from '../utils/isSingleDate';
import isCheckExportData from 'src/utils/isCheckExportData';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BulkProductsDeleteDialog from 'src/components/BulkProductsDeleteDialog';

// const tabsOptions = [
//   {
//     label: 'Orders',
//     value: 'orders',
//   },
//   {
//     label: 'Details',
//     value: 'details',
//   },
// ];

export default function OrderTable() {
  const theme = useTheme();
  const [successfullOrders, setSuccessfullOrders] = useState(0);
  const [successfullPayment, setSuccessfullPayment] = useState(0);
  const currentSelectedRole = () => AuthService.getCurrentRoleInLocal();
  const role = currentSelectedRole();
  const [dineinPerc, setDineInPerc] = useState(0);
  const [parcelPerc, setParcelPerc] = useState(0);
  const [filterTable, setFilterTable] = useState([]);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [customCode, setCustomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useMediaQuery('(max-width:600px)');

  const [customerId, setCustomerId] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [currentRowId, setCurrentRowId] = useState('');
  const [currentCustomCode, setCurrentCustomCode] = useState({ label: '', id: '' });
  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', Id: '' });
  const [open, setOpen] = useState(false);
  const [delParam, setDelParam] = useState({});
  const orderTypeValues = useRecoilValue(orderTypeConfiguration);
  const logo = useRecoilValue(storeLogo);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const [isDesc, setIsDesc] = useState(true);
  const [order, setOrder] = useState();
  const [status, setStatus] = useState({});
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const additionalDiscountConfig = get(configuration, 'billingSettings.additionalDiscount', false);
  const additionalChargesConfig = get(configuration, 'billingSettings.additionalCharges', false);
  const packingChargesConfig = get(configuration, 'billingSettings.packingCharges', false);
  const deliveryChargesConfig = get(configuration, 'billingSettings.deliveryCharges', false);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [loading, setLoading] = useState();
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const [isOpenBulkProductsDeleteDialog, setIsOpenBulkProductsDeleteDialog] = useState(false);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const isSinglePage = size >= rowCount;

  const [orderTypes, setOrderTypes] = useState([
    { label: get(orderTypeValues, 'orderTypes.value1', ''), value: 0 },
    { label: get(orderTypeValues, 'orderTypes.value2', ''), value: 0 },
  ]);

  const [selected, setSelected] = useState([]);

  const handleOpen = (e) => {
    setCurrentRowId(e);
    setOpen(true);
  };
  const handleClose = () => {
    setCurrentRowId('');
    setOpen(false);
  };

  const handleCustomCode = (e) => {
    console.log('jhhjhhhj');
    setCustomCode(get(e, 'id'));
    setCurrentCustomCode(e);
  };
  const handleCustomerId = (e) => {
    setCustomerId(get(e, 'id'));
    setCurrentCustomerCode(e);
  };
  const handleChangeOrder = (e) => {
    setStatus(e);
  };

  const getOrderReports = async () => {
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
        status: status.id,
        storeName: storeName,
      };

      setLoading(true);
      const serverResponse = await BookingServices.getOrdersReportOfRA(options);
      const serverSummaryResponse = await BookingServices.getOrdersReportSummary(options);
      setLoading(false);
      setFilterTable(get(serverResponse, 'data.orderData', []));
      setRowCount(get(serverResponse, 'data.totalItems', 0));
      setSuccessfullOrders(get(serverSummaryResponse, 'data.successfullOrders', 0));
      setSuccessfullPayment(convertToRupee(get(serverSummaryResponse, 'data.totalAmount', 0)));

      const formattedOrders = map(get(serverSummaryResponse, 'data.data'), (e) => {
        return {
          label: get(e, 'orderType') === null ? 'Others' : get(e, 'orderType'),
          value: convertToRupee(get(e, 'orderAmount')),
        };
      });
      setOrderTypes(formattedOrders);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const getOrderDetails = async (order) => {
    try {
      const orderDetailsRes = await PRODUCTS_API.getOrderDetails({
        orderId: get(order, 'orderId'),
        paymentId: get(order, 'id'),
        // orderId: get(order, 'id')
      });

      setOrder({
        data1: get(orderDetailsRes, 'data'),
        data2: order,
      });
      handleOpen();
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_GET_ORDER_DETAILS);
    }
  };

  // const deleteOrder = async (selectedOrder) => {
  //   try {
  //     console.log('selectedOrder', selectedOrder);
  //     const options = {
  //       orderId: get(selectedOrder, 'row.orderId'),
  //       paymentId: get(selectedOrder, 'row.id'),
  //     };
  //     const response = await PAYMENT_API.deleteOrder(options);
  //     if (response) {
  //       toast.success(SuccessConstants.DELETED_SUCCESSFUL);
  //       getOrderReports();
  //       handleCloseDeleteDrawer();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };
  // const handleCloseDeleteDrawer = () => {
  //   setOpenDelete(false);
  //   setDelParam({});
  // };

  useEffect(() => {
    if (currentStore) getOrderReports();
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
    status,
    storeName,
  ]);

  const handlePaymentTypeColor = (status) => {
    if (status === ORDER_STATUS.FULL_PAYMENT) {
      return 'success';
    } else if (status === ORDER_STATUS.PARTIAL) {
      return 'info';
    } else return 'warning';
  };

  const noSortableFields = OrderSortTable;

  const noMenuOptionFields = ['orderId'];

  console.log('filterTable', filterTable);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filterTable.map((n) => n.paymentId);
      setSelected(newSelecteds);
      return;
    } else setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const columns = OrderTableColumns.map((column) => {
    const minWidthData =
      column.field === 'category' ||
      column.field === 'date' ||
      column.field === 'additionalDiscount' ||
      column.field === 'additionalCharges' ||
      column.field === 'packingCharges' ||
      column.field === 'deliveryCharges' ||
      column.field === 'totalParcelCharges'
        ? 230
        : column.field === 'status' || column.field === 'paymentType' || column.field === 'roundOff'
        ? 200
        : column.field === 'deliveryDate' ||
          column.field === 'orderAmount' ||
          column.field === 'GSTPrice' ||
          column.field === 'orderType' ||
          column.field === 'tableName' ||
          column.field === 'captainName'
        ? 190
        : 120;

    return {
      headerName:
        column.field === 'checkbox' ? (
          <Checkbox
            checked={filterTable?.length > 0 && selected?.length === filterTable?.length}
            onChange={handleSelectAllClick}
          />
        ) : (
          column.title
        ),
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      sortable: column.field === 'checkbox' ? false : !noSortableFields.includes(column.field),
      disableColumnMenu:
        column.field === 'checkbox' ? true : noMenuOptionFields.includes(column.field),
      headerClassName: 'super-app-theme--header',

      ...(column.field === 'orderId' && {
        renderCell: (params) => (
          <Typography
            onClick={() => getOrderDetails(get(params, 'row'))}
            sx={{
              textDecoration: 'underline !important',
              color: `${theme.palette.primary.main} !important`,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {get(params, 'value')}
          </Typography>
        ),
      }),

      ...((column.field === 'orderAmount' ||
        column.field === 'GSTPrice' ||
        column.field === 'additionalDiscount' ||
        column.field === 'additionalCharges' ||
        column.field === 'packingCharges' ||
        column.field === 'deliveryCharges' ||
        column.field === 'roundOff' ||
        column.field === 'totalParcelCharges') && { type: 'number' }),

      ...(column.field === 'date' && { valueFormatter: ({ value }) => fDatesWithTimeStamp(value) }),

      ...(column.field === 'orderAmount' || column.field === 'GSTPrice'
        ? { valueFormatter: ({ value }) => formatAmountToIndianCurrency(value) }
        : {}),

      ...(column.field === 'status' && {
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
      ...(column.field === 'paymentType' && {
        renderCell: (params) => (
          <Chip
            size="small"
            color={handlePaymentTypeColor(params.value)}
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
            }}
            label={`${get(params, 'value')}`}
          />
        ),
      }),
      ...(column.field === 'checkbox' && {
        renderCell: (params) => {
          const selectedUser = selected.indexOf(params?.id) !== -1;
          return (
            <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, params?.id)} />
          );
        },
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
  //         <OrderKebabMenu
  //           params={params}
  //           handleOpenDeleteDrawer={() => {
  //             setDelParam(params);
  //             setOpenDelete(true);
  //           }}
  //         />
  //       </>
  //     ),
  //   });

  const rows =
    !isEmpty(filterTable) &&
    map(filterTable, (data) => {
      console.log('data', data);

      const actualParcelCharges =
        Number(data?.totalParcelCharges) || 0 + Number(data?.packingCharges) || 0;

      const sum = reduce(
        get(data, 'payments'),
        function (previousValue, current) {
          return previousValue + get(current, 'paidAmount');
        },
        0
      );

      const deliveryDateDisplay = get(data, 'deliveryDate')
        ? formatIndDateWithOutUtc(get(data, 'deliveryDate'))
        : '-';

      return {
        id: get(data, 'paymentId'),
        date: `${get(data, 'date')} ${get(data, 'time')}`,
        orderId: get(data, 'orderId'),
        GSTPrice:toFixedIfNecessary(convertToRupee(get(data, 'GSTPrice')),2),
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
        roundOff: convertToRupee(get(data, 'roundOff')),
        deliveryDate: deliveryDateDisplay,
        orderAmount: toFixedIfNecessary(convertToRupee(get(data, 'orderAmount')),2),
        orderType: get(data, 'orderType') || '-',
        status: get(data, 'status'),
        paymentType: get(data, 'type'),
        totalParcelCharges: convertToRupee(actualParcelCharges) || 0,
        tableName: get(data, 'additionalInfo.tableName') || '-',
        captainName: get(data, 'additionalInfo.captainName') || '-',
      };
    });

  const pdfDownload = async () => {
    try {
      setIsLoading(true);
      const filename = 'orders-report.pdf';
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }, isTimeQuery),
        endDate: IndFormat({ endDate }, isTimeQuery),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        storeName: storeName,
        type: 'orders',
        filename,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/order-wise-pdf${query}`;
        const filename = generateFilename('Order_Report');
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
        if (isSingleDate(startDate, endDate)) {
          await PRODUCTS_API.exportOrdersAsPdf({
            ...options,
            Filestore: false,
          });
        } else {
          const res = await PRODUCTS_API.exportOrdersAsPdf({
            ...options,
            Filestore: true,
          });
          await isCheckExportData({ attachmentId: get(res, 'data'), filename });
        }
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    } finally {
      setIsLoading(false);
    }
  };

  const csvDownload = async (csvColumns, onClose) => {
    try {
      setIsLoading(true);
      const filename = 'orders-report.csv';
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }, isTimeQuery),
        endDate: IndFormat({ endDate }, isTimeQuery),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        storeName: storeName,
        type: 'orders',
        filename,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        let query = ObjectToQueryParams(options);
        forEach(csvColumns, (_value, _key) => {
          if (_value) {
            query += `&column=${_key}`;
          }
        });
        const url = `${API}/api/v1/POS/merchant/report/order-wise-csv${query}`;
        const filename = generateFilename('Order_Report');
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
        if (isSingleDate(startDate, endDate)) {
          await PRODUCTS_API.exportOrdersAsCsv(
            {
              ...options,
              Filestore: false,
            },
            csvColumns
          );
        } else {
          const res = await PRODUCTS_API.exportOrdersAsCsv(
            {
              ...options,
              Filestore: true,
            },
            csvColumns
          );
          await isCheckExportData({ attachmentId: get(res, 'data'), filename });
        }
      }
      ObjectStorage.setItem(StorageConstants.SELECTED_CSV_COLUMNS, { data: csvColumns });
      onClose();
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };

  const excelDownload = async (excelColumns, onClose) => {
    try {
      setIsLoading(true);
      const filename = 'orders-report.xlsx';
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }, isTimeQuery),
        endDate: IndFormat({ endDate }, isTimeQuery),
        ...(customCode ? { customCode: customCode } : {}),
        ...(customerId ? { customerId: customerId } : {}),
        storeName: storeName,
        type: 'orders',
        filename,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        let query = ObjectToQueryParams(options);
        forEach(excelColumns, (_value, _key) => {
          if (_value) {
            query += `&column=${_key}`;
          }
        });
        const url = `${API}/api/v1/POS/merchant/download/report/order-wise-xlxs${query}`;
        const filename = generateFilename('Order_Report');
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
        if (isSingleDate(startDate, endDate)) {
          await PRODUCTS_API.exportOrdersAsExcel(
            {
              ...options,
              Filestore: false,
            },
            excelColumns
          );
        } else {
          const res = await PRODUCTS_API.exportOrdersAsExcel(
            {
              ...options,
              Filestore: true,
            },
            excelColumns
          );
          await isCheckExportData({ attachmentId: get(res, 'data'), filename });
        }
      }
      ObjectStorage.setItem(StorageConstants.SELECTED_CSV_COLUMNS, { data: excelColumns });
      onClose();
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBulkOrdersWithStock = async () => {
    try {
      const options = {
        paymentIds: selected,
      };
      await PRODUCTS_API.bulkOrdersDeleteWithStock(options);
      setIsOpenBulkProductsDeleteDialog(false);
      setAlertDialogInformation({ open: false });
      setSelected([]);
      getOrderReports();
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleDeleteBulkOrdersWithoutStock = async (isNotInitialFetch) => {
    try {
      const options = {
        paymentIds: selected,
      };
      await PRODUCTS_API.bulkOrdersDeleteWithoutStock(options);
      if (!isNotInitialFetch) {
        setIsOpenBulkProductsDeleteDialog(false);
        setAlertDialogInformation({ open: false });
        setSelected([]);
        getOrderReports();
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleDeleteBulkOrders = async (onClose) => {
    try {
      const options = {
        paymentIds: selected,
      };
      await PRODUCTS_API.bulkOrdersDelete(options);
      await handleDeleteBulkOrdersWithoutStock(true);
      onClose();
      setSelected([]);
      getOrderReports();
    } catch (error) {
      if (error?.errorResponse?.code === 'ERR_PBEE_0001') {
        setIsOpenBulkProductsDeleteDialog(true);
      }
    }
  };

  const handleDeleteBulkOrdersAlert = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to delete selected orders?`,
      actions: {
        primary: {
          text: 'Delete',
          onClick: (onClose) => {
            handleDeleteBulkOrders(onClose);
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Stack>
        <Box xs display="flex" alignItems="center">
          {reportSummary && (
            <Box my={2} className="step1">
              <FilterComponent
                handleCustomCode={handleCustomCode}
                // isOrderDetails={isOrderDetails}
                handleCustomerId={handleCustomerId}
                handleChangeOrder={handleChangeOrder}
                currentCustomCode={currentCustomCode}
                currentCustomerId={currentCustomerId}
                filterTable={filterTable}
                title="OrderReport"
                docTitle="Order Report"
                headers={OrderTableHeaders}
                columns={OrderTableColumns}
                printPdf={pdfDownload}
                csvDownload={csvDownload}
                excelDownload={excelDownload}
                isConfigCsvOrExcelColumns
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                isDesc={isDesc}
                setIsDesc={setIsDesc}
                setStatus={setStatus}
                status={status}
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
              titleDcard1={'Successful Orders'}
              titleDcard2={'Total Order Amount(₹)'}
              subtitleDcard1={toFixedIfNecessary(successfullOrders, 2)}
              subtitleDcard2={toFixedIfNecessary(successfullPayment, 2)}
              chartTitle={'Type'}
              chartData={orderTypes}
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
              {map(OrderTableHeaders, (e, index) => (
                <TableCell sx={{ color: theme.palette.primary.main }} align={'center'}>
                  {e}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(filterTable, (row, index) => (
              <OrderTableRow row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}

          <Stack sx={{ width: '100%' }}>
            {selected?.length > 0 && (
              <Stack
                flexDirection={'row'}
                sx={{
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  height: '50px',
                  mt: 3,
                }}
              >
                <Stack
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1,
                    width: '100%',
                  }}
                >
                  <Typography
                    component="div"
                    variant="subtitle1"
                    marginLeft={2}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {selected?.length} selected
                  </Typography>
                </Stack>

                <Tooltip title="Bulk orders delete">
                  <IconButton onClick={handleDeleteBulkOrdersAlert}>
                    <DeleteOutlineIcon sx={{ color: 'white' }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>

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
                  '& .MuiTypography-root': {
                    textDecoration: 'none',
                    color: '#212b36',
                    fontSize: '14px',
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
                localeText={{ noRowsLabel: 'No order reports found' }}
                getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                }
                autoHeight={true}
                loading={loading}
              />
            </Box>
          }
        </Box>
        {order && !isEmpty(filterTable) && (
          <DrawerTransaction
            handleOpen={handleOpen}
            open={open}
            handleClose={handleClose}
            row={order}
            filterTable={filterTable}
          />
        )}
        <TakeATourWithJoy config={orderReportTourConfig} />
      </Stack>

      {/* {isOrderDetails && <OrderSummaryReportTable isOrderDetails={isOrderDetails} />} */}
      <BulkProductsDeleteDialog
        open={isOpenBulkProductsDeleteDialog}
        handleCloseDialog={() => {
          setIsOpenBulkProductsDeleteDialog(false);
        }}
        handleDeleteBulkOrdersWithStock={handleDeleteBulkOrdersWithStock}
        handleDeleteBulkOrdersWithoutStock={handleDeleteBulkOrdersWithoutStock}
      />
      {/* <Dialog open={openDelete} onClose={handleCloseDeleteDrawer}>
        <Paper
          sx={{
            p: 2,
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            {` Are you sure you want to delete this order ${get(
              delParam,
              'row.orderId'
            )}  ? This action cannot be undone.`}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseDeleteDrawer} sx={{ mr: 2 }} variant="text">
              Cancel
            </Button>
            <Button
              onClick={() => {
                deleteOrder(delParam);
              }}
              variant="contained"
            >
              Delete
            </Button>
          </div>
        </Paper>
      </Dialog> */}
    </>
  );
}
