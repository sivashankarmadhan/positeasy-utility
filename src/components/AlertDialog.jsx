import { LoadingButton } from '@mui/lab';
import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { get, set } from 'lodash';
import React from 'react';
import { useRecoilState } from 'recoil';
import { alertDialogInformationState } from 'src/global/recoilState';
import getClone from 'src/utils/getClone';

export default function AlertDialog() {
  const [alertDialogInformation, setAlertDialogInformation] = useRecoilState(
    alertDialogInformationState
  );

  const { primary, secondary } = alertDialogInformation?.actions || {};

  const onClose = () => {
    setAlertDialogInformation({ open: false });
  };

  const onLoading = (status) => {
    const cloneAlertDialogInformation = getClone(alertDialogInformation);
    set(cloneAlertDialogInformation, 'actions.primary.loading', status);
    setAlertDialogInformation(cloneAlertDialogInformation);
  };

  return (
    <Dialog open={get(alertDialogInformation, 'open')}>
      <Card sx={{ p: 2, width: { xs: 320, sm: 400 } }}>
        <Typography variant="h5" mb={0.5}>
          {get(alertDialogInformation, 'title')}
        </Typography>
        <Typography variant="body1">{get(alertDialogInformation, 'subtitle')}</Typography>
        <Stack flexDirection={'row'} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            onClick={() => {
              secondary?.onClick?.(onClose);
            }}
            sx={{ mr: 2, ...(secondary?.sx || {}) }}
            variant="text"
          >
            {get(secondary, 'text')}
          </Button>
          <LoadingButton
            sx={{ ...(primary?.sx || {}) }}
            onClick={(event) => {
              primary?.onClick?.(onClose, onLoading, event);
            }}
            variant="contained"
            loading={get(primary, 'loading')}
          >
            {get(primary, 'text')}
          </LoadingButton>
        </Stack>
      </Card>
    </Dialog>
  );
}
