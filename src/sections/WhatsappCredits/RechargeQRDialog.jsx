import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import QRCode from 'react-qr-code';
import { ErrorBoundary } from 'react-error-boundary';
import DialogComponent from './Dialog';
import { get, isEmpty } from 'lodash';
import TimeoutScreen from './TimeoutScreen';
import { alertDialogInformationState, allConfiguration } from 'src/global/recoilState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { LoadingButton } from '@mui/lab';
import WHATSAPP_CREDITS from 'src/services/whatsappCredits';
import AuthService from 'src/services/authService';
import { fCurrency } from 'src/utils/formatNumber';
import MyTimer from '../../components/MyTimer';
import { ThreeDots } from 'react-loader-spinner';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { ErrorConstants } from 'src/constants/ErrorConstants';

let t = null;

const RechargeQRDialog = ({
  open,
  onClose,
  amount,
  paymentIntiateResponse,
  setRechargeScanDialogOpen,
  setRechargeErrorDialogOpen,
  setRechargeSuccessDialogOpen,
}) => {
  const theme = useTheme();
  const clrInterval = useRef();

  const time = new Date();
  const timeout = 3.02;
  time.setSeconds(time.getSeconds() + timeout * 60);

  const isMobile = useMediaQuery('(max-width:600px)');

  const [isSentPaymentApiCall, setIsSentPaymentApiCall] = useState(false);
  const [isTimeOutScreen, setIsTimeOutScreen] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState('');
  const [isShowCheckManuallyBtn, setIsShowCheckManuallyBtn] = useState(false);
  const [checkManuallyLoading, setCheckManuallyLoading] = useState(false);

  const configuration = useRecoilValue(allConfiguration);
  const isPrint = get(configuration, 'savePrint', false);

  const previousInterval = 5;

  const [openWarning, setOpenWarning] = useState(false);

  const transactionId = get(paymentIntiateResponse, 'transactionId');

  const shopName = AuthService.getShopName();

  const moveToErrorScreen = () => {
    setRechargeScanDialogOpen(false);
    setRechargeErrorDialogOpen(true);
  };

  const moveToSuccessScreen = () => {
    setRechargeScanDialogOpen(false);
    setRechargeSuccessDialogOpen(true);
  };

  const handleWarning = () => {
    setOpenWarning(true);
  };

  const handleCloseWarning = () => {
    setOpenWarning(false);
  };

  const handleCancelTransaction = async () => {
    setIsLoading(true);
    try {
      const options = {
        transactionId: transactionId,
      };
      const response = await WHATSAPP_CREDITS.cancelTransaction(options);
      if (response) {
        clearIntervalStatus();
        setRechargeScanDialogOpen(false);
        onClose();
        toast.error(get(response, 'data.message', 'Payment Canceled by User'));
      }
    } catch (error) {
      console.log(error);
      clearIntervalStatus();
      setRechargeScanDialogOpen(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleWarningWithAlert = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to cancel the transaction? This action
      cannot be undone.`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            handleCancelTransaction();
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  function ErrorFallback() {
    return <div />;
  }

  const clearIntervalStatus = () => {
    clearInterval(clrInterval.current);
  };

  const callVerifyPaymentApi = async (isCheckStatusFlow) => {
    if (isSentPaymentApiCall) return;
    try {
      if (isEmpty(transactionId)) return;
      const options = {
        paymentId: transactionId,
      };
      setIsSentPaymentApiCall(true);

      let response = {};

      if (isCheckStatusFlow) {
        response = await WHATSAPP_CREDITS.verifyPayment(options);
      } else {
        response = await WHATSAPP_CREDITS.verifyPaymentLocal(options);
      }

      const isSameTransaction = get(response, 'data.paymentId') === transactionId;
      const isTimeout =
        get(response, 'data')?.['payments.reason'] === 'TXN_AUTO_FAILED' &&
        get(response, 'data.paymentStatus') === 'FAILED' &&
        isSameTransaction;
      const isFailed = get(response, 'data.paymentStatus') === 'FAILED' && isSameTransaction;
      const isSuccess = get(response, 'data.paymentStatus') === 'COMPLETED' && isSameTransaction;
      if (isSuccess) {
        handleCloseWarning();
        clearIntervalStatus();
        setPaymentErrorMsg('');
        moveToSuccessScreen();
      } else if (isTimeout) {
        handleCloseWarning();
        clearIntervalStatus();
        if (isCheckStatusFlow) {
          setPaymentErrorMsg(ErrorConstants.PAYMENT_TRANSACTION_IS_TIMEOUT);
        }
        // navigate("/dashboard/paymentStatus", { state: "TIMEOUT" });
        setIsTimeOutScreen(true);
      } else if (isFailed) {
        handleCloseWarning();
        clearIntervalStatus();
        if (isCheckStatusFlow) {
          setPaymentErrorMsg(ErrorConstants.PAYMENT_TRANSACTION_IS_FAILED);
        }
        moveToErrorScreen();
      }
    } catch (error) {
      console.log(error);
      if (!isCheckStatusFlow) {
        throw new Error('error');
      }
    } finally {
      setIsSentPaymentApiCall(false);
    }
  };

  const verifyPayment = () => {
    clearIntervalStatus();
    try {
      clrInterval.current = setInterval(async () => {
        await callVerifyPaymentApi();
      }, previousInterval * 1000);
    } catch (error) {
      console.log(error);
      clearIntervalStatus();
      moveToErrorScreen();
    }
    return;
  };

  useEffect(() => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (!transactionId) return;
      verifyPayment();
    }, 500);
    return () => {
      clearIntervalStatus();
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsShowCheckManuallyBtn(true);
    }, 60000);
  }, []);

  if (isTimeOutScreen) {
    return (
      <DialogComponent
        open={open}
        onClose={() => {
          handleWarningWithAlert();
        }}
        title={`Recharge ₹${amount}`}
        customMinWidth={isMobile ? 370 : 400}
      >
        <TimeoutScreen
          callVerifyPaymentApi={callVerifyPaymentApi}
          isSentPaymentApiCall={isSentPaymentApiCall}
          paymentErrorMsg={paymentErrorMsg}
        />
      </DialogComponent>
    );
  }

  return (
    <DialogComponent
      open={open}
      onClose={() => {
        handleWarningWithAlert();
      }}
      title={`Recharge ₹${amount}`}
      customMinWidth={isMobile ? 350 : 400}
    >
      <Stack
        sx={{
          mt: 3,
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Stack
          sx={{
            width: '90%',
          }}
        >
          <Typography sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', color: '#637381' }}>
            Scan QR to Recharge
          </Typography>
          {!isEmpty(get(paymentIntiateResponse, 'qrString')) && (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <QRCode
                size={50}
                style={{
                  height: isMobile ? '25vh' : '30vh',
                  maxWidth: '100%',
                  width: '100%',
                }}
                value={get(paymentIntiateResponse, 'qrString')}
                viewBox={`0 0 ${256} ${500}`}
              />
            </ErrorBoundary>
          )}

          <Stack flexDirection="column" justifyContent="center">
            <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 2 }}>
              Transaction Id: {transactionId}
            </Typography>
            <MyTimer expiryTimestamp={time} onClose={() => console.log('timeout')} />
          </Stack>

          <Box
            sx={{
              display: 'flex',
              gap: 2, // equivalent to space-x-8
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
              width: '100%',
              aspectRatio: '3 / 2',
              objectFit: 'contain',
            }}
          >
            <img
              src={'/assets/images/upi.jpeg'}
              alt="UPI"
              style={{ width: isMobile ? '60px' : '70px', marginRight: '8px' }}
            />
            <img
              src={'/assets/images/gpay.png'}
              alt="GPay"
              style={{ width: isMobile ? '60px' : '70px' }}
            />
            <img
              src={'/assets/images/phonepe.jpeg'}
              alt="PhonePe"
              style={{ width: '85px', height: '35px' }}
            />
            <img
              src={'/assets/images/paytm.jpeg'}
              alt="Paytm"
              style={{ width: isMobile ? '60px' : '70px' }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
              mb: 1,
            }}
          >
            <Button
              sx={{
                backgroundColor: 'red',
                padding: '0.5rem',
                marginTop: '0.5rem',
                borderRadius: 'lg',
                width: '12rem',
                textAlign: 'center',
                color: 'white',
                marginLeft: 'auto',
                marginRight: 'auto',
                '&:hover': {
                  backgroundColor: 'red',
                },
              }}
              onClick={() => handleWarningWithAlert()}
            >
              Cancel
            </Button>

            {isShowCheckManuallyBtn && (
              <>
                {!checkManuallyLoading ? (
                  <Button
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.300',
                      padding: '0.5rem',
                      borderRadius: 'lg',
                      width: '12rem',
                      textAlign: 'center',
                      color: 'primary.300',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                    onClick={async () => {
                      setCheckManuallyLoading(true);
                      try {
                        await callVerifyPaymentApi(true);
                      } catch (error) {
                        console.log(error);
                      } finally {
                        setCheckManuallyLoading(false);
                      }
                    }}
                  >
                    Check manually
                  </Button>
                ) : (
                  <Box
                    sx={{
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <ThreeDots
                      height="40"
                      width="100"
                      radius="9"
                      color="#5a0a45"
                      ariaLabel="three-dots-loading"
                      wrapperStyle={{}}
                      wrapperClassName=""
                      visible={true}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Stack>
      </Stack>
    </DialogComponent>
  );
};

export default RechargeQRDialog;
