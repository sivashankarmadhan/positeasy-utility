import { yupResolver } from '@hookform/resolvers/yup';
import DiamondIcon from '@mui/icons-material/Diamond';
import { Button, Card, Divider, IconButton, Stack, Typography } from '@mui/material';
import { get } from 'lodash';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Form from 'src/components/subscriptionPlan/Form';
import * as Yup from 'yup';

// { selectedPlan, isOpenForm }

export default function UpgradePlan({ selectedPlan, isOpenForm, couponDetails }) {
  const [continuePayment, isContinuePayment] = useState(false);

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string(),
    lastName: Yup.string(),
    email: Yup.string(),
    address: Yup.string(),
    contactNumber: Yup.string(),
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: '',
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const discountAmount =
    couponDetails?.discountType === 'Flat'
      ? couponDetails?.value
      : (selectedPlan?.totalAmount * couponDetails?.value) / 100;

      const finalAmount = parseFloat(
        (selectedPlan?.totalAmount - (discountAmount || 0)).toFixed(2)
      );
  const {
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;
  const planType = selectedPlan?.type;
  const durationText = planType === 'monthly' ? '1 Month' : '12 Months';
  // const onSubmit = (data) => {
  //   console.log(data, 'data');
  // };
  console.log('selectedPlannnnn', selectedPlan);
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 2 },
        p: 2,
        width: '100%',
        // minHeight: '100%',
        alignItems: { xs: 'center', md: 'flex-start' },
        justifyContent: { xs: 'center', md: 'space-between' },
      }}
    >
      <Stack
        sx={{
          width: { xs: '100%', md: '47%' },
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        <Form
          continuePayment={continuePayment}
          isContinuePayment={isContinuePayment}
          sx={{ width: '100%' }}
          selectedPlan={selectedPlan}
          isOpenForm={isOpenForm}
        />
      </Stack>
      {/* <Stack sx={{ width: '6%' }}> */}
      <Divider orientation="vertical" flexItem />
      {/* </Stack> */}
      <Stack
        sx={{
          width: { xs: '100%', md: '47%' },
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          // m: 4,
          justifyContent: 'flex-start',
        }}
      >
        <Typography fontSize={20} fontWeight={700} sx={{ py: 2, maxWidth: '100%' }}>
          Order Summary
        </Typography>
        <Divider />

        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            py: 2,
            gap: { md: 6, xs: 2 },
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
            <Stack sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                sx={{
                  width: 38,
                  height: 38,
                  background: '#eeee',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <DiamondIcon fontSize="16px" />
              </IconButton>
            </Stack>
            <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
              <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                <Typography variant="h4">{selectedPlan.planName || 'Plan Name'}</Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ px: '4px', py: '0px', fontSize: '10px', height: '20px' }}
                >
                  Best offer
                </Button>
              </Stack>
              <Typography sx={{ color: '#5a0a45', fontSize: '11px', fontWeight: '700' }}>
                {selectedPlan.description || 'Plan Description'}
              </Typography>
            </Stack>
          </Stack>
          <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '16px', sm: '20px' } }}>
              ₹ {selectedPlan?.totalAmount || 'amount'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
              {durationText}
            </Typography>
          </Stack>
        </Stack>
        <Divider />
        <Stack sx={{ display: 'flex', flexDirection: 'column', py: 2 }}>
          <Stack
            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', pb: 2 }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>GST</Typography>

            <Stack flexDirection="row" alignItems="center" gap={0.7}>
              <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>
                ₹{get(selectedPlan, 'totalAmount') - get(selectedPlan, 'amount') || 0}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '12px' }}>
                ({`${get(selectedPlan, 'GST') || 0}%`})
              </Typography>
            </Stack>
          </Stack>
          <Stack
            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', pb: 2 }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>Subtotal</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>
              ₹{selectedPlan?.amount}
            </Typography>
          </Stack>
        </Stack>
        {couponDetails && (
          <>
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                pb: 2,
                color: 'green',
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>Discount </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>
                {couponDetails?.discountType === 'Flat'
                  ? `₹${couponDetails?.value}`
                  : `${couponDetails?.value}%`}
              </Typography>
            </Stack>
            <Divider />
          </>
        )}
        <Divider />
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
          }}
        >
          <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '16px' }}>Total</Typography>
            <Typography sx={{ fontSize: '14px' }}>Including GST taxes</Typography>
          </Stack>
          <Typography variant="h3">₹{finalAmount}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
