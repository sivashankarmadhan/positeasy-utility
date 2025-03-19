import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Iconify from 'src/components/iconify';
import { REQUIRED_CONSTANTS, ROLES_DATA, VALIDATE_CONSTANTS } from 'src/constants/AppConstants';
import { PATH_AUTH } from 'src/routes/paths';
import Auth_API from 'src/services/auth';
import AuthService from 'src/services/authService';
import * as Yup from 'yup';
import FormProvider from '../../components/FormProvider';
import { RHFTextField } from 'src/components/hook-form';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { get } from 'lodash';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

export default function ForgotForm({ handleClose, role }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };
  const handleShowOldPassword = () => {
    setShowOldPassword((show) => !show);
  };
  const defaultValues = {
    oldPassword: '',
    confirmPassword: '',
    password: '',
  };
  const RegisterSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old password is required'),
    password: Yup.string().required(REQUIRED_CONSTANTS.PASSWORD),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], VALIDATE_CONSTANTS.PASSWORD_SHOULD_SAME)
      .required(REQUIRED_CONSTANTS.CONFIRM_PASSWORD),
  });
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
  const handleSuccess = (msg) => {
    handleClose();
    toast.success(msg || SuccessConstants.PASSWORD_UPDATED);
  };
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const options = {
        oldPassword: data.oldPassword,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };
      if (role === ROLES_DATA.master.role) {
        const response = await Auth_API.masterUpdatePassword(options);
        if (response) {
          handleSuccess(get(response, 'data.message'));
        }
      }
      if (role !== ROLES_DATA.master.role) {
        const response = await Auth_API.updatePassword(options);
        if (response) {
          handleSuccess(get(response, 'data.message'));
        }
      }
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
          name="oldPassword"
          type={showOldPassword ? 'text' : 'password'}
          label="Old"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleShowOldPassword} edge="end">
                  <Iconify icon={showOldPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <RHFTextField
          fullWidth
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="New"
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
          name="confirmPassword"
          label="Confirm"
          type={showConfirmPassword ? 'text' : 'password'}
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
