import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from '../../../../components/hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { get } from 'lodash';

// ----------------------------------------------------------------------

function AddGst({ onSubmit, isOpenAddGstModal, closeGstModal }) {
  const LoginSchema = Yup.object().shape({
    gstNumber: Yup.string().required(ErrorConstants.GST_NUMBER_IS_REQUIRED),
    gstPercent: Yup.string().matches(
      RegexValidation.PERCENTAGE_NUMBER,
      ErrorConstants.GST_PERCENTAGE_IS_REQUIRED_AND_POSITIVE_NUMBER
    ),
  });

  const defaultValues = {
    gstNumber: 0,
    gstPercent: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <Dialog open={isOpenAddGstModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 360, sm: 400 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add GST
          </Typography>
          <Stack gap={2}>
            <RHFTextField label="GST Percentage" name="gstPercent" sx={{ width: '100%' }} />
            <RHFTextField label="GST Number" name="gstNumber" sx={{ width: '100%' }} />
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeGstModal}>
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

export default AddGst;
