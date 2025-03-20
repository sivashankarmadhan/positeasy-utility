import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';

RHFAutocompleteObjOptions.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFAutocompleteObjOptions({
  name,
  label,
  freeSolo = true,
  helperText,
  options,
  startAdornment,
  endAdornment,
  disabled,
  multiple,
  disabledSearchOnChange,
  ...other
}) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      fullWidth
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <Autocomplete
            multiple={multiple}
            freeSolo={freeSolo}
            fullWidth
            disabled={disabled}
            {...field}
            options={options} // Set initial options as an empty array
            value={field.value || ''} // Set the value from react-hook-form field value
            onChange={(event, newValue) => {
              setValue(name, newValue, { shouldValidate: true });
            }}
            renderInput={(params) => (
              <TextField
                fullWidth
                onChange={(event) => {
                  if (!disabledSearchOnChange) {
                    setValue(name, { label: event.target.value, id: '' }, { shouldValidate: true });
                  }
                }}
                label={label}
                error={!!error}
                helperText={helperText && error ? helperText : error?.message || ''}
                {...params}
                InputProps={{
                  ...params.InputProps,
                  ...(startAdornment ? { startAdornment } : {}),
                  ...(endAdornment ? { endAdornment } : {}),
                }}
              />
            )}
            {...other}
          />
        );
      }}
    />
  );
}
