// form

// @mui
import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { get } from 'lodash';
// hooks
// components

import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';

import { SuccessConstants } from 'src/constants/SuccessConstants';
import Auth_API from 'src/services/auth';
import STORES_API from 'src/services/stores';

// ----------------------------------------------------------------------

export default function RemoveStaff(props) {
  const { open, handleClose, staff, getStaffs } = props;
  const staffId = get(staff, 'staffId');
  const handleComplete = async (data) => {
    try {
      const response = await STORES_API.removeStaff(staffId);
      if (response) {
        toast.success(SuccessConstants.ACCESS_REMOVED);
        handleCloseDialog();
        getStaffs();
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      handleCloseDialog();
    }
  };
  const handleCloseDialog = () => {
    handleClose();
  };
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 360, sm: 400 } }}>
        <Typography sx={{ display: 'flex', textAlign: 'left', fontSize: 14, fontWeight: 'bold' }}>
          {`Are you sure want to remove  staff ${get(
            staff,
            'name'
          )?.toUpperCase()} ? This action cannot be undone!`}
        </Typography>
        <Stack
          flexDirection={'row'}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 2,
            gap: 1,
          }}
        >
          <Button size={'small'} onClick={handleCloseDialog} variant="text">
            Cancel
          </Button>
          <Button size={'small'} onClick={handleComplete} variant="contained">
            Ok
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
