import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { debounce, find, get, isEmpty, map, some } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import PdfDownload from 'src/PrintPdf/PdfDownload';
import StartAndEndDatePicker from 'src/components/DateRangePickerRsuite';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  ALL_CONSTANT,
  StockSummaryReportHeaders,
  StockSummaryReportTableColumns,
  StockSummarySortTable,
  USER_AGENTS,
  hideScrollbar,
  PURCHASE_TO_SHOP,
} from 'src/constants/AppConstants';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { StocksReportTourConfig } from 'src/constants/TourConstants';
import {
  currentEndDate,
  currentStartDate,
  currentStoreId,
  storeLogo,
  reportSummaryState,
  stores,
} from 'src/global/recoilState';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import { generateFilename } from 'src/helper/generateFilename';
import triggerPrint from 'src/helper/triggerPrint';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { IndFormat, fDates, formatDate } from 'src/utils/formatTime';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import handleGeneratePDFReport from 'src/utils/handleGeneratePDFReport';
import handlePdfPrint from 'src/utils/handlePdfPrint';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ListItemText } from '@mui/material';
import { isUndefined } from 'lodash';
import { checkTargetForNewValues } from 'framer-motion';
import isUnderWeekDates from 'src/utils/isUnderWeekDates';
import { Icon } from '@iconify/react';

