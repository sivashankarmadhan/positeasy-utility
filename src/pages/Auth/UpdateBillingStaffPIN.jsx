import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Alert, Button, IconButton, InputAdornment, Stack } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RHFTextField } from '../../components/hook-form';
import Iconify from '../../components/iconify';
import {
  BILLING_STAFF_DEFAULT_PIN,
  REQUIRED_CONSTANTS,
  SUMMARY_DEFAULT_PIN,
  VALIDATE_CONSTANTS,
} from '../../constants/AppConstants';
import { SuccessConstants } from '../../constants/SuccessConstants';
import * as Yup from 'yup';
import FormProvider from '../../components/FormProvider';

// ----------------------------------------------------------------------

export default function UpdateBillingStaffPIN({ handleClose, handleSetStaffPIN, previous }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const defaultValues = {
    confirmPIN: null,
    PIN: null,
  };
  const RegisterSchema = Yup.object().shape({
    PIN: Yup.string('PIN must be only number')
      .required(REQUIRED_CONSTANTS.PIN)
      .matches(/^(?=.*[0-9])/, {
        message: 'Password must be  number.',
      })
      .max(5, 'PIN must be maximum 5 digits')
      .min(5, 'PIN must be atleast 5 digits'),
    confirmPIN: Yup.string('PIN must be only number')
      .oneOf([Yup.ref('PIN'), null], VALIDATE_CONSTANTS.PIN_SHOULD_SAME)
      .required(REQUIRED_CONSTANTS.CONFIRM_PIN),
  });
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    setError,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {
    try {
      handleSetStaffPIN({ ...previous, secretPin: data.confirmPIN });
      handleClose();
    } catch (error) {
      console.log(error);
      setError('afterSubmit', {
        ...error,
        message:
          error.detail ||
          error.message ||
          error.errorResponse.message ||
          error.errorResponse.data.message ||
          'Something went wrong!!',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ my: 2 }}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField
          fullWidth
          name="PIN"
          type={showPassword ? 'number' : 'password'}
          label="New PIN"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleShowPassword} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField
          name="confirmPIN"
          label="Confirm PIN"
          type={showConfirmPassword ? 'number' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
          <Button variant="text" onClick={() => handleClose()}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isLoading}>
            Update
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
