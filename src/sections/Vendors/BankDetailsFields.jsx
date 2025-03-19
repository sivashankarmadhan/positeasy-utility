import { Stack, Typography } from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import React from 'react';
import { RHFTextField } from 'src/components/hook-form';

const BankDetailsFields = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Stack gap={3}>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>Beneficiary Name</Typography>
        <RHFTextField
          size="small"
          name="bankingInfo.beneficiaryName"
          sx={{ width: isMobile ? '50%' : '30%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>Bank Name</Typography>
        <RHFTextField
          size="small"
          name="bankingInfo.bankName"
          sx={{ width: isMobile ? '50%' : '30%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>Account Number</Typography>
        <RHFTextField
          size="small"
          name="bankingInfo.accountNumber"
          sx={{ width: isMobile ? '50%' : '30%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>IFSC</Typography>
        <RHFTextField
          size="small"
          name="bankingInfo.ifsc"
          sx={{ width: isMobile ? '50%' : '30%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
    </Stack>
  );
};

export default BankDetailsFields;
