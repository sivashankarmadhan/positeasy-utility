import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';

// form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  alpha,
  Checkbox,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
// hooks
// components
import { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { PATH_AUTH } from 'src/routes/paths';
import FormProvider from '../../components/FormProvider';

import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import Auth_API from 'src/services/auth';
import { REQUIRED_CONSTANTS, VALIDATE_CONSTANTS } from 'src/constants/AppConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import RegexValidation from 'src/constants/RegexValidation';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function RegisterForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isChecked, setIsChecked] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required(REQUIRED_CONSTANTS.NAME),
    storeName: Yup.string().required(REQUIRED_CONSTANTS.BUSINESS_NAME),
    email: Yup.string().email(VALIDATE_CONSTANTS.EMAIL).required(REQUIRED_CONSTANTS.EMAIL),
    contactNumber: Yup.string()
      .matches(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits')
      .required(REQUIRED_CONSTANTS.CONTACT_NUMBER),
    password: Yup.string().required(REQUIRED_CONSTANTS.PASSWORD),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], VALIDATE_CONSTANTS.PASSWORD_SHOULD_SAME)
      .required(REQUIRED_CONSTANTS.CONFIRM_PASSWORD),
  });

  const defaultValues = {
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    storeName: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    const options = {
      name: data.name.trim(),
      storeName: data.storeName.trim(),
      contactNumber: '91' + data.contactNumber.trim(),
      password: data.password.trim(),
      email: data.email.trim(),
    };
    try {
      const response = await Auth_API.signup(options);
      if (response) {
        toast.success(SuccessConstants.REGISTER);
        navigate(PATH_AUTH.login, { replace: true });
        reset();
      }
    } catch (error) {
      console.error(error);
      setError('afterSubmit', {
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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="name" label="Name" />
        <RHFTextField name="storeName" label="Business name" />

        <RHFTextField name="contactNumber" label="Whatsapp number" />

        <Stack pl={0} pb={0}>
          <Typography
            fontWeight={600}
            fontSize={'10px'}
            sx={{
              color: 'black',
              p: 1,
              pl: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '5px',
              opacity: '80%',
            }}
          >
            <b>Note:</b>&nbsp; Credentials will be sent to this number{' '}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <RHFTextField
            name="confirmPassword"
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <RHFTextField name="email" label="Email address" />
        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            name="loginCheckbox"
            color="primary"
          />
          <Typography>
            I read and agree to&nbsp;
            <Link
              variant="subtitle2"
              to={'https://www.positeasy.com/termsandconditions'}
              target="_blank"
            >
              Terms & Conditions
            </Link>
            &nbsp;and&nbsp;
            <Link
              variant="subtitle2"
              to={'https://www.positeasy.com/privacy-policy'}
              target="_blank"
            >
              Privacy Policy
            </Link>
          </Typography>
        </Stack>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={!isChecked}
        >
          Register
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
