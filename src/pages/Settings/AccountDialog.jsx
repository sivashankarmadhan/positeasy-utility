import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import STORES_API from 'src/services/stores';
import { allConfiguration, currentStoreId, currentTerminalId, stores } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import RegexValidation from 'src/constants/RegexValidation';
import { find, get } from 'lodash';

const validationSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(RegexValidation.PHONE_NUMBER, 'Enter a valid 10-digit phone number')
    .nullable(),

  email: Yup.string()
    .matches(RegexValidation.EMAIL, 'Enter a valid email address')
    .required('Email is required'),
});
const OptionsDialog = ({ open, handleClose, otherAccountInfo }) => {
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [isEmailChecked] = useState(true);
  const selectedTerminal = useRecoilValue(currentTerminalId);
  const currentStore = useRecoilValue(currentStoreId);
  const storesData = useRecoilValue(stores);

  const [configuration] = useRecoilState(allConfiguration);
  const isMobile = useMediaQuery('(max-width:600px)');
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { phone: null, email: '', isPhoneChecked: false, isEmailChecked: false },
  });

  console.log('errors', errors);
  const findData = find(storesData, (_item) => {
    return (
      get(_item, 'storeId') === currentStore && get(_item, 'terminalId') === selectedTerminal
    );
  });
  const dialogStyles = {
    width: '450px',
    minHeight: isMobile ? '430px' : '390px',
  };

  const onSubmit = async (values) => {
    if (!isEmailChecked) {
      toast.error('Please select email as the communication method');
      return;
    }

    const options = {
      phone: isPhoneChecked ? `91${values.phone}` : '',
      mail: isEmailChecked ? values.email : '',
      ismsg: isPhoneChecked,
      terminalNumber: findData?.terminalNumber,
      merchantId: configuration.merchantId,
    };
    // console.log(confiiiiiii, 'configuration');
    try {
      const response = await STORES_API.passKey(options);
      if (response) {
        toast.success('Pass key changed successfully');
        handleClose();
      }
    } catch (error) {
      console.error('error', error.message);
      toast.error(error.message);
    }
  };
  console.log('otherAccountInfoooo', otherAccountInfo);
  return (
    <Dialog open={open}  PaperProps={{ style: dialogStyles }}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'left', fontSize: '16px' }}>
          Choose your desired method to share your terminal passkey (
          {otherAccountInfo?.terminalName || ''})
        </Typography>

        <Typography variant="body2" sx={{ color: '#757575', fontSize: '14px', pt: 1 }}>
          Remember your passkey is confidential. Please keep it hidden.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" alignItems="center" sx={{ height: '55px' }} mt={1} mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPhoneChecked}
                  onChange={() => {
                    setIsPhoneChecked(!isPhoneChecked);
                    setValue('isPhoneChecked', !isPhoneChecked);
                  }}
                  name="phoneCheckbox"
                  color="primary"
                />
              }
              label="Phone"
            />
            {isPhoneChecked && (
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Number"
                    variant="outlined"
                    margin="dense"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={{
                      marginLeft: 1.3,
                      flex: 1,
                      height: '56px',
                    }}
                  />
                )}
              />
            )}
          </Box>

          <Box display="flex" alignItems="center" sx={{ height: '55px' }} mt={4} mb={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isEmailChecked}
                  onChange={() => {
                    setValue('isEmailChecked', !isEmailChecked);
                  }}
                  name="emailCheckbox"
                  color="primary"
                />
              }
              label="Email"
            />
            {isEmailChecked && (
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    variant="outlined"
                    margin="dense"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      marginLeft: 2,
                      flex: 1,
                      height: '56px',
                    }}
                  />
                )}
              />
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{ color: 'red', fontSize: '12px', fontWeight: 'bold' }}
            mt={4}
          >
            Note: The current passkey will be regenerated!
          </Typography>
          <Stack sx={{ flexDirection: 'row', justifyContent: 'end', gap: '10px' }} mt={1}>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Submit
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OptionsDialog;
