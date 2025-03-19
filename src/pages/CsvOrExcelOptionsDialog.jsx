import React, { useEffect } from 'react';
// form
import { useForm } from 'react-hook-form';

import {
  Card,
  Dialog,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  useTheme,
} from '@mui/material';
import FormProvider from 'src/components/FormProvider';
import { RHFCheckbox } from 'src/components/hook-form';
import { CSV_OR_EXCEL_COLUMNS } from 'src/constants/AppConstants';
import { forEach, get, map } from 'lodash';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';

const CsvOrExcelOptionsDialog = ({ open, handleClose, onSubmit, name }) => {
  const theme = useTheme();

  const defaultValues = {};
  forEach(CSV_OR_EXCEL_COLUMNS, (_column) => {
    defaultValues[get(_column, 'name')] = true;
  });

  const methods = useForm({
    defaultValues,
  });

  const { reset, handleSubmit } = methods;

  let selectAll = {};
  forEach(CSV_OR_EXCEL_COLUMNS, (_column) => {
    selectAll[get(_column, 'name')] = true;
  });

  let clearAll = {};
  forEach(CSV_OR_EXCEL_COLUMNS, (_column) => {
    clearAll[get(_column, 'name')] = false;
  });

  useEffect(() => {
    const localSelectedCsvColumns = ObjectStorage.getItem(
      StorageConstants.SELECTED_CSV_OR_EXCEL_COLUMNS
    );
    if (get(localSelectedCsvColumns, 'data')) {
      reset(get(localSelectedCsvColumns, 'data'));
    }
  }, []);

  return (
    <Dialog open={open}  fullWidth maxWidth="md">
      <Card
        sx={{
          p: 2,
          width: '100%',
        }}
      >
        <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
          <Stack flexDirection="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6">{name} Columns</Typography>
            <Stack flexDirection="row" gap={2}>
              <Typography
                variant="overline"
                sx={{
                  textDecoration: 'underline',
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  reset(selectAll);
                }}
              >
                Select All
              </Typography>
              <Typography
                variant="overline"
                sx={{
                  textDecoration: 'underline',
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  reset(clearAll);
                }}
              >
                Clear All
              </Typography>
            </Stack>
          </Stack>

          <Stack
            flexDirection="row"
            flexWrap="wrap"
            gap={2}
            maxHeight={400}
            sx={{ overflow: 'auto' }}
          >
            {map(CSV_OR_EXCEL_COLUMNS, (_column) => {
              return <RHFCheckbox name={get(_column, 'name')} label={get(_column, 'label')} />;
            })}
          </Stack>

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="large" type="submit" variant="contained">
              Submit
            </Button>
          </Stack>
        </FormProvider>
      </Card>
    </Dialog>
  );
};

export default CsvOrExcelOptionsDialog;
