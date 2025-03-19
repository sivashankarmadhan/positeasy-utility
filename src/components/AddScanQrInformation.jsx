import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Alert, Card, Dialog, Stack, Typography, useTheme } from '@mui/material';
// hooks
// components
import { RHFCheckbox, RHFTextField, RHFUploadAvatar } from './hook-form';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import FormProvider from './FormProvider';
import AuthService from '../services/authService';
import { get } from 'lodash';
import { allConfiguration, storeLogo } from '../global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useCallback, useEffect, useState } from 'react';
import { ROLES_DATA } from 'src/constants/AppConstants';
import S3ServicesLogo from 'src/services/API/S3ServicesLogo';
import CloseIcon from '@mui/icons-material/Close';

// ----------------------------------------------------------------------

export default function AddScanQrInformation(props) {
  const { open, handleClose, onSubmitPrintInformation, scanQRSettingsData } = props;
  const configuration = useRecoilValue(allConfiguration);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles = ROLES_DATA.master.role === currentRole;
  const shopName = AuthService.getShopName();
  console.log('scanQRSettingsData', scanQRSettingsData);
  const RegisterSchema = Yup.object().shape({
    storeName: Yup.string().required(' Shop name required'),
    storeNumber: Yup.string().matches(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits'),
    // isEnablePrintSummary: Yup.boolean(),
    // reprintForStaff: Yup.boolean(),
  });
  const theme = useTheme();

  const defaultValues = {
    storeName: get(scanQRSettingsData, 'storeName') || shopName,
    storeNumber: get(scanQRSettingsData, 'storeNumber') || '',
    storeLogo: get(scanQRSettingsData, 'storeLogo') || '',
    CancellationPolicy: get(scanQRSettingsData, 'CancellationPolicy') || '',
    aboutus: get(scanQRSettingsData, 'aboutus') || '',
    termsAndCondition: get(scanQRSettingsData, 'termsAndCondition') || '',
    minimumAmount: get(scanQRSettingsData, 'minimumAmount') || '',
    isOrderPlaced: true,
    isName: true,
    isWhatsappNumber: true,
    isDeliveryAddress: get(scanQRSettingsData, 'isDeliveryAddress') || false,
    isDeliveryNotes: get(scanQRSettingsData, 'isDeliveryNotes') || false,
    isOrderAck: get(scanQRSettingsData, 'isOrderAck') || false,
    isOrderRjtd: get(scanQRSettingsData, 'isOrderRjtd') || false,
    isOrderCompleted: get(scanQRSettingsData, 'isOrderCompleted') || false,
    isOrderReady: get(scanQRSettingsData, 'isOrderReady') || false,
    isOrderOFD: get(scanQRSettingsData, 'isOrderOFD') || false,
    isOrderDelivered: get(scanQRSettingsData, 'isOrderDelivered') || false,
    isDirectComplete: get(scanQRSettingsData, 'isDirectComplete') || false,
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
  console.log('errors', errors);

  // useEffect(()=> {
  //   if(get(scanQRSettingsData, 'storeLogo')) {
  //     setValue(
  //       'storeLogo',
  //       Object.assign(get(scanQRSettingsData, 'storeLogo'), {
  //         preview: get(scanQRSettingsData, 'storeLogo'),
  //       })
  //     );
  //   }

  // }, [])

  const postLogoImage = async (file) => {
    try {
      // setIsLoading(true);
      const link = await S3ServicesLogo.getS3Link({ format: 'jpg' });

      await S3ServicesLogo.sendImagesToS3({
        S3URL: get(link, 'data.URL'),
        file: file,
      });
      const optiurl = get(link, 'data.URL')?.split('?')[0];

      const options = {
        logoImage: optiurl,
      };
      console.log('options', options);
      // await LogoServices.postLogoImage(options);
      setValue('storeLogo', optiurl);
      // initialFetch();
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // setValue(
        //   'storeLogo',
        //   Object.assign(file, {
        //     preview: URL.createObjectURL(file),
        //   })
        // );
        postLogoImage(file);
      }
    },
    [setValue]
  );

  const onSubmit = (data) => {
    console.log('data', data);
    onSubmitPrintInformation(data, reset);
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
            Add Scan Qr Information
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
              <RHFUploadAvatar
                sx={{ width: 200, height: 200 }}
                name="storeLogo"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  isAuthorizedRoles ? (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      Drag and drop or browse to choose a file
                    </Typography>
                  ) : (
                    <></>
                  )
                }
              />
              <RHFTextField name="storeName" label="Store name" />
              <RHFTextField name="storeNumber" label="Store number " />
              <RHFTextField multiline maxRows={4} name="aboutus" label="About us" />
              <RHFTextField
                multiline
                maxRows={4}
                name="termsAndCondition"
                label="Terms and conditions"
              />
              <RHFTextField
                multiline
                maxRows={4}
                name="CancellationPolicy"
                label="Cancellation Policy"
              />
              <RHFTextField name="minimumAmount" type="number" label="Minimum Order Amount" />
              <Stack gap={1}>
                <Stack flexDirection={'row'} alignItems={'center'}>
                  <Typography variant="subtitle1">customer Information</Typography>
                  <Tooltip
                    title="if enabled, the field will show in customer info dialogue box in scanqr app"
                    arrow
                  >
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <RHFCheckbox name="isName" disabled label="Name" />
                    <RHFCheckbox name="isWhatsappNumber" disabled label="Whatsapp number" />
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <RHFCheckbox name="isDeliveryAddress" label="Delivery Address" />
                    <RHFCheckbox name="isDeliveryNotes" sx={{ pr: 3.5 }} label="Delivery notes" />
                  </Stack>
                </Stack>
              </Stack>
              <Stack gap={1}>
                <Stack flexDirection={'row'} alignItems={'center'}>
                  <Typography variant="subtitle1">Notify customer on</Typography>
                  <Tooltip
                    title="order info will be sent to customer via whatsapp (Charges apply)"
                    arrow
                  >
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <RHFCheckbox name="isOrderPlaced" disabled label="Order placed" />
                    <RHFCheckbox name="isOrderAck" label="Order acknowledge" />
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <RHFCheckbox
                      name="isOrderRjtd"
                      sx={{ alignItems: 'right' }}
                      label="Order reject"
                    />
                    <RHFCheckbox name="isOrderReady" sx={{ pr: 5.5 }} label="Order Ready" />
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <RHFCheckbox name="isOrderOFD" label="Order out for delivery" />
                    <RHFCheckbox name="isOrderCompleted" sx={{ pr: 2 }} label="Order completed" />
                    {/* <RHFCheckbox name="isOrderDelivered" disabled  label="Order delivered" /> */}
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    {/* <RHFCheckbox name="isOrderCompleted" disabled label="Order completed" /> */}
                    {/* <RHFCheckbox name="isDirectComplete" sx={{ pr: 1.8 }} label="Direct Completed" /> */}
                  </Stack>
                </Stack>
              </Stack>
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
