import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Switch, FormControlLabel, FormHelperText, Stack, Typography } from '@mui/material';

// ----------------------------------------------------------------------

RHFSwitch.propTypes = {
  name: PropTypes.string,
  helperText: PropTypes.node,
};

export default function RHFSwitch({ name, helperText, labelFront, labelBack, sx = {} }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
          {labelFront && <Typography>{labelFront}</Typography>}
          <Switch {...field} checked={field.value} sx={{ ...sx }} />
          {labelBack && <Typography>{labelBack}</Typography>}

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>{error ? error?.message : helperText}</FormHelperText>
          )}
        </Stack>
      )}
    />
  );
}
