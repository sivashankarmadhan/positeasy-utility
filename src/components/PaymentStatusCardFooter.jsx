import { Box, Divider, Stack, Typography } from '@mui/material';
import React from 'react';

const PaymentStatusCardFooter = ({ content1, content2, content3,content4 }) => {
  return (
    <>
      <Divider sx={{ borderStyle: 'dashed', mt: 2 }} />

      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
      >
        <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
          <Typography sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}>
            {content1?.svg}
            {content1?.label}
          </Typography>
          <Typography sx={{ typography: 'subtitle1' }}>{content1?.value}</Typography>
        </Box>

        <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
          <Typography sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}>
            {content2?.svg}
            {content2?.label}
          </Typography>
          <Typography sx={{ typography: 'subtitle1' }}>{content2?.value}</Typography>
        </Box>
        <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
          <Typography sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}>
            {content3?.svg}
            {content3?.label}
          </Typography>
          <Typography sx={{ typography: 'subtitle1' }}>{content3?.value}</Typography>
        </Box>
        <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
          <Typography sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}>
            {content4?.svg}
            {content4?.label}
          </Typography>
          <Typography sx={{ typography: 'subtitle1' }}>{content4?.value}</Typography>
        </Box>
      </Stack>
    </>
  );
};

export default PaymentStatusCardFooter;
