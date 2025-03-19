import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Card, Dialog, Stack, Typography, Grid } from '@mui/material';
// hooks
// components
import { RHFCheckbox, RHFTextField } from './hook-form';
import FormProvider from './FormProvider';
import AuthService from '../services/authService';
import { get } from 'lodash';
import { allConfiguration } from '../global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { ConsoleLog } from 'src/helper/ConsoleLog';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

export default function AddEbillPrintInformation(props) {
  const { open, handleClose, onSubmitPrintInformation, ebillConfig } = props;
  console.log('ebillConfig',ebillConfig)
  const configuration = useRecoilValue(allConfiguration);
  const isCountersEnabled = get(configuration, 'counterSettings.isCountersEnabled', false);
  const shopName = AuthService.getShopName();

  const RegisterSchema = Yup.object().shape({
    shopName: Yup.string().required(' Shop Name required'),
    address: Yup.string(),
    contactNumber: Yup.string(),
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
    onSubmitPrintInformation(data, reset);
  };

  const handleCloseDialog = () => {
    handleClose();
    // reset();
  };

  useEffect(() => {reset({
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
  })}, [ebillConfig, reset])
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    // <Dialog open={open} onClose={handleCloseDialog}>
    <Stack>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={isMobile?1:2}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          {/* <Stack overflow="auto" spacing={3} height="60vh" pt={1}> */}
          <Grid container sx={{ width: '100%', pt: 2}}>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 0 ,pb:3}}>
              <RHFTextField name="shopName" label="Shop name" />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 2 ,pb:3}}>
              <RHFTextField name="footer" label="Footer" />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 2 ,pb:3}}>
              <RHFTextField name="contactNumber" label="Store Number " />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 0 ,pb:3}}>
              <RHFTextField name="reviewChannel" label="Review Channel" />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 2 ,pb:3}}>
              <RHFTextField name="reviewLink" label="Review Link" />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 2 ,pb:3}}>
              <RHFTextField name="GST" label="GST" />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 0 ,pb:3}}>
              <RHFTextField name="tandc" label="T & C Details" multiline rows={4} maxRows={14} />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{paddingLeft: isMobile ? 0 : 2 ,pb:3}}>
              <RHFTextField name="address" multiline rows={4} maxRows={14} label="Outlet address" />
            </Grid>
            

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
          </Grid>
          {/* </Stack> */}
          <Stack sx={{width:'100%',flexDirection:'row', display:'flex',justifyContent:'flex-end'}}>
          <LoadingButton
            sx={{width:'100px',m:1 }}
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
          Save
          </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
    </Stack>
    // </Dialog>
  );
}
