import { IconButton, MenuItem, TableCell, TableRow, TextField } from '@mui/material';
import { map } from 'lodash';
import React, { useEffect } from 'react';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { UNIT_TYPES } from 'src/constants/AppConstants';
import DeleteIcon from '@mui/icons-material/Delete';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import debounce from 'src/utils/debounce';

let isUpdateOfferPrice = true;
let isUpdateDiscount = true;

const UnitsRow = ({
  newProduct,
  addMoreUnits,
  index,
  editMode,
  fieldName,
  isProfitLossMode,
  isNotStaff,
  removeUnits,
  getValues,
  setValue,
  watch,
}) => {
  const watchOfferPrice = watch(`${fieldName}.offerPrice`);
  const watchDiscount = watch(`${fieldName}.discount`);

  const handleDiscountAmount = () => {
    const discount = Number(getValues(`${fieldName}.discount`));
    const price = Number(getValues(`${fieldName}.actualPrice`));
    if (discount <= 100) {
      return toFixedIfNecessary((discount / 100) * price, 2);
    }
    return 0;
  };

  useEffect(() => {
    if (!isUpdateOfferPrice) return;
    const offerPrice = Number(getValues(`${fieldName}.offerPrice`));
    const price = Number(getValues(`${fieldName}.actualPrice`));

    const discount = 100 - (100 * offerPrice) / price;

    setValue(`${fieldName}.discount`, toFixedIfNecessary(discount, 2));
    isUpdateDiscount = false;
    debounce(() => {
      isUpdateDiscount = true;
    });
  }, [watchOfferPrice]);

  useEffect(() => {
    if (!isUpdateDiscount) return;
    const price = Number(getValues(`${fieldName}.actualPrice`));
    const offerPrice = price - handleDiscountAmount();

    setValue(`${fieldName}.offerPrice`, toFixedIfNecessary(offerPrice, 2));
    isUpdateOfferPrice = false;
    debounce(() => {
      isUpdateOfferPrice = true;
    });
  }, [watchDiscount]);

  return (
    <TableRow>
      {(newProduct || addMoreUnits) && (
        <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 120 }} align="center">
          <RHFTextField
            inputProps={{ readOnly: !editMode }}
            variant="standard"
            name={`${fieldName}.actualProductId`}
            label="Product ID "
            size="small"
            placeholder={'Optional'}
            InputLabelProps={{ shrink: !!getValues(`${fieldName}.actualProductId`) }}
            disabled={newProduct ? false : index === 0}
          />
        </TableCell>
      )}
      <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 120 }} align="left">
        <RHFTextField
          name={`${fieldName}.units`}
          inputProps={{ readOnly: !editMode }}
          variant="standard"
          label="Enter units"
          type="number"
          size="small"
          onWheel={(e) => e.target.blur()}
        />
      </TableCell>
      <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 120 }} align="center">
        <RHFSelect name={`${fieldName}.unitType`} variant="standard" label="Unit type" size="small">
          {map(UNIT_TYPES, (e) => (
            <MenuItem key={e.id} value={e.value}>
              {e.label}
            </MenuItem>
          ))}
        </RHFSelect>
      </TableCell>
      {isProfitLossMode && isNotStaff && (
        <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 120 }} align="center">
          <RHFTextField
            inputProps={{ readOnly: !editMode }}
            variant="standard"
            name={`${fieldName}.actualBasePrice`}
            label="Enter Base Price "
            size="small"
            type="number"
            onWheel={(e) => e.target.blur()}
          />
        </TableCell>
      )}
      <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 120 }} align="center">
        <RHFTextField
          inputProps={{ readOnly: !editMode }}
          variant="standard"
          name={`${fieldName}.actualPrice`}
          label="Enter Price "
          size="small"
          type="number"
          onWheel={(e) => e.target.blur()}
        />
      </TableCell>

      <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 120 }} align="center">
        <RHFTextField
          inputProps={{ readOnly: !editMode }}
          variant="standard"
          name={`${fieldName}.offerPrice`}
          label="Offer Price"
          size="small"
          type="number"
          onWheel={(e) => e.target.blur()}
          InputLabelProps={{ shrink: !!getValues(`${fieldName}.offerPrice`) }}
          placeholder="Optional"
        />
      </TableCell>

      <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 120 }} align="center">
        <RHFTextField
          inputProps={{ readOnly: !editMode }}
          variant="standard"
          name={`${fieldName}.discount`}
          label="Discount"
          size="small"
          type="number"
          onWheel={(e) => e.target.blur()}
          InputLabelProps={{ shrink: !!getValues(`${fieldName}.discount`) }}
          placeholder="Optional"
        />
      </TableCell>

      <TableCell sx={{ lineHeight: '1.5', paddingY: '6px', minWidth: 150 }} align="center">
        <TextField
          variant="standard"
          name="discountAmount"
          value={handleDiscountAmount()}
          label="Discount Amount"
          placeholder="Optional"
          disabled
        />
      </TableCell>

      <TableCell
        sx={{
          lineHeight: '1.5',
          paddingY: '6px',
          position: 'sticky',
          right: 0,
          backgroundColor: 'white',
        }}
        align="center"
      >
        <IconButton sx={{ mx: 'auto', mt: 1.5 }} onClick={removeUnits(index)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default UnitsRow;
