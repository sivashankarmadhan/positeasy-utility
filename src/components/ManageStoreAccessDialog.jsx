import * as Yup from 'yup'; // form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
// hooks
// components
import { RHFCheckbox, RHFSwitch, RHFTextField } from './/hook-form';
import FormProvider from './FormProvider';

import { filter, find, get, groupBy, isEmpty, map, slice, some } from 'lodash';
import { useRecoilValue } from 'recoil';
import { REQUIRED_CONSTANTS, ROLES_DATA, VALIDATE_CONSTANTS } from 'src/constants/AppConstants';
import { stores } from 'src/global/recoilState';
import Auth_API from 'src/services/auth';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { useEffect, useState } from 'react';
import STORES_API from 'src/services/stores';
import CloseIcon from '@mui/icons-material/Close';

// ----------------------------------------------------------------------

export default function ManageStoreAccessDialog(props) {
  const theme = useTheme();
  const { open, handleClose, selectedStore, getStores, storeList } = props;

  // const storeList = useRecoilValue(stores);
  const [selectedStoreList, setSelectedStoreList] = useState([]);

  const [lastTerminalId, setLastTerminalId] = useState(null);

  const groupedStoresData = groupBy(storeList, 'storeId');
  const storeLabelList = map(groupedStoresData, (terminal, store) => {
    return {
      id: store,
      label: get(terminal, '0.storeName'),
    };
  });

  const checkCurrentStoreList = (status) => {
    const findData = find(selectedStoreList, (_item) => {
      return get(_item, 'id') === status;
    });
    return status === selectedStore || !!findData;
  };

  const handleChangeStatus = (e) => {
    setSelectedStoreList(e);
  };

  const getStoreName = (storeId) => {
    const terminals = find(storeList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(selectedStore);

  const generateTerminalId = () => {
    if (!lastTerminalId) return 'T1';
    return `T${Number(lastTerminalId?.substring?.(1) || 0) + 1}`;
  };

  const newTerminalId = generateTerminalId();

  const RegisterSchema = Yup.object().shape({
    email: Yup.string().email(VALIDATE_CONSTANTS.EMAIL).required(REQUIRED_CONSTANTS.EMAIL),
  });
  const defaultValues = {
    email: '',
    password: '',
    sendMail: false,
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const watchPassword = watch('password');

  const handleCloseDialog = () => {
    handleClose();
    reset();
  };

  const onSubmit = async (data) => {
    if (newTerminalId?.includes?.('NaN')) {
      toast.error(ErrorConstants.INVALID_TERMINAL_ID);
      return;
    }

    try {
      const checkOptions = {
        storeName: storeName,
        storeId: selectedStore,
        terminalId: newTerminalId,
        email: data.email,
        password: data.password,
        sendMail: data.sendMail,
        storeAccess: map(selectedStoreList, (_item) => get(_item, 'id')),
      };
      await Auth_API.createManagerAccount(checkOptions);
      toast.success(SuccessConstants.MANAGER_ACCOUNT_IS_CREATED_SUCCESSFULLY);
      handleCloseDialog();
      getStores();
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (!watchPassword) {
      setValue('sendMail', true);
    }
  }, [watchPassword]);

  useEffect(() => {
    if (!isEmpty(storeList)) {
      const findData = find(storeLabelList, (_item) => get(_item, 'id') === selectedStore);
      setSelectedStoreList([findData]);
    }
  }, [storeList]);

  const getLastTerminalId = async () => {
    try {
      const resp = await STORES_API.getLastTerminalId(selectedStore);
      setLastTerminalId(get(resp, 'data.terminalId'));
    } catch (err) {
      console.log('err', 'err');
      // toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (open) {
      getLastTerminalId();
    }
  }, [open]);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 310, md: 360, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create manager account for &nbsp;
            <Typography variant="h6" sx={{ display: 'inline' }} color={theme.palette.primary.main}>
              {storeName}
            </Typography>
          </Typography>

          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() => handleCloseDialog()}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <RHFTextField autoFocus name="email" label="Email address" />
            <RHFTextField
              name="password"
              label="Password"
              placeholder="Optional"
              InputLabelProps={{ shrink: true }}
            />
            <RHFCheckbox
              name="sendMail"
              label="Credentials will be sent to this Email."
              disabled={!watchPassword}
            />

            <Autocomplete
              multiple
              size="small"
              filterSelectedOptions
              getOptionDisabled={(option) => checkCurrentStoreList(option.id)}
              options={storeLabelList}
              sx={{
                '& .MuiInputBase-root .MuiButtonBase-root:first-child .MuiSvgIcon-root': {
                  display: 'none',
                },
              }}
              value={selectedStoreList}
              onChange={(event, newValue) => handleChangeStatus(newValue)}
              renderInput={(params) => <TextField variant="filled" {...params} label={'Stores'} />}
            />

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Create account
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Dialog>
  );
}
