import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// @mui
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { get, isArray, isEmpty, map, set } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { hideScrollbar } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RegexValidation from 'src/constants/RegexValidation';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { alertDialogInformationState, allConfiguration } from 'src/global/recoilState';
import GetAppIcon from '@mui/icons-material/GetApp';
import SettingServices from 'src/services/API/SettingServices';
import {ListItemText} from '@mui/material';
// ----------------------------------------------------------------------

function AddCustomerWAInfo({
  isOpenAddCustomerWAModal,
  closeCustomerModal,
  customerCodes,
  customerInfo,
  isCustomerCodeEnabled,
}) {
  const theme = useTheme();
  const gstRegex =
    /^[0-9]{2}[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/;
  const [isAlreadyCustomer, setIsAlreadyCustomer] = useState(false);
  const [items, setItems] = useState([]);
  const defaultValueCustom = { label: '', id: '', name: '', contactNumber: '' };
  const [currentCustomerIdLabel, setCurrentCustomerCodeLabel] = useState(defaultValueCustom);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const configuration = useRecoilValue(allConfiguration);
  const customerCodeMode = get(configuration, 'customerManagement', false);

  const LoginSchema = Yup.object().shape({
    name: Yup.string().required(ErrorConstants.CUSTOMER_NAME_IS_REQUIRED),
    contactNumber: Yup.string().matches(/^[0-9]{10}$/, "Contact number must be exactly 10 digits")
      .required(ErrorConstants.CUSTOMER_PHONE_NUMBER_REQUIRED)
      .matches(RegexValidation.PHONE_NUMBER, ErrorConstants.CUSTOMER_PHONE_NUMBER_SHOULD_BE_VALID),
    GST: Yup.string(),
    address: Yup.string(),
    shippingAddress: Yup.string(),
    items: Yup.array().of(
      Yup.object().shape({
        customFieldKey: Yup.string(),
        customFieldValue: Yup.string(),
      })
    ),
  });

  const defaultValues = {
    name: get(customerInfo, 'name', '') || '',
    contactNumber: get(customerInfo, 'contactNumber', '') || '',
    GST: get(customerInfo, 'GST') || get(customerInfo, 'gstInfo.GSTNumber', '') || '',
    address: get(customerInfo, 'address', '') || '',
    shippingAddress: get(customerInfo, 'shippingAddress', '') || '',
    items: get(customerInfo, 'additionalInfo', []),
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
  console.log('customerInfo', customerInfo);
  const onSubmit = async (data, isNotPostCustomerData) => {
    try {
      const options = {
        name: get(data, 'name')?.trim(),
        contactNumber: get(data, "contactNumber").length > 10 ? get(data, "contactNumber") : `91${get(data, "contactNumber")}`,
        id: get(data, 'id'),
        GST: get(data, 'GST') || get(data, 'gstInfo.GSTNumber', ''),
        address: get(data, 'address')?.trim(),
        shippingAddress: get(data, 'shippingAddress')?.trim(),
        additionalInfo: get(data, 'items') || get(data, 'additionalInfo'),
        whatsappTo: true
      };
      console.log('options', options);
      const formatOptions = {
        name: get(data, 'name')?.trim(),
        contactNumber: get(data, "contactNumber").length > 10 ? get(data, "contactNumber") : `91${get(data, "contactNumber")}`,
        address: get(data, 'address')?.trim(),
        shippingAddress: get(data, 'shippingAddress')?.trim(),
        whatsappTo: true,
        ...(get(data, 'GST') || get(data, 'gstInfo.GSTNumber', '')
          ? { gstInfo: { GSTNumber: get(data, 'GST') || get(data, 'gstInfo.GSTNumber', '') } }
          : {}),
        ...(!isEmpty(get(data, 'items') || get(data, 'additionalInfo'))
          ? { additionalInfo: get(data, 'items') || get(data, 'additionalInfo') }
          : {}),
      };
      if (!isNotPostCustomerData && isEmpty(customerInfo)) {
        if (!customerCodeMode) {
          const options = {
            customerManagement: true,
          };
          await SettingServices.postConfiguration(options);
        }
        const postCustomerDataRes = await SettingServices.postCustomerData(formatOptions);
        set(options, 'id', get(postCustomerDataRes, 'data.customerId'));
        set(options, 'customerId', get(postCustomerDataRes, 'data.customerId'));
        closeCustomerModal(options, false);
      } else if (!isNotPostCustomerData && !isEmpty(customerInfo)) {
        let updateOptions = {
          ...formatOptions,
          customerId: get(data, 'customerId'),
        };
        await SettingServices.updateCustomer(updateOptions);
        closeCustomerModal(updateOptions, false);
      } else if (isNotPostCustomerData) {
        closeCustomerModal(currentCustomerIdLabel, false);
      }
      reset();
      setIsAlreadyCustomer(false);
    } catch (err) {
      toast.error(get(err, 'message', ErrorConstants.SOMETHING_WRONG));
    }
  };
  const handleChangeAddCustomerCode = (value) => {
    if (value) {
      setCurrentCustomerCodeLabel(value);
    }
    if (!value) setCurrentCustomerCodeLabel(defaultValueCustom);
  };
  const filterOptions = (options, { inputValue }) => {
    return options.filter(
      (option) =>
        get(option, 'name')?.toLowerCase()?.includes(inputValue?.toLowerCase()) ||
        get(option, 'contactNumber')?.includes(inputValue)
    );
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
    map(get(customerInfo, 'additionalInfo', []), (e, index) => {
      setValue(`items[${index}].customFieldKey`, get(e, `customFieldKey`));
      setValue(`items[${index}].customFieldValue`, get(e, `customFieldValue`));
    });
    setItems(get(customerInfo, 'additionalInfo', []));
  };
  useEffect(() => {
    if (!isEmpty(customerInfo)) {
      reset(customerInfo);
      setEditValueUnits();
    } else reset(defaultValues);
  }, [customerInfo]);

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
    <Dialog open={isOpenAddCustomerWAModal}>
      {!isAlreadyCustomer && (
        <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data))}>
          <Card sx={{ p: 2, width: { xs: 340, sm: 500 } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add new whatsapp customer information
            </Typography>
            <Stack gap={2}>
              <Stack sx={{ flexDirection: 'column' }} gap={2}>
                <RHFTextField
                  size="small"
                  autoFocus
                  label="Name"
                  name="name"
                  sx={{ width: '100%' }}
                />
                <Stack flexDirection="row" gap={2}>
                  <RHFTextField
                    type="number"
                    label="Contact number"
                    name="contactNumber"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">91</InputAdornment>,
                    }}
                    size="small"
                    sx={{ width: '100%' }}
                  />
                  <RHFTextField
                    inputProps={{ maxLength: 15, style: { textTransform: 'uppercase' } }}
                    label="GSTIN (optional)"
                    name="GST"
                    size="small"
                    sx={{ width: '100%' }}
                  />
                </Stack>
                <RHFTextField
                  rows={5}
                  multiline
                  label="Billing address (optional)"
                  name="address"
                  size="small"
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
                    rows={5}
                    multiline
                    label="Shipping Address (optional)"
                    name="shippingAddress"
                    size="small"
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
            </Stack>
            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                justifyContent: isCustomerCodeEnabled ? 'space-between' : 'flex-end',
                alignItems: 'center',
                mt: 2,
              }}
            >
              {isCustomerCodeEnabled && (
                <Button
                  variant="text"
                  onClick={() => setIsAlreadyCustomer(true)}
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  sx={{ textTransform: 'none' }}
                >
                  Existing customer
                </Button>
              )}
              <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2}>
                <Button
                  size="large"
                  variant="text"
                  onClick={() => closeCustomerModal(customerInfo, true)}
                >
                  Cancel
                </Button>
                <LoadingButton
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Submit
                </LoadingButton>
              </Stack>
            </Stack>
          </Card>
        </FormProvider>
      )}
      {isAlreadyCustomer && (
        <Card sx={{ p: 2, minHeight: 220, width: { xs: 340, sm: 500 } }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Select customer  
          </Typography>
          <Autocomplete
            fullWidth
            freeSolo
            autoFocus
            disablePortal
            PaperComponent={(props) => (
              <Paper
                elevation={0}
                square
                {...props}
                sx={{
                  maxHeight: 100,
                  width: 'auto',
                  borderRadius: 1.5,
                  '& .Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.main,
                  },
                  '& .MuiMenuItem-root': {
                    fontSize: 13,
                  },
                  ...hideScrollbar,
                }}
              />
            )}
            options={map(customerCodes, (_item) => ({
              label: _item.name,
              id: _item.customerId,
              name: _item.name,
              contactNumber: _item.contactNumber,
              GST: get(_item, 'gstInfo.GSTNumber'),
              address: get(_item, 'address'),
              additionalInfo: get(_item, 'additionalInfo'),
              whatsappTo: true
            }))}
            value={get(currentCustomerIdLabel, 'label')}
            filterOptions={filterOptions}
            onChange={(event, newValue) => {
              handleChangeAddCustomerCode(newValue);
            }}
            sx={{ width: '100%' }}
            renderOption={(props, item) => (
              <li {...props} key={item.id}>
                <ListItemText>{item.label}</ListItemText>
              </li>
    )}
            renderInput={(params) => (
              <TextField variant="outlined" {...params} label={'Customer'} />
            )}
          />
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={4}>
            <Button
              size="large"
              variant="text"
              onClick={() => {
                setIsAlreadyCustomer(false);
                closeCustomerModal(customerInfo, true);
              }}
            >
              Cancel
            </Button>

            <LoadingButton
              type="button"
              onClick={() => onSubmit(currentCustomerIdLabel, true)}
              disabled={get(currentCustomerIdLabel, 'id') === ''}
              on
              size="large"
              variant="contained"
            >
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      )}
    </Dialog>
  );
}

export default AddCustomerWAInfo;
