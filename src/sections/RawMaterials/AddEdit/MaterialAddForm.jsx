import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CircularProgress, Grid, InputAdornment, Stack, Typography } from '@mui/material';
import { isBoolean } from 'lodash';
import { useEffect } from 'react';
import { RHFAutocomplete, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';
import { toFixedIfNecessary } from 'src/utils/formatNumber';

const MaterialAddForm = ({
  methods,
  availableProductId,
  productIdLoading,
  isNotStaff,
  errors,
  newProduct,
  productCategoryList,
  RHFAutocompleteObjOptions,
  isShowBatchField,
  isAvailableBatchId,
  batchIdLoading,
  watchUnitName,
}) => {
  const stockQuantity = methods.watch('stockQuantity');
  const unitAverageValue = methods.watch('unitAverageValue') || 0;
  const rawValue = methods.watch('rawValue');

  useEffect(() => {
    if (!newProduct) {
      const calculatedValue = toFixedIfNecessary(stockQuantity * unitAverageValue, 2);
      methods.setValue('rawValue', calculatedValue);
    }
  }, [stockQuantity, unitAverageValue, methods, newProduct]);

  return (
    <>
      <Grid item xs={12} md={3.88}>
        <RHFTextField
          name="productId"
          variant="outlined"
          label="Product ID"
          placeholder={'Optional'}
          fullWidth
          InputProps={{
            ...(methods.watch('productId') && isBoolean(availableProductId)
              ? !productIdLoading && availableProductId
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CheckCircleIcon sx={{ color: 'green' }} size={20} />
                      </InputAdornment>
                    ),
                  }
                : {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CancelIcon size={20} sx={{ color: 'red' }} />
                      </InputAdornment>
                    ),
                  }
              : {}),
            ...(productIdLoading && methods.watch('productId')
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }
              : {}),
          }}
          InputLabelProps={{ shrink: true }}
          disabled={!newProduct}
        />
      </Grid>
      <Grid item xs={12} md={3.88}>
        <RHFTextField name="name" variant="outlined" label="Product name" fullWidth />
      </Grid>
      <Grid item xs={12} md={3.88}>
        <RHFAutocomplete
          label="Category"
          options={productCategoryList}
          name="category"
          variant="outlined"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item md={2.89}>
        <RHFTextField
          name={`unitName`}
          variant="outlined"
          label="Unit Name"
          onWheel={(e) => e.target.blur()}
        />
      </Grid>

      <Grid item md={2.89}>
        <RHFTextField
          name="stockQuantity"
          type="number"
          variant="outlined"
          label="Stock Quantity"
          onWheel={(e) => e.target.blur()}
          InputProps={{
            value: toFixedIfNecessary(methods.watch('stockQuantity'), 2),
            disabled: !newProduct,
          }}
        />
      </Grid>
      <Grid item md={2.89}>
        <RHFTextField
          name={`rawValue`}
          type="number"
          variant="outlined"
          label=" Total Value"
          onWheel={(e) => e.target.blur()}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            disabled: !newProduct,
          }}
        />
      </Grid>
      <Stack
        flexDirection={'row'}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        mt={0.8}
      >
        <Stack
          flexDirection={'row'}
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography mr={6.6}>Batch (optional) </Typography>
          <RHFSwitch name="isBatch" />
        </Stack>
      </Stack>
      <Stack
        flexDirection={'row'}
        sx={{
          alignItems: 'center',
          display: isShowBatchField ? 'flex' : 'none',
          flexDirection: { xs: 'column', md: 'row' },
        }}
        mt={0.8}
        gap={1.5}
      >
        <RHFTextField
          name="batchId"
          variant="outlined"
          label="Batch ID"
          placeholder={'Optional'}
          sx={{
            width: 'auto',
          }}
          InputProps={{
            ...(methods.watch('batchId') && isBoolean(isAvailableBatchId)
              ? !batchIdLoading && isAvailableBatchId
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CheckCircleIcon sx={{ color: 'green' }} size={20} />
                      </InputAdornment>
                    ),
                  }
                : {
                    endAdornment: (
                      <InputAdornment position="end">
                        <CancelIcon size={20} sx={{ color: 'red' }} />
                      </InputAdornment>
                    ),
                  }
              : {}),
            ...(batchIdLoading && methods.watch('batchId')
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }
              : {}),
          }}
          // InputLabelProps={{ shrink: true }}
        />
        <RHFDatePicker name="manufactureDate" label={'Manufacture Date'} />
        <RHFDatePicker name="expiryDate" label={'Expiry Date'} />
      </Stack>
    </>
  );
};

export default MaterialAddForm;
