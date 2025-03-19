import { useEffect, useState } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Card,
  Dialog,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
// hooks
// components
import { RHFTextField } from './/hook-form';
import FormProvider from './FormProvider';

import { filter, find, get, isEmpty, map, slice } from 'lodash';
import { useRecoilValue } from 'recoil';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { stores } from 'src/global/recoilState';
import Auth_API from 'src/services/auth';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { REQUIRED_CONSTANTS } from 'src/constants/AppConstants';
import STORES_API from 'src/services/stores';
import CloseIcon from '@mui/icons-material/Close';

// ----------------------------------------------------------------------

export default function TerminalAddDialog(props) {
  const theme = useTheme();
  const { open, handleClose, selectedStore, getStores } = props;
  const storesList = useRecoilValue(stores);

  const [lastTerminalId, setLastTerminalId] = useState(null);

  const generateTerminalId = () => {
    if (!lastTerminalId) return 'T1';
    return `T${Number(lastTerminalId?.substring?.(1) || 0) + 1}`;
  };

  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(selectedStore);
  const newTerminalId = generateTerminalId();
  const RegisterSchema = Yup.object().shape({
    email: Yup.string().email().required(REQUIRED_CONSTANTS.EMAIL),
    terminalName: Yup.string().required(REQUIRED_CONSTANTS.TERMINAL_NAME),
    whatsappNumber: Yup.string().test(
      'is-optional-or-10-digit',
      'Phone number must be a valid 10-digit number',
      (value) => {
        if (value) {
          const numberWithoutCountryCode = value.replace(/^\+91/, '');
          return /^\d{10}$/.test(numberWithoutCountryCode);
        }
        return true;
      }
    ),
  });

  const handleFocusWhatsappNumber = () => {
    const currentValue = watch('whatsappNumber');
    if (currentValue && !currentValue.startsWith('+91')) {
      setValue('whatsappNumber', `+91${currentValue}`);
    }
  };
  const handleWhatsappNumberChange = (event) => {
    const value = event.target.value;

    if (value === '') {
      setValue('whatsappNumber', '');
      return;
    }

    if (!value.startsWith('+91')) {
      setValue('whatsappNumber', `+91${value.replace(/^\+91/, '')}`);
    } else {
      setValue('whatsappNumber', value);
    }
  };

  const defaultValues = {
    email: '',
    terminalName: '',
    whatsappNumber: '',
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const {
    reset,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = methods;
  const onSubmit = async (data) => {
    if (newTerminalId?.includes?.('NaN')) {
      toast.error(ErrorConstants.INVALID_TERMINAL_ID);
      return;
    }

    const options = {
      storeName,
      email: data.email,
      terminalName: data.terminalName,
      storeId: selectedStore,
      terminalId: newTerminalId,
    };
    if (data.whatsappNumber) {
      options.whatsappNumber = data.whatsappNumber;
    }
    try {
      const response = await Auth_API.createTerminal(options);
      if (response) {
        handleCloseDialog();
        getStores();
        toast.success(SuccessConstants.TERMINAL_CREATED);
      }
    } catch (error) {
      setError(ErrorConstants.AFTER_SUBMIT, {
        ...error,
        message:
          error?.response?.message ||
          error.detail ||
          error?.message ||
          error?.errorResponse?.message ||
          ErrorConstants.SOMETHING_WRONG,
      });
    }
  };
  const handleCloseDialog = () => {
    handleClose();
    reset();
  };
  useEffect(() => {
    reset(defaultValues);
  }, [newTerminalId, selectedStore, storeName]);

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

  console.log('lastTerminalId', lastTerminalId);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 310, md: 360, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add new terminal for{' '}
            <Typography sx={{ display: 'inline' }} variant="h6" color={theme.palette.primary.main}>
              {storeName}
            </Typography>
          </Typography>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.primary.main, height: 40 }}
              onClick={() => handleCloseDialog()}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

            <RHFTextField autoFocus name="terminalName" label="Terminal Name" />
            <RHFTextField name="email" label="Email address" />
            <RHFTextField
              name="whatsappNumber"
              label="Whatsapp Number (Optional)"
              onFocus={handleFocusWhatsappNumber}
              onChange={handleWhatsappNumberChange} // Handle dynamic input
              value={watch('whatsappNumber')}
            />

            <Typography variant="caption">
              <b>Note :</b> Credentials will be sent to this Email.
            </Typography>
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Add terminal
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Dialog>
  );
}
