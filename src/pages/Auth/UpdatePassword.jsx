import { Card, Dialog, Typography } from '@mui/material';
import React from 'react';
import ForgotForm from './ForgotForm';
import AuthService from 'src/services/authService';
import { ROLES_DATA } from 'src/constants/AppConstants';

export default function UpdatePassword(props) {
  const { open, handleClose } = props;
  const currentRole = AuthService.getCurrentRoleInLocal();
  return (
    <Dialog open={open}>
      <Card sx={{ width: { xs: 340, sm: 400 }, p: 3 }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
          {ROLES_DATA[currentRole]?.label} Password Update
        </Typography>
        <ForgotForm handleClose={handleClose} role={currentRole} />
      </Card>
    </Dialog>
  );
}
