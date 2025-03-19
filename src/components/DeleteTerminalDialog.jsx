import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { get } from 'lodash';
import React from 'react';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import Auth_API from 'src/services/auth';

export default function DeleteTerminalDialog(props) {
  const { selectedTerminal, openDeleteTerminalDialog, handleCloseDeleteUnpaidTerminal, getStores } =
    props;
  const handleDeleteUnpaidTerminal = async () => {
    try {
      const options = {
        terminalNumber: get(selectedTerminal, 'terminalNumber'),
        storeId: get(selectedTerminal, 'storeId'),
        terminalId: get(selectedTerminal, 'terminalId'),
      };
      const response = await Auth_API.removeUnpaidTerminal(options);
      if (response) toast.success(SuccessConstants.DELETED_SUCCESSFUL);
      handleCloseDeleteUnpaidTerminal();
      getStores();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Dialog open={openDeleteTerminalDialog}>
      <Card sx={{ p: 2, width: { xs: 360, sm: 400 } }}>
        <Typography variant="subtitle1">
          Are you sure,you want to delete {get(selectedTerminal, 'terminalName')}?
        </Typography>
        <Stack flexDirection={'row'} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={handleCloseDeleteUnpaidTerminal} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button onClick={handleDeleteUnpaidTerminal} variant="contained">
            Delete Unpaid Terminal
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
