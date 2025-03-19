import { Button, Card, Dialog, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toFixedIfNecessary } from 'src/utils/formatNumber';

export default function AddAdvanceDialog(props) {
  const {
    totalOrderValue,
    openAdvance,
    handleCloseAdvance,
    setFinalAdvance,
    finalAdvance,
    remainingTotalAmount,
  } = props;

  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [error, setError] = useState(""); 

  const handleAdvanceAmount = (e) => {
    const value = parseFloat(e.target.value);
    
    if (isNaN(value) || value <= 0) {
      setAdvanceAmount(0);
      setError("Please enter a valid amount greater than 0");
    } else if (value > remainingTotalAmount) {
      setAdvanceAmount(value);
      setError("Entered amount cannot exceed the total amount");
    } else {
      setAdvanceAmount(value);
      setError("");
    }
  };

  const handleSubmit = () => {
    if (advanceAmount > 0) {
      setFinalAdvance(advanceAmount);
      handleCloseAdvance();
    } else {
      setError("Please enter a valid amount greater than 0");
    }
  };

  useEffect(() => {
    if (finalAdvance > 0) {
      setAdvanceAmount(finalAdvance);
    }
  }, [finalAdvance]);

  return (
    <Dialog open={openAdvance}>
      <Card sx={{ p: 2, width: { xs: 340, sm: 500 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Advance payment
        </Typography>

        <Stack flexDirection={'row'} justifyContent={'space-between'} marginBottom={1}>
          <Typography>Total amount </Typography>
          <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: 'primary.main' }}>
            {toFixedIfNecessary(remainingTotalAmount, 2)}
          </Typography>
        </Stack>
        <Stack flexDirection={'row'} justifyContent={'space-between'} marginBottom={1}>
          <Typography>Advance amount </Typography>
          <Typography sx={{ fontSize: '18px', fontWeight: 'bold' }}>
            -&nbsp;{advanceAmount}
          </Typography>
        </Stack>
        <Stack flexDirection={'row'} justifyContent={'space-between'} marginBottom={1}>
          <Typography>Balance amount </Typography>
          <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: 'primary.main' }}>
            {toFixedIfNecessary(remainingTotalAmount - advanceAmount, 2)}
          </Typography>
        </Stack>
        <Stack flexDirection={'row'} justifyContent={'space-between'} marginBottom={1}>
          <Typography>Enter Advance </Typography>
          <TextField
            autoFocus
            type="number"
            size="small"
            onChange={handleAdvanceAmount}
            error={Boolean(error)} 
            helperText={error}
          />
        </Stack>
        <Stack
          flexDirection={'row'}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
            gap: 1,
          }}
        >
          <Button onClick={handleCloseAdvance} variant="contained">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={advanceAmount <= 0 || Boolean(error)}>
            Ok
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
