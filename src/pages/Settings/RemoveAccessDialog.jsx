// RemoveAccessDialog.js
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  useTheme,
  Stack,
  alpha,
} from '@mui/material';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import Auth_API from 'src/services/auth';

export default function RemoveAccessDialog({
  open,
  handleClose,
  storeId,
  terminalNumber,
  getOtherAccountInfo,
}) {
  const theme = useTheme();

  const handleComplete = async () => {
    const options = {
      storeId,
      terminalNumber,
    };
    try {
      console.log('kkkkkkk', terminalNumber);

      const response = await Auth_API.removeAccess(options);
      if (response) {
        toast.success(response.data.message);
        handleCloseDialog();
        getOtherAccountInfo();
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handleCloseDialog = () => {
    handleClose();
  };
  return (
    <Dialog open={open}>
      <DialogTitle sx={{ pb: 1 }}>Remove Access</DialogTitle>
      <DialogContent>
        <DialogContentText>Do you wish to remove current terminal access?
        <Stack p={1} pl={0} pb={0}><Typography fontWeight={600} fontSize={'10px'} sx={{color: 'black', p: 0.5, pl: 1, backgroundColor:  alpha(theme.palette.primary.main, 0.2), borderRadius: '3px', opacity: '80%' }} >Hint: Any offline bills under the terminal will be lost forever</Typography></Stack>

        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button onClick={handleComplete} color="error" variant="contained" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