import {
  allConfiguration,
} from '../global/recoilState';
export default function StockSummaryReportTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const currentStore = useRecoilValue(currentStoreId);
  const [searchProductId, setSearchProductId] = useState('');
  const [searchProduct, setSearchProduct] = useState({ label: '', id: '' });
  const [productName, setProductName] = useState([]);
  const [stockReport, setStockReport] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const logo = useRecoilValue(storeLogo);
  const [searchType, setSearchType] = useState('');
  const optionTypes = ['IN', 'OUT', 'WASTAGE'];
  const [searchOrderId, setSearchOrderId] = useState('');
  const isDesktop = useMediaQuery('(min-width:1419px)');
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const isSinglePage = size >= rowCount;
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  console.log('productName', searchType);

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };
  const handleChangeType = (e) => {
    setSearchType(e.target.innerText);
  };
  const handleChangeProductId = (e) => {
    setSearchProductId(get(e, 'id'));
    setSearchProduct(e);
    // setStockType(newValue);
  };

  const noSortableFields = StockSummarySortTable;

  const [stockType, setStockType] = useState({
    label: PURCHASE_TO_SHOP.PRODUCT,
    id: PURCHASE_TO_SHOP.PRODUCT,
  });
  const handleChangeStockType = (e, newValue) => {
    setStockType(newValue);
  };
  const optionStockTypes = map(PURCHASE_TO_SHOP, (_value) => ({
    label: _value?.replace('_', ' '),
    id: _value,
  }));
  const isUnderWeekDatesBol = isUnderWeekDates(startDate, endDate, true);

  const columns = StockSummaryReportTableColumns.map((column) => ({
    headerName: column.title,
    field: column.field,
    flex: 1,
    sortable: !noSortableFields.includes(column.field),
    minWidth: column.field === 'name' ? 180 : 140,
    ...(column.field === 'date' && { valueFormatter: ({ value }) => fDates(value) }),
    ...((column.field === 'inStock' ||
      column.field === 'outStock' ||
      column.field === 'wastageStock') && {
      renderCell: ({ value }) => <Box sx={{ color: value > 0 ? 'green' : 'red' }}>{value}</Box>,
    }),
  }));

  const getProductName = async () => {
    if (isUndefined(currentStore) || currentStore === 'undefined') return;
    try {
      const response = await PRODUCTS_API.getProductName({ stockType: stockType?.id });
      if (response) setProductName(response.data);
    } catch (e) {
      setProductName([]);
    }
  };

  const formatResponse = (response) => {
    let formatted = [];
    map(response, (e) => {
      let data = {};
      map(get(e, 'paymentInfo', []), (f) => {
        data = {
          ...data,
          name: get(f, 'name'),
          productId: get(f, 'productId'),
          ...(get(f, 'type') === 'IN' ? { inStock: get(f, 'Stock_status') } : {}),
          ...(get(f, 'type') === 'OUT' ? { outStock: get(f, 'Stock_status') } : {}),
          ...(get(f, 'type') === 'WASTAGE' ? { wastageStock: get(f, 'Stock_status') } : {}),
        };
      });
      formatted.push(data);
    });
    return formatted;
  };

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getStockSummaryReports = async () => {
    if (isUndefined(currentStore) || currentStore === 'undefined') return;
    try {
      const options = {
        startDateD: IndFormat({ startDate },isTimeQuery),
        endDateD: IndFormat({ endDate },isTimeQuery),
        size,
        page,
        productId: searchProductId,
        type: searchType,
        stockType: get(stockType, 'id'),
        storeName: storeName,
      };
      setLoading(true);
      const response = await PRODUCTS_API.getStockSummary(options);
      setLoading(false);
      if (response) {
        const formatted = formatResponse(get(response, 'data.data', []));
        setStockReport(formatted || []);
        setRowCount(get(response, 'data.totalItems', []));
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentStore) getStockSummaryReports();
  }, [
    startDate,
    endDate,
    currentStore,
    page,
    size,
    searchProductId,
    searchType,
    searchOrderId,
    stockType,
  ]);

  useEffect(() => {
    getProductName();
  }, [currentStore]);

  const printPdf = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(searchProductId ? { productId: searchProductId } : {}),
        ...(stockType?.id ? { stockType: stockType?.id } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/stocks-summary-pdf${query}`;
        const filename = generateFilename('Stock_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorisation: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportStocksSummaryAsPdf(options);
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
        ...(searchProductId ? { productId: searchProductId } : {}),
        ...(stockType?.id ? { stockType: stockType?.id } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/stocks-summary-csv${query}`;
        const filename = generateFilename('Stock_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorisation: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportStocksSummaryAsCsv(options);
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
        ...(searchProductId ? { productId: searchProductId } : {}),
        ...(stockType?.id ? { stockType: stockType?.id } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/stocks-summary-xlsx${query}`;
        const filename = generateFilename('Stock_Report');
        handleCSVDownload({
          url,
          method: 'GET',
          headers: {
            Authorisation: `Bearer ${AuthService._getAccessToken()}`,
            deviceid: AuthService.getDeviceId(),
          },
          filename,
        });
      } else {
        await PRODUCTS_API.exportStocksSummaryAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterOptions = createFilterOptions({
    ignoreCase: true,
    matchFrom: 'start',
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      {reportSummary && (
        <>
          {!isMobile ? (
            <Box my={2} className="step1">
              <Stack
                sx={{
                  display: 'flex',
                  flexFlow: 'row wrap',
                  alignItems: 'center',
                }}
                gap={1}
              >
                <StartAndEndDatePicker />
                {!isEmpty(productName) && (
                  <Autocomplete
                    size="small"
                    label="Product Name"
                    disablePortal
                    options={map(productName, (e) => {
                      return {
                        label: get(e, 'name'),
                        id: get(e, 'productId'),
                      };
                    })}
                    value={searchProduct}
                    filterOptions={filterOptions}
                    onChange={(event, newValue) => handleChangeProductId(newValue)}
                    sx={{ minWidth: 160 }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Product Name'} />
                    )}
                  />
                )}
                {/* <Autocomplete
                  size="small"
                  label="Type"
                  value={searchType}
                  disablePortal
                  options={optionTypes}
                  onChange={handleChangeType}
                  sx={{ minWidth: 160 }}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Type'} />
                  )}
                /> */}
                <Autocomplete
                  size="small"
                  label="Type"
                  disablePortal
                  disableClearable
                  value={stockType}
                  options={optionStockTypes}
                  onChange={handleChangeStockType}
                  sx={{ minWidth: 180 }}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Stock Type'} />
                  )}
                />
                {!isEmpty(stockReport) && (
                  <Tooltip title={'Export PDF'}>
                    <Stack>
                      <PdfDownload
                        heading={StockSummaryReportHeaders}
                        paymentRows={stockReport}
                        startDate={startDate}
                        endDate={endDate}
                        title={'StockReport'}
                        columns={StockSummaryReportTableColumns}
                        DocTitle={'Stock Report'}
                        printPdf={printPdf}
                        isUnderWeekDatesBol={isUnderWeekDatesBol}
                      />
                    </Stack>
                  </Tooltip>
                )}
                {!isEmpty(stockReport) && (
                  <Tooltip
                    title={
                      isUnderWeekDates(startDate, endDate, true) ? 'Export CSV' : 'COMING SOON'
                    }
                  >
                    <IconButton
                      disabled={!isUnderWeekDates(startDate, endDate, true)}
                      ml={1}
                      onClick={csvDownload}
                    >
                      <Icon
                        icon="grommet-icons:document-csv"
                        style={
                          isUnderWeekDates(startDate, endDate, true)
                            ? { color: theme.palette.primary.main }
                            : { opacity: 0.5, color: 'gray' }
                        }
                        width="20"
                        height="20"
                      />
                    </IconButton>
                  </Tooltip>
                )}
                {!isEmpty(stockReport) && (
                  <Tooltip title={isUnderWeekDatesBol ? 'Export EXCEL' : 'COMING SOON'}>
                    <IconButton ml={1} disabled={!isUnderWeekDatesBol} onClick={excelDownload}>
                      <Icon
                        icon="uiw:file-excel"
                        style={
                          isUnderWeekDatesBol
                            ? { color: theme.palette.primary.main }
                            : { opacity: 0.5, color: 'gray' }
                        }
                        width="20"
                        height="20"
                      />
                    </IconButton>
                  </Tooltip>
                )}
                {/* TODO: we will enable future */}
                {/* {!isEmpty(stockReport) && (
              <Tooltip title="Click above to print or save as pdf">
                <Stack>
                  <PdfDownload
                    heading={StockSummaryReportHeaders}
                    paymentRows={stockReport}
                    startDate={startDate}
                    endDate={endDate}
                    title={'StocSummaryReport'}
                    columns={StockSummaryReportTableColumns}
                    DocTitle={'Stock Summary Report'}
                    printPdf={printPdf}
                  />
                </Stack>
              </Tooltip>
            )}  */}
                <Tooltip title="Export csv">
                  {/* <IconButton ml={1} onClick={csvDownload}>
                <DownloadIcon sx={{ color: theme.palette.primary.main }} />
              </IconButton> */}
                </Tooltip>
              </Stack>
            </Box>
          ) : (
            <Box my={2} className="step1">
              <Stack
                sx={{
                  display: 'flex',
                  flexFlow: 'row wrap',
                  alignItems: 'center',
                }}
                gap={2}
              >
                <StartAndEndDatePicker />
                {/* TODO: we will enable future */}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} width="100%">
                  {!isEmpty(productName) && (
                    <Autocomplete
                      size="small"
                      label="Product Name"
                      disablePortal
                      options={map(productName, (e) => {
                        return {
                          label: get(e, 'name'),
                          id: get(e, 'productId'),
                        };
                      })}
                      value={searchProduct}
                      filterOptions={filterOptions}
                      onChange={(event, newValue) => handleChangeProductId(newValue)}
                      sx={{ minWidth: 160, width: '100%' }}
                      renderInput={(params) => (
                        <TextField variant="filled" {...params} label={'Product Name'} />
                      )}
                    />
                  )}

                  <Autocomplete
                    size="small"
                    label="Type"
                    disablePortal
                    disableClearable
                    value={stockType}
                    options={optionStockTypes}
                    onChange={handleChangeStockType}
                    sx={{ minWidth: 160, width: '100%' }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Stock Type'} />
                    )}
                  />
                </Stack>
                {!isEmpty(stockReport) && (
                  <Tooltip title={'Export PDF'}>
                    <Stack>
                      <PdfDownload
                        heading={StockSummaryReportHeaders}
                        paymentRows={stockReport}
                        startDate={startDate}
                        endDate={endDate}
                        title={'StockReport'}
                        columns={StockSummaryReportTableColumns}
                        DocTitle={'Stock Report'}
                        printPdf={printPdf}
                        isUnderWeekDatesBol={isUnderWeekDatesBol}
                      />
                    </Stack>
                  </Tooltip>
                )}
                {!isEmpty(stockReport) && (
                  <Tooltip
                    title={
                      isUnderWeekDates(startDate, endDate, true) ? 'Export CSV' : 'COMING SOON'
                    }
                  >
                    <IconButton
                      disabled={!isUnderWeekDates(startDate, endDate, true)}
                      ml={1}
                      onClick={csvDownload}
                    >
                      <Icon
                        icon="grommet-icons:document-csv"
                        style={
                          isUnderWeekDates(startDate, endDate, true)
                            ? { color: theme.palette.primary.main }
                            : { opacity: 0.5, color: 'gray' }
                        }
                        width="20"
                        height="20"
                      />
                    </IconButton>
                  </Tooltip>
                )}
                {!isEmpty(stockReport) && (
                  <Tooltip title={isUnderWeekDatesBol ? 'Export EXCEL' : 'COMING SOON'}>
                    <IconButton ml={1} disabled={!isUnderWeekDatesBol} onClick={excelDownload}>
                      <Icon
                        icon="uiw:file-excel"
                        style={
                          isUnderWeekDatesBol
                            ? { color: theme.palette.primary.main }
                            : { opacity: 0.5, color: 'gray' }
                        }
                        width="20"
                        height="20"
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          )}
        </>
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
          height: 'calc(100vh - 13rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        <Box
          className="step2"
          sx={{
            height: 'calc(100vh - 13rem)',
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
            rows={map(stockReport, (e, index) => {
              return { ...e, id: index + 1 };
            })}
            rowCount={rowCount}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: size, page: page - 1 } },
            }}
            pageSizeOptions={[10, 50, 100]}
            disableRowSelectionOnClick
            onPaginationModelChange={handlePagination}
            paginationMode="server"
            localeText={{ noRowsLabel: 'No stock summary reports found' }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
            }
            autoHeight={true}
            loading={loading}
          />
        </Box>
      </Box>
      <TakeATourWithJoy config={StocksReportTourConfig} />
    </>
  );
}
