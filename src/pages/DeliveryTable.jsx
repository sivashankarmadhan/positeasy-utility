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
    Link,
    IconButton,
  } from '@mui/material';

  import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
  import DatePicker from 'src/components/DatePicker';
  import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
  import { tooltipClasses } from '@mui/material/Tooltip';
  import OrderKebabMenu from './OrderKebabMenu';
  import { styled } from '@mui/material/styles';
  import { filter, find, flatMap, forEach, get, groupBy, isEmpty, map, omit } from 'lodash';
  import { useEffect, useState } from 'react';
  import { useRecoilState, useRecoilValue } from 'recoil';
  import { toFixedIfNecessary, formatAmountToIndianCurrency } from 'src/utils/formatNumber';
  import DrawerTransaction from 'src/components/DrawerTransactionOrder';
  import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard';
  import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
  import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
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
    currentDate,
  } from 'src/global/recoilState';
  import AuthService from 'src/services/authService';
  import { convertToRupee } from 'src/helper/ConvertPrice';
  import { getCurrentDate } from 'src/helper/FormatTime';
  import BookingServices from 'src/services/API/BookingServices';
  import FilterComponent from './FilterComponent';
  import triggerPrint from 'src/helper/triggerPrint';
  import { storeLogo } from 'src/global/recoilState';
  import {
    fDates,
    IndFormat,
    fDatesWithTimeStamp,
    fDateTimes,
    fDatesWithTimeStampFromUtc,
  } from 'src/utils/formatTime';
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
  import statusColor, { purchaseOrderStatusColor } from 'src/utils/statusColor';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
  import ExpandLessIcon from '@mui/icons-material/ExpandLess';
  import moment from 'moment';
  import HandleRawMaterialsDrawer from 'src/sections/RawMaterials/HandleRawMaterialsDrawer';
  import DeliveryDateRangePickerRsuite from 'src/components/DeliveryDateRangePickerRsuite';
  import { MaterialReactTable } from 'material-react-table';
  
  export default function DeliveryTable({ isOrderDetails }) {
    const theme = useTheme();
    const selectedDate = useRecoilValue(currentDate);
    const [successfullOrders, setSuccessfullOrders] = useState(0);
    const [successfullPayment, setSuccessfullPayment] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
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
    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
    });
    const [customCode, setCustomCode] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [rowCount, setRowCount] = useState(0);
    const [currentRowId, setCurrentRowId] = useState('');
    const [open, setOpen] = useState(false);
    const [delParam, setDelParam] = useState({});
    // const [openDelete, setOpenDelete] = useState(false);
    const orderTypeValues = useRecoilValue(orderTypeConfiguration);
    const logo = useRecoilValue(storeLogo);
    const configuration = useRecoilValue(allConfiguration);
    const [isDesc, setIsDesc] = useState(false);
  
    const [vendor, setVendor] = useState({});
    const [orderSummaryDetails, setOrderSummaryDetails] = useState([]);
    const [orderDetails, setOrderDetails] = useState({});
    const [rawMaterials, setRawMaterials] = useState([]);
    const [purchaseOrderStatus, setPurchaseOrderStatus] = useState({});
    const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
    const [expanded, setExpanded] = useState({});
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [vendorList, setVendorList] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
    const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  
    const isSinglePage = size >= rowCount;

    const featureDate = true
  
    const handleChanges = () => {
      setIsDesc((prev) => !prev);
    };
    const [statusListByAmount, setStatusListByAmount] = useState([
      { label: get(orderTypeValues, 'orderTypes.value1', ''), value: 0 },
      { label: get(orderTypeValues, 'orderTypes.value2', ''), value: 0 },
    ]);
  
    const [statusListByCount, setStatusListByCount] = useState([
      { label: get(orderTypeValues, 'orderTypes.value1', ''), value: 0 },
      { label: get(orderTypeValues, 'orderTypes.value2', ''), value: 0 },
    ]);
  
    const handleOpen = (e) => {
      // setCurrentRowId(e);
      setOpen(true);
    };
    const handleClose = () => {
      // setCurrentRowId('');
      setOpen(false);
    };
  
    const storesList = useRecoilValue(stores);
    const getStoreName = (storeId) => {
      const terminals = find(storesList, (e) => e.storeId === storeId);
      if (isEmpty(terminals)) return '';
      return get(terminals, 'storeName');
    };
    const storeName = getStoreName(currentStore);
  
    const getOrderSummaryReports = async () => {
      if (currentStore === undefined || currentStore === 'undefined') return;
      try {
        setLoading(true);
  
        const options = {
        //   startDate: IndFormat({ startDate }),
        //   endDate: IndFormat({ endDate }),
          size: pagination.pageSize,
          page: pagination.pageIndex + 1,
          ...(selectedDate ? { deliverySort: isDesc ? 'latest' : 'oldest' } : {}),
        delStart: IndFormat({ startDate: selectedDate }),
        delEnd: IndFormat({ endDate: selectedDate }),
          storeId: currentStore,
        };
        const serverResponse = await BookingServices.getOrderSummaryDetails(options);
        console.log('serverResponse', serverResponse);
        setRowCount(serverResponse?.data?.totalItems);
        const transformedData = flatMap(serverResponse?.data?.data, (item) => {
          return map(item.orders, (order) => ({
            ...omit(item, 'orders'),
            ...order,
          }));
        });
        setOrderSummaryDetails(transformedData);
        // const serverSummaryResponse = await BookingServices.getPurchaseOrdersReportSummary(options);
        setFilterTable(get(serverResponse, 'data.data', []));
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    console.log('endDatess', orderDetails);
    const getRawMaterials = async (data) => {
      try {
        console.log('endDate', data);
        setOpen(true);
        const options = {
          productId: data?.productId,
          storeId: currentStore,
        };
  
        const productResponse = await BookingServices.getProductRawMaterials(options);
        console.log('getProductRawMaterials', productResponse, data);
        setRawMaterials(productResponse?.data);
        if (productResponse?.data) {
          setOrderDetails(data);
        } else {
          setOrderDetails({});
        }
  
        // const transformedData = flatMap(serverResponse?.data?.data, (item) => {
        //   return map(item.orders, (order) => ({
        //     ...omit(item, 'orders'),
        //     ...order,
        //   }));
        // });
        // setOrderSummaryDetails(transformedData)
      } catch (e) {
        console.log(e);
      }
    };
  
    const pdfDownload = async () => {
        setIsLoading(true);
      try {
        const storeId = AuthService.getSelectedStoreId();
        const terminalId = AuthService.getSelectedTerminal();
        let options = {
          storeId,
          ...(selectedDate ? { delStart: IndFormat({ startDate: selectedDate }) } : {}),
          ...(selectedDate ? { delEnd: IndFormat({ endDate: selectedDate }) } : {}),
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
          await PRODUCTS_API.exportOrdersSummaryAsPdf(options);
        }
      } catch (err) {
        console.log('ererrr', err);
        toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
      }finally {
        setIsLoading(false);
      }

    };

    const handlePagination = (e) => {
      setPage(e.page + 1);
      setSize(e.pageSize);
    };
  
    useEffect(() => {
      if (currentStore) getOrderSummaryReports();
    }, [
      currentStore,
      currentTerminal,
      page,
      size,
      isDesc,
      pagination,
      selectedDate,
    
    ]);
  
    const columns1 = [
      {
        accessorKey: 'paymentId', // Accessor key for grouping
        header: 'Order details',
        enableRowGroup: true,
        size: 300,
        // muiTableHeadCellProps: { sx: { display: 'none' } },
        Cell: ({ renderedCellValue, row }) => {
          console.log('rowrow', row);
          return (
            <Stack>
              <Stack flexDirection={'row'} gap={1}>
                <Typography variant="subtitle2" color={'gray'}>
                  Order Id :
                </Typography>
                <Typography variant="subtitle2">#{row?.original?.orderId}</Typography>
              </Stack>
              <Stack flexDirection={'row'} gap={1}>
                <Typography variant="subtitle2" color={'gray'}>
                  Delivery date :
                </Typography>
                <Typography variant="subtitle2">
                  {row?.original?.deliveryDate
                    ? fDatesWithTimeStampFromUtc(row?.original?.deliveryDate)
                    : '-'}
                </Typography>
              </Stack>
              <Stack flexDirection={'row'} gap={1}>
                <Typography variant="subtitle2" color={'gray'}>
                  Order amount :
                </Typography>
                <Typography variant="subtitle2">
                  ₹{(row?.original?.orderAmount / 100).toFixed(2)}
                </Typography>
              </Stack>
              <Stack flexDirection={'row'} gap={1}>
                <Typography variant="subtitle2" color={'gray'}>
                  Payment status :
                </Typography>
                {/* <Typography variant="subtitle2">{row?.original?.paymentStatus}</Typography> */}
                <Chip
                  size="small"
                  color={statusColor(row?.original?.paymentStatus)}
                  sx={{
                    fontSize: '11px',
                    fontWeight: 600,
                    '&.MuiChip-root': { borderRadius: '4px' },
                  }}
                  label={`${row?.original?.paymentStatus}`}
                />
              </Stack>
              {/* <Stack flexDirection={'row'}>
                <Typography variant="subtitle2">Order Id :</Typography>
                <Typography variant="subtitle3">{row?.original?.orderId}</Typography>
              </Stack> */}
            </Stack>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        // enableRowGroup: false,
        enableGrouping: false,
        Cell: ({ renderedCellValue, row }) => {
          console.log('rowrow', row);
          return (
            <Stack>
              <Stack flexDirection={'row'} alignItems={'center'} gap={1}>
                {
                  row?.original?.productInfo?.name ? (
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => getRawMaterials(row?.original)}
                    >
                      <Typography variant="subtitle2" sx={{ textDecoration: 'underline' }}>
                        {row?.original?.productInfo?.name}
                      </Typography>
                    </Link>
                  ) : (
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => getRawMaterials(row?.original)}
                    >
                      <Typography variant="subtitle2">{row?.original?.productId}</Typography>
                    </Link>
                  )
                  // <Button
                  //   // disabled={isEmpty(filterAddQuantityData)}
                  //   onClick={() => getRawMaterials(row?.original)}
                  //   size="small"
                  //   color="primary"
                  //   variant="contained"
                  // >
                  //   <Typography fontSize={'12px'} fontWeight={600}>
                  //     Raw materials
                  //   </Typography>
                  // </Button>
                }
              </Stack>
            </Stack>
          );
        },
  
        // Cell: ({ renderedCellValue, row }) =>
        //  <>{row.orders[0].name}</>,
      },
      {
        accessorKey: 'price',
        header: 'Price',
        enableGrouping: false,
        Cell: ({ renderedCellValue, row }) => <>₹{(renderedCellValue / 100).toFixed(2)}</>,
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        enableGrouping: false,
      },
    ];
  
    const rows =
      !isEmpty(filterTable) &&
      map(filterTable, (data) => ({
        id: get(data, 'purchaseId'),
        purchaseId: get(data, 'purchaseId'),
        date: `${get(data, 'date')}`,
        referenceId: get(data, 'referenceId'),
        amount: convertToRupee(get(data, 'amount')),
        GST: convertToRupee(get(data, 'GST')),
        discount: convertToRupee(get(data, 'discount')),
        deliveryCharges: convertToRupee(get(data, 'deliveryCharges')),
        status: get(data, 'status'),
        vendor: get(data, 'vendor.name'),
      }));
  
    const csvDownload = async () => {
      try {
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
      }
    };
    // const getVendorList = async () => {
    //   if (currentStore === undefined || currentStore === 'undefined') return;
    //   try {
    //     const response = await VendorServices.getVendorNames(currentStore);
    //     if (response) setVendorList(get(response, 'data', []));
    //   } catch (e) {
    //     console.log(e);
    //     setVendorList([]);
    //   }
    // };
  
    // useEffect(() => {
    //   getVendorList();
    // }, []);
    // const table1=useMaterialReactTable({
    //   state:{pagination}
    // })
  
    console.log('vendorList', vendorList);
  
    const isMobile = useMediaQuery('(max-width:600px)');
  
    console.log('statusListByCount', statusListByAmount);
    console.log('  IconButton', isDesc);
    if (isLoading) return <LoadingScreen />
    return (
      <>
        <Box xs display="flex" alignItems="center">
          {reportSummary && (
            <Stack
              my={2}
              gap={isMobile ? 1 : 2}
              flexDirection={isMobile ? 'row' : 'row'}
              alignItems={'center'}
              className="step1"
            >
              <Stack flexDirection={isMobile ? 'row' : 'row'} alignItems={'center'}>
                <Stack pb={isMobile ? '' : 2}  >
                  <Typography variant="caption">Delivery Date</Typography>
                  {/* <DeliveryDateRangePickerRsuite
                    setDeliveryStartDate={setDeliveryStartDate}
                    setDeliveryEndDate={setDeliveryEndDate}
                    deliverystartDate={deliverystartDate}
                    deliveryendDate={deliveryendDate}
                  /> */}
                   <DatePicker
                   featureDate={featureDate}
                   />
                </Stack>
                <Stack pt={isMobile ? 2 : ''}>
                {selectedDate ? (
                  <Tooltip title={isDesc ? 'Descending' : 'Ascending'}>
                    <IconButton onClick={handleChanges}>
                      {isDesc ? (
                        <ArrowDownwardIcon sx={{ color: theme.palette.primary.main }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ color: theme.palette.primary.main }} />
                      )}
                    </IconButton>
                  </Tooltip>
                ) : (
                  ''
                )}
                </Stack>
      

              <FilterComponent
                filterTable={filterTable}
                title="OrderReport"
                docTitle="Order Report"
                headers={OrderTableHeaders}
                isOrderSummaryDetails={true}
                columns={PurchaseOrderTableColumns}
                printPdf={pdfDownload}
                // csvDownload={csvDownload}
                isOrderDetails={isOrderDetails}
                // excelDownload={excelDownload}
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
              </Stack>
            </Stack>
          )}
        </Box>
        {/* {isMobile ? (
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
        )} */}
        <Box
          sx={{
            height: isMobile ? 'calc(100vh - 17rem)' : 'calc(100vh - 13rem)',
            overflow: 'auto',
            ...hideScrollbar,
          }}
        >
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
              <MaterialReactTable
                columns={columns1}
                data={orderSummaryDetails}
                enableGrouping
                manualPagination
                muiPaginationProps={{
                  showRowsPerPage: true,
                  rowsPerPageOptions: [10, 20, 50, 100],
                }}
                // table={table1}
  
                state={{ pagination, expanded: true, isLoading: loading }}
                enablePagination
                rowCount={rowCount}
                onPaginationChange={setPagination}
                paginationDisplayMode={'default'}
                selectAllMode={'page'}
                initialState={{ grouping: ['paymentId'], pagination }}
                enableTopToolbar={false}
                enableStickyHeader
                muiCircularProgressProps={{
                  color: 'primary',
                }}
                muiSkeletonProps={{
                  animation: 'pulse',
                  height: 28,
                }}
              />
            </Box>
          }
          {console.log(pagination, rowCount, 'PAGINATION')}
  
          {open && (
            <HandleRawMaterialsDrawer
              expense={rawMaterials}
              openDrawer={open}
              orderDetails={orderDetails}
              handleCloseDrawer={handleClose}
              // handleDelete={handleDelete}
              // getExpenseDashboard={getExpenseDashboard}
            />
          )}
        </Box>
      </>
    );
  }
  