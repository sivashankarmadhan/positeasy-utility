import {
  Card,
  Dialog,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Checkbox,
  TextField,
  useTheme,
} from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { hideScrollbar } from 'src/constants/AppConstants';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import INTENT_API from 'src/services/IntentService';
import { fDatesWithTimeStampWithDayjs } from 'src/utils/formatTime';

const ViewLogsDialog = ({ isOpen, onClose, isViewOnly, data, getAllPurchaseOrders }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [purchaseLogData, setPurchaseLogData] = useState({});
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const theme = useTheme();

  const getPurchaseLogs = async (referenceId, status) => {
    try {
      setIsLoading(true);
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        size: 10,
        page: 1,
        referenceId: get(data, 'referenceId'),
      };
      const res = await INTENT_API.getPurchaseLogs(options);
      console.log('resres12', res);
      setPurchaseLogData(res?.data?.data);;
      setIsLoading(false);
    } catch (err) {
      console.log('err', err);
      setIsLoading(false);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getPurchaseLogs();
  }, []);
  return (
    <Dialog open={isOpen}>
      <Card
        sx={{
          p: 2,
          width: { xs: '100%' },
        }}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }}>
            Purchase order Log status
          </Typography>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>

        <TableContainer style={{ maxHeight: 400, ...hideScrollbar }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                  }}
                >
                  Reference Id
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                  }}
                >
                  Updated Date
                </TableCell>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: '1px solid #ced4da',
                  }}
                >
                  Request
                </TableCell>
              </TableRow>
            </TableHead>
            {!isEmpty(purchaseLogData) && (
              <TableBody>
                {map(purchaseLogData, (_item) => {
                  return (
                    <TableRow sx={{ borderBottom: '1px solid #ced4da' }}>
                      <TableCell align="left">{get(_item, 'referenceId')}</TableCell>
                      <TableCell align="left">
                        {fDatesWithTimeStampWithDayjs(get(_item, 'date'))}
                      </TableCell>
                      <TableCell align="left" sx={{fontWeight: 600}}>{get(_item, 'desc')}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        {isEmpty(purchaseLogData) && (
          <Typography sx={{ fontWeight: 700, textAlign: 'center', padding: 2 }}>No Log status Found</Typography>
        )}
      </Card>
    </Dialog>
  );
};

export default ViewLogsDialog;
