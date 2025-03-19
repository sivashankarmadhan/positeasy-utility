import { Box, Chip, Stack, Typography } from '@mui/material';
import { get, startCase } from 'lodash';
import React from 'react';
import { fCurrency } from 'src/utils/formatNumber';

const STATUS = {
  COMPLETED: {
    primary: '#47c61c',
    secondary: '#fff',
  },
  PENDING: {
    primary: '#ecebeb',
    secondary: '#a6a6a6',
  },
  CANCELLED: {
    primary: '#ffc703',
    secondary: '#fff',
  },
};

const TransactionItem = ({ title, value, status }) => {
  return (
    <Stack flexDirection="row" justifyContent="space-between">
      <Box>
        <Typography variant="subtitle2">{`Order #${title}`}</Typography>
        <Chip
          label={startCase(status?.toLowerCase())}
          sx={{
            backgroundColor: get(STATUS, `${status}.primary`),
            height: '17px',
            color: get(STATUS, `${status}.secondary`),
            fontSize: '10px',
            width: 80,
          }}
        />
      </Box>

      <Typography variant="h5">{fCurrency(value)}</Typography>
    </Stack>
  );
};

export default TransactionItem;
