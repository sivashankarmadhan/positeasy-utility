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
} from '@mui/material';
import Label from '../components/label';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { debounce, get, isEmpty, map, find } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import Autocomplete from '@mui/material/Autocomplete';
import PdfDownload from 'src/PrintPdf/PdfDownload';
import StartAndEndDatePicker from 'src/components/DateRangePickerRsuite';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  AttendanceReportTableColumns,
  AttendanceSortTable,
  AttendanceTableHeaders,
  ALL_CONSTANT,
  USER_AGENTS,
  hideScrollbar,
} from 'src/constants/AppConstants';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCardAttendsnce';

import { StocksReportTourConfig } from 'src/constants/TourConstants';
import { currentStoreId } from 'src/global/recoilState';
import { getCurrentDate } from 'src/helper/FormatTime';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import PRODUCTS_API from 'src/services/products';
import triggerPrint from 'src/helper/triggerPrint';
import { storeLogo, stores } from 'src/global/recoilState';
import {
  fDates,
  fDatesWithTimeStampFromUtc,
  formatDate,
  IndFormat,
  fDateDifferenceUtc,
} from 'src/utils/formatTime';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import toast from 'react-hot-toast';
import DownloadIcon from '@mui/icons-material/Download';
import { currentEndDate, currentStartDate, reportSummaryState } from 'src/global/recoilState';
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
import { isUndefined } from 'lodash';
import { ListItemText } from '@mui/material';
import isUnderWeekDates from 'src/utils/isUnderWeekDates';
import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
import { allConfiguration } from 'src/global/recoilState';

