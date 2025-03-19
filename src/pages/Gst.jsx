import { Box, Chip, useMediaQuery, useTheme } from '@mui/material';
import { find, forEach, get, isEmpty, map, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  ALL_CONSTANT,
  GSTTableHeaders,
  GstTableColumns,
  GstSortTable,
  PaymentModeTypeConstants,
  USER_AGENTS,
  hideScrollbar,
  PaymentStatusConstants,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { reportGSTTourConfig } from 'src/constants/TourConstants';
import { GstData, SelectedSection } from 'src/global/SettingsState';
import { currentStoreId, customCodeList, customerList, stores } from 'src/global/recoilState';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { getCurrentDate } from 'src/helper/FormatTime';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import CardsGst from 'src/sections/ReportsAndAnalytics/Gst/CardsGst';
import DrawerTransaction from 'src/sections/ReportsAndAnalytics/Gst/DrawerTransaction';
import BookingServices from 'src/services/API/BookingServices';
import FilterComponent from './FilterComponent';
import { toFixedIfNecessary, formatAmountToIndianCurrency } from 'src/utils/formatNumber';
import triggerPrint from 'src/helper/triggerPrint';
import { storeLogo, reportSummaryState } from 'src/global/recoilState';
import { fDates, IndFormat, fDatesWithTimeStamp } from 'src/utils/formatTime';
import PRODUCTS_API from 'src/services/products';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import statusColor from 'src/utils/statusColor';
import moment from 'moment';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
import { allConfiguration } from 'src/global/recoilState';

function Gst() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [totalCollectedAmount, setTotalCollectedAmount] = useState(0);
  const [totalGSTAmount, setTotalGSTAmount] = useState(0);
  const [withoutGstAmount, setWithoutGstAmount] = useState(0);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const [paymentModewise, setPaymentModeWise] = useState([{ label: '', value: 0 }]);
  const [customCode, setCustomCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const currentStore = useRecoilValue(currentStoreId);
  const [tableData, setTableData] = useState([]);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const [isLoading, setIsLoading] = useState(false);

  const setSection = useSetRecoilState(SelectedSection);
  const gstData = useRecoilValue(GstData);
  const [loading, setLoading] = useState();
  const [upiPerc, setUpiPerc] = useState(0);
  const [cashPerc, setCashPerc] = useState(0);
  const [cardPerc, setCardPerc] = useState(0);
  const [currentRowId, setCurrentRowId] = useState('');
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [currentCustomCode, setCurrentCustomCode] = useState({ label: '', id: '' });
  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', id: '' });
  const customCodes = useRecoilValue(customCodeList);
  const customerCodes = useRecoilValue(customerList);
  const [open, setOpen] = useState(false);
  const logo = useRecoilValue(storeLogo);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isSinglePage = size >= rowCount;

  const handleOpen = (id) => {
    setOpen(true);
    setCurrentRowId(id);
  };
  const handleClose = () => {
    setOpen(false);
    setCurrentRowId('');
  };



  const handleCustomCode = (e) => {
    setCustomCode(get(e, 'id'));
    setCurrentCustomCode(e);
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

  const getGstDetails = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      let formatOptions = {};

      if (startDate && endDate) {
        set(formatOptions, 'startDate', IndFormat({ startDate }, isTimeQuery));
        set(formatOptions, 'endDate', IndFormat({ endDate }, isTimeQuery));
      }
      if (customerId) {
        set(formatOptions, 'customerId', customerId);
      }
      if (customCode) {
        set(formatOptions, 'customCode', customCode);
      }
      if (storeName) {
        set(formatOptions, 'storeName', storeName);
      }
      setLoading(true);
      console.log('formatOptions', formatOptions);
      const res = await BookingServices.fetchGstDetails({
        ...formatOptions,
        size,
        page,
        storeName,
      });
      const responseSummary = await BookingServices.fetchGstSummaryReport({ ...formatOptions });

      setLoading(false);
      setPaymentModeWise([
        {
          label: 'GST',
          value: convertToRupee(get(responseSummary, 'data.0.GSTAmount')),
        },
        {
          label: 'Without GST',
          value: convertToRupee(
            get(responseSummary, 'data.0.orderAmount') - get(responseSummary, 'data.0.GSTAmount')
          ),
        },
      ]);
      setTableData(get(res, 'data.data'));
      setRowCount(get(res, 'data.totalItems'));
      setTotalCollectedAmount(get(responseSummary, 'data.0.orderAmount'));

      setWithoutGstAmount(
        get(responseSummary, 'data.0.orderAmount') - get(responseSummary, 'data.0.GSTAmount')
      );
      setTotalGSTAmount(get(responseSummary, 'data.0.GSTAmount'));
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      setLoading(false);
    }
  };
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  const getChartAmountData = (serverResponse, type) => {
    let upiData = 0;
    let totalAmount = convertToRupee(get(serverResponse, 'data.totalGSTAmount', 0));
    forEach(get(serverResponse, 'data.splitData', []), (_res) => {
      if (get(_res, 'type') === type) {
        upiData = convertToRupee(get(_res, 'GSTPrice', 0)) / totalAmount;
      }
    });
    return Number(toFixedIfNecessary(upiData * 100, 2));
  };

  useEffect(() => {
    if (currentStore) getGstDetails();
  }, [startDate, endDate, currentStore, customerId, customCode, page, size]);

  const noFilterableFields = ['paymentId', 'date'];
  const noSortableFields = GstSortTable;

  const noMenuOptionFields = ['paymentId'];
  const columns = GstTableColumns.map((column) => {
    const minWidthData =
      column.field === 'paymentId' ||
      column.field === 'paymentStatus' ||
      column.field === 'type' ||
      column.field === 'date'
        ? 200
        : column.field === 'orderAmount' ||
          column.field === 'GSTPrice' ||
          column.field === 'contactNumber'
        ? 170
        : column.field === 'additionalDiscount' ||
          column.field === 'additionalCharges' ||
          column.field === 'packingCharges' ||
          column.field === 'deliveryCharges' ||
          column.field === 'amount'
        ? 200
        : 140;
    return {
      headerName: column.title,
      field: column.field,
      flex: column.field === 'paymentId' ? 1 : 2,
      width: column.field === 'paymentId' ? 200 : column.field === 'date' ? 120 : 170,
      minWidth: minWidthData,
      ...(column.field === 'date'
        ? { maxWidth: 120, valueFormatter: ({ value }) => fDatesWithTimeStamp(value) }
        : {}),
      filterable: !noFilterableFields.includes(column.field),
      sortable: !noSortableFields.includes(column.field),
      disableColumnMenu: noMenuOptionFields.includes(column.field),
      headerClassName: 'super-app-theme--header',

      ...((column.field === 'orderAmount' ||
        column.field === 'GSTPrice' ||
        column.field === 'amount' ||
        column.field === 'additionalDiscount' ||
        column.field === 'additionalCharges' ||
        column.field === 'packingCharges' ||
        column.field === 'deliveryCharges') && {
        type: 'number',
      }),

      ...(column.field === 'orderAmount' || column.field === 'GSTPrice' || column.field === 'amount'
        ? { valueFormatter: ({ value }) => formatAmountToIndianCurrency(value) }
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
            label={`${params.value}`}
          />
        ),
      }),
    };
  });
  const columnsD = [
    ...columns,
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
          <Chip
            size="small"
            onClick={() => handleOpen(params.row.id)}
            variant="outlined"
            color="info"
            label="View Details"
            sx={{ cursor: 'pointer' }}
          />
        </>
      ),
    },
  ];

  const rows =
    !isEmpty(tableData) &&
    map(tableData, (item) => ({
      id: get(item, 'paymentId'),
      paymentId: get(item, 'paymentId'),
      date: `${get(item, 'date')} ${get(item, 'time')}`,
      GSTPrice: toFixedIfNecessary(convertToRupee(get(item, 'GSTPrice')), 2),
      orderAmount: toFixedIfNecessary(convertToRupee(get(item, 'orderAmount')), 2),
      amount: toFixedIfNecessary(
        convertToRupee(get(item, 'orderAmount') - get(item, 'GSTPrice')),
        2
      ),
      paymentStatus: get(item, 'paymentStatus'),
      paymentMode: get(item, 'payments.0.mode'),
      type: get(item, 'type'),
      name: get(item, 'name', '--'),
      contactNumber: get(item, 'contactNumber', '--'),
    }));

  // if (!get(gstData, 'gstEnabled')) {
  //   return (
  //     <Card sx={{ width: '60%', mx: 'auto', mt: 3 }}>
  //       <Stack p={2} flexDirection="row" alignItems="center" gap={1.5}>
  //         <ErrorOutlineIcon sx={{ color: theme.palette.primary.light }} />
  //         <Stack flexGrow={1}>
  //           <Typography variant="h6">View GST Details</Typography>
  //           <Typography variant="body2">
  //             If enabled, You can view and filter GST details.
  //           </Typography>
  //         </Stack>
  //         <Button
  //           sx={{ color: theme.palette.primary.light }}
  //           variant="text"
  //           onClick={() => {
  //             navigate(RouterConstants.DASHBOARD_SETTINGS_CONFIG);
  //             setSection(SettingsSections[1].path);
  //           }}
  //         >
  //           Enable
  //         </Button>
  //       </Stack>
  //     </Card>
  //   );
  // }

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
        const url = `${API}/api/v1/POS/merchant/report/GST-csv${query}`;
        const filename = generateFilename('GST_Report');
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
        await PRODUCTS_API.exportGstAsCsv(options);
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
        const url = `${API}/api/v1/POS/merchant/report/GST-pdf${query}`;
        const filename = generateFilename('GST_Report');
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
        await PRODUCTS_API.exportGstAsPdf(options);
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
        const url = `${API}/api/v1/POS/merchant/report/GST-xlsx${query}`;
        const filename = generateFilename('GST_Report');
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
        await PRODUCTS_API.exportGstAsExcel(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = useMediaQuery('(max-width:600px)');

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
              filterTable={tableData}
              title="ProductReport"
              docTitle="GST Report"
              headers={GSTTableHeaders}
              columns={GstTableColumns}
              printPdf={pdfDownload}
              csvDownload={csvDownload}
              excelDownload={excelDownload}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
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
          height: isMobile ? 'calc(100vh - 14rem)' : 'calc(100vh - 10rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        {loading ? (
          <ReportCardSkeletonLoader />
        ) : (
          <CardsGst
            totalCollectedAmount={convertToRupee(totalCollectedAmount)}
            totalGSTAmount={convertToRupee(totalGSTAmount)}
            withoutGstAmount={convertToRupee(withoutGstAmount)}
            tableData={tableData}
            chartData={paymentModewise}
          />
        )}
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
            localeText={{ noRowsLabel: 'No   gst reports found' }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
            }
            autoHeight={true}
            loading={loading}
          />
        </Box>
      </Box>
      {/* <TableGst headers={headers} data={tableData} />{' '} */}
      {currentRowId && (
        <DrawerTransaction
          handleOpen={handleOpen}
          open={open}
          handleClose={handleClose}
          row={find(tableData, (d) => d.paymentId === currentRowId)}
        />
      )}
      <TakeATourWithJoy config={reportGSTTourConfig} />
    </>
  );
}

export default Gst;
