import { Button, Stack, Typography } from '@mui/material';

import DialogOne from './DialogOne';
const PaymentSuccessDialog = ({ open, onClose, onCloseMainDialog, message }) => {
  const handleClose = () => {
    onClose(); // Close the success dialog
    onCloseMainDialog(); // Close the main dialog
  };

  return (
    <DialogOne open={open} onClose={onClose}>
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
        <img src="/assets/images/whatsapp/success.png" style={{ width: '9rem' }} alt="" />

        <Typography sx={{ color: '#00C275', fontWeight: 'bold' }}>{message}</Typography>
        <Button onClick={handleClose} sx={{ backgroundColor: '#00C275' }} variant="contained">
          Done
        </Button>
      </Stack>
    </DialogOne>
  );
};

export default PaymentSuccessDialog;
