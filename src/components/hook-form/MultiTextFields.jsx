import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextField, Chip, Autocomplete, FormControl, FormHelperText } from '@mui/material';
import { find, get } from 'lodash';
import { PINCODE_REGEX } from 'src/constants/AppConstants';

export default function MultiTextFields({ name, helperText, disabled, ...other }) {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState('');

  const isValidPincode = (value) => PINCODE_REGEX.test(value);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const errorMessage = find(error, (_item) => get(_item, 'message'))?.message;

        return (
          <FormControl sx={{ width: '100%' }}>
            <Autocomplete
              {...field}
              multiple
              freeSolo
              options={[]}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                if (newInputValue === '' || isValidPincode(newInputValue)) {
                  setInputValue(newInputValue);
                }
              }}
              onChange={(event, newValue) => {
                const validValues = newValue.filter((value) => PINCODE_REGEX.test(value));
                field.onChange(validValues);
                setInputValue('');
              }}
              onBlur={() => {
                if (inputValue && PINCODE_REGEX.test(inputValue)) {
                  field.onChange([...(field.value || []), inputValue]);
                  setInputValue('');
                }
              }}
              renderTags={(value, getTagProps) =>
                value?.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  {...other}
                  error={Boolean(error)}
                  helperText={errorMessage || helperText}
                />
              )}
              disabled={disabled}
            />
            {(!!error || helperText) && (
              <FormHelperText error={!!error}>{errorMessage || helperText}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
}
