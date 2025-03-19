import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Button, Card, Dialog, Stack, Typography } from '@mui/material';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import SettingServices from 'src/services/API/SettingServices';
import { get, isEmpty } from 'lodash';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

function AddCustomCode({
  isOpenAddCustomCodeModal,
  closeCustomCodeModal,
  editCustomCode,
  customCodes,
  initialFetch,
}) {
  console.log('editCustomCode', editCustomCode);

  const schema = Yup.object().shape({
    codeName: Yup.string().required(ErrorConstants.CUSTOM_CODE_IS_REQUIRED),
  });

  const defaultValues = {
    codeName: get(editCustomCode, 'codeName', '') || '',
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = methods;
  const onSubmit = async (data) => {
    try {
      const options = {
        codeName: get(data, 'codeName')?.trim(),
        customCode: get(editCustomCode, 'customCode'),
      };
      if (!isEmpty(editCustomCode)) {
        const response = await SettingServices.editCustomCode({
          ...options,
        }); // need to change if api complete
        if (response) toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
      } else if (isEmpty(editCustomCode)) {
        await SettingServices.postCustomCode(options);
        if (!customCodes?.length) {
          await SettingServices.postConfiguration({
            customCode: true,
          });
        }
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }
      initialFetch();
      reset();
      closeCustomCodeModal();
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
    if (!isEmpty(editCustomCode)) {
      const { codeName } = editCustomCode;
      reset({
        codeName,
      });
    } else {
      reset(defaultValues);
    }
  }, [editCustomCode]);

  return (
    <Dialog open={isOpenAddCustomCodeModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 360, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {!isEmpty(editCustomCode) ? 'Update Custom Code' : ' Add Custom Code'}
          </Typography>
          <Stack gap={2}>
            {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
            <RHFTextField
              label="Custom name (Name on billing)"
              name="codeName"
              sx={{ width: '100%' }}
            />
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeCustomCodeModal}>
              Cancel
            </Button>
            <LoadingButton size="large" type="submit" variant="contained" loading={isSubmitting}>
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default AddCustomCode;
