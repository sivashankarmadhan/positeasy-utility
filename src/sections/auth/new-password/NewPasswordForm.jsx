import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, FormHelperText } from '@mui/material';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import { RHFTextField } from '../../../components/hook-form';
import FormProvider from '../../../components/FormProvider';
import AuthService from '../../../services/auth';
import get from 'lodash/get';
import { PATH_AUTH } from '../../../routes/paths';
import { useParams } from 'react-router';
import jwt_decode from 'jwt-decode';
import toast from 'react-hot-toast';
import { ErrorConstants } from '../../../constants/ErrorConstants';

// ----------------------------------------------------------------------

export default function NewPasswordForm() {
  const navigate = useNavigate();

  const params = useParams();

  const token = get(params, 'token');

  const data = jwt_decode(token);

  const email = get(data, 'email');

  const [showPassword, setShowPassword] = useState(false);

  const NewPasswordSchema = Yup.object().shape({
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  });

  const defaultValues = {
    email,
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    mode: 'all',
    resolver: yupResolver(NewPasswordSchema),
    defaultValues,
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const handleResendEmail = async () => {
    try {
      const response = await AuthService.sendResetEmail({
        email,
      });
      toast.success(get(response, 'data'));
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_SEND_EMAIL);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await AuthService.sendNewPassword(
        {
          password: get(data, 'password'),
          confirmPassword: get(data, 'confirmPassword'),
        },
        token
      );
      toast.success(get(response, 'data'));
      navigate(PATH_AUTH.login, { replace: true });
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_RESET_PASSWORD);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email" disabled />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Change password
        </LoadingButton>

        <Typography variant="body2">
          Not working? &nbsp;
          <Link sx={{ cursor: 'pointer' }} variant="subtitle2" onClick={() => handleResendEmail()}>
            Resend email
          </Link>
        </Typography>
      </Stack>
    </FormProvider>
  );
}
