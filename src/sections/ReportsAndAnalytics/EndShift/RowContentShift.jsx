import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

const RowContentShift = ({ name, value, isBold, color }) => {
  const theme = useTheme();
  return (
    <Stack flexDirection="row" justifyContent={'space-between'} width={'50%'} px={2} pr={3}>
      <Typography
        sx={{
          fontSize: '16px',
          paddingY: '6px',
          opacity: isBold ? '100%' : '50%',
        }}
        align="left"
      >
        {name}
      </Typography>

      <Typography
        sx={{
          fontSize: '14px',
          paddingY: '6px',
          color: color || (isBold ? theme.palette.primary.main : 'black'),
          fontWeight: isBold ? 'bold' : '400',
 
        }}
        align="right"
      >
        {value}
      </Typography>
    </Stack>
  );
};

export default RowContentShift;
