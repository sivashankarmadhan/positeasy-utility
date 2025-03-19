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
import { ORDER_STATUS, PaymentModeTypeConstantsCart } from 'src/constants/AppConstants';
// ----------------------------------------------------------------------

function AddPayment({
  isOpenModal,
  closeModal,
  postPayment,
  orderDetails,
  selectedList,
  creditPayment,
  isPaymentRefundDone,
}) {
  const theme = useTheme();
  const [viewMore, setViewMore] = useState(false);
  const totalPartialPayments = reduce(
    get(orderDetails, 'paymentsInfo'),
    (acc, value) => acc + value?.paidAmount,
    0
  );
  const orderAmount = get(selectedList, 'orderAmount');
  const isCredit = get(selectedList, 'type') === ORDER_STATUS.CREDIT;

  const LoginSchema = Yup.object().shape({
    amount: Yup.string().when('type', {
      is: (value) => value === ORDER_STATUS.FULL_PAYMENT,
      then: (schema) => Yup.string(),
      otherwise: (schema) =>
        Yup.string()
          .required(ErrorConstants.AMOUNT_IS_REQUIRED)
          .matches(RegexValidation.POSITIVE_NUMBER, ErrorConstants.AMOUNT_IS_POSITIVE_NUMBER)
          .test('is-greater-than-zero', ErrorConstants.AMOUNT_IS_REQUIRED, (value) => {
            return Number(value) > 0;
          }),
    }),
    mode: Yup.string().required(ErrorConstants.PAYMENT_MODE),
    type: Yup.string().required(),
  });

  const defaultValues = {
    amount: '',
    mode: '',
    type: ORDER_STATUS.FULL_PAYMENT,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;
  const values = watch();

  const onSubmit = async (data) => {
    {
      isCredit
        ? creditPayment(
            get(data, 'type') === ORDER_STATUS.FULL_PAYMENT
              ? { ...data, amount: (orderAmount - totalPartialPayments) / 100 }
              : data,
            reset,
            orderAmount <= totalPartialPayments + Number(get(data, 'amount', 0) * 100)
          )
        : postPayment(
            get(data, 'type') === ORDER_STATUS.FULL_PAYMENT
              ? { ...data, amount: (orderAmount - totalPartialPayments) / 100 }
              : data,
            reset,
            orderAmount <= totalPartialPayments + Number(get(data, 'amount', 0) * 100)
          );
    }
  };
  console.log(errors);
  return (
    <Dialog open={isOpenModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
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

          {isCredit ? (
            <Stack>
              {' '}
              <RHFRadioGroup
                row={true}
                name={'type'}
                options={[{ label: ORDER_STATUS.FULL_PAYMENT, value: ORDER_STATUS.FULL_PAYMENT }]}
              />
            </Stack>
          ) : (
            <Stack sx={{ flexDirection: 'row', gap: 2 }}>
              <RHFRadioGroup
                row={true}
                name={'type'}
                options={[{ label: ORDER_STATUS.FULL_PAYMENT, value: ORDER_STATUS.FULL_PAYMENT }]}
              />{' '}
              <RHFRadioGroup
                row={true}
                name={'type'}
                options={[{ label: ORDER_STATUS.PARTIAL, value: ORDER_STATUS.PARTIAL }]}
              />
            </Stack>
          )}
          <Stack gap={2}>
            {get(values, 'type') === ORDER_STATUS.PARTIAL && (
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
            {get(values, 'type') === ORDER_STATUS.PARTIAL && (
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
            <Button size="large" variant="text" onClick={closeModal}>
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

export default AddPayment;
