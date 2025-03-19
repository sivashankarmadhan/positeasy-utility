import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Card, Dialog, Grid, Stack, Typography } from '@mui/material';
// hooks
// components
import { RHFCheckbox, RHFTextField } from './hook-form';
import FormProvider from './FormProvider';
import AuthService from 'src/services/authService';
import { get } from 'lodash';
import { allConfiguration } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

export default function AddPrintInformation(props) {
  const { open, handleClose, onSubmitPrintInformation, printInformationData } = props;
  const configuration = useRecoilValue(allConfiguration);
  const isCountersEnabled = get(configuration, 'counterSettings.isCountersEnabled', false);
  const isCustomerCodeEnabled = get(configuration, 'customerManagement', false);
  const shopName = AuthService.getShopName();

  const RegisterSchema = Yup.object().shape({
    shopName: Yup.string().required(' Shop Name required'),
    address: Yup.string(),
    contactNumber: Yup.string(),
    GST: Yup.string(),
    bankDetails: Yup.string(),
    footer: Yup.string(),
    footerNote: Yup.string(),
    merchantCopy: Yup.boolean(),
    itemwiseToken: Yup.boolean(),
    ...(isCountersEnabled
      ? {
          counterwise: Yup.boolean(),
          counterwise_splitup: Yup.boolean(),
        }
      : {}),
    isEnablePrintSummary: Yup.boolean(),
    reprintForStaff: Yup.boolean(),
    fssai: Yup.string(),
    prepaid: Yup.boolean(),
    isGSTAbstract: Yup.boolean(),
    isShowMRP: Yup.boolean(),

    isLogo: Yup.boolean(),
    ...(isCustomerCodeEnabled
      ? {
          customerInfoPrintSettings: Yup.object().shape({
            showCustomerName: Yup.boolean(),
            showCustomerContactNumber: Yup.boolean(),
            showCustomerAddress: Yup.boolean(),
            showCustomerShippingAddress: Yup.boolean(),
          }),
        }
      : {}),
  });

  const defaultValues = {
    shopName: get(printInformationData, 'shopName') || shopName,
    address: get(printInformationData, 'address') || '',
    contactNumber: get(printInformationData, 'contactNumber') || '',
    GST: get(printInformationData, 'GST') || '',
    bankDetails: get(printInformationData, 'bankDetails') || '',
    footer: get(printInformationData, 'footer') || '',
    footerNote: get(printInformationData, 'footerNote') || '',
    merchantCopy: get(printInformationData, 'merchantCopy') || false,
    itemwiseToken: get(printInformationData, 'itemwiseToken') || false,
    counterwise: get(printInformationData, 'counterwise') || false,
    counterwise_splitup: get(printInformationData, 'counterwise_splitup') || false,
    isEnablePrintSummary: get(printInformationData, 'isEnablePrintSummary') || false,
    reprintForStaff: get(printInformationData, 'reprintForStaff') || false,
    fssai: get(printInformationData, 'fssai') || '',
    prepaid: get(printInformationData, 'prepaid') || false,
    isGSTAbstract: get(printInformationData, 'isGSTAbstract') || false,
    isShowMRP: get(printInformationData, 'isShowMRP') || false,
    isDisableEstimate: get(printInformationData, 'isDisableEstimate') || false,
    isLogo: get(printInformationData, 'isLogo') || false,
    customerInfoPrintSettings: {
      showCustomerName:
        get(printInformationData, 'customerInfoPrintSettings.showCustomerName') || true,
      showCustomerContactNumber:
        get(printInformationData, 'customerInfoPrintSettings.showCustomerContactNumber') || false,
      showCustomerAddress:
        get(printInformationData, 'customerInfoPrintSettings.showCustomerAddress') || false,
      showCustomerShippingAddress:
        get(printInformationData, 'customerInfoPrintSettings.showCustomerShippingAddress') || false,
    },
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;
  const values = watch();

  const onSubmit = (data) => {
    onSubmitPrintInformation(data, reset);
  };

  const handleCloseDialog = () => {
    handleClose();
    reset();
  };
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (get(values, 'counterwise') || get(values, 'counterwise_splitup')) {
      setValue('itemwiseToken', false);
    }
  }, [get(values, 'counterwise'), get(values, 'counterwise_splitup')]);

  useEffect(() => {
    if (get(values, 'itemwiseToken')) {
      setValue('counterwise', false);
      setValue('counterwise_splitup', false);
    }
  }, [get(values, 'itemwiseToken')]);
  useEffect(() => {
    reset(defaultValues);
  }, [configuration]);

  return (
    // <Dialog open={open} onClose={handleCloseDialog}>

    <Stack>
      <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
        Add print Information
      </Typography>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <Grid container spacing={isMobile ? 1 : 2} sx={{ width: '100%', pt: 2 }}>
            <Grid item xs={12} md={4} lg={4} sx={{ width: '100%', paddingLeft: 0, pb: 3 }}>
              <RHFTextField name="shopName" label="Shop name" />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{ paddingLeft: 0, pb: 3 }}>
              <RHFTextField name="contactNumber" label="Contact Number " />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{ paddingLeft: 0, pb: 3 }}>
              <RHFTextField name="GST" label="GST" />
            </Grid>
            <Grid item xs={12} md={4} lg={6} sx={{ paddingLeft: 0, pb: 3 }}>
              <RHFTextField name="fssai" label="FSSAI" />
            </Grid>
            <Grid item xs={12} md={4} lg={6} sx={{ paddingLeft: 0, pb: 3 }}>
              <RHFTextField name="footer" label="Footer" />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{ paddingLeft: 0, pb: 3 }}>
              <RHFTextField name="address" multiline rows={4} maxRows={14} label="Shop address" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFTextField
                name="bankDetails"
                label="Bank Details"
                multiline
                rows={4}
                maxRows={14}
              />
            </Grid>
            <Grid item xs={12} md={4} lg={4} sx={{ paddingLeft: 0, pb: 3 }}>
              <RHFTextField name="footerNote" multiline rows={4} maxRows={14} label="Footer note" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="merchantCopy" label="Merchant copy" />
            </Grid>

            {isCountersEnabled && (
              <>
                <Grid item xs={12} md={4} lg={4}>
                  <RHFCheckbox name="counterwise" label="Counter wise kitchen order token" />
                </Grid>
                {get(values, 'counterwise') && (
                  <Grid item xs={12} md={4} lg={4}>
                    <RHFCheckbox name="counterwise_splitup" label="Counter wise bills" />
                  </Grid>
                )}
              </>
            )}
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="itemwiseToken" label="Product wise token" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="reprintForStaff" label=" Allow reprint for Staff" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="isEnablePrintSummary" label="Print end shift summary report " />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="prepaid" label="Show paid text" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="isGSTAbstract" label="Show GST abstract section" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="isShowMRP" label="Show MRP column" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="isLogo" label="Show logo (Windows only)" />
            </Grid>
            <Grid item xs={12} md={4} lg={4}>
              <RHFCheckbox name="isDisableEstimate" label="Disable Estimate label" />
            </Grid>
          </Grid>
          {isCustomerCodeEnabled && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
                Print Customer Information
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2} sx={{ width: '100%', pt: 2 }}>
                <Grid item xs={12} md={4} lg={4}>
                  <RHFCheckbox
                    name="customerInfoPrintSettings.showCustomerName"
                    label="Show  Name"
                  />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <RHFCheckbox
                    name="customerInfoPrintSettings.showCustomerContactNumber"
                    label="Show  Contact Number"
                  />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <RHFCheckbox
                    name="customerInfoPrintSettings.showCustomerAddress"
                    label="Show  Address"
                  />
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                  <RHFCheckbox
                    name="customerInfoPrintSettings.showCustomerShippingAddress"
                    label="Show  Shipping Address"
                  />
                </Grid>
              </Grid>
            </>
          )}
          {/* </Stack> */}
          <Stack
            sx={{
              width: '100%',
              flexDirection: 'row',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <LoadingButton
              sx={{ width: '100px', m: 1 }}
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
    </Stack>
  );
}
