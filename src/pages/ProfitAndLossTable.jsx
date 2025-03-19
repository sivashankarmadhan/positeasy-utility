import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  useTheme,
  Chip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import * as React from 'react';
import { forEach, get, isEmpty, map, find, reduce } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import StartAndEndDatePicker from 'src/components/DateRangePickerRsuite';
import PdfDownload from 'src/PrintPdf/PdfDownload';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard1';
import {
  ProfitAndLossTableColumns,
  ProfitAndLossSortTable,
  ProfitTableHeaders,
} from 'src/constants/AppConstants';
import {
  currentStoreId,
  currentTerminalId,
  customCodeList,
  customerList,
  storeLogo,
  stores,
} from 'src/global/recoilState';
import { toFixedIfNecessary} from 'src/utils/formatNumber';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { getCurrentDate } from 'src/helper/FormatTime';
import BookingServices from 'src/services/API/BookingServices';
import OrderTableRow from '../components/OrderTableRow';
import { CustomCodeMode, CustomerCodeMode } from 'src/global/SettingsState';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import { orderReportTourConfig } from 'src/constants/TourConstants';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import DrawerTransaction from 'src/components/DrawerTransactionOrder';
import { fCurrency } from 'src/utils/formatNumber';
import ExtensionIcon from '@mui/icons-material/Extension';
import DropDown from 'src/components/cart/DropDown';
import FilterComponent from './FilterComponent';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import { slice } from 'lodash';
import triggerPrint from 'src/helper/triggerPrint';
import HtmlTooltip from 'src/components/HtmlTooltip';
import PRODUCTS_API from 'src/services/products';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';
import { currentEndDate, currentStartDate, reportSummaryState } from 'src/global/recoilState';
import { IndFormat } from 'src/utils/formatTime';
import statusColor from 'src/utils/statusColor';
import moment from 'moment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
import { allConfiguration } from 'src/global/recoilState';

