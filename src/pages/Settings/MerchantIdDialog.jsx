import { Button, Card, Dialog, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import StoreServices from 'src/services/API/StoreServices'; // Adjust path as per your project structure
import PaymentErrorDialog from './PaymentError';
import PaymentSuccessDialog from './PaymentSuccess';

const MerchantIdDialog = ({ isOpen, onClose, currentMerchantId, showAddMerchantButton }) => {
  const [newMerchantId, setNewMerchantId] = useState('');
  const [paymentSuccessDialogOpen, setPaymentSuccessDialogOpen] = useState(false);
  const [paymentErrorDialogOpen, setPaymentErrorDialogOpen] = useState(false);

  const onSubmit = async () => {
    try {
      await StoreServices.updateMerchantId(newMerchantId);
      await StoreServices.updateEditedId({ mId: newMerchantId });
      setPaymentSuccessDialogOpen(true); // Show success dialog with message
    } catch (error) {
      console.error(error);
      setPaymentErrorDialogOpen(true); // Show error dialog with message
    }
  };

  const handleCloseDialogs = () => {
    setPaymentSuccessDialogOpen(false);
    setPaymentErrorDialogOpen(false);
  };

  const handleMainDialogClose = () => {
    onClose(); // Close the main dialog
  };

  return (
    <Dialog open={isOpen}>
      <Card sx={{ p: 2, width: { xs: 320, sm: 500 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {showAddMerchantButton ? 'Add' : 'Update'} Merchant ID
        </Typography>
        <TextField
          margin="dense"
          label="Merchant ID"
          value={newMerchantId}
          onChange={(e) => setNewMerchantId(e.target.value)}
          fullWidth
        />
        <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2} spacing={2}>
          <Button size="large" variant="text" onClick={handleMainDialogClose}>
            Cancel
          </Button>
          <Button size="large" type="button" variant="contained" onClick={onSubmit}>
            Submit
          </Button>
        </Stack>
      </Card>

      {/* Success Dialog */}
      {paymentSuccessDialogOpen && (
        <PaymentSuccessDialog
          open={paymentSuccessDialogOpen}
          message="Authentication success"
          onClose={handleCloseDialogs}
          onCloseMainDialog={handleMainDialogClose}
        />
      )}

      {/* Error Dialog */}
      {paymentErrorDialogOpen && (
        <PaymentErrorDialog
          open={paymentErrorDialogOpen}
          message="Authentication failed"
          onClose={handleCloseDialogs}
          onCloseMainDialog={onClose} // Pass the onClose function directly
        />
      )}
    </Dialog>
  );
};

export default MerchantIdDialog;
