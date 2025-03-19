import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { Box, Button, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  BANKING_DETAILS,
  REQUIRED_CONSTANTS,
  vendorDetailsSections,
  ADDRESS,
} from 'src/constants/AppConstants';
import { forEach, get, isEmpty, isEqual, isObject, map } from 'lodash';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import toast from 'react-hot-toast';
import VendorServices from 'src/services/API/VendorServices';
import { useNavigate, useParams } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import filterChangedValueInObj from 'src/utils/filterChangedValueInObj';
import GetAppIcon from '@mui/icons-material/GetApp';
import BillingOrShippingFields from 'src/sections/Vendors/BillingOrShippingFields';
import BankDetailsFields from 'src/sections/Vendors/BankDetailsFields';
import VendorBasicDetailsFields from 'src/sections/Vendors/VendorBasicDetailsFields';
import { useMediaQuery } from '@poriyaalar/custom-hooks';

const CreateOrEditVendor = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const params = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(vendorDetailsSections?.[0]?.status);
  const [isLoading, setIsLoading] = useState(false);
  const [vendorDetails, setVendorDetails] = useState({});

  const vendorId = get(params, 'vendorId');

  const defaultValues = {
    name: '',
    companyName: '',
    contactNumber: '',
    email: '',
    vendorInfo: {
      billingAddress: {},
      shippingAddress: {},
      fssaiLicNo: '',
      gstNo: '',
    },
    bankingInfo: {},
  };

  const schema = Yup.object().shape({
    name: Yup.string().required(REQUIRED_CONSTANTS.VENDOR_NAME),
    companyName: Yup.string().required(REQUIRED_CONSTANTS.COMPANY_NAME),
    contactNumber: Yup.string().required(REQUIRED_CONSTANTS.CONTACT_NUMBER),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { reset, handleSubmit, watch, setValue } = methods;

  const watchVendorInfo = watch('vendorInfo');

  const isUnSaveData = !isEqual(vendorDetails, watch());

  const onSubmit = async (data) => {
    let actualData = {};
    forEach(defaultValues, (_value, _key) => {
      actualData[_key] = data[_key];
    });
    setIsLoading(true);
    try {
      if (vendorId) {
        await VendorServices.editVendor({
          ...filterChangedValueInObj({ oldObject: vendorDetails, newObject: actualData }),
          vendorId,
        });
        toast.success(SuccessConstants.EDITED_VENDOR_SUCCESSFULLY);
      } else {
        await VendorServices.addVendor(actualData);
        reset(defaultValues);
        toast.success(SuccessConstants.ADDED_VENDOR_SUCCESSFULLY);
      }
      navigate(PATH_DASHBOARD.viewVendors);
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const getVendorDetails = async () => {
    setIsLoading(true);
    try {
      const response = await VendorServices.getVendor({ id: vendorId });
      let actualData = {};
      forEach(defaultValues, (_value, _key) => {
        actualData[_key] = get(response, 'data')?.[_key];
      });
      setVendorDetails(actualData);
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      getVendorDetails();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(vendorDetails)) {
      reset(vendorDetails);
    }
  }, [vendorDetails]);

  if (isLoading) return <LoadingScreen />;

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          m: 2,
          mb: 6,
          height: 'calc(100vh - 170px)',
          overflow: 'auto',
        }}
      >
        <VendorBasicDetailsFields />
        <Box sx={{ borderBottom: 1, borderColor: 'divider', my: 3 }}>
          <Tabs
            variant="scrollable"
            scrollButtons={false}
            value={selectedTab}
            onChange={(event, newValue) => {
              setSelectedTab(newValue);
            }}
          >
            {map(vendorDetailsSections, (_item) => (
              <Tab value={_item.status} label={_item.name} />
            ))}
          </Tabs>
        </Box>

        {selectedTab === ADDRESS && (
          <Stack flexDirection={isMobile ? 'column' : 'row'} gap={10}>
            <Stack gap={3}>
              <Typography sx={{ fontWeight: 600 }}>Billing Address</Typography>
              <BillingOrShippingFields name="billingAddress" />
            </Stack>
            <Stack gap={3}>
              <Stack flexDirection="row" gap={1}>
                <Typography sx={{ fontWeight: 600 }}>Shipping Address</Typography>
                <Stack
                  sx={{ cursor: 'pointer' }}
                  flexDirection="row"
                  gap={1}
                  onClick={() => {
                    setValue('vendorInfo.shippingAddress', get(watchVendorInfo, 'billingAddress'));
                  }}
                >
                  ( <GetAppIcon sx={{ width: 20, height: 20, color: theme.palette.primary.main }} />
                  <Typography sx={{ fontWeight: 600 }} variant="body1" color="primary">
                    Copy billing Address
                  </Typography>
                  )
                </Stack>
              </Stack>
              <BillingOrShippingFields name="shippingAddress" />
            </Stack>
          </Stack>
        )}
        {selectedTab === BANKING_DETAILS && <BankDetailsFields />}
      </Box>
      <Stack
        sx={{ position: 'fixed', bottom: 20, right: 18 }}
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
        gap={2}
        mt={2}
      >
        <Button disabled={!isUnSaveData} size="large" type="submit" variant="contained">
          {vendorId ? 'Update' : 'Submit'}
        </Button>
      </Stack>
    </FormProvider>
  );
};

export default CreateOrEditVendor;
