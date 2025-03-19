import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { get, map } from 'lodash';
import RegexValidation from 'src/constants/RegexValidation';

const QuantityEditDialog = ({ open, handleClose, onSubmit, quantity }) => {
  const [quantityLocal, setQuantityLocal] = useState({});

  useEffect(() => {
    if (open) {
      setQuantityLocal(quantity);
    }
  }, [open]);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 360, sm: 400 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Edit Quantity
        </Typography>
        <Stack flexDirection="row" gap={2}>
          <TextField
            label="Quantity"
            value={quantityLocal}
            onChange={(event) => {
              const floatValue = event.target.value?.split?.('.')?.[1];
              if (
                RegexValidation.POSITIVE_NUMBER_WITH_EMPTY.test(event.target.value) &&
                (!floatValue || floatValue?.length <= 2)
              ) {
                setQuantityLocal(event.target.value);
              }
            }}
            name="quantity"
            sx={{ width: '100%' }}
          />
        </Stack>

        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
          <Button size="large" variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="large"
            type="button"
            variant="contained"
            onClick={() => {
              onSubmit(quantityLocal);
            }}
          >
            Submit
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
};

export default QuantityEditDialog;
