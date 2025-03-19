import { Card, Dialog } from '@mui/material';
import React from 'react';

export default function PrinterConfiguration(props) {
  const { open } = props;
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 340, sm: 500 } }}></Card>
    </Dialog>
  );
}
