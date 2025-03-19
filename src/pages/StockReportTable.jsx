import {
  Box,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
} from '@mui/material';

import { useResponsive } from '@poriyaalar/custom-hooks';

import Autocomplete from '@mui/material/Autocomplete';

import { find, get, isEmpty, isUndefined, map, forEach, reduce } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';

import PdfDownload from 'src/PrintPdf/PdfDownload';
import StartAndEndDatePicker from 'src/components/DateRangePickerRsuite';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  StockTableColumns,
  StockSortTable,
  StockTableHeaders,
  ALL_CONSTANT,
  USER_AGENTS,
  hideScrollbar,
  PURCHASE_TO_SHOP,
  RawMaterials,
} from 'src/constants/AppConstants';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { StocksReportTourConfig } from 'src/constants/TourConstants';

import { getCurrentDate } from 'src/helper/FormatTime';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import PRODUCTS_API from 'src/services/products';
import triggerPrint from 'src/helper/triggerPrint';

import { fDates, fDatesWithTimeStampWithDayjs, fDatesWithTimeStampFromUtc, IndFormat } from 'src/utils/formatTime';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';
import { ErrorConstants } from 'src/constants/ErrorConstants';

import DownloadIcon from '@mui/icons-material/Download';
import {
  currentEndDate,
  currentStartDate,
  currentStoreId,
  reportSummaryState,
  storeLogo,
  stores,
} from 'src/global/recoilState';
import handleGeneratePDFReport from 'src/utils/handleGeneratePDFReport';
import handlePdfPrint from 'src/utils/handlePdfPrint';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import moment from 'moment';
import { Icon } from '@iconify/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { allConfiguration } from 'src/global/recoilState';
import isUnderWeekDates from 'src/utils/isUnderWeekDates';
import { InfoIcon } from 'src/theme/overrides/CustomIcons';
import { AccessTime, PersonPinCircleOutlined, PersonPinCircleRounded } from '@mui/icons-material';

