import { useEffect, useState } from 'react';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { get } from 'lodash';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Card, Dialog, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
// hooks
// components
import { RHFTextField } from './/hook-form';
import FormProvider from './FormProvider';
import STORES_API from 'src/services/stores';
import { isEmpty, map } from 'lodash';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import Auth_API from 'src/services/auth';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { REQUIRED_CONSTANTS, VALIDATE_CONSTANTS } from 'src/constants/AppConstants';
import LoadingScreen from './loading-screen/LoadingScreen';
import CloseIcon from '@mui/icons-material/Close';


// ----------------------------------------------------------------------

export default function StoresAddDialog(props) {
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const { open, handleClose, storeLabelList, getStores, storeList, setStoreList } = props;

  const RegisterSchema = Yup.object().shape({
    storeName: Yup.string()
      .max(30, VALIDATE_CONSTANTS.STORE_NAME_30CHAR)
      .required(REQUIRED_CONSTANTS.STORE_NAME),
    email: Yup.string().email().required(REQUIRED_CONSTANTS.EMAIL),
    terminalName: Yup.string().required(REQUIRED_CONSTANTS.TERMINAL_NAME),
    whatsappNumber: Yup.string()
    .test(
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
  const handleFocusWhatsappNumberstore = () => {
    const currentValue = watch('whatsappNumber');
    if (currentValue && !currentValue.startsWith('+91')) {
      setValue('whatsappNumber', `+91${currentValue}`);
    }
  };
  const handleWhatsappNumberChangestore = (event) => {
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
  
  const generateStoreId = (data) => {
    if (isEmpty(data || storeLabelList)) return;
    const formatStores = map(data || storeLabelList, (_store) => {
      var numb = _store.match(/\d/g);
      numb = numb?.join('');
      return Number(numb) || 0;
    });

    return `Store${Math.max(...(formatStores || [])) + 1}s`;
  };

  const defaultValues = {
    storeName: '',
    email: '',
    terminalName: '',
    terminalId: 'T1',
    whatsappNumber: '', 

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

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const managerResponse = await STORES_API.getManagerAllList();
      if (managerResponse) {
        setStoreList(get(managerResponse, 'data', []));
      } else {
        throw new Error('Failed to retrieve manager list');
      }
      const newStoreId = generateStoreId(
        map(get(managerResponse, 'data', []), (_item) => get(_item, 'storeId'))
      );
      const options = {
        storeName: data.storeName,
        email: data.email,
        storeId: newStoreId,
        terminalId: data.terminalId,
        terminalName: data.terminalName,
      };
      if (data.whatsappNumber) {
        options.whatsappNumber = data.whatsappNumber;
      }

      const storeResponse = await Auth_API.createStores(options);
      if (storeResponse && managerResponse) {
        handleCloseDialog();
        getStores();
        toast.success(SuccessConstants.STORE_CREATED);
      } else {
        throw new Error('Failed to create store');
      }
    } catch (error) {
      setError('afterSubmit', {
        type: 'manual',
        message:
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.message ||
          ErrorConstants.SOMETHING_WRONG,
      });
      console.error('Error in onSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    handleClose();
    reset();
  };
  useEffect(() => {
    reset(defaultValues);
  }, []);
  if (isLoading) return <LoadingScreen />;
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 310, md: 360, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add new store
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
          <Stack spacing={1}>
            {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
            {false && (
              <Tooltip title="Terminal Id Autogenerated Not Editable">
                <RHFTextField
                  name="terminalId"
                  label="Terminal Id"
                  variant="filled"
                  sx={{ pointerEvents: 'none' }}
                  InputProps={{ style: { color: 'black' }, readOnly: true }}
                />
              </Tooltip>
            )}

            <RHFTextField autoFocus name="storeName" label="Store name" />
            <RHFTextField name="terminalName" label="Terminal name" />

            {false && (
              <Tooltip title="Store Id Autogenerated Not Editable">
                <RHFTextField
                  name="storeId"
                  label="Store Id"
                  sx={{ pointerEvents: 'none' }}
                  InputProps={{ style: { color: 'rgba(0,0,0,0.4)' }, readOnly: true }}
                />
              </Tooltip>
            )}

            <RHFTextField name="email" label="Email address" />
            <RHFTextField name="whatsappNumber" label="Whatsapp Number (Optional)" onFocus={handleFocusWhatsappNumberstore} onChange={handleWhatsappNumberChangestore}
            value={watch('whatsappNumber')} />
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
              Add store
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Dialog>
  );
}
