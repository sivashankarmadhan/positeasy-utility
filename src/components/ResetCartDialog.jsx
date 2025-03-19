import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { get } from 'lodash';
import React from 'react';
import toast from 'react-hot-toast';
import { useResetRecoilState } from 'recoil';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { cart } from 'src/global/recoilState';
import Auth_API from 'src/services/auth';

export default function ResetCartDialog(props) {
  const { open, handleClose, confirmNavigation } = props;
  const resetOrder = useResetRecoilState(cart);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 360, sm: 400 } }}>
        <Typography variant="subtitle1">
          Are you sure, you want to clear the cart or maintain?
        </Typography>
        <Stack flexDirection={'row'} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={handleClose} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button
            onClick={() => {
              resetOrder();
              confirmNavigation();
            }}
            variant="contained"
          >
            Delete Unpaid Terminal
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
