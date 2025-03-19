import { Stack, TextField } from '@mui/material';
import React from 'react';

import { CustomCodeMode, CustomerCodeMode } from 'src/global/SettingsState';
import { useRecoilValue } from 'recoil';

const FiltersGst = ({
  handleCustomCode,
  handleCustomerId,
  startDate,

  endDate,
}) => {
  return (
    <Stack
      sx={{
        display: { xs: 'grid', sm: 'flex' },
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: { xs: 'center', sm: 'flex-end' },
        gridTemplateColumns: 'repeat(2, 1fr)',
      }}
      gap={1}
    ></Stack>
  );
};

export default FiltersGst;
