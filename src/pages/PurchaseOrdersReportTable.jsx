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
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import OrderKebabMenu from './OrderKebabMenu';
import { styled } from '@mui/material/styles';
import { filter, find, forEach, get, groupBy, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { toFixedIfNecessary, formatAmountToIndianCurrency } from 'src/utils/formatNumber';
import DrawerTransaction from 'src/components/DrawerTransactionOrder';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  PurchaseOrderTableColumns,
  OrderTableHeaders,
  OrderTypeConstants,
  PaymentStatusConstants,
  hideScrollbar,
  ORDER_STATUS,
  OrderSortTable,
  USER_AGENTS,
  ALL_CONSTANT,
  PURCHASE_ORDER_STATUS_FOR_BTN_GRP,
} from 'src/constants/AppConstants';
import { orderReportTourConfig } from 'src/constants/TourConstants';
import {
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
import VendorServices from 'src/services/API/VendorServices';
import { ErrorConstants } from 'src//constants/ErrorConstants';
import toast from 'react-hot-toast';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import { generateFilename } from 'src/helper/generateFilename';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import { purchaseOrderStatusColor } from 'src/utils/statusColor';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import moment from 'moment';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
export default function PurchaseOrdersReportTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const [successfullOrders, setSuccessfullOrders] = useState(0);
  const [successfullPayment, setSuccessfullPayment] = useState(0);
  const currentSelectedRole = () => AuthService.getCurrentRoleInLocal();
  const role = currentSelectedRole();
  const [dineinPerc, setDineInPerc] = useState(0);
  const [parcelPerc, setParcelPerc] = useState(0);
  const [filterTable, setFilterTable] = useState([]);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [customCode, setCustomCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [currentRowId, setCurrentRowId] = useState('');
  const [open, setOpen] = useState(false);
  const [delParam, setDelParam] = useState({});
  // const [openDelete, setOpenDelete] = useState(false);
  const orderTypeValues = useRecoilValue(orderTypeConfiguration);
  const logo = useRecoilValue(storeLogo);
  const [isDesc, setIsDesc] = useState(true);
  const [vendor, setVendor] = useState({});
  const [purchaseOrderStatus, setPurchaseOrderStatus] = useState({});
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const [vendorList, setVendorList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const additionalDiscountConfig = get(configuration, 'billingSettings.additionalDiscount', false);
  const additionalChargesConfig = get(configuration, 'billingSettings.additionalCharges', false);
  const packingChargesConfig = get(configuration, 'billingSettings.packingCharges', false);
  const deliveryChargesConfig = get(configuration, 'billingSettings.deliveryCharges', false);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);

  const isSinglePage = size >= rowCount;

  const [statusListByAmount, setStatusListByAmount] = useState([
    { label: get(orderTypeValues, 'orderTypes.value1', ''), value: 0 },
    { label: get(orderTypeValues, 'orderTypes.value2', ''), value: 0 },
  ]);

  const [statusListByCount, setStatusListByCount] = useState([
    { label: get(orderTypeValues, 'orderTypes.value1', ''), value: 0 },
    { label: get(orderTypeValues, 'orderTypes.value2', ''), value: 0 },
  ]);

  const handleOpen = (e) => {
    setCurrentRowId(e);
    setOpen(true);
  };
  const handleClose = () => {
    setCurrentRowId('');
    setOpen(false);
  };

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getOrderReports = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      console.log('endDate', endDate);
      const options = {
        startDateD: IndFormat({ startDate },isTimeQuery),
        endDateD: IndFormat({ endDate },isTimeQuery),
        customCode: customCode,
        customerId: customerId,
        size,
        page,
        vendorId: get(vendor, 'id'),
        status: get(purchaseOrderStatus, 'id'),
        sort: isDesc ? 'latest' : 'oldest',
        storeName: storeName,
      };
      setLoading(true);
      const serverResponse = await BookingServices.getPurchaseOrdersReport(options);
      const serverSummaryResponse = await BookingServices.getPurchaseOrdersReportSummary(options);
      setLoading(false);
      setFilterTable(get(serverResponse, 'data.data', []));
      setRowCount(get(serverResponse, 'data.totalItems', 0));
      setSuccessfullOrders(get(serverSummaryResponse, 'data.totalOrders', 0));
      setSuccessfullPayment(convertToRupee(get(serverSummaryResponse, 'data.totalAmount', 0)));

      const formattedSplitAmount = map(get(serverSummaryResponse, 'data.splitAmount'), (e) => {
        return {
          label: get(e, 'status') === null ? 'Others' : get(e, 'status'),
          value: convertToRupee(get(e, 'order_amount')),
        };
      });

      const formattedOrderCount = map(get(serverSummaryResponse, 'data.orderCount'), (e) => {
        return {
          label: get(e, 'status') === null ? 'Others' : get(e, 'status'),
          value: get(e, 'count'),
        };
      });
      setStatusListByAmount(formattedSplitAmount);
      setStatusListByCount(formattedOrderCount);
    } catch (e) {
      console.log(e);
      setLoading(false);
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/purchase-PDF${query}`;
        const filename = generateFilename('Purchase_Order_Report');
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
        await PRODUCTS_API.exportPurchaseOrdersAsPdf(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    } finally {
      setIsLoading(false);
    }
  };

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
    vendor,
    purchaseOrderStatus,
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

  const columns = PurchaseOrderTableColumns.map((column) => {
    const minWidthData =
      column.field === 'date' || column.field === 'referenceId'
        ? 200
        : column.field === 'deliveryCharges' ||
          column.field === 'status' ||
          column.field === 'GST' ||
          column.field === 'amount'
        ? 170
        : 120;

    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      sortable: !noSortableFields.includes(column.field),
      disableColumnMenu: noMenuOptionFields.includes(column.field),
      headerClassName: 'super-app-theme--header',

      ...(column.field === 'orderId' && {
        renderCell: (params) => (
          <Typography
            onClick={() => handleOpen(get(params, 'row.id'))}
            sx={{
              textDecoration: 'underline',
              color: '#0000EE',
              cursor: 'pointer',
            }}
          >
            {get(params, 'value')}
          </Typography>
        ),
      }),

      ...((column.field === 'amount' ||
        column.field === 'GST' ||
        column.field === 'deliveryCharges' ||
        column.field === 'discount') && { type: 'number' }),

      ...(column.field === 'date' && { valueFormatter: ({ value }) => fDatesWithTimeStamp(value) }),
      ...(column.field === 'amount' ||
      column.field === 'GST' ||
      column.field === 'discount' ||
      column.field === 'deliveryCharges'
        ? { valueFormatter: ({ value }) => formatAmountToIndianCurrency(value) }
        : {}),
      ...(column.field === 'status' && {
        renderCell: (params) => (
          <Chip
            size="small"
            sx={{
              ml: 0.5,
              fontSize: '11px',
              fontWeight: 800,
              '&.MuiChip-root': { borderRadius: '4px' },
              backgroundColor: purchaseOrderStatusColor(params?.value)?.bgColor,
              color: purchaseOrderStatusColor(params?.value)?.color,
            }}
            label={`${get(params, 'value', 'Status not found')}`}
          />
        ),
      }),
    };
  });
  const columnsD = [...columns];
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
    map(filterTable, (data) => ({
      id: get(data, 'purchaseId'),
      purchaseId: get(data, 'purchaseId'),
      date: `${get(data, 'date')}`,
      referenceId: get(data, 'referenceId'),
      amount: toFixedIfNecessary (convertToRupee(get(data, 'amount')),2),
      GST: toFixedIfNecessary( convertToRupee(get(data, 'GST')),2),
      discount: toFixedIfNecessary(convertToRupee(get(data, 'discount')),2),
      deliveryCharges: convertToRupee(get(data, 'deliveryCharges')),
      status: get(data, 'status'),
      vendor: get(data, 'vendor.name'),
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
        const url = `${API}/api/v1/POS/merchant/report/purchase-csv${query}`;
        const filename = generateFilename('Purchase_Orders_Report');
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
        await PRODUCTS_API.exportPurchaseOrdersAsCsv(options);
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/purchase-xlsx${query}&filename=purchase-orders-report.xlsx`;
        const filename = generateFilename('Purchase_Order_Report');
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
        await PRODUCTS_API.exportPurchaseOrdersAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    } finally {
      setIsLoading(false);
    }
  };
  const getVendorList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const response = await VendorServices.getVendorNames(currentStore);
      if (response) setVendorList(get(response, 'data', []));
    } catch (e) {
      console.log(e);
      setVendorList([]);
    }
  };

  useEffect(() => {
    getVendorList();
  }, []);

  console.log('vendorList', vendorList);

  const isMobile = useMediaQuery('(max-width:600px)');

  console.log('statusListByCount', statusListByAmount);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Box xs display="flex" alignItems="center">
        {reportSummary && (
          <Box my={2} className="step1">
            <FilterComponent
              filterTable={filterTable}
              title="OrderReport"
              docTitle="Order Report"
              headers={OrderTableHeaders}
              columns={PurchaseOrderTableColumns}
              printPdf={pdfDownload}
              csvDownload={csvDownload}
              excelDownload={excelDownload}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              isDesc={isDesc}
              setIsDesc={setIsDesc}
              vendor={vendor}
              handleChangeVendor={(value) => {
                setVendor(value);
              }}
              vendorList={vendorList}
              purchaseOrderStatus={purchaseOrderStatus}
              handleChangeStatus={(value) => {
                setPurchaseOrderStatus(value);
              }}
              purchaseOrderStatusList={PURCHASE_ORDER_STATUS_FOR_BTN_GRP}
              isDisabledCustomCodeAndCustomer
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
          height: isMobile ? 'calc(100vh - 17rem)' : 'calc(100vh - 13rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        {loading ? (
          <ReportCardSkeletonLoader />
        ) : (
          <ReportAndAnalyticsCard
            titleDcard1={'Total Purchase Orders And Amount'}
            titleDcard2={'Status By Amount'}
            subtitleDcard1={{
              name1: 'Count',
              value1: successfullOrders,
              name2: 'Amount',
              value2:toFixedIfNecessary(successfullPayment,2) 
            }}
            subtitleDcard2={statusListByAmount}
            chartTitle={'Status By Count'}
            chartData={statusListByCount}
            isNotRupeeForChartData
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
        {
          <Box
            sx={{
              height: isMobile ? 'calc(100vh - 17rem)' : 'calc(100vh - 21rem)',
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
      {currentRowId && !isEmpty(filterTable) && (
        <DrawerTransaction
          handleOpen={handleOpen}
          open={open}
          handleClose={handleClose}
          row={find(filterTable, (d) => d.paymentId === currentRowId)}
        />
      )}
      <TakeATourWithJoy config={orderReportTourConfig} />
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
