import { Box, Chip, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { find, forEach, get, isEmpty, map, reduce } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  ALL_CONSTANT,
  ProductTableColumns,
  ProductTableHeaders,
  USER_AGENTS,
  hideScrollbar,
  ProductSortTable,
  MemberTableColumns,
  ORDER_STATUS,
  MEMBERSHIP_STATUS,
} from 'src/constants/AppConstants';
import { productReportTourConfig } from 'src/constants/TourConstants';
import { allCategories, currentStoreId, currentTerminalId, stores } from 'src/global/recoilState';
import StyledDataGrid from 'src/helper/StyledDataGrid';
import BookingServices from 'src/services/API/BookingServices';
import FilterComponent from './FilterComponent';
import { reportSummaryState } from 'src/global/recoilState';
import PRODUCTS_API from 'src/services/products';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import { allConfiguration } from 'src/global/recoilState';
import { IndFormat } from 'src/utils/formatTime';
import AuthService from 'src/services/authService';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import uuid from 'react-uuid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';

import ReportCardSkeletonLoader from 'src/components/reportSkeletonLoader/reportSkeletonCardLoader';
import MembershipCardReports from 'src/components/MembershipCardReports';
export default function MembershipReports() {
  const theme = useTheme();
  const [loading, setLoading] = useState();
  const { isMobile } = useResponsive();
  const [totalActiveMember, setTotalActiveMember] = useState(0);
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [expiredMembers, setExpiredMembers] = useState(0);
  const [overallMember, setOverallMember] = useState(0);

  const [memberStatus, setMemberStatus] = useState('');
  const [filterTable, setFilterTable] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [customCode, setCustomCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [categorizeCode, setCategorizeCode] = useState('');
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [currentCustomCode, setCurrentCustomCode] = useState({ label: '', id: '' });
  const [currentCustomerId, setCurrentCustomerCode] = useState({ label: '', id: '' });
  const [memberConatactNo, setMemberConatactNo] = useState('');
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
  const isSinglePage = size >= rowCount;
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const configuration = useRecoilValue(allConfiguration);
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);

  const [isLoading, setIsLoading] = useState(false);

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);
  const handleCustomCode = (e) => {
    setCustomCode(get(e, 'id'));
    setCurrentCustomCode(e);
  };
  const handleCustomerId = (e) => {
    setCustomerId(get(e, 'id'));
    setCurrentCustomerCode(e);
  };


  const getMemberReports = async () => {
    try {
      const options = {
        startDateD: IndFormat({ startDate }, isTimeQuery),
        endDateD: IndFormat({ endDate }, isTimeQuery),
        contactNumber:  memberConatactNo.length === 10 ? `91${memberConatactNo}` : '',
        status: memberStatus || '',
        name: currentCustomerId?.label || '',
        size,
        page,
      };
      setLoading(true);
      const serverResponse = await BookingServices.getMembershipReports(options);
      setLoading(false);
      setFilterTable(get(serverResponse, 'data.data', []));
      setRowCount(get(serverResponse, 'data.totalItems', 0));
      setTotalActiveMember(get(serverResponse, 'data.Active', 0));
      setOverallMember(get(serverResponse, 'data.overAllMember', 0));
      setTotalCustomer(get(serverResponse, 'data.customer', 0));
      setExpiredMembers(get(serverResponse, 'data.Expried', 0));
    } catch (e) {
      setLoading(false);
    }
  };

  const handlePagination = (e) => {
    setPage(e.page + 1);
    setSize(e.pageSize);
  };

  useEffect(() => {
    if (currentStore) getMemberReports();
  }, [
    startDate,
    endDate,
    currentStore,
    currentTerminal,
    customCode,
    customerId,
    currentCustomerId,
    categorizeCode,
    memberStatus,
    page,
    size,
  ]);
  useEffect(() => {
    if(memberConatactNo.length === 10 || memberConatactNo.length === 0) {
        if (currentStore) getMemberReports();
    }
  }, [
    memberConatactNo,
  ]);

  const handlePaymentTypeColor = (status) => {
    if (status === MEMBERSHIP_STATUS.ACTIVE) {
      return 'success';
    } else if (status === MEMBERSHIP_STATUS.INACTIVE) {
      return 'info';
    } else return 'warning';
  };


  const noSortableFields = ProductSortTable;

  const columns = MemberTableColumns.map((column) => {
    const minWidthData =
      column.field === 'name'
        ? 180
        : column.field === 'contactNumber'
        ? 150
        : 100;
    return {
      headerName: column.title,
      field: column.field,
      flex: 1,
      minWidth: minWidthData,
      headerClassName: 'super-app-theme--header',
      sortable: !noSortableFields.includes(column.field),
      ...(column.field === 'status' && {
        renderCell: (params) => (
          <Chip
            size="small"
            color={handlePaymentTypeColor(params.value)}
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              '&.MuiChip-root': { borderRadius: '4px' },
            }}
            label={`${get(params, 'value')}`}
          />
        ),
      }),
    };
  });
  const rows =
    !isEmpty(filterTable) &&
    map(
      filterTable,
      ({
        name,
        contactNumber,
        amount,
        dateOfSubscription,
        status,
        nextRenewal,
      }) => {
        console.log('status', <div>{status}</div>);
        return {
          id: uuid(),
          name: name || '-',
          contactNumber: contactNumber || '-',
          amount: `₹${amount}` || '-',
          dateOfSubscription : new Date(dateOfSubscription)?.toISOString()?.split("T")[0] || '-',
          nextRenewal : new Date(nextRenewal)?.toISOString()?.split("T")[0] || '-',
          status : status|| '-',
        };
      }
    );

  const csvDownload = async () => {
    try {
      setIsLoading(true);
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(memberConatactNo ? { contactNumber: memberConatactNo.length === 10 ? `91${memberConatactNo}` : '' } : {}),
        ...(memberStatus ? { status: memberStatus } : {}),
        ...(currentCustomerId ? { name: currentCustomerId?.label } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/memberShip/report-memberShipCsv${query}`;
        const filename = generateFilename('Membership_Report');
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
        await PRODUCTS_API.exportMembershipAsCsv(options);
      }
    } catch (err) {
      toast.error(get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_CSV);
    } finally {
      setIsLoading(false);
    }
  };

  const pdfDownload = async () => {
    setIsLoading(true);
    try {
      const storeId = AuthService.getSelectedStoreId();
      const terminalId = AuthService.getSelectedTerminal();
      let options = {
        storeId,
        startDate: IndFormat({ startDate }),
        endDate: IndFormat({ endDate }),
        ...(memberConatactNo ? { contactNumber: memberConatactNo.length === 10 ? `91${memberConatactNo}` : '' } : {}),
        ...(memberStatus ? { status: memberStatus } : {}),
        ...(currentCustomerId ? { name: currentCustomerId?.label } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/memberShip/report-memberShipPdf${query}`;
        const filename = generateFilename('Membership_Report');
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
        await PRODUCTS_API.exportMembershipAsPdf(options);
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
        ...(memberConatactNo ? { contactNumber: memberConatactNo.length === 10 ? `91${memberConatactNo}` : '' } : {}),
        ...(memberStatus ? { status: memberStatus } : {}),
        ...(currentCustomerId ? { name: currentCustomerId?.label } : {}),
        storeName: storeName,
      };
      options =
        terminalId === ALL_CONSTANT.ALL
          ? { ...options, storeId }
          : { ...options, storeId, terminalId };
      if (isAndroid || isAndroidRawPrint) {
        const API = AuthService.getRemoteURL();
        const query = ObjectToQueryParams(options);
        const url = `${API}/api/v1/POS/memberShip/report-memberShipXlsx${query}`;
        const filename = generateFilename('Membership_Report');
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
        await PRODUCTS_API.exportMembershipAsExcel(options);
      }
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.data.message') || ErrorConstants.FAILED_TO_DOWNLOAD_EXCEL
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      {reportSummary && (
        <Box my={2} className="step1">
          <FilterComponent
            handleCustomCode={handleCustomCode}
            handleCustomerId={handleCustomerId}
            currentCustomCode={currentCustomCode}
            currentCustomerId={currentCustomerId}
            filterTable={filterTable}
            title="membershipReport"
            docTitle="Member Report"
            headers={ProductTableHeaders}
            columns={ProductTableColumns}
            printPdf={pdfDownload}
            csvDownload={csvDownload}
            excelDownload={excelDownload}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            isDisabledCustomCodeAndCustomer
            setMemberStatus={setMemberStatus}
            memberStatus={memberStatus}
            setMemberConatactNo={setMemberConatactNo}
            memberConatactNo={memberConatactNo}
          />
        </Box>
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
        <MembershipCardReports
        titleDcard1={'Active Members'}
        titleDcard2={'Customer Info'}
        isMembership
        subtitleDcard1={totalActiveMember}
        subtitleDcard2={totalCustomer}
        subtitleDcard3={overallMember}
        subtitleDcard4={totalActiveMember}
        subtitleDcard5={expiredMembers}
        titleDcard3={'Members'}
        titleDcard4={'Overall Customer'}
        titleDcard5={'Overall Members'}
        titleDcard6={'Active'}
        titleDcard7={'Expired'}
      />
        )}
       
        {
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
              columns={columns}
              initialState={{
                pagination: { paginationModel: { pageSize: size, page: page - 1 } },
              }}
              pageSizeOptions={[10, 50, 100]}
              disableRowSelectionOnClick
              onPaginationModelChange={handlePagination}
              paginationMode="server"
              localeText={{ noRowsLabel: 'No product  reports found' }}
              getRowClassName={(params) =>
                params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
              }
              autoHeight={true}
              loading={loading}
            />
          </Box>
        }
      </Box>
      <TakeATourWithJoy config={productReportTourConfig} />
    </>
  );
}
