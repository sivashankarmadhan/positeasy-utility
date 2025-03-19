import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
// @mui
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useBoolean } from 'src/hooks/useBoolean';

import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Divider } from '@mui/material';

{
  /* <RHFAutocompletePagination
                name="productOrRawMaterial"
                label={capitalize(get(values, 'type'))}
                optionCount={totalItemsForRawMaterial}
                page={page}
                setPage={setPage}
                loading={loading}
                freeSolo
                options={map(productListForStock, (_item) => {
                  return {
                    label: get(_item, 'name'),
                    id: get(_item, 'productId'),
                  };
                })}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option === value}
                fullWidth
                size="small"
              /> */
}

// ----------------------------------------------------------------------
// const PopperStyledComponent = styled(Popper)(({ theme }) => ({
//     border: `1px solid ${
//         theme.palette.mode === 'light' ? 'rgba(149, 157, 165, 0.2)' : 'rgb(1, 4, 9)'
//     }`,
// }));
export default function RHFAutocompletePagination({
  name,
  label,
  placeholder,
  helperText,
  InputOptions,
  optionCount,
  page,
  setPage,
  loading,
  freeSolo,
  ...other
}) {
  const { control, setValue, getValues } = useFormContext();

  const values = getValues();

  const open = useBoolean();
  const paginationRef = useRef(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          freeSolo={freeSolo}
          open={open.value}
          onOpen={() => {
            open.onTrue();
          }}
          onClose={(e) => {
            open.onFalse();
          }}
          onChange={(event, newValue) => {
            paginationRef.current = null;
            setValue(name, newValue, { shouldValidate: false });
          }}
          renderInput={(params) => (
            <>
              <TextField
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error ? error?.message : helperText}
                variant={InputOptions?.variant || 'outlined'}
                {...params}
                sx={{
                  '& .MuiInputLabel-shrink, & .MuiFormLabel-root, & .MuiTypography-caption': {
                    color: '#8199B1',
                  },
                }}
              />
            </>
          )}
          PaperComponent={({ children, ...popperProps }) => {
            return (
              <>
                <Paper {...popperProps}>
                  {loading ? (
                    <Stack
                      sx={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyItems: 'center',
                      }}
                    >
                      <CircularProgress />
                    </Stack>
                  ) : (
                    <>
                      {children}
                      <Divider />
                      <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        sx={{ p: 1 }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Pagination
                          ref={paginationRef}
                          count={Math.ceil(optionCount / 10) || 0}
                          page={page}
                          onChange={(e, val) => {
                            setPage(val);
                            paginationRef.current = true;
                            e.preventDefault();
                          }}
                          size="small"
                          showFirstButton
                          showLastButton
                        />
                      </Stack>
                    </>
                  )}
                </Paper>
              </>
            );
          }}
          {...other}
        />
      )}
    />
  );
}

RHFAutocompletePagination.propTypes = {
  helperText: PropTypes.string,
  label: PropTypes.string,

  name: PropTypes.string,
  placeholder: PropTypes.string,
  InputOptions: PropTypes.string,
};
