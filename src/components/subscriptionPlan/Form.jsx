import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  Box,
  TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import * as Yup from 'yup';
// import Pay from '../../assets/icons/Pay.jpg';
// import Gpay from '../../assets/icons/Gpay.webp';
// import Paytm from '../../assets/icons/Paytm.png';
// import Phonepay from '../../assets/icons/Phonepay.png';
import { ThreeDots } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { alertDialogInformationState, couponDetailsState } from 'src/global/recoilState';
import RechargeErrorDialog from 'src/sections/WhatsappCredits/RechargeErrorDialog';
import RechargeSuccessDialog from 'src/sections/WhatsappCredits/RechargeSuccessDialog';
import SubscriptionPlan_API from 'src/services/API/SubscriptionServices';
import AmazonPay from '../../assets/icons/AmazonPay.png';
import GPay from '../../assets/icons/GPay.png';
import Paytm from '../../assets/icons/Paytm.png';
import PhonePay from '../../assets/icons/Phonepay.png';
import PaymentDialog from './PaymentDialog';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';

export default function Form({
  continuePayment,
  isContinuePayment,
  subscriptionId,
  selectedPlan,
  isOpenForm,
  couponData,
}) {
  const theme = useTheme(); // Define theme
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState('upi');
  const [timer, setTimer] = useState(180);
  const [upiIntent, setUpiIntent] = useState('');
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [cancelTransactionLoading, setCancelTransactionLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isProceedClicked, setIsProceedClicked] = useState(false);
  const [couponDetails, setCouponDetails] = useRecoilState(couponDetailsState);

  console.log('upiIntentttt', upiIntent);
  const handleChange = (event) => {
    setPaymentMethods(event.target.value);
  };

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string(),
    lastName: Yup.string(),
    email: Yup.string(),
    address: Yup.string(),
    contactNumber: Yup.string(),
  });
  console.log(isContinuePayment, 'false');
  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: '',
    vpaAddress: '',
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const handleClick = () => {
    isContinuePayment(true);
  };
  const fetchPaymentData = async () => {
    try {
      setIsQrLoading(true);
      //const subscriptionId = 'YOUR_SUBSCRIPTION_ID'; // Replace with actual subscription ID
      const data = await SubscriptionPlan_API.initiatePayment(
        selectedPlan.subscriptionId,
        couponDetails ? { couponInfo: couponDetails } : {}
      );
      console.log('dataaaa', data.data.data);
      setUpiIntent(data.data.data.upiIntent);
      setTransactionId(data.data.data.transactionId);
      setAmount(data.data.data.amount);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsQrLoading(false);
    }
  };
  const callVerifyPaymentApi = async (isCheckStatusFlow) => {
    try {
      if (!transactionId) return;

      const options = { paymentId: transactionId };
      let response;

      if (isCheckStatusFlow) {
        response = await SubscriptionPlan_API.SubscriptionVerifyPayment(options);
      } else {
        response = await SubscriptionPlan_API.SubscriptionVerifyPaymentLocal(options);
      }

      const paymentState = response.data?.data?.paymentState || response.data?.paymentStatus;

      if (paymentState === 'COMPLETED') {
        setSuccessDialogOpen(true); // Show success dialog
      } else if (paymentState === 'FAILED') {
        setErrorDialogOpen(true); // Show error dialog
      } else if (paymentState === 'PENDING') {
        console.log('Payment is still pending.'); // Handle pending state if needed
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };
  const handleOpenConfirmationDialog = () => {
    setOpenConfirmationDialog(true);
  };

  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false);
  };
  const handleProceedToPay = async () => {
    setIsProceedClicked(true);
  
    if (coupon.trim()) {
      try {
        const response = await SubscriptionPlan_API.getCouponValidDetails({ code: coupon });
  
        if (response?.data?.code) {

          const discountValue = Number(response.data.value);
          const discountType = response.data.discountType;
          const totalAmount = Number(selectedPlan?.totalAmount);
          if (
          (discountType === 'Flat' && discountValue >= totalAmount) ||
          (discountType === 'Percentage' && (totalAmount * discountValue) / 100 >= totalAmount)
        ) {
          toast.error(ErrorConstants.ERROR_COUPON_INVALID);          
          setIsProceedClicked(false);
          return;
        }
          toast.success(SuccessConstants.COUPON_APPLIED_SUCCESS);
          setIsCouponApplied(true);
          setCouponDetails({
            name: response.data.name, 
            value: response.data.value, 
            code: response.data.code,
            discountType: response.data.discountType
        });

        } else {
          toast.error(ErrorConstants.ERROR_COUPON_INVALID);
          setIsCouponApplied(false);
          setIsProceedClicked(false);
          return; 
        }
      } catch (error) {
        toast.error(ErrorConstants.ERROR_COUPON);
        setIsProceedClicked(false);
        return;
      }
    } else {
      fetchPaymentData(null);

    }
  };

  const handleCancelTransaction = async () => {
    setCancelTransactionLoading(true);
    try {
      const response = await SubscriptionPlan_API.SubscriptionCancelTransaction({
        paymentId: transactionId,
      });
      toast.error(get(response, 'data.message', 'Payment Canceled by User'));

      isOpenForm(true);
    } catch (error) {
      console.error('Error:', error);
      toast.error(ErrorConstants.ERROR_COUPON_CANCELED);
    } finally {
      setCancelTransactionLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethods === 'upi') {
      fetchPaymentData();
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000); // Update every second

      return () => clearInterval(intervalId);
    }
  }, [timer]);

  // useEffect(() => {
  //   if (timer % 60 === 0 && timer !== 180) {
  //     fetchPaymentData(); // Refresh QR code every minute, excluding initial setup
  //   }
  // }, [timer]);

  useEffect(() => {
    if (timer === 0) {
      handleCancelTransaction(); // Automatically cancel when timer runs out
    }
  }, [timer]);

  useEffect(() => {
    let verificationInterval;
    if (transactionId) {
      verificationInterval = setInterval(() => {
        callVerifyPaymentApi(true);
      }, 30000); // Check payment status every 30 seconds
    }
    return () => clearInterval(verificationInterval);
  }, [transactionId]);
  
  useEffect(() => {
    if (couponDetails !== null) {
        fetchPaymentData(couponDetails);
    }
  }, [couponDetails]);

  useEffect(() => {
    if (isOpenForm) {
      setTransactionId('');
      setUpiIntent('');
      setAmount(0);
      setCoupon('');
      setIsCouponApplied(false);
      setCouponDetails(null);
      setSuccessDialogOpen(false);
      setErrorDialogOpen(false);
      setIsProceedClicked(false);
    }
  }, [isOpenForm]);
  
  const handleOpenPaymentDialog = () => {
    setOpenPaymentDialog(true);
  };
  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };

  console.log('successDialogOpennnnnn', successDialogOpen);
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

  return (
    <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* {!continuePayment && (
        <FormProvider methods={methods} onSubmit={handleSubmit()}>
          <Stack>
            <Typography fontSize={16} fontWeight={700} sx={{ pb: 2 }}>
              Contact Details
            </Typography>

            <Grid container gap={2} sx={{ justifyContent: 'space-between' }}>
              <Grid item xs={12} md={5.6}>
                <RHFTextField name="firstName" label="First Name" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={5.6}>
                <RHFTextField name="lastName" label="Last Name" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={12}>
                <RHFTextField name="email" label="Email" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={12}>
                <RHFTextField name="phoneNumber" label="Phone number" size="small" fullWidth />
              </Grid>
            </Grid>
          </Stack>
          <Stack>
            <Typography fontSize={16} fontWeight={700} sx={{ py: 2 }}>
              Communication Address
            </Typography>

            <Grid container gap={2} sx={{ justifyContent: 'space-between' }}>
              <Grid item xs={12} md={12}>
                <RHFTextField name="doorNo" label="Door No" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={12}>
                <RHFTextField name="address" label="Address" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={5.6}>
                <RHFTextField name="city" label="City" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={5.6}>
                <RHFTextField name="state" label="State" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={5.6}>
                <RHFTextField name="postalCode" label="Postal Code" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={5.8}>
                <RHFTextField name="LandMark" label="Famous LandMark" size="small" fullWidth />
              </Grid>
            </Grid>
          </Stack>
          <Stack sx={{ display: 'flex', py: 2, alignItems: 'flex-end' }}>
            <Button variant="contained" onClick={handleClick}>
              Continue
            </Button>
          </Stack>
        </FormProvider>
      )} */}
      {!continuePayment && (
        <Stack
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <Typography fontSize={20} fontWeight={700} sx={{ py: 2, maxWidth: '100%' }}>
            Payment
          </Typography>
          <Divider />
          <Typography variant="body2" fontWeight={700} sx={{ py: 2 }}>
            Pay With:
          </Typography>
          <FormControl sx={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 1 }}>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              <FormControlLabel
                value={'upi'}
                checked={paymentMethods === 'upi'}
                onChange={handleChange}
                control={<Radio />}
                label="UPI"
              />
              {/* <FormControlLabel
                value={'vpa'}
                onChange={handleChange}
                checked={paymentMethods === 'vpa'}
                control={<Radio />}
                label="VPA"
              /> */}
            </RadioGroup>
          </FormControl>
          {paymentMethods === 'upi' && (
            <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
              <Stack
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  mt: 1,
                  mb: 2,
                }}
              >
                <Card
                  sx={{
                    width: '55px',
                    height: '30px',
                    borderRadius: '4px',
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img src={AmazonPay} style={{}} />
                </Card>
                <Card
                  sx={{
                    width: '55px',
                    height: '30px',
                    borderRadius: '4px',
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={GPay}
                    style={{
                      // width: '45px',
                      // height: '35px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </Card>
                <Card
                  sx={{
                    width: '55px',
                    height: '30px',
                    borderRadius: '4px',
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={PhonePay}
                    style={{
                      // width: '40px',
                      // height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </Card>
                <Card
                  sx={{
                    width: '55px',
                    height: '30px',
                    borderRadius: '4px',
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={Paytm}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </Card>
              </Stack>
              {!isProceedClicked && (
                <Stack spacing={2} width="100%">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Enter Coupon Code"
                      variant="outlined"
                      fullWidth
                      value={coupon}
                      onChange={(e) => {
                        setCoupon(e.target.value);
                        setIsCouponApplied(false);
                      }}
                    />
                  </Stack>

                  <Button variant="contained" color="primary" onClick={handleProceedToPay}>
                    Proceed to Pay
                  </Button>
                </Stack>
              )}
              {isProceedClicked && (
                <Stack
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    border: '1px solid #dadde9',
                    alignItems: 'center',
                    borderRadius: '4px',
                    mb: 2,
                  }}
                >
                  <Stack sx={{ p: 3 }}>
                    {upiIntent && !isQrLoading ? (
                      <QRCode
                        // size={256}
                        style={{ height: 150, width: 150 }}
                        value={upiIntent || ''}
                        viewBox={`0 0 126 126`}
                      />
                    ) : (
                      <ThreeDots
                        height="150"
                        width="100"
                        radius="9"
                        color="#5a0a45"
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        wrapperClassName=""
                        visible={true}
                      />
                    )}
                  </Stack>
                </Stack>
              )}
              {isProceedClicked && (
                <>
                  <Typography variant="caption" my={2}>
                    Your personal data will be used to process your order, support your experience
                    throughout this website, and for other purposes described in our privacy policy.
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'textSecondary',
                      fontWeight: 'bold', // Make the text bold
                      fontSize: '16px',
                      padding: '8px',
                    }}
                  >
                    Time remaining: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      width: '100%',
                      backgroundColor: '#f44336', // Full red color for the button
                      color: '#fff', // White text color
                      '&:hover': {
                        backgroundColor: '#d32f2f', // Darker red for hover effect
                      },
                    }}
                    onClick={() => handleWarningWithAlert()}
                    disabled={cancelTransactionLoading}
                  >
                    Cancel Transaction
                  </Button>
                </>
              )}
            </Stack>
          )}
          {/* {paymentMethods === 'vpa' && (
            <FormProvider methods={methods}>
              <Typography fontWeight={700} mb={2}>
                VPA address
              </Typography>
              <RHFTextField
                name="vpaAddress"
                label="VPA address"
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                sx={{ width: '100%', mb: 2 }}
                onClick={() => handleOpenPaymentDialog()}
              >
                Pay
              </Button>
              <Typography variant="caption">
                Your personal data will be used to process your order, support your experience
                throughout this website, and for other purposes described in our privacy policy.
              </Typography>
            </FormProvider>
          )} */}

          <PaymentDialog open={openPaymentDialog} handleClose={handleClosePaymentDialog} />
        </Stack>
      )}
      <RechargeSuccessDialog
        open={successDialogOpen}
        onClose={() => {
          setSuccessDialogOpen(false);
          isOpenForm(true);
        }}
        amount={amount / 100}
      />
      <RechargeErrorDialog
        open={errorDialogOpen}
        onClose={() => {
          setErrorDialogOpen(false);
          isOpenForm(true);
        }}
        amount={amount / 100}
      />
    </Stack>
  );
}
