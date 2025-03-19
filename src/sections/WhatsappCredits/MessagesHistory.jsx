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
import MessagesHistoryView from './MessagesHistoryView';

const mockData = {
  data: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    messageHistoryData: [
      {
        date: '2024-04-16T10:02:54.784Z',
        deliveryDate: '2024-04-16T10:02:54.784Z',
        orderId: '12',
        orderedAmount: 15000,
        messageStatus: 'COMPLETED',
      },
    ],
  },
};

const MessagesHistory = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  let [messageHistoryList, setMessageHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [totalMessageHistory, setTotalMessageHistory] = useState('');

  const [paginationData, setPaginationData] = useState({
    size: 10,
    page: 1,
  });

  async function fetchMessageHistoryList() {
    setIsLoading(true);
    try {
      //   const responseCustomerCodes = await SettingServices.fetchCustomerList({
      //     size: get(paginationData, 'size'),
      //     page: get(paginationData, 'page'),
      //   });
      setMessageHistoryList(get(mockData, 'data.messageHistoryData', []));
      setTotalMessageHistory(get(mockData, 'data.totalItems'));
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
      <Typography variant="h6">Message History</Typography>
    </Stack>
  );

  useEffect(() => {
    fetchMessageHistoryList();
  }, [currentStore, currentTerminal]);

  useEffect(() => {
    fetchMessageHistoryList();
  }, [paginationData]);

  useEffect(() => {
    if (currentStore && currentTerminal) {
      fetchMessageHistoryList();
    }
  }, [currentStore, currentTerminal]);

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
              <TableCell align="left">Order Id</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Order Details</TableCell>
              <TableCell align="left">Delivery Date</TableCell>
              <TableCell align="left">Ordered Amount</TableCell>
              <TableCell align="left">Message Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {map(messageHistoryList, (_item) => (
              <MessagesHistoryView _item={_item} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        labelRowsPerPage=""
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalMessageHistory}
        rowsPerPage={get(paginationData, 'size')}
        page={get(paginationData, 'page') - 1}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleOnRowsPerPageChange}
      />
    </Card>
  );
};

export default MessagesHistory;
