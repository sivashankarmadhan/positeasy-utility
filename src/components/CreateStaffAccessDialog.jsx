import {
  Alert,
  Button,
  Card,
  Dialog,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { RHFAutocompleteObjOptions, RHFTextField } from './hook-form';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { filter, find, get, isEmpty, map } from 'lodash';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import Auth_API from 'src/services/auth';
import FormProvider from './FormProvider';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { REQUIRED_CONSTANTS } from 'src/constants/AppConstants';
import { Close } from '@mui/icons-material';

export default function CreateStaffAccessDialog(props) {
  const theme = useTheme();
  const {
    open,
    handleClose,
    selectedStore,
    staffId,
    paidStores,
    getTerminalsByStaffId,
    staffData,
  } = props;
  const [continueState, setContinueState] = useState(false);
  const [continueStateSecondCheck, setContinueStateSecondCheck] = useState(false);
  const [continueData, setContinueData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const selectedStaff = find(staffData, (e) => e.staffId === staffId);

  const RegisterSchema = Yup.object().shape({
    terminalId: Yup.object()
      .shape({
        label: Yup.string().required(REQUIRED_CONSTANTS.TERMINAL_ID),
        id: Yup.string().required(REQUIRED_CONSTANTS.TERMINAL_ID),
      })
      .required(REQUIRED_CONSTANTS.TERMINAL_ID),
  });
  const terminals = filter(paidStores, (e) => e.storeId === selectedStore);

  const defaultValues = {
    terminalId: { label: '', id: '' },
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const {
    reset,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    const options = {
      storeId: selectedStore,
      terminalNumber: get(data, 'terminalId.id'),
      staffId,
    };
    setContinueData(options);
    handleCheck(options);
  };

  const handleCheck = async (options) => {
    try {
      const response = await Auth_API.checkTerminalAccess(options);
      if (response) {
        secondCheck(options);
      }
    } catch (error) {
      console.log(error);
      setError(ErrorConstants.AFTER_SUBMIT, {
        ...error,
        message:
          error?.response?.message ||
          error.detail ||
          error?.message ||
          error?.errorResponse?.message ||
          ErrorConstants.SOMETHING_WRONG,
      });
      if (get(error, 'status') === 400 && get(error, 'errorResponse.code') === 'ERR_SBEE_0045') {
        setContinueState(true);
        setErrorMessage(get(error, 'errorResponse.message'));
      }
    }
  };
  const secondCheck = async (options) => {
    try {
      const response = await Auth_API.checkMultiAccess(options);
      if (response) {
        handleComplete(options);
      }
    } catch (error) {
      console.log(error);
      setError(ErrorConstants.AFTER_SUBMIT, {
        ...error,
        message:
          error?.response?.message ||
          error.detail ||
          error?.message ||
          error?.errorResponse?.message ||
          ErrorConstants.SOMETHING_WRONG,
      });
      if (get(error, 'status') === 400 && get(error, 'errorResponse.code') === 'ERR_SBEE_0050') {
        setContinueState(true);
        setContinueStateSecondCheck(true);
        setErrorMessage(get(error, 'errorResponse.message'));
      }
    }
  };
  const getStoreName = (storeId) => {
    const terminals = find(paidStores, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const handleComplete = async (options) => {
    try {
      const response = await Auth_API.createNewAccess(options);
      if (response) {
        toast.success(SuccessConstants.ACCESS_GRANTED);
        getTerminalsByStaffId();
        handleCloseDialog();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCloseDialog = () => {
    handleClose();
    reset();
    setContinueData({});
    setContinueState(false);
    setContinueStateSecondCheck(false);
    setErrorMessage('');
  };

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 360, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ mb: 2, display: continueState ? 'none' : '' }}>
            Link {getStoreName(selectedStore)} Terminal to{' '}
            <Typography variant="h6" sx={{ display: 'inline' }} color={theme.palette.primary.light}>
              {get(selectedStaff, 'name')}
            </Typography>
          </Typography>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() => handleClose()}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Stack>

        {!continueState && (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {get(errors, 'afterSubmit') && (
                <Alert severity="error">{errors.afterSubmit.message}</Alert>
              )}
              <Stack direction={'column'} spacing={2}>
                <Stack flexDirection="row" gap={1}>
                  <Typography variant="subtitle1">Store :</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {getStoreName(selectedStore)}
                  </Typography>
                </Stack>
                <RHFAutocompleteObjOptions
                  options={map(terminals, (e) => {
                    return {
                      //label: (`${get(e, 'terminalName')}`!=='null'||get(e, 'terminalName')!==null)?`${get(e, 'terminalName')}`:`${get(e, 'terminalNumber')}`,
                      label: `${
                        get(e, 'terminalName') !== 'null' && get(e, 'terminalName')
                          ? get(e, 'terminalName')
                          : get(e, 'terminalNumber')
                      }`,
                      id: get(e, 'terminalNumber'),
                    };
                  })}
                  name="terminalId"
                  label="Terminal"
                  helperText={'Terminal Required'}
                />
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Create access
                </LoadingButton>
              </Stack>
            </Stack>
          </FormProvider>
        )}
        {continueState && (
          <>
            <Typography
              sx={{ fontWeight: 'bold', display: 'flex', textAlign: 'left', fontSize: 14 }}
            >
              {errorMessage}
            </Typography>
            <Stack
              flexDirection={'row'}
              sx={{
                display: continueState ? 'flex' : 'none',
                justifyContent: 'flex-end',
                mt: 2,
                gap: 1,
              }}
            >
              <Button onClick={handleCloseDialog} variant="contained">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (continueState) secondCheck(continueData);
                  if (continueStateSecondCheck) handleComplete(continueData);
                }}
                variant="contained"
              >
                Ok
              </Button>
            </Stack>
          </>
        )}
      </Card>
    </Dialog>
  );
}