export default function AttendanceReportTable() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const { isMobile } = useResponsive();
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const currentStore = useRecoilValue(currentStoreId);
  const [searchProductId, setSearchProductId] = useState('');
  const [searchAttandance, setSearchAttendance] = useState('');
  const [staffName, setStaffName] = useState([]);
  const [stockReport, setStockReport] = useState([]);
  const [summaryReports, setSummaryReports] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const logo = useRecoilValue(storeLogo);
  const [searchType, setSearchType] = useState('');
  // const optionTypes = ['Present', 'Absent'];
  const [searchOrderId, setSearchOrderId] = useState('');
  const isDesktop = useMediaQuery('(min-width:1419px)');
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const isSinglePage = size >= rowCount;
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };
  const handleChangeType = debounce((e, newValue) => {
    setSearchType(get(newValue, 'id'));
  }, 1000);
  const handleChangeProductId = debounce((e, newValue) => {
    setSearchProductId(get(newValue, 'id'));
  }, 1000);
  const handleChangeAttendance = debounce((e, newValue) => {
    setSearchAttendance(get(newValue, 'id'));
  }, 1000);

  const noSortableFields = AttendanceSortTable;

  const columns = AttendanceReportTableColumns.map((column) => ({
    headerName: column.title,
    field: column.field,
    flex: 1,
    sortable: !noSortableFields.includes(column.field),
    minWidth: 140,
    //   ...(column.field === 'date' && { valueFormatter: ({ value }) => fDates(value) }),
    ...(column.field === 'inTime' || column.field === 'outTime'
      ? { minWidth: 170, maxWidth: 300 }
      : {}),
    ...(column.field === 'date' ? { maxWidth: 120 } : {}),
    ...(column.field === 'attendance' && {
      renderCell: ({ value }) => (
        <Box sx={{ color: value ? 'green' : 'red' }}>{value ? 'present' : 'absent'}</Box>
      ),
    }),
    ...(column.field === 'attendance' && {
      renderCell: (params) => {
        return (
          <Label variant="soft" color={`${params.value ? 'success' : 'error'}`}>
            {`${params.value ? 'present' : 'absent'}`}
          </Label>
        );
      },
    }),
    ...(column.field === 'newStockQuantity' && {
      valueFormatter: ({ value }) => formatAmountToIndianCurrency(value),
    }),
    headerClassName: 'super-app-theme--header',

    ...((column.field === 'orderId' || column.field === 'newStockQuantity') && {
      type: 'number',
    }),
  }));
  const getStaffName = async () => {
    if (isUndefined(currentStore) || currentStore === 'undefined') return;
    try {
      const response = await PRODUCTS_API.getStaffName();
      if (response) setStaffName(response.data || []);
    } catch (e) {
      setStaffName([]);
    }
  };

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const getAttendanceReport = async () => {
    if (isUndefined(currentStore) || currentStore === 'undefined') return;
    try {
      const options = {
        startDateD: IndFormat({ startDate },isTimeQuery),
        endDateD: IndFormat({ endDate },isTimeQuery),
        size,
        page,
        accessId: searchProductId,
        attendance: searchAttandance,
        type: searchType,
        storeName: storeName,
      };
      setLoading(true);
      const response = await PRODUCTS_API.getAttendanceReport(options);
      const summaryResponse = await PRODUCTS_API.getAttendanceSummary(options);
      setLoading(false);
      if (summaryResponse) {
        setSummaryReports(get(summaryResponse, 'data', []));
      }
      if (response) {
        setStockReport(get(response, 'data.rows', []));
        setRowCount(get(response, 'data.count', []));
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };
  var newDate = new Date();
  var firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);

  useEffect(() => {
    setStartDate(firstDay);
  }, []);

  useEffect(() => {
    if (currentStore) getAttendanceReport();
  }, [
    startDate,
    endDate,
    currentStore,
    page,
    size,
    searchProductId,
    searchType,
    searchOrderId,
    searchAttandance,
  ]);

  useEffect(() => {
    getStaffName();
  }, []);

  const pdfDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        ...(searchProductId ? { accessId: searchProductId } : {}),
        ...(searchAttandance ? { attendance: searchAttandance } : {}),
        storeName: storeName,
      };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/attendance-pdf/${query}`;
        const filename = generateFilename('Attendance_Report');
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
        await PRODUCTS_API.exportAttendanceAsPdf(options);
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
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        ...(searchProductId ? { accessId: searchProductId } : {}),
        ...(searchAttandance ? { attendance: searchAttandance } : {}),
        storeName: storeName,
      };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/attendance-csv/${query}`;
        const filename = generateFilename('Attendance_Report');
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
        await PRODUCTS_API.exportAttendanceAsCsv(options);
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
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        ...(searchProductId ? { accessId: searchProductId } : {}),
        ...(searchAttandance ? { attendance: searchAttandance } : {}),
        storeName: storeName,
      };

      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/merchant/report/attendance-xlsx/${query}`;
        const filename = generateFilename('Attendance_Report');
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
        await PRODUCTS_API.exportAttendanceAsExcel(options);
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

  // const attendane = [{pressent:'present'},{absent:'absent'}]
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
                  // mb:6
                }}
                gap={1}
              >
                <StartAndEndDatePicker />
                <Autocomplete
                  size="small"
                  label="Staff Name"
                  disablePortal
                  options={map(staffName, (_item) => ({
                    label: get(_item, 'name'),
                    id: get(_item, 'accessId'),
                  }))}
                  onChange={handleChangeProductId}
                  sx={{ minWidth: 160 }}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue ? inputValue.toLowerCase() : '';
                    return options.filter(
                      (option) => option.label && option.label.toLowerCase().startsWith(searchTerm)
                    );
                  }}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.label}</ListItemText>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Staff Name'} />
                  )}
                />
                <Autocomplete
                  size="small"
                  label="Staff Name"
                  disablePortal
                  options={[
                    { label: 'Present', id: 'true' },
                    { label: 'Absent', id: 'false' },
                  ]}
                  onChange={handleChangeAttendance}
                  sx={{ minWidth: 160 }}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.label}</ListItemText>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Attendance'} />
                  )}
                />
                {/* <Autocomplete
                size="small"
                label="Type"
                disablePortal
                options={[{label:'Present',id:'true'},{label:'Absent',id:'false'}]}
                onChange={handleChangeType}
                sx={{ minWidth: 160 }}
                renderInput={(params) => <TextField variant="filled" {...params} label={'Typeeee'} />}
              />  */}

                {!isEmpty(stockReport) && (
                  <Tooltip title={'Export PDF'}>
                    <Stack>
                      <PdfDownload
                        heading={AttendanceTableHeaders}
                        paymentRows={stockReport}
                        startDate={startDate}
                        endDate={endDate}
                        title={'StockReport'}
                        columns={AttendanceReportTableColumns}
                        DocTitle={'Stock Report'}
                        printPdf={pdfDownload}
                        isUnderWeekDatesBol={isUnderWeekDatesBol}
                      />
                    </Stack>
                  </Tooltip>
                )}
                <Tooltip
                  title={isUnderWeekDates(startDate, endDate, true) ? 'Export CSV' : 'COMING SOON'}
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
                {loading ? (
                  <ReportCardSkeletonLoader />
                ) : (
                  <ReportAndAnalyticsCard
                    titleDcard1={'Name'}
                    titleDcard2={'Attendance'}
                    isAttendance
                    subtitleDcard1={get(summaryReports, 'name', '-')}
                    subtitleDcard2={get(summaryReports, 'presentCount')}
                    subtitleDcard3={get(summaryReports, 'absentCount')}
                    subtitleDcard4={get(summaryReports, 'totalExtraHours')}
                    subtitleDcard5={get(summaryReports, 'totalPermission')}
                    titleDcard3={'Time'}
                    titleDcard4={'Present'}
                    titleDcard5={'Absent'}
                    titleDcard6={'ExtraHours'}
                    titleDcard7={'Permission'}
                    // chartData={orderTypes}
                  />
                )}
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
                <Stack direction="row" gap={1}>
                  <Autocomplete
                    size="small"
                    label="Staff Name"
                    disablePortal
                    options={map(staffName, (_item) => ({
                      label: get(_item, 'name'),
                      id: get(_item, 'accessId'),
                    }))}
                    onChange={handleChangeProductId}
                    sx={{ minWidth: 160 }}
                    filterOptions={(options, { inputValue }) => {
                      const searchTerm = inputValue ? inputValue.toLowerCase() : '';
                      return options.filter(
                        (option) =>
                          option.label && option.label.toLowerCase().startsWith(searchTerm)
                      );
                    }}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.label}</ListItemText>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Staff Name'} />
                    )}
                  />

                  <Autocomplete
                    size="small"
                    label="Attendance"
                    disablePortal
                    options={[
                      { label: 'Present', id: 'true' },
                      { label: 'Absent', id: 'false' },
                    ]}
                    onChange={handleChangeAttendance}
                    sx={{ minWidth: 160 }}
                    renderOption={(props, item) => (
                      <li {...props} key={item.id}>
                        <ListItemText>{item.label}</ListItemText>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField variant="filled" {...params} label={'Attendance'} />
                    )}
                  />
                </Stack>
                {!isEmpty(stockReport) && (
                  <Tooltip title={'Export PDF'}>
                    <Stack>
                      <PdfDownload
                        heading={AttendanceTableHeaders}
                        paymentRows={stockReport}
                        startDate={startDate}
                        endDate={endDate}
                        title={'StockReport'}
                        columns={AttendanceReportTableColumns}
                        DocTitle={'Stock Report'}
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
              alignItems="center "
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
          height: 'calc(100vh - 18rem)',
          overflow: 'auto',
          ...hideScrollbar,
        }}
      >
        <Box
          className="step2"
          sx={{
            height: 'calc(100vh - 18rem)',
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
              return {
                attendance: e.attendance,
                date: e.date,
                name: e.staff.name,
                overTime: e.extraHours === '00:00:00' || isEmpty(e.extraHours) ? '-' : e.extraHours,
                inTime: isEmpty(e.inTime) ? '-' : fDatesWithTimeStampFromUtc(e.inTime),
                outTime: isEmpty(e.outTime) ? '-' : fDatesWithTimeStampFromUtc(e.outTime),
                workHours: fDateDifferenceUtc(e.inTime, e.outTime),
                leaveHours:
                  e.permission === '00:00:00' || isEmpty(e.permission) ? '-' : e.permission,
                id: index + 1,
              };
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
            localeText={{ noRowsLabel: 'No attendance  reports found' }}
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
