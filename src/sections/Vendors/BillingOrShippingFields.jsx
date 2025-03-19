import { Stack, Typography } from '@mui/material';
import React from 'react';
import { RHFTextField } from 'src/components/hook-form';

const BillingOrShippingFields = ({ name }) => {
  return (
    <>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '15rem', fontWeight: 'bold' }}>Country / Region</Typography>
        <RHFTextField
          size="small"
          name={`vendorInfo.${name}.countryOrRegion`}
          sx={{ width: '100%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '15rem', fontWeight: 'bold' }}>Address</Typography>
        <RHFTextField
          size="small"
          name={`vendorInfo.${name}.address`}
          sx={{ width: '100%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
          multiline
          minRows={4}
        />
      </Stack>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '15rem', fontWeight: 'bold' }}>City</Typography>
        <RHFTextField
          size="small"
          name={`vendorInfo.${name}.city`}
          sx={{ width: '100%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '15rem', fontWeight: 'bold' }}>State</Typography>
        <RHFTextField
          size="small"
          name={`vendorInfo.${name}.state`}
          sx={{ width: '100%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
      <Stack flexDirection="row" gap={3}>
        <Typography sx={{ width: '15rem', fontWeight: 'bold' }}>Zip Code</Typography>
        <RHFTextField
          size="small"
          name={`vendorInfo.${name}.zipCode`}
          sx={{ width: '100%' }}
          InputLabelProps={{ shrink: true }}
          placeholder="Optional"
        />
      </Stack>
    </>
  );
};

export default BillingOrShippingFields;