export default function ProfitAndLossTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const [filterTable, setFilterTable] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const isCustomCodeEnabled = useRecoilValue(CustomCodeMode);
  const isCustomerIdEnabled = useRecoilValue(CustomerCodeMode);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [customCode, setCustomCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [currentRowId, setCurrentRowId] = useState('');
  const [currentCustomCode, setCurrentCustomCode] = useState({ label: '', id: '' });
  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', Id: '' });
  const [top3ProfitProducts, setTop3ProfitProducts] = useState({});
  const customCodes = useRecoilValue(customCodeList);
  const customerCodes = useRecoilValue(customerList);
  const [open, setOpen] = useState(false);
  const logo = useRecoilValue(storeLogo);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const isSinglePage = size >= rowCount;
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = (e) => {
    setCurrentRowId(e);
    setOpen(true);
  };
  const handleClose = () => {
    setCurrentRowId('');
    setOpen(false);
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

  const getProfitAndLossReports = async () => {
    try {
      const options = {
        startDateD: IndFormat({ startDate },isTimeQuery),
        endDateD: IndFormat({ endDate },isTimeQuery),
        customCode,
        customerId,
        size,
        page,
        storeName: storeName,
      };
      setLoading(true);
      const serverResponse = await BookingServices.getProfitAndLossReportOfRA(options);
      setLoading(false);
      setFilterTable(get(serverResponse, 'data.data', []));
      setRowCount(get(serverResponse, 'data.totalItems', 0));
      setTop3ProfitProducts(get(serverResponse, 'data.topThreeProduct', []));
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  const getPercData = (serverResponse, type) => {
    let parcelData = 0;
    let totalAmount = convertToRupee(get(serverResponse, 'data.totalAmount', 0));
    forEach(get(serverResponse, 'data.splitData', []), (_res) => {
      if (get(_res, 'orderType') === type) {
        parcelData += convertToRupee(get(_res, 'orderAmount', 0)) / totalAmount;
      }
    });
    return Number((parcelData * 100).toFixed(1));
  };
  useEffect(() => {
    getProfitAndLossReports();
  }, [startDate, endDate, currentStore, currentTerminal, customCode, customerId, page, size]);

  const noSortableFields = ProfitAndLossSortTable;

  const noMenuOptionFields = ['orderId'];

  const columns = ProfitAndLossTableColumns.map((column) => {
    const minWidthData =
      column.field === 'name' || column.field === 'category' || column.field === 'profit'
        ? 200
        : column.field === 'productId' ||
          column.field === 'quantity' ||
          column.field === 'price' ||
          column.field === 'basePrice' ||
          column.field === 'totalPrice' ||
          column.field === 'totalBasePrice'
        ? 110
        : 100;
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      sortable: !noSortableFields.includes(column.field),
      disableColumnMenu: noMenuOptionFields.includes(column.field),
      headerClassName: 'super-app-theme--header',
      ...(column.field === 'price' ||
      column.field === 'total' ||
      column.field === 'quantity' ||
      column.field === 'basePrice' ||
      column.field === 'totalPrice' ||
      column.field === 'totalBasePrice' ||
      column.field === 'profit'
        ? { type: 'number' }
        : {}),
      ...(column.field === 'orderStatus' && {
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
      ...(column.field === 'name' && {
        renderCell: (params) => (
          <Stack spacing={1} direction="row" justifyItems={'center'}>
            <Typography>
              {params.value}
              {params.row.unit === 'unit' && (
                <Typography sx={{ display: 'inline' }} variant="caption">
                  {` (${params.row.unit}${params.row.unitName})`}
                </Typography>
              )}
            </Typography>
            <HtmlTooltip
              title={
                <React.Fragment>
                  <Typography color="inherit" fontWeight={'bold'}>
                    Add-ons
                  </Typography>
                  {!isEmpty(params.row.addOns) &&
                    map(params.row.addOns, (e) => {
                      return (
                        <Typography sx={{ fontSize: '10px' }}>
                          x{e.quantity} {e.name} {fCurrency(convertToRupee(e.price) * e.quantity)}
                        </Typography>
                      );
                    })}
                </React.Fragment>
              }
            >
              <ExtensionIcon
                sx={{
                  color: !isEmpty(params.row.addOns)
                    ? theme.palette.success.dark
                    : theme.palette.grey[500],
                  fontSize: '20px',
                  visibility: !isEmpty(params.row.addOns) ? 'visible' : 'hidden',
                }}
              />
            </HtmlTooltip>
          </Stack>
        ),
      }),
    };
  });

  const columnsD = [
    ...columns,
    // {
    //   headerName: '',
    //   headerClassName: 'super-app-theme--header',
    //   field: 'details',
    //   width: 120,
    //   filterable: false,
    //   sortable: false,
    //   disableColumnMenu: true,
    //   renderCell: (params) => (
    //     <>
    //       <Chip
    //         size="small"
    //         onClick={() => handleOpen(get(params, 'id'))}
    //         variant="outlined"
    //         color="info"
    //         label="View Details"
    //         sx={{ cursor: 'pointer' }}
    //       />
    //     </>
    //   ),
    // },
  ];

  const rows =
    !isEmpty(filterTable) &&
    map(
      filterTable,
      ({
        orderId,
        productId,
        name,
        totalPrice,
        basePrice,
        totalBasePrice,
        addOns,
        profit,
        quantity,
        price,
      }) => ({
        id: productId,
        productId,
        basePrice: basePrice ? formatAmountToIndianCurrency(basePrice) : 0,
        totalPrice: `${toFixedIfNecessary(totalPrice || 0, 2) }`,
        totalBasePrice:`${toFixedIfNecessary(formatAmountToIndianCurrency(totalBasePrice || 0), 2) }` ,
        profit: basePrice > 0 ? formatAmountToIndianCurrency(profit) : '⚠️Base price not added',
        name,
        addOns,
        quantity,
        price: formatAmountToIndianCurrency(price),
      })
    );
    

  const removeNull = (filterTable) => {
    map(filterTable, (item) => {
      if (item.basePrice === null) {
        item.basePrice = 0;
      }
    });
    return filterTable;
  };

  const chartData = map(top3ProfitProducts, (row) => {
    return { label: get(row, 'name') || '', value: get(row, 'profit') || 0 };
  });

  const sum = reduce(
    chartData,
    function (previousValue, current) {
      return previousValue + (get(current, 'value') === '--' ? 0 : get(current, 'value'));
    },
    0
  );

  const printPdf = async () => {
    try {
      const currentPage = 1;
      const options = {
        startDateD: IndFormat({ startDate }),
        endDateD: IndFormat({ endDate }),
        customCode,
        customerId,
        size: rowCount,
        page: currentPage,
        storeName: storeName,
      };

      const pdfResponse = await BookingServices.getProfitAndLossReportOfRA(options);
      if (!isEmpty(get(pdfResponse, 'data.data', []))) {
        const props = {
          heading: ProfitTableHeaders,
          paymentRows: get(pdfResponse, 'data.data', []),
          startDate: IndFormat({ startDate }),
          endDate: moment(IndFormat({ endDate })).subtract(1, 'd'),
          title: 'ProfitAndLoss',
          docTitle: 'Profit and Loss',
          columns: ProfitAndLossTableColumns,
          logo: logo,
        };
        triggerPrint(props);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const csvDownload = async () => {
    try {
      setIsLoading(true);
      const dateDetails = {
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        storeName: storeName,
      };

      await PRODUCTS_API.exportProfitLossAsCsv(dateDetails);
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };

  const pdfDownload = async () => {
    try {
      setIsLoading(true);
      const dateDetails = {
        storeName: storeName,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
      };
      await PRODUCTS_API.exportProfitLossAsPdf(dateDetails);
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_PDF);
    } finally {
      setIsLoading(false);
    }
  };

  const excelDownload = async () => {
    try {
      setIsLoading(true);
      const dateDetails = {
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        storeName: storeName,
      };

      await PRODUCTS_API.exportProfitLossAsExcel(dateDetails);
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
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
          <Box my={2} mt={6} className="step1">
            <FilterComponent
              handleCustomCode={handleCustomCode}
              handleCustomerId={handleCustomerId}
              currentCustomCode={currentCustomCode}
              currentCustomerId={currentCustomerId}
              filterTable={removeNull(filterTable)}
              title="Profit Report"
              docTitle="Profit Report"
              headers={ProfitTableHeaders}
              columns={ProfitAndLossTableColumns}
              printPdf={pdfDownload}
              csvDownload={csvDownload}
              excelDownload={excelDownload}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
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
      {loading ? (
        <ReportCardSkeletonLoader />
      ) : (
        <ReportAndAnalyticsCard
          total={sum}
          titleDcard1={'Best Profit product'}
          titleDcard2={'Collected amount(Best Profit)(₹)'}
          subtitle1card2D={get(top3ProfitProducts, '0.name', '--')}
          subtitleDcard2={toFixedIfNecessary(formatAmountToIndianCurrency(get(top3ProfitProducts, '0.profit', 0)),2)}
          subtitle1card3D={'Best Profits'}
          chartTitle={'Top 3 Profit products'}
          chartData={chartData}
        />
      )}

      <Box
        sx={{
          height: 300,
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
          localeText={{ noRowsLabel: 'No order  reports found' }}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
          }
          autoHeight={true}
          loading={loading}
        />
      </Box>

      {currentRowId && !isEmpty(filterTable) && (
        <DrawerTransaction
          handleOpen={handleOpen}
          open={open}
          handleClose={handleClose}
          row={find(filterTable, (d) => d.productId === currentRowId)}
        />
      )}
      <TakeATourWithJoy config={orderReportTourConfig} />
    </>
  );
}
