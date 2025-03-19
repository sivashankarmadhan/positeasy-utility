import { Button, Dialog, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { PATH_AUTH } from 'src/routes/paths';
import Auth_API from 'src/services/auth';
import AuthService from 'src/services/authService';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { stubTrue } from 'lodash';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';

export default function Logout(props) {
  const { handleClose, open } = props;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const logoutFn = async () => {
    toast.success(SuccessConstants.LOGOUT);
    AuthService.logout();
    window.location.reload();
    navigate(PATH_AUTH.login, { replace: true });
    handleClose();
  };

  const handleLogout = async () => {
    try {
      setIsLoading(stubTrue);
      logoutFn();
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error(error?.errorResponse?.message || ErrorConstants.UNABLE_TO_LOGOUT);
    }
  };
  if (isLoading) return <LoadingScreen />;
  return (
    <Dialog open={open}>
      <Paper
        sx={{
          p: 2,
        }}
      >
        <Typography sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}>
          {'Are you sure you want to logout this session'}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => handleClose()} sx={{ mr: 2 }} variant="text">
            Cancel
          </Button>
          <Button onClick={() => handleLogout()} variant="contained">
            Logout
          </Button>
        </div>
      </Paper>
    </Dialog>
  );
}
