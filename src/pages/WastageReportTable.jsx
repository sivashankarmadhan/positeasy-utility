import { Icon } from '@iconify/react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Stack, TextField, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { debounce, find, get, isEmpty, isUndefined, map } from 'lodash';
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
  PURCHASE_TO_SHOP,
  StockSummarySortTable,
  USER_AGENTS,
  WastageReportTableColumns,
  WastageSummaryReportHeaders,
  hideScrollbar,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { StocksReportTourConfig } from 'src/constants/TourConstants';
import {
  currentEndDate,
  currentStartDate,
  currentStoreId,
  reportSummaryState,
  storeLogo,
  stores,
} from 'src/global/recoilState';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import { generateFilename } from 'src/helper/generateFilename';
import triggerPrint from 'src/helper/triggerPrint';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { IndFormat } from 'src/utils/formatTime';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import handleGeneratePDFReport from 'src/utils/handleGeneratePDFReport';
import handlePdfPrint from 'src/utils/handlePdfPrint';
import isUnderWeekDates from 'src/utils/isUnderWeekDates';
export default function WastageReportTable() {
  const theme = useTheme();
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

  const [stockType, setStockType] = useState({
    label: PURCHASE_TO_SHOP.PRODUCT,
    id: PURCHASE_TO_SHOP.PRODUCT,
  });
  const optionStockTypes = map(PURCHASE_TO_SHOP, (_value) => ({
    label: _value?.replace('_', ' '),
    id: _value,
  }));

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };
  const handleChangeType = debounce((e) => {
    setSearchType(e.target.innerText);
  }, 1000);
  const handleChangeProductId = (e) => {
    setSearchProductId(get(e, 'id'));
    setSearchProduct(e);
  };

  const noSortableFields = StockSummarySortTable;

  const columns = WastageReportTableColumns.map((column) => ({
    headerName: column.title,
    field: column.field,
    flex: 1,
    sortable: !noSortableFields.includes(column.field),
    minWidth: column.field === 'name' ? 180 : 140,
    renderCell: ({ value }) => {
      if (column.field === 'date') {
        console.log('value', value);

        return <Box>{value ? moment(value).format('YYYY-MM-DD') : 'No Date'}</Box>;
      }
      if (column.field === 'stockAdded') {
        console.log('valueeeeeeeee', value);
        return <Box sx={{ color: value > 0 ? 'green' : 'red' }}>{value}</Box>;
      }
      return <Box>{value}</Box>;
    },
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
    console.log('responseeee', response);
    return response?.data?.rows?.map((item) => {
      let formattedData = {
        date: get(item, 'date', ''),
        productId: get(item, 'productId', ''),
        name: get(item, 'name', ''),
        stockAdded: get(item, 'stockAdded', ''),
        wastageValue: get(item, 'wastageValue', '') || '-',
        type: get(item, 'stockType', '') || '-',
      };
      return formattedData;
    });
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
        startDateD: IndFormat({ startDate }),
        endDateD: IndFormat({ endDate }),
        size,
        page,
        productId: searchProductId,
        storeName: storeName,
        ...(get(stockType, 'id') ? {stockType: get(stockType, 'id')} : {}),
      };
      const response = await PRODUCTS_API.getWastage(options);
      console.log('responseeee', response);
      if (response) {
        const formatted = formatResponse(get(response, 'data', []));

        console.log('formattedddd', formatted);
        setStockReport(formatted || []);
        setRowCount(get(response, 'data.totalItems', []));
      }
    } catch (e) {
      console.log('errrrr', e);
    }
  };
  const printPdf = async () => {
    setIsLoading(true);
    if (!startDate && !endDate) return;
    try {
      const currentPage = 1;
      const options = {
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        storeName: storeName,
        size: rowCount,
        page: currentPage,
        productId: searchProductId,
        ...(get(stockType, 'id') ? {stockType: get(stockType, 'id')} : {}),
      };
      const pdfResponse = await PRODUCTS_API.wastagePdf(options);
      if (!isEmpty(get(pdfResponse, 'data', []))) {
        const props = {
          heading: WastageSummaryReportHeaders,
          paymentRows: formatResponse(get(pdfResponse, 'data', [])),
          startDate: IndFormat({ startDate }),
          endDate: moment(IndFormat({ endDate })).subtract(1, 'd'),
          title: 'WastageReport',
          docTitle: 'Wastage Report',
          columns: WastageReportTableColumns,
          logo: logo,
        };

        if (isAndroid || isAndroidRawPrint) {
          const generatedReport = await handleGeneratePDFReport(props);
          handlePdfPrint({ data: generatedReport });
        } else {
          triggerPrint(props);
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
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
    if (currentStore) {
      getProductName();
    }
  }, [currentStore]);

  const pdfDownload = async () => {
    setIsLoading(true);
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
      ...(get(stockType, 'id') ? {stockType: get(stockType, 'id')} : {}),
        storeName: storeName,
        productId: searchProductId,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
         const url = `${API}/api/v1/POS/merchant/getwastage-pdf${query}`;
        const filename = generateFilename('Wastage_Report');
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
        await PRODUCTS_API.wastagePdf(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const csvDownload = async () => {
    setIsLoading(true);
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(get(stockType, 'id') ? {stockType: get(stockType, 'id')} : {}),
        storeName: storeName,
        productId: searchProductId,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/wastage-csv${query}`;
        const filename = generateFilename('Wastage_Report');
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
        await PRODUCTS_API.wastageExpensesAsCsv(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStockType = (e, newValue) => {
    setStockType(newValue);
  };
  const excelDownload = async () => {
    setIsLoading(true);
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(get(stockType, 'id') ? {stockType: get(stockType, 'id')} : {}),
        storeName: storeName,
        productId: searchProductId,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/wastage-xlsx${query}`;
        const filename = generateFilename('Wastage_Report');
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
        await PRODUCTS_API.wastageExpensesAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isUnderWeekDatesBol = isUnderWeekDates(startDate, endDate, true);

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
                <StartAndEndDatePicker />*{' '}
                {productName && (
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
                    onChange={(event, newValue) => handleChangeProductId(newValue)}
                    sx={{ minWidth: 160 }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Product Name'} />
                    )}
                  />
                )}
                <Autocomplete
                  size="small"
                  label="Type"
                  disablePortal
                  options={optionStockTypes}
                  value={stockType}
                  onChange={handleChangeStockType}
                  sx={{ minWidth: 160 }}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Stock Type'} />
                  )}
                />
                {!isEmpty(stockReport) && (
                  <Tooltip title={isUnderWeekDatesBol ? 'Export PDF' : 'COMING SOON'}>
                    <Stack>
                      <PdfDownload
                        heading={WastageSummaryReportHeaders}
                        paymentRows={stockReport}
                        startDate={startDate}
                        endDate={endDate}
                        title={'WastageReport'}
                        columns={WastageReportTableColumns}
                        DocTitle={'Wastage Report'}
                        printPdf={pdfDownload}
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
                      ml={1}
                      onClick={csvDownload}
                      disabled={!isUnderWeekDates(startDate, endDate, true)}
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
                    <IconButton ml={1} onClick={excelDownload} disabled={!isUnderWeekDatesBol}>
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
                {/* <Tooltip title="Export csv">
                  <IconButton ml={1} onClick={csvDownload}>
                    <DownloadIcon sx={{ color: theme.palette.primary.main }} />
                  </IconButton>
                </Tooltip> */}
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
                {!isEmpty(stockReport) && (
                  <Tooltip title={isUnderWeekDatesBol ? 'Export PDF' : 'COMING SOON'}>
                    <Stack>
                      <PdfDownload
                        heading={WastageSummaryReportHeaders}
                        paymentRows={stockReport}
                        startDate={startDate}
                        endDate={endDate}
                        title={'WastageReport'}
                        columns={WastageReportTableColumns}
                        DocTitle={'Wastage Report'}
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
                    <IconButton disabled={!isUnderWeekDatesBol} ml={1} onClick={excelDownload}>
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
                {/* <Tooltip title="Export csv">
                  <IconButton ml={1} onClick={csvDownload}>
                    <DownloadIcon sx={{ color: theme.palette.primary.main }} />
                  </IconButton>
                </Tooltip> */}
                <Stack direction="row" gap={1}>
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
                      onChange={(event, newValue) => handleChangeProductId(newValue)}
                      sx={{ minWidth: 160 }}
                      renderInput={(params) => (
                        <TextField variant="filled" {...params} label={'Product Name'} />
                      )}
                    />
                  )}

                  <Autocomplete
                    size="small"
                    label="Type"
                    disablePortal
                    options={optionStockTypes}
                    value={stockType}
                    onChange={handleChangeStockType}
                    sx={{ minWidth: 160 }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Type'} />
                    )}
                  />
                </Stack>
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
            componentsProps={{
              filterPanel: { sx: { maxWidth: '90vw' } },
            }}
          />
        </Box>
      </Box>
      <TakeATourWithJoy config={StocksReportTourConfig} />
    </>
  );
}
