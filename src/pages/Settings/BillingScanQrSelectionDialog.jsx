import { LoadingButton } from '@mui/lab';
import { Autocomplete, Button, Card, Dialog, Stack, TextField, Typography } from '@mui/material';
import { get, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { DefaultAliasLanguage, LANGUAGE_CONSTANTS } from 'src/constants/LanguageConstants';
import {
  currentStoreId,
  currentTerminalId,
  terminalConfigurationState,
} from 'src/global/recoilState';
import SettingServices from 'src/services/API/SettingServices';

export default function BillingScanQrSelectionDialog(props) {
  const { open, handleClose, initialFetch } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [loading, setLoading] = useState(false);
  const terminalConfiguration = useRecoilState(terminalConfigurationState)[0];
  const previous = get(terminalConfiguration, 'billingScanQr.qrString');
  console.log(terminalConfiguration);

  const [qrString, setQrString] = useState(previous);

  const handleSubmit = async () => {
    try {
      if (!isEmpty(qrString)) {
        setLoading(true);
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          terminalSettings: {
            ...terminalConfiguration,
            billingScanQr: {
              isActive: true,
              qrString: qrString,
            },
          },
        };
        await SettingServices.postTerminalConfiguration(options);
        setLoading(false);
        initialFetch();
        handleClose();
      } else {
        setLoading(false);
        toast.error('Please enter QR string');
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    if (previous) {
      setQrString(previous);
    }
  }, [previous]);

  return (
    <Dialog open={open}>
      <Card
        sx={{
          p: 2,
          width: { xs: 360, md: 400 },
          minHeight: 173,
          maxHeight: 500,
          overflowY: 'scroll',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          UPI ID
        </Typography>

        <TextField
          autoFocus
          fullWidth
          size="small"
          value={qrString}
          onChange={(e) => {
            setQrString(e.target.value);
          }}
        />

        <Stack
          flexDirection={'row'}
          gap={2}
          sx={{
            justifyContent: 'flex-end',
            mt: 2,
          }}
        >
          <Button onClick={() => handleClose()} variant="outlined">
            Cancel
          </Button>
          <LoadingButton loading={loading} onClick={handleSubmit} variant="contained">
            Submit
          </LoadingButton>
        </Stack>
      </Card>
    </Dialog>
  );
}


