import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

RHFAutocomplete.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFAutocomplete({
  name,
  label,
  helperText,
  options,
  multiple,
  disabledSearchOnChange,
  ...other
}) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          multiple={multiple}
          freeSolo
          {...field}
          options={options} // Set initial options as an empty array
          value={field.value} // Set the value from react-hook-form field value
          onChange={(event, newValue) => {
            setValue(name, newValue, { shouldValidate: true });
          }}
          renderInput={(params) => (
            <TextField
              onChange={(event) => {
                if (!disabledSearchOnChange) {
                  setValue(name, event.target.value, { shouldValidate: true });
                }
              }}
              label={label}
              error={!!error}
              helperText={error ? error?.message : helperText}
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
