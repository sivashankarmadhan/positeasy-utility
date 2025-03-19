import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Stack from '@mui/material/Stack';
import React from 'react';
import dayjs from 'dayjs';
import { TextField } from '@mui/material';

function StartAndEndDatePicker({ startDate, setStartDate, endDate, setEndDate }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack direction="row" gap={3} justifyContent={'flex-end'}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => {
            setStartDate(newValue);
            if (!endDate && newValue) {
              setEndDate(dayjs());
            }
          }}
          format="DD-MM-YYYY"
          sx={{
            '& .MuiInputBase-input': {
              height: '0.5rem', // Set your height here.
            },
            '& .MuiInputLabel-root': {
              bottom: '25px',
              top: 'unset',
            },
            width: '10.5rem',
          }}
          componentsProps={{
            actionBar: {
              actions: ['clear'],
              style: { justifyContent: 'flex-end', paddingBottom: '1rem' },
            },
          }}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          format="DD-MM-YYYY"
          sx={{
            '& .MuiInputBase-input': {
              height: '0.5rem', // Set your height here.
            },
            '& .MuiInputLabel-root': {
              bottom: '25px',
              top: 'unset',
            },
            width: '10.5rem',
          }}
          componentsProps={{
            actionBar: {
              actions: ['clear'],
              style: { justifyContent: 'flex-end', paddingBottom: '1rem' },
            },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
export default StartAndEndDatePicker;
