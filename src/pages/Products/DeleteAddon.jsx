import { Button, Dialog, Paper, Stack, Typography } from '@mui/material';
import { get } from 'lodash';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import PRODUCTS_API from 'src/services/products';

export default function DeleteAddon(props) {
  const { open, addOn, handleClose, getAddons } = props;
  const [continueState, setContinueState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const handleDeleteAddOn = async () => {
    try {
      if (!continueState) {
        const response = await PRODUCTS_API.deleteAddon(get(addOn, 'addOnId'));
        if (response) {
          toast.success(SuccessConstants.DELETED_SUCCESSFUL);
          handleClose();
          getAddons();
        }
      }
    } catch (error) {
      console.log(error);
      if (get(error, 'status') === 400 && get(error, 'errorResponse.code') === 'ERR_SBEE_0054') {
        setContinueState(true);
        setErrorMessage(get(error, 'errorResponse.message'));
      }
    }
  };
  const handleDelinkAll = async () => {
    try {
      const response = await PRODUCTS_API.deLinkAddonOnAll(get(addOn, 'addOnId'));
      if (response) {
        setContinueState(false);
        toast.success('Product delinked');
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Dialog open={open}>
      {!continueState && (
        <Paper
          sx={{
            p: 2,
          }}
        >
          <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            Are you sure you want to delete {get(addOn, 'name')?.toUpperCase()}? This action cannot
            be undone.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 2 }} variant="text">
              Cancel
            </Button>
            <Button onClick={handleDeleteAddOn} variant="contained">
              Ok
            </Button>
          </div>
        </Paper>
      )}
      {continueState && (
        <Paper
          sx={{
            p: 2,
          }}
        >
          <Typography sx={{ fontWeight: 'bold', display: 'flex', textAlign: 'left', fontSize: 14 }}>
            {errorMessage}
          </Typography>
          <Stack
            flexDirection={'row'}
            sx={{
              display: continueState ? 'flex' : 'none',
              justifyContent: 'flex-end',
              mt: 2,
              gap: 1,
            }}
          >
            <Button
              size={'small'}
              onClick={() => {
                handleClose();
                setContinueState(false);
                setErrorMessage('');
              }}
              variant="text"
            >
              Cancel
            </Button>
            <Button size={'small'} onClick={() => handleDelinkAll()} variant="contained">
              Continue to delink
            </Button>
          </Stack>
        </Paper>
      )}
    </Dialog>
  );
}