export default function StockReportTable() {
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
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const [stockType, setStockType] = useState({
    label: PURCHASE_TO_SHOP.PRODUCT,
    id: PURCHASE_TO_SHOP.PRODUCT,
  });
  const optionStockTypes = map(PURCHASE_TO_SHOP, (_value) => ({
    label: _value?.replace('_', ' '),
    id: _value,
  }));

  const handleChangeType = (e) => {
    setSearchType(e.target.innerText);
  };

  const handleChangeStockType = (e, newValue) => {
    setStockType(newValue);
  };

  useEffect(() => {
    setSearchProductId('');
    setSearchProduct({ label: '', id: '' });
    setSearchType('');
  }, [stockType]);

  const handleChangeProductId = (e) => {
    setSearchProductId(get(e, 'id'));
    setSearchProduct(e);
  };

  const noSortableFields = StockSortTable;
  let updatedColumns = [...StockTableColumns];
  if (stockType?.id === RawMaterials.RAW_MATERIALS) {
    updatedColumns.push(
      { title: 'Total Average Value', field: 'rawValue' },
      { title: 'Identifiers', field: 'identifiers' }
    );
  }

  const columns = updatedColumns.map((column) => ({
    headerName: column.title,
    field: column.field,
    flex: 1,
    sortable: !noSortableFields.includes(column.field),
    minWidth:
      column.field === 'newStockQuantity' ||
      column.field === 'additionalInfo' ||
      column.field === 'stockAdded' ||
      column.field === 'date'
        ? 180
        : 140,
    ...(column.field === 'date' && {
      valueFormatter: ({ value }) => fDatesWithTimeStampFromUtc(value),
    }),
    ...(column.field === 'rawValue' && { valueFormatter: ({ value }) => value || '0' }),

    ...(column.field === 'unitAverageValue' && { valueFormatter: ({ value }) => value || '0' }),
    ...(column.field === 'orderId' && { valueFormatter: ({ value }) => value || '-' }),
    ...(column.field === 'stockAdded' && {
      renderCell: ({ value }) => (
        <Box sx={{ color: value > 0 ? 'green' : 'red' }}>
          {value > 0
            ? `${value === 1 ? `${value} unit` : `${value} units`} added`
            : `${value === -1 ? `${Math.abs(value)} unit` : `${Math.abs(value)} units`} sold`}
        </Box>
      ),
    }),
    ...(column.field === 'additionalInfo' && {
      renderCell: (params) =>
        params.value === 'SOLDOUT' || params.value === 'BILL DELETED' ? (
          <Chip
            size="small"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': {
                borderRadius: '4px',
                background: params.value ? '#ed4337' : 'transparent',
                color: params.value ? '#fff' : '#000',
              },
            }}
            label={params.value}
          />
        ) : (
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{params.value}</Typography>
        ),
    }),
    ...(column.field === 'newStockQuantity' && {
      valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
    }),
    headerClassName: 'super-app-theme--header',

    ...(column.field === 'identifiers' && {
      renderCell: (params) => {
        const [open, setOpen] = useState(false);
        const handleOpen = () => setOpen(true);
        const handleClose = () => setOpen(false);
        const identifiers = params?.value;

        return (
          <>
            <Tooltip title="View Assignment">
              <IconButton
                onClick={handleOpen}
                size="small"
                disabled={!identifiers}
                sx={{ color: identifiers ? '#5A0B45' : 'gray' }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose}>
              <DialogContent>
                <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography sx={{ fontWeight: 'bold', textAlign: 'center', p: 1 }}>
                    Identifiers
                  </Typography>
                  <IconButton
                    sx={{ color: theme.palette.main, height: 40 }}
                    onClick={() => handleClose()}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
                {/* <Typography variant="body2">Identifiers</Typography> */}
                <Stack
                  sx={{
                    p: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AccessTime sx={{ color: '#757575' }} />
                    <Typography variant="body2">
                      <strong>Time:</strong>{' '}
                      {params?.formattedValue?.time
                        ? fDatesWithTimeStampWithDayjs(params?.formattedValue?.time)
                        : 'N/A'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonPinCircleOutlined sx={{ color: '#757575' }} />
                    <Typography variant="body2">
                      <strong>Assign By:</strong> {params?.formattedValue?.assignBy || 'N/A'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonPinCircleOutlined sx={{ color: '#757575' }} />
                    <Typography variant="body2">
                      <strong>Assign To:</strong> {params?.formattedValue?.assignTo || 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </DialogContent>
            </Dialog>
          </>
        );
      },
    }),

    headerClassName: 'super-app-theme--header',

    ...((column.field === 'orderId' || column.field === 'newStockQuantity') && {
      type: 'number',
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

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getStockReports = async () => {
    if (isUndefined(currentStore) || currentStore === 'undefined') return;
    try {
      const options = {
        startDateD: IndFormat({ startDate }, isTimeQuery),
        endDateD: IndFormat({ endDate }, isTimeQuery),
        size,
        page,
        productId: searchProductId,
        type: searchType,
        stockType: get(stockType, 'id'),
        storeName: storeName,
      };
      setLoading(true);
      const response = await PRODUCTS_API.getStockReport(options);
      setLoading(false);
      if (response) {
        setStockReport(get(response, 'data.data', []));
        setRowCount(get(response, 'data.totalItems', []));
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentStore) getStockReports();
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
  }, [currentStore, searchProduct]);

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
        ...(searchType ? { type: searchType } : {}),
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
        const url = `${API}/api/v1/POS/merchant/report/stocks-csv${query}`;
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
        await PRODUCTS_API.exportStocksAsCsv(options);
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
        ...(searchProductId ? { productId: searchProductId } : {}),
        ...(searchType ? { type: searchType } : {}),
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
        const url = `${API}/api/v1/POS/merchant/report/stocks-csv${query}`;
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
        await PRODUCTS_API.exportStocksAsPdf(options);
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
        ...(searchProductId ? { productId: searchProductId } : {}),
        ...(searchType ? { type: searchType } : {}),
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
        const url = `${API}/api/v1/POS/merchant/report/stocks-xlsx${query}`;
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
        await PRODUCTS_API.exportStocksAsExcel(options);
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

  const isUnderWeekDatesBol = isUnderWeekDates(startDate, endDate, true);

  if (isLoading) return <LoadingScreen />;
  return (
    <>
      {reportSummary && (
        <>
          {!isMobile ? (
            <Box xs display="flex" alignItems="center">
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
                  <Autocomplete
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
                  />
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

                  {/* {!isEmpty(stockReport) && ( */}
                  <Tooltip title={'Export PDF'}>
                    <Stack>
                      <PdfDownload
                        heading={StockTableHeaders}
                        paymentRows={stockReport}
                        startDate={startDate}
                        endDate={endDate}
                        title={'StockReport'}
                        columns={StockTableColumns}
                        DocTitle={'Stock Report'}
                        printPdf={pdfDownload}
                        isUnderWeekDatesBol={isUnderWeekDatesBol}
                      />
                    </Stack>
                  </Tooltip>
                  {/* )} */}
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
                </Stack>
              </Box>
            </Box>
          ) : (
            <Box my={2} className="step1">
              <Stack
                sx={{
                  display: 'flex',
                  flexFlow: 'row wrap',
                  alignItems: 'center',
                  gap: 2,
                  '@media (max-width: 600px)': {
                    flexFlow: 'column nowrap',
                    alignItems: 'flex-start',
                  },
                }}
              >
                <StartAndEndDatePicker />

                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} width="100%">
                  {!isEmpty(productName) && (
                    <Autocomplete
                      size="small"
                      label="Product Name"
                      disablePortal
                      options={map(productName, (e) => ({
                        label: get(e, 'name'),
                        id: get(e, 'productId'),
                      }))}
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
                    value={searchType}
                    disablePortal
                    options={optionTypes}
                    onChange={handleChangeType}
                    sx={{ minWidth: 160 }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Type'} />
                    )}
                  />

                  <Autocomplete
                    size="small"
                    label="Stock Type"
                    disablePortal
                    options={optionStockTypes}
                    onChange={handleChangeStockType}
                    sx={{ minWidth: 160, width: '100%' }}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Stock Type'} />
                    )}
                  />
                </Stack>

                {!isEmpty(stockReport) && (
                  <Stack direction="row" gap={1} mt={2}>
                    <Tooltip title={'Export PDF'}>
                      <IconButton onClick={pdfDownload}>
                        <Icon
                          icon="mdi:file-pdf"
                          style={{ color: theme.palette.primary.main }}
                          width="20"
                          height="20"
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        isUnderWeekDates(startDate, endDate, true) ? 'Export CSV' : 'COMING SOON'
                      }
                    >
                      <IconButton
                        disabled={!isUnderWeekDates(startDate, endDate, true)}
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
                    <Tooltip title={isUnderWeekDatesBol ? 'Export EXCEL' : 'COMING SOON'}>
                      <IconButton onClick={excelDownload} disabled={!isUnderWeekDatesBol}>
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
                  </Stack>
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
              console.log('eee', e);
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
            localeText={{ noRowsLabel: 'No stock  reports found' }}
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
