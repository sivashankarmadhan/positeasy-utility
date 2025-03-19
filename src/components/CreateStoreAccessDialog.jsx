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
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { RHFAutocompleteObjOptions } from './hook-form';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { filter, find, get, groupBy, isEmpty, map } from 'lodash';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Auth_API from 'src/services/auth';
import FormProvider from './FormProvider';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { REQUIRED_CONSTANTS, ROLES_DATA } from 'src/constants/AppConstants';
import RHFAutoCompleteCustomObj from './hook-form/RHFAutoCompleteCustomObj';
import ObjectStorage from 'src/modules/ObjectStorage';
import { ROLE_STORAGE } from 'src/constants/StorageConstants';
import { currentStoreId, stores } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import CloseIcon from '@mui/icons-material/Close';

export default function CreateStoreAccessDialog(props) {
  const { open, handleClose, paidStores, staffId, getTerminalsByStaffId, staffData } = props;
  const theme = useTheme();

  const storesData = useRecoilValue(stores);

  const groupedStoresData = groupBy(paidStores, 'storeId');
  const storeLabelList = map(groupedStoresData, (terminal, store) => store);
  const [continueState, setContinueState] = useState(false);
  const [continueStateSecondCheck, setContinueStateSecondCheck] = useState(false);
  const [continueData, setContinueData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const selectedStore = useRecoilValue(currentStoreId);

  const { role } = ObjectStorage.getItem(ROLE_STORAGE.ROLE) || {};
  const isManager = role === ROLES_DATA.store_manager.role;

  const selectedStaff = find(staffData, (e) => e.staffId === staffId);
  const RegisterSchema = Yup.object().shape({
    terminalId: Yup.object()
      .shape({
        label: Yup.string().required(REQUIRED_CONSTANTS.TERMINAL_ID),
        id: Yup.string().required(REQUIRED_CONSTANTS.TERMINAL_ID),
        data: Yup.object(),
      })
      .required(REQUIRED_CONSTANTS.TERMINAL_ID),
  });
  const getTerminalsByStoreId = () => {
    const terminals = filter(paidStores, (e) => e.storeId === selectedStore);
    return terminals;
  };
  const getStoreName = (storeId) => {
    const terminals = find(groupBy(storesData, 'storeId'), (terminal, store) => {
      return store === storeId;
    });
    if (isEmpty(terminals)) return '';
    return get(terminals, '0.storeName');
  };

  const defaultValues = {
    terminalId: { label: '', id: '', data: {} },
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
        setContinueState(true);
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
        setContinueStateSecondCheck(true);
        setErrorMessage(get(error, 'errorResponse.message'));
      }
    }
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

  const terminalList = isManager
    ? filter(getTerminalsByStoreId(), (_item) => {
        return get(_item, 'roleId') !== ROLES_DATA.master.id;
      })
    : getTerminalsByStoreId();

  console.log('terminalList', terminalList);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 310, md: 360, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ mb: 1, display: continueState ? 'none' : '' }}>
            Link Terminal to{' '}
            <Typography variant="h6" sx={{ display: 'inline' }} color={theme.palette.primary.light}>
              {get(selectedStaff, 'name')}
            </Typography>
          </Typography>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() =>  handleCloseDialog()}
            >
              <CloseIcon />
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

                <RHFAutoCompleteCustomObj
                  options={map(terminalList || [], (e) => {
                    return {
                      label: `${
                        get(e, 'terminalName') !== 'null' && get(e, 'terminalName')
                          ? get(e, 'terminalName')
                          : get(e, 'terminalNumber')
                      }`,
                      id: get(e, 'terminalNumber'),
                      data: { ...e },
                    };
                  })}
                  name="terminalId"
                  freeSolo={false}
                  label="Terminal"
                  helperText={'Terminal not found'}
                  renderOption={(props, option, { selected }) => (
                    <li
                      {...props}
                      style={{
                        ...(get(option, 'data.roleId') === ROLES_DATA.master.id
                          ? {
                              backgroundColor: theme.palette.warning.main,
                              color: '#FFFFFF',
                              fontWeight: 'bold',
                              pointerEvents: 'none',
                            }
                          : {}),
                      }}
                    >
                      {get(option, 'data.roleId') === ROLES_DATA.master.id
                        ? `${option.label} *(Not Allowed)`
                        : option.label}
                    </li>
                  )}
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
              <Button size={'small'} onClick={handleCloseDialog} variant="text">
                Cancel
              </Button>
              <Button
                size={'small'}
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
