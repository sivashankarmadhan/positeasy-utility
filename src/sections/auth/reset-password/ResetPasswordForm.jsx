import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import get from 'lodash/get';

import { RHFTextField } from '../../../components/hook-form';
import AuthService from '../../../services/auth';
import FormProvider from '../../../components/FormProvider';
import { ErrorConstants } from '../../../constants/ErrorConstants';

// ----------------------------------------------------------------------

export default function ResetPasswordForm() {
  const navigate = useNavigate();

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: { email: '' },
  });

  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      const response = await AuthService.sendResetEmail({
        email: data.email,
      });
      toast.success(get(response, 'data'));
      reset();
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_SEND_EMAIL);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email address" />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Send Request
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
