import { Button, Dialog, Paper, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { PATH_AUTH } from 'src/routes/paths';
import Auth_API from 'src/services/auth';
import AuthService from 'src/services/authService';
import { ROLES, ROLES_DATA, ROLES_DATA_ID } from 'src/constants/AppConstants';
import { get } from 'lodash';
import STORES_API from 'src/services/stores';
import { useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { SuccessConstants } from 'src/constants/SuccessConstants';

export default function BillingLogout(props) {
  const currentRole = AuthService.getCurrentRoleInLocal();
  const [childDialogOpen, setChildDialogOpen] = useState(false);
  const { handleClose, open, storesData } = props;
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const handleLogout = async () => {
    try {
      const response = await Auth_API.logout();
      if (response) {
        toast.success(SuccessConstants.LOGOUT);
        AuthService._billingLogout();
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleRegenerate = async (options) => {
    try {
      const response = await STORES_API.regenerateBillingKey(options);
      if (response) {
        toast.success('Key generation successful');
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const removeAccess = async (options) => {
    try {
      const response = await STORES_API.removeAccess(options);
      if (response) {
        toast.success('Access removed Successfully');
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const keyOptions = {
    storeId: get(storesData, 'storeId'),
    terminalNumber: get(storesData, 'terminalNumber'),
  };
  const removeAccessOptions = {
    storeId: get(storesData, 'storeId'),
    terminalNumber: get(storesData, 'terminalNumber'),
    access: null,
  };
  const handleChildDialogOpen = () => {
    setChildDialogOpen(true);
  };
  const handleChildDialogClose = () => {
    setChildDialogOpen(false);
  };
  return (
    <>
      <Dialog open={open}>
        {get(ROLES_DATA_ID[get(storesData, 'roleId')], 'role') === currentRole && (
          <Paper
            sx={{
              p: 3,
            }}
          >
            <Typography variant="h5">Confirm</Typography>

            <Typography sx={{ mb: 3, mt: 0.5 }}>
              Are you sure you want to logout this session?
            </Typography>

            <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="text" onClick={() => handleClose()}>
                Cancel
              </Button>
              <Button onClick={() => handleLogout()} variant="contained">
                Submit
              </Button>
            </Stack>
          </Paper>
        )}
        {get(storesData, 'roleId') !== ROLES_DATA.master.id &&
          currentRole === ROLES_DATA.master.role && (
            <Paper
              sx={{
                p: 3,
              }}
            >
              <Typography variant="h6">
                Regenerate key or remove access for terminal -{' '}
                {get(storesData, 'terminalName') || get(storesData, 'terminalNumber')} of store -{' '}
                {get(storesData, 'storeName')}
              </Typography>

              {/* <Typography sx={{ mb: 3, mt: 0.5 }}>Are you sure you want to regenerate key?</Typography> */}

              <Stack
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                mt={2}
              >
                <Button size="large" variant="text" onClick={() => handleClose()}>
                  Cancel
                </Button>
                <Tooltip
                  title={`A new key will be generated for terminal - ${
                    get(storesData, 'terminalName') || get(storesData, 'terminalNumber')
                  } of store - ${get(storesData, 'storeName')}`}
                >
                  <Button
                    onClick={() => handleRegenerate(keyOptions)}
                    size={isMobile ? 'small' : 'large'}
                    variant="contained"
                    sx={{ whiteSpace: 'nowrap', px: 3 }}
                  >
                    Regenerate key
                    <InfoOutlinedIcon fontSize="3px" />
                  </Button>
                </Tooltip>
                <Tooltip
                  title={`Access will be removed for terminal - ${
                    get(storesData, 'terminalName') || get(storesData, 'terminalNumber')
                  } of store - ${get(storesData, 'storeName')}`}
                >
                  <Button
                    onClick={() => handleChildDialogOpen()}
                    size={isMobile ? 'small' : 'large'}
                    variant="contained"
                    sx={{ whiteSpace: 'nowrap', px: 3 }}
                  >
                    Remove access
                    <InfoOutlinedIcon fontSize="3px" />
                  </Button>
                </Tooltip>
              </Stack>
            </Paper>
          )}
      </Dialog>
      <Dialog open={childDialogOpen}>
        <Paper
          sx={{
            p: 3,
          }}
        >
          <Typography variant="h5">Confirm</Typography>

          <Typography sx={{ mb: 3, mt: 0.5 }}>Are you sure you want to remove access?</Typography>

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={() => handleChildDialogClose()}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                removeAccess(removeAccessOptions);
                handleChildDialogClose();
              }}
              size="large"
              variant="contained"
            >
              Submit
            </Button>
          </Stack>
        </Paper>
      </Dialog>
    </>
  );
}
