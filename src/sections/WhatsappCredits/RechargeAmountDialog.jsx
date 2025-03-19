import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RegexValidation from 'src/constants/RegexValidation';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import QRCode from 'react-qr-code';
import { ErrorBoundary } from 'react-error-boundary';
import DialogComponent from './Dialog';
import WHATSAPP_CREDITS from 'src/services/whatsappCredits';
import { find, get, isEmpty } from 'lodash';
import { currentStoreId, stores } from 'src/global/recoilState';
import { useRecoilValue } from 'recoil';

const RechargeAmountDialog = ({
  open,
  onClose,
  amount,
  setAmount,
  setRechargeScanDialogOpen,
  setPaymentIntiateResponse,
}) => {
  const [localAmount, setLocalAmount] = useState('');
  const currentStore = useRecoilValue(currentStoreId);
  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore)
  useEffect(() => {
    setLocalAmount(amount);
  }, [amount]);

  const creditRequest = async () => {
    try {
      const resp = await WHATSAPP_CREDITS.creditRequest({ amount: Number(localAmount) * 100, storeId: currentStore, storeName: storeName });
      setPaymentIntiateResponse(get(resp, 'data.data'));
      setAmount(localAmount);
      onClose();
      setRechargeScanDialogOpen(true);
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  return (
    <DialogComponent open={open} onClose={onClose} title="Recharge Amount" customMinWidth={300}>
      <Stack sx={{ width: '100%' }}>
        <TextField
          sx={{ mt: 3 }}
          autoFocus
          label="Amount"
          size="small"
          value={localAmount}
          onChange={(e) => {
            setLocalAmount(e.target.value);
          }}
        />
        <Stack
          flexDirection={'row'}
          sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 3, gap: 2 }}
        >
          <Button onClick={onClose} sx={{ color: '#000' }} variant="text">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!localAmount) return;
              if (!RegexValidation.POSITIVE_NUMBER.test(localAmount)) {
                toast.error(ErrorConstants.INVALID_AMOUNT);
                return;
              }
              creditRequest();
            }}
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </Stack>
      </Stack>
    </DialogComponent>
  );
};

export default RechargeAmountDialog;
