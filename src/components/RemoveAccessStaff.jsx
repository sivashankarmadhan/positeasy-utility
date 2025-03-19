// form

// @mui
import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
// hooks
// components

import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';

import { SuccessConstants } from 'src/constants/SuccessConstants';
import Auth_API from 'src/services/auth';

// ----------------------------------------------------------------------

export default function RemoveAccessStaff(props) {
  const { open, handleClose, storeId, terminalNumber, terminalName, staffName, getStaffs } = props;

  const handleComplete = async (data) => {
    const options = {
      storeId,
      terminalNumber,
    };
    try {
      const response = await Auth_API.removeAccess(options);
      if (response) {
        toast.success(SuccessConstants.ACCESS_REMOVED);
        handleCloseDialog();
        getStaffs();
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
      <Card sx={{ p: 2, width: { xs: 360, sm: 400 } }}>
        <Typography
          sx={{
            display: 'flex',
            textAlign: 'left',
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          {`Are you sure want to remove the access of ${
            terminalName === null ? terminalNumber : terminalName
          } terminal  from ${staffName?.toUpperCase()}? This action cannot be undone!`}
        </Typography>
        <Stack
          flexDirection={'row'}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
            gap: 2,
          }}
        >
          <Button onClick={handleCloseDialog} variant="text">
            Cancel
          </Button>
          <Button onClick={() => handleComplete()} variant="contained">
            Remove access
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
