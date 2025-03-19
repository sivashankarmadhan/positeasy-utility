import {
  Card,
  CardHeader,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { get, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import WHATSAPP_CREDITS from 'src/services/whatsappCredits';
import RechargeHistoryView from './RechargeHistoryView';

const mockData = {
  data: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    rechargeHistoryData: [
      {
        date: '2024-04-16T10:02:54.784Z',
        paymentId: 'Pay_3u388383zdh',
        gatewayPayId: 43242212,
        gatewaySource: 'Online',
        paymentFrom: 'UPI',
        rechargedAmount: 13390,
        paymentStatus: 'COMPLETED',
      },
    ],
  },
};

const RechargeHistory = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  let [rechargeHistoryList, setRechargeHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [totalRechargeHistory, setTotalRechargeHistory] = useState('');

  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });

  async function fetchRechargeHistoryList() {
    setIsLoading(true);
    try {
      const responseCustomerCodes = await WHATSAPP_CREDITS.getRechargeHistory({
        size: get(paginationData, 'size'),
        page: get(paginationData, 'page'),
      });

      setRechargeHistoryList(get(responseCustomerCodes, 'data.data', []));
      setTotalRechargeHistory(get(responseCustomerCodes, 'data.totalItems'));
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handlePageChange(event, newPage) {
    setPaginationData((prev) => ({ ...prev, page: newPage + 1 }));
  }

  function handleOnRowsPerPageChange(event, data) {
    setPaginationData({ page: 1, size: data.props.value });
  }

  const renderHeading = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="h6">Recharge History</Typography>
    </Stack>
  );

  useEffect(() => {
    if (currentStore && currentTerminal) {
      fetchRechargeHistoryList();
    }
  }, [currentStore, currentTerminal, paginationData]);

  if (isLoading) return <LoadingScreen />;

  return (
    <Card sx={{ m: 2 }}>
      <CardHeader
        className="RechargeHistoryStep1"
        title={renderHeading}
        sx={{ mb: 3, px: !isMobile ? 2 : null, pl: isMobile ? 2 : null }}
      />
      <TableContainer sx={{ height: 'calc(100vh - 300px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Payment Id</TableCell>
              <TableCell align="left">Reason</TableCell>
              <TableCell align="left">Payment From</TableCell>
              <TableCell align="left">Recharged Amount</TableCell>
              <TableCell align="left">Payment Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {map(rechargeHistoryList, (_item) => (
              <RechargeHistoryView _item={_item} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        labelRowsPerPage=""
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalRechargeHistory}
        rowsPerPage={get(paginationData, 'size')}
        page={get(paginationData, 'page') - 1}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleOnRowsPerPageChange}
      />
    </Card>
  );
};

export default RechargeHistory;
