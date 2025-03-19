import TextField from '@mui/material/TextField';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Controller, useFormContext } from 'react-hook-form';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

const RHFDatePicker = ({
  disablePast,
  minDate,
  name,
  label,
  disabled,
  size,
  defaultValues,
  inputFormat,
  sx,
  isDefault,
  ...rest
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopDatePicker
              label={label}
              control={control}
              minDate={minDate}
              inputFormat={"DD-MM-YYYY"}
              value={moment(value)}
              disablePast={disablePast}
              onChange={(event) => {
                onChange(event);
              }}
              defaultValues={defaultValues}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!error}
                  helperText={error?.message}
                  {...rest}
                />
              )}
              slotProps={{
                textField: {
                  size: size || "medium",
                  error: !!error,
                  helperText: error?.message,
                  ...rest,
                },
              }}
              disabled={disabled}
              sx={sx}
            />
          </LocalizationProvider>
        );
      }}
    />
  );
};

export default RHFDatePicker;
