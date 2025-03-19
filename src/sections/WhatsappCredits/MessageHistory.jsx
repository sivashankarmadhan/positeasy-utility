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
import MessageHistoryView from './MessageHistoryView';

const mockData = {
  "data": {
    "currentPage": 1,
    "pageSize": 5,
    "totalItems": 6,
    "totalPages": 2,
    "data": [
      {
        "id": "04e4e8c0-ebbe-4d54-8d78-c84a0a9de632",
        "merchantId": "aa2f6053-1160-4078-a602-91d52de72e24",
        "storeId": "Store1s",
        "date": "2024-07-11T12:41:56.000Z",
        "paymentId": "Pay_6N668f856bDZjHw2T1",
        "messageId": "c1c66433-3d46-4589-a178-456e66b6e3e4",
        "contactNumber": "+919384650810",
        "channel": "whatsapp",
        "status": "delivered",
        "createdAt": "2024-07-11T12:41:56.298Z",
        "updatedAt": "2024-07-11T12:41:56.556Z"
      },
      {
        "id": "23ff4d79-70ce-4884-a9d7-7bdea98ca222",
        "merchantId": "aa2f6053-1160-4078-a602-91d52de72e24",
        "storeId": "Store1s",
        "date": "2024-07-11T12:38:23.000Z",
        "paymentId": "Pay_6N668f856bDZjHw2T1",
        "messageId": "18be59c7-92dc-48fc-8324-2853c771c68b",
        "contactNumber": "+919384650810",
        "channel": "whatsapp",
        "status": "enqueued",
        "createdAt": "2024-07-11T12:38:23.499Z",
        "updatedAt": "2024-07-11T12:38:23.683Z"
      },
      {
        "id": "69d38da8-f93a-466f-840b-c77a04b20d12",
        "merchantId": "aa2f6053-1160-4078-a602-91d52de72e24",
        "storeId": "Store1s",
        "date": "2024-07-11T12:33:34.000Z",
        "paymentId": "Pay_6N668f856bDZjHw2T1",
        "messageId": "bc8159fa-40ee-4e5c-a18d-ebf329ea1075",
        "contactNumber": "+919384650810",
        "channel": "whatsapp",
        "status": "enqueued",
        "createdAt": "2024-07-11T12:33:34.221Z",
        "updatedAt": "2024-07-11T12:33:34.379Z"
      },
      {
        "id": "43780c66-8f7e-4dfd-b60d-83a129a3735c",
        "merchantId": "aa2f6053-1160-4078-a602-91d52de72e24",
        "storeId": "Store1s",
        "date": "2024-07-11T12:29:30.000Z",
        "paymentId": "Pay_6N668f856bDZjHw2T1",
        "messageId": "46d59f1e-ff32-408e-ad12-f6ef53152113",
        "contactNumber": null,
        "channel": "whatsapp",
        "status": "submitted",
        "createdAt": "2024-07-11T12:29:30.903Z",
        "updatedAt": "2024-07-11T12:29:30.903Z"
      },
      {
        "id": "71edd32b-4896-4639-8a71-50f2fcd4f9cf",
        "merchantId": "aa2f6053-1160-4078-a602-91d52de72e24",
        "storeId": "Store1s",
        "date": "2024-07-11T12:28:56.000Z",
        "paymentId": "Pay_6N668f856bDZjHw2T1",
        "messageId": "03ce1f5d-5b11-4d15-a6b6-b929389cd6b9",
        "contactNumber": null,
        "channel": "whatsapp",
        "status": "submitted",
        "createdAt": "2024-07-11T12:28:56.847Z",
        "updatedAt": "2024-07-11T12:28:56.847Z"
      }
    ]
  }
};

const MessageHistory = () => {
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
      const responseCustomerCodes = await WHATSAPP_CREDITS.getMessageHistory({
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
      <Typography variant="h6">Message History</Typography>
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
              <TableCell align="left">Message Id</TableCell>
              <TableCell align="left">Contact Number</TableCell>
              <TableCell align="left">Channel</TableCell>
              <TableCell align="left">Type</TableCell>
              <TableCell align="left">Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {map(rechargeHistoryList, (_item) => (
              <MessageHistoryView _item={_item} />
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

export default MessageHistory;
