import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { get } from 'lodash';
import React from 'react';
import { useRecoilState } from 'recoil';
import { alertDialogInformationState } from 'src/global/recoilState';

export default function AlertDialog() {
  const [alertDialogInformation, setAlertDialogInformation] = useRecoilState(
    alertDialogInformationState
  );

  const { primary, secondary } = alertDialogInformation?.actions || {};

  const onClose = () => {
    setAlertDialogInformation({ open: false });
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
          <Button
            sx={{ ...(primary?.sx || {}) }}
            onClick={() => {
              primary?.onClick?.(onClose);
            }}
            variant="contained"
          >
            {get(primary, 'text')}
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
