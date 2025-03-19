import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Card, Dialog, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
// hooks
// components
import { RHFCheckbox, RHFTextField } from './hook-form';
import FormProvider from './FormProvider';
import AuthService from 'src/services/authService';
import { get } from 'lodash';
import { allConfiguration } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import CloseIcon from '@mui/icons-material/Close';

// ----------------------------------------------------------------------

export default function AddScanQrEbillPrintInformation(props) {
  const { open, handleClose, onSubmitEbillInformation, ebillConfig } = props;
  const theme = useTheme();
  const configuration = useRecoilValue(allConfiguration);
  const isCountersEnabled = get(configuration, 'counterSettings.isCountersEnabled', false);
  const shopName = AuthService.getShopName();

  const RegisterSchema = Yup.object().shape({
    shopName: Yup.string().required(' Shop Name required'),
    address: Yup.string(),
    contactNumber: Yup.string().matches(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits'),
    GST: Yup.string(),
    bankDetails: Yup.string(),
    tandc: Yup.string(),
    footer: Yup.string(),
    merchantCopy: Yup.boolean(),
    ...(isCountersEnabled
      ? {
          counterwise: Yup.boolean(),
          counterwise_splitup: Yup.boolean(),
        }
      : {}),
    isEnablePrintSummary: Yup.boolean(),
    reprintForStaff: Yup.boolean(),
  });

  const defaultValues = {
    shopName: get(ebillConfig, 'shopName') || shopName,
    address: get(ebillConfig, 'address') || '',
    contactNumber: get(ebillConfig, 'contactNumber') || '',
    GST: get(ebillConfig, 'gst') || '',
    footer: get(ebillConfig, 'footer') || '',
    tandc: get(ebillConfig, 'tandc') || '',
    reviewChannel: get(ebillConfig, 'reviewChannel') || '',
    reviewLink: get(ebillConfig, 'reviewLink') || '',
    // counterwise_splitup: get(printInformationData, 'counterwise_splitup') || false,
    // isEnablePrintSummary: get(printInformationData, 'isEnablePrintSummary') || false,
    // reprintForStaff: get(printInformationData, 'reprintForStaff') || false,
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = methods;
  const values = watch();

  const onSubmit = (data) => {
    onSubmitEbillInformation(data, reset);
  };

  const handleCloseDialog = () => {
    handleClose();
    reset();
  };

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 330, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add E-bill Information
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

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
            <Stack overflow="auto" spacing={3} height="60vh" pt={1}>
              <RHFTextField name="shopName" label="Shop name" />
              <RHFTextField name="address" multiline rows={4} maxRows={14} label="Outlet address" />
              <RHFTextField name="contactNumber" label="Store Number " />
              <RHFTextField name="reviewChannel" label="Review Channel" />
              <RHFTextField name="reviewLink" label="Review Link" />
              <RHFTextField name="GST" label="GST" />
              <RHFTextField name="tandc" label="T & C Details" multiline rows={4} maxRows={14} />
              <RHFTextField name="footer" label="Footer" />
              {/* <RHFCheckbox name="merchantCopy" label="Merchant Copy" />
              {isCountersEnabled && (
                <Stack flexDirection={'row'} gap={2}>
                  <RHFCheckbox name="counterwise" label="Counter Bill" />
                  {get(values, 'counterwise') && (
                    <RHFCheckbox name="counterwise_splitup" label="Split Counter" />
                  )}
                </Stack>
              )}
              <RHFCheckbox name="reprintForStaff" label="Reprint for Staff" />
              <RHFCheckbox name="isEnablePrintSummary" label="Print End Shift Summary Report " /> */}
            </Stack>
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              ok
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Dialog>
  );
}
