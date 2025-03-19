import {
  Button,
  Card,
  Checkbox,
  Dialog,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import StoreServices from 'src/services/API/StoreServices';
import { useBoolean } from 'src/hooks/useBoolean';
import Iconify from 'src/components/iconify';
import SettingServices from 'src/services/API/SettingServices';
import { find, get, isEmpty, map } from 'lodash';
import { currentStoreId, stores } from 'src/global/recoilState';
import { useRecoilValue } from 'recoil';

const ViewIntegrateDialog = ({
  isOpen,
  onClose,
  getStoreDetails,
  integrationName,
  integrateData,
  configuration,
  getIntegration,
}) => {
  const [sectionName, setSectionName] = useState('');
  const [webHooks1, setWebHooks1] = useState('');
  const [webHooks2, setWebHooks2] = useState('');
  const currentStore = useRecoilValue(currentStoreId);
  const [isIntegration, setIsIntegration] = useState(false);
  const [webHooksSection, setWebHooksSection] = useState('');
  const [webHooksSection1, setWebHooksSection1] = useState('');
  const [webHooksSection2, setWebHooksSection2] = useState('');
console.log('currenntStore', currentStore);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isShortKeyCopy, setIsShortKeyCopy] = useState(false);
  console.log('integrateData', integrateData);

  const handleNameChange = (e) => {
    setSectionName(e.target.value)
  }
  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const addIntegration = async (e) => {

    try {
      const options = {
        storeId: configuration?.storeId,
        name: sectionName,
        storeName: storeName
      }
      const resp = await SettingServices.addIntegration(options);
      setSectionName('')
      getIntegration()
      onClose()
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  return (
    <Dialog sx={{ width: '100%' }} open={isOpen}>
      <Stack gap={2} sx={{ p: 2, width: { xs: 300, sm: 600 } }}>
        <Stack
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          sx={{ cursor: 'pointer' }}
        >
          <Typography variant="h6">Integration</Typography>
          <CloseIcon onClick={onClose} />
        </Stack>

  
<Stack> <Stack
          sx={{
            backgroundColor: '#F0EFEF',
            justifyContent: 'center',
            p: 2,
            borderRadius: '10px',

            gap: 2,
          }}
        >
          <Stack
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            sx={{ cursor: 'pointer' }}
          >
            {/* <Typography variant="h6">Name</Typography> */}
            {/* <DeleteIcon sx={{ color: 'red' }} onClick={deleteIntegration} /> */}
          </Stack>

          <Stack gap={2}>
            <TextField
              fullWidth
              // disabled
              value={sectionName}
              onChange={handleNameChange}
              label="Enter Name"
              type={'text'}
            />
            <Button
            size="large"
            type="button"
            variant="contained"
             onClick={addIntegration}
          >
            Generate
          </Button>
            {/* <ContentCopyIcon sx={{ cursor: 'pointer' }} /> */}
            {/* <Button size="small" type="button" variant="contained">
            Regenerate
          </Button> */}
          </Stack>
        </Stack>
   </Stack>

        {/* <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
          <Button size="large" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="large"
            type="button"
            variant="contained"
            //  onClick={onSubmit}
          >
            Submit
          </Button>
        </Stack> */}
      </Stack>
    </Dialog>
  );
};

export default ViewIntegrateDialog;
