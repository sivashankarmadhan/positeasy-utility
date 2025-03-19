import { Box, Chip, IconButton, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { find, get, isEmpty, map, reduce } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
// import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment';
import toast from 'react-hot-toast';
import { useRecoilState } from 'recoil';
import EndShiftSplitUpDialog from 'src/components/EndShiftSplitUpDialog';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  ALL_CONSTANT,
  EndShiftSortTable,
  EndShiftTableColumns,
  hideScrollbar,
  ShiftsTableColumns,
  ShiftTableHeaders,
  USER_AGENTS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import {
  currentEndDate,
  currentStartDate,
  currentStoreId,
  currentTerminalId,
  reportSummaryState,
  storeLogo,
  stores,
} from 'src/global/recoilState';
import { generateFilename } from 'src/helper/generateFilename';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import triggerPrint from 'src/helper/triggerPrint';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import { dateWithTimeAndSecFormatAMPM, IndFormat } from 'src/utils/formatTime';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';
import FilterComponent from './FilterComponent';
import { allConfiguration } from 'src/global/recoilState';
import ViewSoldSummaryDialog from 'src/components/ViewSoldSummaryDialog';
import { Icon } from '@iconify/react';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { toFixedIfNecessary } from 'src/utils/formatNumber';

export default function EndShiftReportTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [endShiftReport, setEndShiftReport] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const isDesktop = useMediaQuery('(min-width:1419px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  const startDate = useRecoilValue(currentStartDate);
  const endDate = useRecoilValue(currentEndDate);
  const storesData = useRecoilValue(stores);
  const selectedTerminal = useRecoilValue(currentTerminalId);
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const logo = useRecoilValue(storeLogo);
  const [currentRowId, setCurrentRowId] = useState('');
  const [open, setOpen] = useState(false);
  const [openViewSoldSummary, setOpenViewSoldSummary] = useState(false);

  const isSinglePage = size >= rowCount;
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  const handleOpen = (e) => {
    setCurrentRowId(e);
    setOpen(true);
  };

  const handleOpenSoldSummary = (e) => {
    setCurrentRowId(e);
    setOpenViewSoldSummary(true);
  };

  const handleClose = () => {
    setCurrentRowId('');
    setOpen(false);
  };

  const handleCloseSoldSummary = () => {
    setCurrentRowId('');
    setOpenViewSoldSummary(false);
  };

  const noSortableFields = EndShiftSortTable;

  const columns = [
    ...EndShiftTableColumns.map((column) => ({
      headerName: column.title,
      field: column.field,
      flex: 1,
      sortable: !noSortableFields.includes(column.field),
      minWidth:
        column.field === 'terminalNumber' ||
        column.field === 'totalAmount' ||
        column.field === 'totalShiftPayment' ||
        column.field === 'staffName'
          ? 210
          : column.field === 'date' ||
            column.field === 'cash' ||
            column.field === 'card' ||
            column.field === 'upi' ||
            column.field === 'shiftExpense' ||
            column.field === 'saleToday'
          ? 200
          : 140,
      ...(column.field === 'date' && {
        valueFormatter: ({ value }) =>
          value ? moment(value, 'DD/MM/YYYY')?.format('DD-MM-YYYY') : '-',
      }),
      ...(column.field === 'staffName' && {
        valueFormatter: ({ value }) => value || '-',
      }),
      ...(column.field === 'date' && {
        renderCell: (data) => {
          return <Box>{dateWithTimeAndSecFormatAMPM(get(data, 'row.createdAt'))}</Box>;
        },
      }),
      ...(column.field === 'orderId' && { valueFormatter: ({ value }) => value || '-' }),
      ...(column.field === 'cash' && {
        valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
      }),
      ...(column.field === 'card' && {
        valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
      }),
      ...(column.field === 'upi' && {
        valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
      }),
      ...(column.field === 'shiftExpense' && {
        valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
      }),
      ...(column.field === 'totalAmount' && {
        valueFormatter: ({ value }) =>
          formatAmountToIndianCurrency(toFixedIfNecessary(Number(value), 2)),
      }),
      ...(column.field === 'totalShiftPayment' && {
        valueFormatter: ({ value }) =>
          formatAmountToIndianCurrency(toFixedIfNecessary(Number(value), 2)),
      }),
      ...(column.field === 'difference' && {
        renderCell: ({ value }) => (
          <Box sx={{ color: value > 0 ? 'green' : 'red' }}>
            {toFixedIfNecessary(Number(value), 2)}
          </Box>
        ),
      }),
      headerClassName: 'super-app-theme--header',
    })),
    {
      headerName: '',
      headerClassName: 'super-app-theme--header',
      field: 'details1',
      width: 120,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params, sdsdds) => (
        <>
          <Chip
            size="small"
            onClick={() => {
              console.log('params', params, sdsdds);
              handleOpen(get(params, 'row.id'));
            }}
            variant="outlined"
            color="info"
            label="View SplitUp"
            sx={{ cursor: 'pointer' }}
          />
        </>
      ),
    },
    {
      headerName: '',
      headerClassName: 'super-app-theme--header',
      field: 'details2',
      width: 170,
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <>
          <Tooltip title="View sold summary">
            <IconButton
              disabled={isEmpty(params?.row?.soldSummary)}
              onClick={(event) => {
                handleOpenSoldSummary(get(params, 'row.id'));
              }}
            >
              <SummarizeIcon size={30} />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];
  const printPdf = async () => {
    try {
      const currentPage = 1;
      const findData = find(storesData, (_item) => {
        return (
          get(_item, 'storeId') === currentStore && get(_item, 'terminalId') === selectedTerminal
        );
      });

      const options = {
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        size: rowCount,
        page: currentPage,
        ...(get(findData, 'terminalNumber')
          ? { terminalNumber: get(findData, 'terminalNumber') }
          : {}),
      };

      let response = await PRODUCTS_API.getEndShiftReports(options);

      if (!isEmpty(get(response, 'data.data', []))) {
        const props = {
          heading: ShiftTableHeaders,
          paymentRows: get(response, 'data.data', []),
          startDate: IndFormat({ startDate }),
          endDate: IndFormat({ endDate }),
          title: 'CounterReport',
          docTitle: 'Counter Report',
          columns: ShiftsTableColumns,
          logo: logo,
        };
        triggerPrint(props);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getEndShiftReports = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;

    try {
      const findData = find(storesData, (_item) => {
        return (
          get(_item, 'storeId') === currentStore && get(_item, 'terminalId') === selectedTerminal
        );
      });

      const options = {
        startDate: IndFormat({ startDate }, isTimeQuery),
        endDate: IndFormat({ endDate }, isTimeQuery),
        size,
        page,
        ...(get(findData, 'terminalNumber')
          ? { terminalNumber: get(findData, 'terminalNumber') }
          : {}),
        storeName: storeName,
      };
      setLoading(true);

      let response = await PRODUCTS_API.getEndShiftReports(options);
      setLoading(false);

      if (response) {
        const formatEndShiftReportData = map(get(response, 'data.data', []), (_item) => {
          const totalShiftPayment = reduce(
            get(_item, 'saleSplitUp'),
            (accumulator, currentValue) => accumulator + get(currentValue, 'amount'),
            0
          );
          return {
            ..._item,
            totalShiftPayment,
          };
        });

        setEndShiftReport(formatEndShiftReportData);
        setRowCount(get(response, 'data.totalItems', []));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStore) getEndShiftReports();
  }, [startDate, endDate, currentStore, currentTerminal, page, size]);

  const selectedEndShiftReport = find(endShiftReport, (_item) => get(_item, 'id') === currentRowId);

  const pdfDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/shift-wise-pdf${query}`;
        const filename = generateFilename('Shift_wise_Report');
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
        await PRODUCTS_API.exportShiftWiseAsPdf(options);
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/shift-wise-xlsx${query}&filename-shift-wise-report.xlsx`;
        const filename = generateFilename('Shift_wise_Report');
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
        await PRODUCTS_API.exportShiftWiseAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/shift-wise-csv${query}&filename-shift-wise-report.csv`;
        const filename = generateFilename('Shift_wise_Report');
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
        await PRODUCTS_API.exportShiftWiseAsCsv(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
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
            <Stack
              sx={{
                display: 'flex',
                flexFlow: 'row wrap-reverse',
                alignItems: 'center',
              }}
              gap={1}
            >
              <FilterComponent
                startDate={startDate}
                endDate={endDate}
                filterTable={endShiftReport}
                printPdf={pdfDownload}
                excelDownload={excelDownload}
                csvDownload={csvDownload}
                isDisabledCustomCodeAndCustomer
              />
            </Stack>
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
          height: 'calc(100vh - 10rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        <Box
          className="step2"
          sx={{
            height: 'calc(100vh - 10rem)',
            // height: isDesktop ? 650 : 450,
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
            rows={endShiftReport}
            rowCount={rowCount}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: size, page: page - 1 } },
            }}
            pageSizeOptions={[10, 50, 100]}
            disableRowSelectionOnClick
            onPaginationModelChange={handlePagination}
            paginationMode="server"
            localeText={{ noRowsLabel: 'No end shift reports found' }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
            }
            autoHeight={true}
            loading={loading}
          />

          {currentRowId && !isEmpty(endShiftReport) && (
            <EndShiftSplitUpDialog
              open={open}
              handleOpen={handleOpen}
              handleClose={handleClose}
              selectedEndShiftReport={selectedEndShiftReport}
            />
          )}

          {currentRowId && !isEmpty(endShiftReport) && (
            <ViewSoldSummaryDialog
              isOpen={openViewSoldSummary}
              onClose={handleCloseSoldSummary}
              data={find(endShiftReport, (_item) => get(_item, 'id') === currentRowId)}
            />
          )}
        </Box>
      </Box>
      {/* <TakeATourWithJoy config={StocksReportTourConfig} /> */}
    </>
  );
}
