import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Alert, IconButton, InputAdornment, Stack, Link } from '@mui/material';
import { get, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import {
  REQUIRED_CONSTANTS,
  ROLES_DATA,
  SignInTypes,
  VALIDATE_CONSTANTS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { ROLE_STORAGE, StorageConstants } from 'src/constants/StorageConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { signInAs, stores } from 'src/global/recoilState';
import ObjectStorage from 'src/modules/ObjectStorage';
import Auth_API from 'src/services/auth';
import AuthService from 'src/services/authService';
import STORES_API from 'src/services/stores';
import * as Yup from 'yup';
import FormProvider from '../../components/FormProvider';
import { PATH_AUTH, PATH_DASHBOARD } from '../../routes/paths';
import RegexValidation from 'src/constants/RegexValidation';
import loginCredentials from 'src/modules/IndexDB/LoginCredentials';
import getClone from 'src/utils/getClone';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const signedInAs = useRecoilValue(signInAs);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const setStoresData = useSetRecoilState(stores);
  const isRefreshToken = AuthService._getRefreshToken();

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const defaultValues = {
    ...(signedInAs === SignInTypes.TERMINAL
      ? { terminalNumber: '', passkey: '', contactNumber: '' }
      : { email: '', password: '' }),
  };

  const RegisterSchema = Yup.object().shape({
    ...(signedInAs === SignInTypes.TERMINAL
      ? {
          terminalNumber: Yup.string().required(REQUIRED_CONSTANTS.TERMINAL_NUMBER),
          passkey: Yup.string().required(REQUIRED_CONSTANTS.PASS_KEY),
          contactNumber: Yup.string()
            .matches(RegexValidation.PHONE_NUMBER, VALIDATE_CONSTANTS.CONTACT_NUMBER)
            .required(REQUIRED_CONSTANTS.CONTACT_NUMBER),
        }
      : {
          email: Yup.string()
            .transform((value) => value.trim())
            .email(VALIDATE_CONSTANTS.USERNAME)
            .required(REQUIRED_CONSTANTS.EMAIL),
          password: Yup.string().required(REQUIRED_CONSTANTS.PASSWORD),
        }),
  });

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const values = watch();

  const handleTokenSetup = async (response, isStaff) => {
    ObjectStorage.setItem(StorageConstants.ACCESS_TOKEN, { token: response?.data.accessToken });
    ObjectStorage.setItem(ROLE_STORAGE.ROLE, {
      role: get(response, 'data.respPayload.role'),
    });

    ObjectStorage.setItem(StorageConstants.REFRESH_TOKEN, {
      token: get(response, 'data.refreshToken'),
    });
    ObjectStorage.setItem(StorageConstants.MERCHANT_DETAILS, {
      data: { ...get(response, 'data.respPayload') },
    });
    await getStores(get(response, 'data.respPayload.role'));

    navigate(isStaff ? PATH_DASHBOARD.inventory.products : PATH_DASHBOARD.dashboard, {
      replace: true,
    });

    toast.success(SuccessConstants.LOGIN);
  };

  const getStores = async (role) => {
    try {
      if (role === ROLES_DATA.master.role) {
        const response = await STORES_API.getStoresMaster();
        if (response) {
          setStoresData(get(response, 'data'));
          ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
        }
      } else if (
        role === ROLES_DATA.store_manager.role ||
        role === ROLES_DATA.manager_and_staff.role
      ) {
        const response = await STORES_API.getStoresManager();
        if (response) {
          setStoresData(get(response, 'data'));
          ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
        }
      } else {
        const response = await STORES_API.getStoresByStoreId();
        if (response) {
          setStoresData(get(response, 'data'));
          ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const onSubmit = async (data) => {
    try {
      const trimmedData = {
        email: data?.email?.trim(),
        password: data?.password?.trim(),
        terminalNumber: data?.terminalNumber?.trim(),
        passkey: data?.passkey?.trim(),
        contactNumber: data?.contactNumber?.trim(),
      };

      const options = {
        email: trimmedData?.email,
        password: trimmedData?.password,
      };
      console.log(options, 'options');
      if (signedInAs === SignInTypes.MASTER) {
        const response = await Auth_API.masterSignin(options);
        if (response) handleTokenSetup(response);
      } else if (signedInAs === SignInTypes.MANAGER) {
        const response = await Auth_API.managerSignin(options);
        if (response) handleTokenSetup(response);
      } else if (signedInAs === SignInTypes.TERMINAL) {
        const terminalOptions = {
          terminalNumber: trimmedData.terminalNumber,
          passkey: trimmedData.passkey,
          contactNumber: trimmedData.contactNumber,
        };
        const response = await Auth_API.signin(terminalOptions);
        if (response) {
          const localLoginCredentials = await loginCredentials.getAllLoginCredentials();
          if (!isEmpty(localLoginCredentials)) {
            const firstLocalLoginCredentials = get(localLoginCredentials, '0');
            await loginCredentials.editParticularLoginCredentials({
              ...trimmedData,
              id: get(firstLocalLoginCredentials, 'id'),
            });
          } else {
            await loginCredentials.addLoginCredentials(trimmedData);
          }
          handleTokenSetup(response, true);
        }
      }

      reset();
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    reset();
  }, [signedInAs]);

  const getLocalLoginCredentials = async () => {
    const localLoginCredentials = await loginCredentials.getAllLoginCredentials();
    if (!isEmpty(localLoginCredentials)) {
      const firstLocalLoginCredentials = getClone(get(localLoginCredentials, '0'));
      delete firstLocalLoginCredentials?.id;
      reset(firstLocalLoginCredentials);
    }
  };

  useEffect(() => {
    if (signedInAs === SignInTypes.TERMINAL) {
      getLocalLoginCredentials();
    } else {
      reset();
    }
  }, [signedInAs]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ my: 2 }}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
        <RHFTextField
          sx={{ backgroundColor: '#eee' }}
          fullWidth
          autoComplete={signedInAs === SignInTypes.TERMINAL ? 'terminalNumber' : 'email'}
          type="text"
          label={signedInAs === SignInTypes.TERMINAL ? 'Terminal Access Id' : 'Username / Email'}
          name={signedInAs === SignInTypes.TERMINAL ? 'terminalNumber' : 'email'}
        />
        <RHFTextField
          name="contactNumber"
          label="Contact number"
          sx={{
            display: signedInAs === SignInTypes.TERMINAL ? '' : 'none',
            backgroundColor: '#eee',
          }}
          InputLabelProps={{ shrink: !!get(values, 'contactNumber') }}
        />
        <RHFTextField
          sx={{ backgroundColor: '#eee' }}
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label={signedInAs === SignInTypes.TERMINAL ? 'Passkey' : 'Password'}
          name={signedInAs === SignInTypes.TERMINAL ? 'passkey' : 'password'}
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

        {signedInAs === SignInTypes.MASTER && (
          <Stack alignItems="flex-end" sx={{ my: 2 }}>
            <Link component={RouterLink} variant="subtitle2" to={PATH_AUTH.resetPassword}>
              Forgot password?
            </Link>
          </Stack>
        )}

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Login
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
