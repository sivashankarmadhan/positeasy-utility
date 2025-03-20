import TextField from '@mui/material/TextField';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Controller, useFormContext } from 'react-hook-form';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { DATE_TIME_FORMAT_ATTENDANCE } from 'src/constants/AppConstants';
import { TimeField } from '@mui/x-date-pickers';

const RHFTimePicker = ({ name, label, disabled, size, sx, ...rest }) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <TimeField
              label={label}
              control={control}
              value={moment(value)}
              onChange={(event) => {
                onChange(event);
              }}
              disabled={disabled}
              sx={sx}
              format={DATE_TIME_FORMAT_ATTENDANCE.HH_MM}
            />
          </LocalizationProvider>
        );
      }}
    />
  );
};

export default RHFTimePicker;
