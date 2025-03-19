import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

RHFAutoCompleteCustomObj.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFAutoCompleteCustomObj({
  name,
  label,
  freeSolo = true,
  helperText,
  options,
  ...other
}) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      fullWidth
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          freeSolo={freeSolo}
          fullWidth
          {...field}
          options={options} // Set initial options as an empty array
          value={field.value} // Set the value from react-hook-form field value
          onChange={(event, newValue) => {
            setValue(name, newValue, { shouldValidate: true });
          }}
          renderInput={(params) => (
            <TextField
              fullWidth
              onChange={(event) => {
                setValue(
                  name,
                  { label: event.target.value, id: '', data: {} },
                  { shouldValidate: true }
                );
              }}
              label={label}
              error={!!error}
              helperText={helperText && error ? helperText : error?.message ? 'required' : ''}
              {...params}
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
          {...other}
        />
      )}
    />
  );
}
