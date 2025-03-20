import React, { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { Box, Stack, Switch, Typography, useTheme } from '@mui/material';

const FDAutoEnableDialog = ({ DateTimePickerName }) => {
  const theme = useTheme();

  const [date, setDate] = useState(null);
  const [enableDate, setEnableDate] = useState(false);

  return (
    <Stack flexDirection="row" alignItems="center" gap={2}>
      <Stack flexDirection="row" alignItems="center">
        {!enableDate && <Typography variant="subtitle1">Auto enable on</Typography>}
        <Switch
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: theme.palette.primary.light,
            },
            '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
              backgroundColor: theme.palette.primary.light,
            },
            mx: 1.35,
          }}
          checked={enableDate}
          onChange={() => {
            if (enableDate) {
              setDate(null);
            } else {
              setDate(dayjs());
            }
            setEnableDate(!enableDate);
          }}
        />
      </Stack>

      {enableDate && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={['DatePicker', 'DatePicker']}>
            <DateTimePicker
              format="YY-MM-DD hh:mm A"
              label="Auto enable on at"
              defaultValue={null}
              name={DateTimePickerName}
              minDateTime={dayjs().subtract(1, 'minute')}
              value={date}
              onChange={(newValue) => setDate(newValue)}
              disabled={!enableDate}
            />
          </DemoContainer>
        </LocalizationProvider>
      )}
    </Stack>
  );
};

export default FDAutoEnableDialog;
