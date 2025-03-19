import { Box, Chip, Stack, Typography } from '@mui/material';
import React from 'react';
import { toFixedIfNecessary } from '../../../src/utils/formatNumber';

const TrendingItem = ({ logo, title, value, category, isPrimary }) => {
  return (
    <Stack flexDirection="row" justifyContent="space-between">
      <Stack gap={1.5} flexDirection="row" alignItems="center">
        <Box
          sx={{
            borderRadius: '50%',
            backgroundColor: isPrimary ? '#f5deb2' : '#d8f3fe',
            height: '50px',
            width: '50px',
            overflow: 'hidden',
          }}
        >
          <img
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            src={logo}
          />
        </Box>

        <Box>
          <Chip
            label={category}
            sx={{
              backgroundColor: isPrimary ? '#5a0b45' : '#d8f3fe',
              height: '17px',
              color: isPrimary ? '#fff' : '#000',
              fontSize: '10px',
            }}
          />
          <Typography variant="subtitle2">{title}</Typography>
        </Box>
      </Stack>

      <Typography variant="h5">{value ? toFixedIfNecessary(value, 2) : ''}</Typography>
    </Stack>
  );
};

export default TrendingItem;
