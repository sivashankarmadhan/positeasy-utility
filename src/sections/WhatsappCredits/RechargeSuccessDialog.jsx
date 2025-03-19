import React, { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import DialogComponent from './Dialog';

const RechargeSuccessDialog = ({ open, onClose, amount }) => {
  return (
    <DialogComponent open={open} onClose={onClose} title="Confirmation" customMinWidth={300}>
      <Stack
        sx={{
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mt: 2,
        }}
      >
        <img src="/assets/images/WhatsApp/success.png" style={{ width: '5.5rem' }} alt="" />
        <Typography sx={{ fontWeight: 'bold', fontSize: '30px' }}>₹ {amount}</Typography>
        <Typography sx={{ color: '#00C275', fontWeight: 'bold' }}>Payment Successful</Typography>
        <Button
          onClick={onClose}
          sx={{ backgroundColor: '#00C275', '&:hover': { backgroundColor: '#00C275' } }}
          variant="contained"
        >
          Done
        </Button>
      </Stack>
    </DialogComponent>
  );
};

export default RechargeSuccessDialog;
