import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, useTheme } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { get, isEmpty, map, orderBy, reduce, find } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import uuid from 'react-uuid';
import { useRecoilState, useRecoilValue } from 'recoil';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard1';
import {
  ALL_CONSTANT,
  TerminalsTableColumns,
  TerminalsTableHeaders,
  USER_AGENTS,
  hideScrollbar,
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
import StyledDataGrid from 'src/helper/StyledDataGrid';
import { generateFilename } from 'src/helper/generateFilename';
import triggerPrint from 'src/helper/triggerPrint';
import BookingServices from 'src/services/API/BookingServices';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { IndFormat } from 'src/utils/formatTime';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import FilterComponent from './FilterComponent';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
import { allConfiguration } from 'src/global/recoilState';

export default function TerminalsTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const { isMobile } = useResponsive();

  const [filterTable, setFilterTable] = useState([]);
  const [pdfTable, setPdfTable] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [size, setSize] = useState(20);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);

  const [counterList, setCounterList] = useState([]);
  const logo = useRecoilValue(storeLogo);
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const [counter, setCounter] = useState([]);
  const [total, setTotal] = useState(0);
  const [bestSelling, setBestSelling] = useState([]);
  const [chartDatas, setChartDatas] = useState([]);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isSinglePage = size >= rowCount;
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const [isLoading, setIsLoading] = useState(false);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getTerminalsReports = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const options = {
        startDate: IndFormat({ startDate }, isTimeQuery),
        endDate: IndFormat({ endDate }, isTimeQuery),
        storeId: currentStore,
        page,
        size,
        storeName: storeName,
      };
      setLoading(true);
      const serverResponse = await BookingServices.getTerminalsReportOfRA(options, counter);
      setLoading(false);

      if (!isEmpty(get(serverResponse, 'data', []))) {
        const totalOrders = reduce(
          get(serverResponse, 'data.counterTerminalData', []),
          (acc, val) => acc + get(val, 'totalOrders', 0),
          0
        );

        const totalValues = reduce(
          get(serverResponse, 'data.counterTerminalData', []),
          (acc, val) => acc + get(val, 'terminalSale', 0),
          0
        );

        setFilterTable([
          ...get(serverResponse, 'data.counterTerminalData', []),
          { terminalName: 'Total', totalOrders, terminalSale: totalValues },
        ]);
        const totalSales = reduce(
          get(serverResponse, 'data.counterTerminalData', []),
          (acc, val) => acc + val['terminalSale'],
          0
        );

        const sortedData = orderBy(
          get(serverResponse, 'data.counterTerminalData', []),
          ['terminalSale'],
          ['desc']
        );
        setBestSelling(sortedData);

        setTotal(totalSales);
      } else {
        setFilterTable([]);
        setTotal(0);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
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
        let query = ObjectToQueryParams(options);
        if (!isEmpty(counter)) {
          map(counter, (e) => {
            query = `${query}&counterId=${get(e, 'id')}`;
          });
        }
        const url = `${API}/api/v1/POS/merchant/report/terminal-wise-csv${query}`;
        const filename = generateFilename('Terminal_Report');
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
        await PRODUCTS_API.exportTerminalsReportAsCsv(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };
  const handleChangeCounter = (e) => {
    setCounter(e);
  };
  const getProductCounterList = async () => {
    if (currentStore === undefined || currentStore === 'undefined') return;
    try {
      const response = await PRODUCTS_API.getProductCounterList(currentStore);
      if (response) setCounterList(response.data);
    } catch (e) {
      console.log(e);
      setCounterList([]);
    }
  };
  useEffect(() => {
    if (currentStore) {
      getTerminalsReports();
    }
  }, [startDate, endDate, , page, size, counter, currentStore]);

  useEffect(() => {
    if (currentStore) {
      getProductCounterList();
    }
  }, [currentStore]);
  const columns = TerminalsTableColumns.map((column) => {
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      ...(column.field === 'total'
        ? { valueFormatter: ({ value }) => toFixedIfNecessary(value, 2) }
        : {}),
    };
  });
  const printPdf = async () => {
    try {
      if (!isEmpty(filterTable)) {
        const props = {
          heading: TerminalsTableHeaders,
          paymentRows: filterTable,
          startDate: IndFormat({ startDate }),
          endDate: moment(IndFormat({ endDate })).subtract(1, 'd'),
          title: 'Terminals Report',
          docTitle: 'Terminals Report',
          columns: TerminalsTableColumns,
          logo: logo,
        };
        triggerPrint(props);
      }
    } catch (e) {
      console.log(e);
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
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/terminal-wise-pdf${query}`;
        const filename = generateFilename('Terminals_Report');
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
        await PRODUCTS_API.exportTerminalOrdersAsPdf(options);
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
        const url = `${API}/api/v1/POS/merchant/report/order-wise-xlsx${query}&filename=orders-report.xlsx`;
        const filename = generateFilename('Terminals_Report');
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
        await PRODUCTS_API.exportTerminalOrdersAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    } finally {
      setIsLoading(false);
    }
  };

  const rows =
    !isEmpty(filterTable) &&
    map(filterTable, (terminals) => {
      return {
        id: uuid(),
        terminalId: terminals['terminalId'] || '-',
        terminalName: terminals['terminalName'] || '-',
        totalOrders: terminals['totalOrders'] || '-',
        total: toFixedIfNecessary(terminals['terminalSale'] || 0, 2),
      };
    });
  useEffect(() => {}, [bestSelling]);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Box xs display="flex" alignItems="center">
        {reportSummary && (
          <Box my={2} className="step1">
            <FilterComponent
              filterTable={filterTable}
              title="Terminal Report"
              docTitle="Terminal Report"
              headers={TerminalsTableHeaders}
              columns={TerminalsTableColumns}
              startDate={startDate}
              printPdf={pdfDownload}
              excelDownload={excelDownload}
              csvDownload={csvDownload}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              handleChangeCounter={handleChangeCounter}
              multiCounters={counter}
              counterList={counterList}
              customer={false}
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
          height: isMobile ? 'calc(100vh - 17rem)' : 'calc(100vh - 13rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        {loading ? (
          <ReportCardSkeletonLoader />
        ) : (
          <ReportAndAnalyticsCard
            titleDcard1={'Best selling terminals'}
            titleDcard2={'Collected amount(₹)'}
            subtitle1card1D={get(bestSelling, '0.terminalName', '-')}
            subtitle1card2D={get(bestSelling, '0.terminalSale', '-')}
            subtitleDcard2={toFixedIfNecessary(total, 2)}
            subtitle1card3D={'Best seller'}
            chartTitle={'Top 3 selling terminal'}
            chartData={map(bestSelling?.slice(0, 3), (e, index) => {
              if (index < 4)
                return { label: get(e, 'terminalName'), value: e['terminalSale'] || 0 };
            })}
            isNotRupee
            titleDcard3={'Terminal Name'}
            titleDcard4={'Collected Amount(₹)'}
            isReport
          />
        )}
        {
          <Box
            sx={{
              height: isMobile ? 'calc(100vh - 17rem)' : 'calc(100vh - 23rem)',
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
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: size, page: page - 1 } },
              }}
              pageSizeOptions={[10, 20, 50, 100]}
              disableRowSelectionOnClick
              onPaginationModelChange={handlePagination}
              paginationMode="server"
              localeText={{ noRowsLabel: 'No terminals  reports found' }}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              autoHeight={true}
              loading={loading}
            />
          </Box>
        }
      </Box>
    </>
  );
}
