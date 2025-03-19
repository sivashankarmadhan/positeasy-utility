import React, { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import DialogComponent from './Dialog';

const RechargeErrorDialog = ({ open, onClose, amount }) => {
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
        <img src="/assets/images/WhatsApp/error.png" style={{ width: '5.5rem' }} alt="" />
        <Typography sx={{ fontWeight: 'bold', fontSize: '30px' }}>₹ {amount}</Typography>
        <Typography sx={{ color: '#FF0101', fontWeight: 'bold' }}>Payment Failed</Typography>
        <Button onClick={onClose} color="primary" variant="contained">
          Try Again
        </Button>
      </Stack>
    </DialogComponent>
  );
};

export default RechargeErrorDialog;
