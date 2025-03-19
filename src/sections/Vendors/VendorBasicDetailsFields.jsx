import { Stack, Typography } from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import React from 'react';
import { RHFTextField } from 'src/components/hook-form';

const VendorBasicDetailsFields = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Stack flexDirection={isMobile ? 'column' : 'row'}>
      <Stack flexDirection="column" gap={3} width="100%" mb={isMobile ? 3 : 0}>
        <Stack flexDirection="row" gap={3}>
          <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>Name</Typography>
          <RHFTextField size="small" name="name" sx={{ width: isMobile ? '70%' : '50%' }} />
        </Stack>
        <Stack flexDirection="row" gap={3}>
          <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>Company Name</Typography>
          <RHFTextField size="small" name="companyName" sx={{ width: isMobile ? '70%' : '50%' }} />
        </Stack>
        <Stack flexDirection="row" gap={3}>
          <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>Contact Number</Typography>
          <RHFTextField
            size="small"
            name="contactNumber"
            sx={{ width: isMobile ? '70%' : '50%' }}
          />
        </Stack>
        <Stack flexDirection="row" gap={3}>
          <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>Email</Typography>
          <RHFTextField size="small" name="email" sx={{ width: isMobile ? '70%' : '50%' }} />
        </Stack>
      </Stack>

      <Stack flexDirection="column" gap={3} width="100%">
        <Stack flexDirection="row" gap={3}>
          <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>FSSAI Lic No</Typography>
          <RHFTextField
            size="small"
            name="vendorInfo.fssaiLicNo"
            sx={{ width: isMobile ? '70%' : '50%' }}
          />
        </Stack>
        <Stack flexDirection="row" gap={3}>
          <Typography sx={{ width: '8rem', fontWeight: 'bold' }}>GST No</Typography>
          <RHFTextField
            size="small"
            name="vendorInfo.gstNo"
            sx={{ width: isMobile ? '70%' : '50%' }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default VendorBasicDetailsFields;
