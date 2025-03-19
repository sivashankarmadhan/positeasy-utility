import { Button, Stack, Typography } from '@mui/material';
import DialogOne from './DialogOne'; // Assuming DialogOne is your custom dialog component

const PaymentErrorDialog = ({ open, onClose, onCloseMainDialog }) => {
  const handleClose = () => {
    onClose(); // Close the error dialog
    onCloseMainDialog(); // Close the submit dialog
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
        <img src="/assets/images/whatsapp/error.png" style={{ width: '5.5rem' }} alt="" />
        <Typography sx={{ color: '#FF0101', fontWeight: 'bold' }}>Authentication Failed</Typography>
        <Button onClick={handleClose} color="primary" variant="contained">
          Try Again
        </Button>
      </Stack>
    </DialogOne>
  );
};

export default PaymentErrorDialog;
