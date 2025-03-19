import { Button, Card, Dialog, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import StoreServices from 'src/services/API/StoreServices';

const OutletAddressDialog = ({ isOpen, onClose, getStoreDetails, currentOutletAddress }) => {
  const [outletAddress, setOutletAddress] = useState('');

  const onSubmit = async () => {
    try {
      await StoreServices.postOutletAddress({ address: outletAddress });
      onClose();
      getStoreDetails();
    } catch (e) {
      console.error(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setOutletAddress(currentOutletAddress);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <Card sx={{ p: 2, width: { xs: 340, sm: 500 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Edit Outlet Address
        </Typography>
        <TextField
          multiline
          rows={3}
          maxRows={14}
          label="Outlet Address"
          value={outletAddress}
          onChange={(e) => {
            setOutletAddress(e.target.value);
          }}
          sx={{ width: '100%' }}
        />
        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
          <Button size="large" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button size="large" type="button" variant="contained" onClick={onSubmit}>
            Submit
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
};

export default OutletAddressDialog;
