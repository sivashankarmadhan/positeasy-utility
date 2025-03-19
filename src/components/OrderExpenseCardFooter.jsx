import { Box, Divider, Stack, Typography } from '@mui/material';
import React from 'react';

const OrderExpenseCardFooter = ({ content1, content2, content3 }) => {
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
            {content1?.title}
          </Typography>
          <Typography sx={{ typography: 'subtitle1' }}>{content1?.value}</Typography>
        </Box>

        <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
          <Typography sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}>
            {content2?.svg}
            {content2?.title}
          </Typography>
          <Typography sx={{ typography: 'subtitle1' }}>{content2?.value}</Typography>
        </Box>
        <Box sx={{ py: 2, width: 1, textAlign: 'center' }}>
          <Typography sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}>
            {content3?.svg}
            {content3?.title}
          </Typography>
          <Typography sx={{ typography: 'subtitle1' }}>{content3?.value}</Typography>
        </Box>
      </Stack>
    </>
  );
};

export default OrderExpenseCardFooter;
