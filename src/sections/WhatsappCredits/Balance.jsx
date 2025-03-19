import { Button, Card, Divider, Stack, Typography, useMediaQuery } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Label from 'src/components/label';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RechargeAmountDialog from './RechargeAmountDialog';
import RechargeQRDialog from './RechargeQRDialog';
import RechargeSuccessDialog from './RechargeSuccessDialog';
import RechargeErrorDialog from './RechargeErrorDialog';
import WHATSAPP_CREDITS from 'src/services/whatsappCredits';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { get } from 'lodash';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import { useRecoilState, useRecoilValue } from 'recoil';
import { whatsappBalanceDetailsState } from 'src/global/recoilState';
import { StyledSectionWhatsappBg, StyledSectionphoneWhatsappBg } from 'src/layouts/login/styles';

const Balance = () => {
  const [amount, setAmount] = useState('');
  const [rechargeAmountDialogOpen, setRechargeAmountDialogOpen] = useState(false);
  const [rechargeScanDialogOpen, setRechargeScanDialogOpen] = useState(false);
  const [rechargeSuccessDialogOpen, setRechargeSuccessDialogOpen] = useState(false);
  const [rechargeErrorDialogOpen, setRechargeErrorDialogOpen] = useState(false);

  const [balanceDetails, setBalanceDetails] = useRecoilState(whatsappBalanceDetailsState);
  const [paymentIntiateResponse, setPaymentIntiateResponse] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');
  const whatsappBalance = (get(balanceDetails, 'whatsappCredits', 0) / 100).toFixed(2) || 0;
console.log('whatsappBalance', whatsappBalance);
  const isLowBalance = Number(Math.floor(whatsappBalance)) <= 3;

  const getBalance = async () => {
    try {
      const resp = await WHATSAPP_CREDITS.getBalance();
      setBalanceDetails(get(resp, 'data'));
    } catch (err) {
      console.log('err', err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(()=> {
    getBalance()
  }, [])
  return (
    <Stack
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      sx={{ height: isMobile ? 'calc(80vh - 100px)' : 'calc(100vh - 100px)' }}
    >
      { !isMobile ? <StyledSectionWhatsappBg/> : <StyledSectionphoneWhatsappBg/>}
      <Card sx={{ width: 350, px: 3 }}>
        {isLowBalance && (
          <Typography
            sx={{
              backgroundColor: 'red',
              color: '#fff',
              fontWeight: 'bold',
              width: 120,
              px: 0.3,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              textAlign: 'center',
            }}
          >
            Low Balance
          </Typography>
        )}

        <Stack mt={2}>
          <Stack flexDirection="row" alignItems="center" gap={1.5}>
            <Typography sx={{ color: '#637381', fontSize: '25px', fontWeight: 'bold' }}>
              Balance
            </Typography>
            <Label
              color="success"
              sx={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'none' }}
            >
              20 paise per message
            </Label>
          </Stack>
          <Typography
            sx={{ fontSize: '55px', fontWeight: 'bold', position: 'relative', bottom: 8 }}
          >
            ₹ {whatsappBalance || 0}
          </Typography>
        </Stack>

        <Divider />

        <Stack my={2}>
          <Stack flexDirection="row" alignItems="center" gap={0.7}>
            <WhatsAppIcon sx={{ color: 'green', fontSize: '30px' }} />
            <Typography sx={{ fontSize: '35px', fontWeight: 'bold' }}>
              {Math.round(whatsappBalance / 0.2) || 0}
            </Typography>
          </Stack>
          <Typography sx={{ color: '#637381', fontSize: '23px' }}>Messages can be sent</Typography>
        </Stack>

        <Divider />
        <Button
          variant="contained"
          fullWidth
          sx={{ height: '50px', my: 3 }}
          onClick={() => {
            setRechargeAmountDialogOpen(true);
          }}
        >
          Recharge Now
        </Button>
      </Card>

      {rechargeAmountDialogOpen && (
        <RechargeAmountDialog
          open={rechargeAmountDialogOpen}
          onClose={() => {
            setRechargeAmountDialogOpen(false);
          }}
          amount={amount}
          setAmount={setAmount}
          setRechargeScanDialogOpen={setRechargeScanDialogOpen}
          setPaymentIntiateResponse={setPaymentIntiateResponse}
        />
      )}
      {rechargeScanDialogOpen && (
        <RechargeQRDialog
          open={rechargeScanDialogOpen}
          onClose={() => {
            setRechargeScanDialogOpen(false);
            setRechargeAmountDialogOpen(true);
            setAmount('');
          }}
          amount={amount}
          paymentIntiateResponse={paymentIntiateResponse}
          setRechargeScanDialogOpen={setRechargeScanDialogOpen}
          setRechargeErrorDialogOpen={setRechargeErrorDialogOpen}
          setRechargeSuccessDialogOpen={setRechargeSuccessDialogOpen}
        />
      )}
      {rechargeSuccessDialogOpen && (
        <RechargeSuccessDialog
          open={rechargeSuccessDialogOpen}
          onClose={() => {
            setRechargeSuccessDialogOpen(false);
            setAmount('');
            getBalance();
          }}
          amount={amount}
        />
      )}
      {rechargeErrorDialogOpen && (
        <RechargeErrorDialog
          open={rechargeErrorDialogOpen}
          onClose={() => {
            setRechargeErrorDialogOpen(false);
            setAmount('');
          }}
          amount={amount}
        />
      )}
    </Stack>
  );
};

export default Balance;
