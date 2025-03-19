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

export default function LanguageSelectionDialog(props) {
  const { open, handleClose, initialFetch } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [loading, setLoading] = useState(false);
  const terminalConfiguration = useRecoilState(terminalConfigurationState)[0];
  const previous = get(terminalConfiguration, 'alias.language');
  console.log(terminalConfiguration);
  const isShowProductCategoryAlias = get(terminalConfiguration, 'alias.isActive', false);
  const [selectedLanguage, setSelectedLanguage] = useState(previous || DefaultAliasLanguage);
  const handleChangeAliasLanguage = (e, value) => {
    e.stopPropagation();
    setSelectedLanguage(value);
  };

  const handleSubmit = async () => {
    try {
      if (!isEmpty(selectedLanguage)) {
        setLoading(true);
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          terminalSettings: {
            ...terminalConfiguration,
            alias: {
              isActive: isShowProductCategoryAlias,
              language: selectedLanguage,
            },
          },
        };
        await SettingServices.postTerminalConfiguration(options);
        setLoading(false);
        initialFetch();
        handleClose();
      } else {
        setLoading(false);
        toast.error('Choose one language');
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    if (previous) {
      setSelectedLanguage(previous);
    }
  }, [previous]);

  return (
    <Dialog open={open}>
      <Card
        sx={{
          p: 2,
          width: { xs: 360, md: 400 },
          minHeight: 200,
          maxHeight: 500,
          overflowY: 'scroll',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Choose language
        </Typography>

        <Autocomplete
          fullWidth
          disablePortal
          value={selectedLanguage}
          options={LANGUAGE_CONSTANTS}
          freeSolo={false}
          onChange={handleChangeAliasLanguage}
          renderInput={(params) => <TextField {...params} label="Language" />}
        />
        <Typography variant="caption" sx={{ mb: 2, fontWeight: 'bold' }}>
          Note : This above choosing language for the staff app to show the product alias and
          category alias
        </Typography>
        <Stack
          flexDirection={'row'}
          gap={2}
          sx={{
            justifyContent: 'flex-end',
            mt: 2,
          }}
        >
          <Button onClick={() => handleClose()} variant="outlined">
            Close
          </Button>
          <LoadingButton loading={loading} onClick={handleSubmit} variant="contained">
            Submit
          </LoadingButton>
        </Stack>
      </Card>
    </Dialog>
  );
}
