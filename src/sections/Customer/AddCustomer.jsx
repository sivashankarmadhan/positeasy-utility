import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// @mui
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import RegexValidation from 'src/constants/RegexValidation';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useEffect, useState } from 'react';
import { get, isArray, isEmpty, map } from 'lodash';
import SettingServices from 'src/services/API/SettingServices';
import { useSetRecoilState } from 'recoil';
import { alertDialogInformationState } from 'src/global/recoilState';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import toast from 'react-hot-toast';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthService from 'src/services/authService';
import { ROLES_DATA } from 'src/constants/AppConstants';
import GetAppIcon from '@mui/icons-material/GetApp';

// ----------------------------------------------------------------------

function AddCustomer({
  isOpenAddCustomerModal,
  closeCustomerModal,
  editCustomer,
  customerCodes,
  initialFetch,
}) {
  const theme = useTheme();

  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;
  const [items, setItems] = useState([]);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  
  const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/


  const LoginSchema = Yup.object().shape({
    name: Yup.string().required(ErrorConstants.CUSTOMER_NAME_IS_REQUIRED),
    contactNumber: Yup.string()
      .required("required")
      .transform(value => value.trim())
      .required("required")
      .matches(phoneRegExp, 'Phone number is not valid')
      .min(10, "too short")
      .max(10, "too long"),

    address: Yup.string().nullable(),
    shippingAddress: Yup.string().nullable(),
    GST: Yup.string(),
    items: Yup.array().of(
      Yup.object().shape({
        customFieldKey: Yup.string(),
        customFieldValue: Yup.string(),
      })
    ),
  });

  const getContactNumberWith91 = (contactNumber) => {
    return contactNumber.length > 10 ? contactNumber : `91${contactNumber}`;
  };

  const getContactNumberWithout91 = (contactNumber) => {
    return contactNumber.length > 10 ? String(contactNumber).replace('91', '') : contactNumber;
  };

  const defaultValues = {
    name: '',
    contactNumber: '',
    address: '',
    shippingAddress: '',
    GST: '',
    items: [],
  };
  const defaultValueUnits = {
    customFieldKey: '',
    customFieldValue: '',
  };
  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting, errors },
    clearErrors,
  } = methods;
  const values = watch();
  const onSubmit = async (data) => {
    const contactNumberWith91 = getContactNumberWith91(get(data, 'contactNumber'))?.trim();
    try {
      const options = {
        name: get(data, 'name')?.trim(),
        contactNumber: String(contactNumberWith91),
        address: get(data, 'address')?.trim(),
        shippingAddress: get(data, 'shippingAddress')?.trim(),
        ...(get(data, 'GST')?.trim() ? { gstInfo: { GSTNumber: get(data, 'GST')?.trim() } } : {}),
        ...(!isEmpty(get(data, 'items')) ? { additionalInfo: get(data, 'items') } : {}),
        ...(isEmpty(editCustomer) ? {} : { customerId: get(editCustomer, 'customerId') }),
      };
      console.log(options,'options')
      if (!isEmpty(editCustomer)) {
        const response = await SettingServices.updateCustomer(options);
        if (response) toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
      } else if (isEmpty(editCustomer)) {
        await SettingServices.postCustomerData(options);
        if (!customerCodes?.length > 0 && isAuthorizedRoles) {
          await SettingServices.postConfiguration({
            customerManagement: true,
          });
        }
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }
      initialFetch();
      reset();
      closeCustomerModal();
    } catch (err) {
      toast.error(get(err, 'errorResponse?.message', ErrorConstants.SOMETHING_WRONG));
    }
  };

  const addNewCustomField = async () => {
    setItems([...items, defaultValueUnits]);
    const addItems = getValues('items');
    if (isArray(addItems)) {
      setValue('items', [...addItems, defaultValueUnits]);
    } else {
      setValue('items', [defaultValueUnits]);
    }
  };
  const removeCustomField = async (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    const delItems = getValues('items');
    delItems.splice(index, 1);
    for (let i = 0; i < delItems.length; i++) {
      setValue(`items[${i}].customFieldKey`, delItems[i].customFieldKey);
      setValue(`items[${i}].customFieldValue`, delItems[i].customFieldValue);
    }
    if (delItems.length < 1) {
      clearErrors();
    }
  };
  const clearAllCustomFields = () => {
    setItems([]);
    setValue('items', []);
    clearErrors();
  };
  const setEditValueUnits = () => {
    map(get(editCustomer, 'additionalInfo', []), (e, index) => {
      setValue(`items[${index}].customFieldKey`, get(e, `customFieldKey`));
      setValue(`items[${index}].customFieldValue`, get(e, `customFieldValue`));
    });
    setItems(get(editCustomer, 'additionalInfo', []));
  };
  useEffect(() => {
    if (!isEmpty(editCustomer)) {
      const { name, contactNumber, address, gstInfo } = editCustomer;
      reset({
        name,
        contactNumber: getContactNumberWithout91(contactNumber) || '',
        address,
        GST: get(gstInfo, 'GSTNumber'),
      });
      setEditValueUnits();
    } else {
      reset(defaultValues);
    }
  }, [get(editCustomer, 'customerId')]);

  const handleClearAll = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear all ?`,
      actions: {
        primary: {
          text: 'Clear All',
          onClick: (onClose) => {
            clearAllCustomFields();
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  const handleRemoveCustomField = (index) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear ?`,
      actions: {
        primary: {
          text: 'Clear',
          onClick: (onClose) => {
            removeCustomField(index);
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  return (
    <Dialog open={isOpenAddCustomerModal} >
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 325, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {!isEmpty(editCustomer) ? 'Update Customer' : ' '}
          </Typography>
          <Stack gap={2}>
            <RHFTextField size="small" label="Customer Name" name="name" sx={{ width: '100%' }} />

            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFTextField
                size="small"
                label="Customer Phone"
                name="contactNumber"
                InputProps={{
                  startAdornment: <InputAdornment position="start">91</InputAdornment>,
                }}
                sx={{ width: '100%' }}
              />
              <RHFTextField
                size="small"
                inputProps={{ maxLength: 15, style: { textTransform: 'uppercase' } }}
                label="GSTIN (optional)"
                name="GST"
                sx={{ width: '100%' }}
              />
            </Stack>

            <RHFTextField
              size="small"
              label="Billing Address (optional)"
              name="address"
              multiline
              rows={5}
              sx={{ width: '100%' }}
            />

            <Stack gap={1.5}>
              <Stack
                sx={{ cursor: 'pointer' }}
                flexDirection="row"
                justifyContent="flex-end"
                alignItems="center"
                gap={1}
                onClick={() => {
                  const address = getValues('address');
                  setValue('shippingAddress', address);
                }}
              >
                <GetAppIcon sx={{ width: 20, height: 20 }} />
                <Typography variant="body1">Copy billing Address</Typography>
              </Stack>

              <RHFTextField
                size="small"
                label="Shipping Address (optional)"
                name="shippingAddress"
                multiline
                rows={5}
                sx={{ width: '100%' }}
              />
            </Stack>

            <Paper>
              {map(items, (_, index) => {
                const fieldName = `items[${index}]`;
                return (
                  <Stack
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <RHFTextField
                      variant="outlined"
                      name={`${fieldName}.customFieldKey`}
                      label="Custom Name "
                      size="small"
                    />

                    <RHFTextField
                      variant="outlined"
                      name={`${fieldName}.customFieldValue`}
                      label="Custom Value"
                      size="small"
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveCustomField(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                );
              })}

              <Box sx={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addNewCustomField}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Add more
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={!isEmpty(items) ? handleClearAll : null}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Clear all
                </Button>
              </Box>
            </Paper>
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeCustomerModal}>
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

export default AddCustomer;
