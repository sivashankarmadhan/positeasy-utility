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
import { REFUND_STATUS, PaymentModeTypeConstantsCart } from 'src/constants/AppConstants';
// ----------------------------------------------------------------------

function AddRefundPayment({ isOpenModal, closeModal, postPayment, orderDetails, selectedList }) {
  const theme = useTheme();
  const [viewMore, setViewMore] = useState(false);

  const orderAmount = reduce(
    get(selectedList, 'payments'),
    (acc, value) => acc + value?.paidAmount,
    0
  );

  const LoginSchema = Yup.object().shape({
    amount: Yup.string().when('type', {
      is: (value) => value === REFUND_STATUS.FULL_REFUND,
      then: (schema) => Yup.string(),
      otherwise: (schema) =>
        Yup.string()
          .required(ErrorConstants.AMOUNT_IS_REQUIRED)
          .matches(RegexValidation.POSITIVE_NUMBER, ErrorConstants.AMOUNT_IS_POSITIVE_NUMBER)
          .test('is-greater-than-zero', ErrorConstants.AMOUNT_IS_REQUIRED, (value) => {
            return Number(value) > 0;
          }),
    }),
    type: Yup.string().required(),
  });

  const defaultValues = {
    amount: '',
    type: REFUND_STATUS.FULL_REFUND,
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
    postPayment(
      get(data, 'type') === REFUND_STATUS.FULL_REFUND
        ? { ...data, amount: orderAmount / 100 }
        : data,
      reset
    );
  };
  console.log(errors);
  return (
    <Dialog open={isOpenModal} onClose={closeModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 340, sm: 400 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add refund payment
          </Typography>

          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>Total Order Amount</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>
              {fCurrency(orderAmount / 100) || '-'}
            </Typography>
          </Stack>

          <Stack sx={{ flexDirection: 'row', gap: 2 }}>
            <RHFRadioGroup
              row={true}
              name={'type'}
              options={[{ label: REFUND_STATUS.FULL_REFUND, value: REFUND_STATUS.FULL_REFUND }]}
            />{' '}
            <RHFRadioGroup
              row={true}
              name={'type'}
              options={[{ label: REFUND_STATUS.PARTIAL, value: REFUND_STATUS.PARTIAL }]}
            />
          </Stack>

          <Stack gap={2}>
            {get(values, 'type') === REFUND_STATUS.PARTIAL && (
              <RHFTextField
                autoFocus
                size="small"
                label="Amount"
                name="amount"
                sx={{ width: '100%', mt: 1 }}
              />
            )}
            {get(values, 'type') === REFUND_STATUS.PARTIAL && (
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
                  {fCurrency((orderAmount - Number(get(values, 'amount')) * 100) / 100) || '-'}
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

export default AddRefundPayment;
