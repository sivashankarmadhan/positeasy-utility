import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFRadioGroup, RHFSelect, RHFTextField } from 'src/components/hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import { Button, Card, Dialog, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { findLastIndex, get, map, reduce } from 'lodash';
import { fCurrency } from 'src/utils/formatNumber';
import { convertTimeTo12HourFormat, dateFormat, fDate, formatTime } from 'src/utils/formatTime';
import { useEffect, useState } from 'react';
import {
  PURCHASE_ORDER_PAYMENT_TYPE,
  PaymentModeTypeConstantsCart,
} from 'src/constants/AppConstants';
import { alertDialogInformationState } from 'src/global/recoilState';
import { useSetRecoilState } from 'recoil';
// ----------------------------------------------------------------------

function AddPaymentForPurchaseOrder({ isOpenModal, closeModal, postPayment, orderDetails }) {
  const theme = useTheme();
  const [viewMore, setViewMore] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  console.log('orderDetails', orderDetails);

  const totalPartialPayments = reduce(
    get(orderDetails, 'purchaseBills'),
    (acc, value) => acc + value?.paidAmount,
    0
  );
  const orderAmount = get(orderDetails, 'data.amount');

  const LoginSchema = Yup.object().shape({
    amount: Yup.string().when('type', {
      is: (value) => value === PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
      then: (schema) => Yup.string(),
      otherwise: (schema) =>
        Yup.string()
          .required(ErrorConstants.AMOUNT_IS_REQUIRED)
          .matches(RegexValidation.POSITIVE_NUMBER, ErrorConstants.AMOUNT_IS_POSITIVE_NUMBER),
    }),
    mode: Yup.string().required(ErrorConstants.PAYMENT_MODE),
    type: Yup.string().required(),
  });

  const defaultValues = {
    amount: '',
    mode: '',
    type: PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;
  const values = watch();
  console.log('values', values);

  const onSubmit = async (data) => {
    postPayment(
      get(data, 'type') === PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT
        ? { ...data, amount: orderAmount - totalPartialPayments }
        : { ...data, amount: get(data, 'amount') * 100 },
      reset,
      orderAmount <= totalPartialPayments + Number(get(data, 'amount', 0) * 100)
    );
  };

  useEffect(() => {
    if (isOpenModal?.status && isOpenModal?.paymentType === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL) {
      setValue('type', PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL);
    }
  }, [isOpenModal]);

  const handleSubmitWithAlert = (onSubmit) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Purchase order will be closed`,
      actions: {
        primary: {
          text: 'Confirm',
          onClick: async (onClose) => {
            onSubmit();
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
    <Dialog open={isOpenModal?.status}>
      <FormProvider
        methods={methods}
        onSubmit={handleSubmit((data) => {
          if (PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT === get(data, 'type')) {
            handleSubmitWithAlert(() => {
              onSubmit(data, reset);
            });
          } else {
            onSubmit(data, reset);
          }
        })}
      >
        <Card sx={{ p: 2, width: { xs: 340, sm: 400 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Payment
          </Typography>
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography>Total Order Amount</Typography>
            <Typography>{fCurrency(orderAmount / 100) || '-'}</Typography>
          </Stack>

          <Stack
            sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography>
              Previous Total Paid
              <Typography
                onClick={() => setViewMore(!viewMore)}
                variant="caption"
                display={'inline'}
                sx={{
                  ml: 1,
                  fontSize: '10px',
                  '&:hover': { textDecoration: 'underline', fontWeight: 'bold' },
                }}
              >
                {viewMore ? 'Close' : 'View Payments'}
              </Typography>
            </Typography>
            <Typography>- {fCurrency(totalPartialPayments / 100) || '-'}</Typography>
          </Stack>
          {viewMore && (
            <div>
              {map(get(orderDetails, 'paymentsInfo'), (e) => (
                <Stack
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: theme.palette.primary.main,
                  }}
                >
                  <Stack flexDirection={'row'} sx={{ gap: 2 }}>
                    <Typography variant="caption">
                      {`${dateFormat(get(e, 'createdAt'))}
                  ${formatTime(get(e, 'createdAt'))}`}
                    </Typography>
                    <Typography variant="caption">{e?.mode || '-'}</Typography>
                  </Stack>
                  <Typography variant="caption">{fCurrency(e?.paidAmount / 100) || '-'}</Typography>
                </Stack>
              ))}
            </div>
          )}
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              my: 1,
            }}
          >
            <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Pay Balance </Typography>
            <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
              {fCurrency((orderAmount - totalPartialPayments) / 100) || '-'}
            </Typography>
          </Stack>
          <RHFRadioGroup
            row={true}
            name={'type'}
            options={[
              {
                label: PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
                value: PURCHASE_ORDER_PAYMENT_TYPE.FULL_PAYMENT,
              },
              {
                label: 'PARTIAL',
                value: PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL,
              },
            ]}
          />
          <Stack gap={2}>
            {get(values, 'type') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL && (
              <RHFTextField
                autoFocus
                size="small"
                label="Amount"
                name="amount"
                sx={{ width: '100%', mt: 1 }}
              />
            )}
            <RHFSelect name={'mode'} variant="outlined" label="Payment mode" size="small">
              {map(PaymentModeTypeConstantsCart, (e) => (
                <MenuItem key={e.name} value={e.name}>
                  {e.name}
                </MenuItem>
              ))}
            </RHFSelect>
            {get(values, 'type') === PURCHASE_ORDER_PAYMENT_TYPE.PARTIAL && (
              <Stack
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  mb: 1,
                  gap: 1,
                }}
              >
                <Typography variant="caption">Remaining Balance: </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {fCurrency(
                    (orderAmount - (totalPartialPayments + Number(get(values, 'amount')) * 100)) /
                      100
                  ) || '-'}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button
              size="large"
              variant="text"
              onClick={() => {
                closeModal();
                reset();
              }}
            >
              Cancel
            </Button>
            <LoadingButton size="large" type="submit" variant="contained">
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default AddPaymentForPurchaseOrder;
