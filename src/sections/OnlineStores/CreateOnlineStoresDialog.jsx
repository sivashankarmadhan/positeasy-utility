import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import FormProvider from 'src/components/FormProvider';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { RHFAutocomplete, RHFCheckbox, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { Icon } from '@iconify/react';
import MultiTextFields from 'src/components/hook-form/MultiTextFields';
import AddIcon from '@mui/icons-material/Add';
import AuthService from 'src/services/authService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  alertDialogInformationState,
  currentStoreId,
  storeNameState,
  storeReferenceState,
  stores,
} from 'src/global/recoilState';
import { compact, filter, find, get, isEmpty, isEqual, map, some } from 'lodash';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';
import moment from 'moment';
import { InfoIcon } from 'src/theme/overrides/CustomIcons';
import RHFTimePicker from 'src/components/hook-form/RHFTimePicker';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import { stubFalse } from 'lodash';
import dayjs from 'dayjs';
import { formatTimeAMandPM, formatTimeWithoutSec, timeAndSecFormat } from 'src/utils/formatTime';
import {
  SOUND_CONFIG_ARRAY,
  days,
  daysOfObject,
  ERROR,
  FDNavigateLink,
} from 'src/constants/AppConstants';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

const CreateOnlineStoresDialog = ({
  openAddOnlineOrderDialog,
  handleClose,
  selectedStore,
  storeList,
  soundConfiguration,
  storeName,
  storeReference,
}) => {
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const theme = useTheme();
  const [isShowVerifyButton, setIsShowVerifyButton] = useState(false);
  const [isMarkedAsPublished, setIsMarkedAsPublished] = useState(false);
  const [isZipCodeEnabled, setIsZipCodeEnabled] = useState(false);
  // const storeName = useRecoilValue(storeNameState);

  const [day, setDay] = useState(daysOfObject.SUNDAY);
  // const storeReference = useRecoilValue(storeReferenceState);

  const defaultDaySlots = [
    {
      day: 'sunday',
      slots: [
        {
          start_time: moment().startOf('day').format(),
          end_time: moment().endOf('day').format(),
        },
      ],
    },
    {
      day: 'monday',
      slots: [
        {
          start_time: moment().startOf('day').format(),
          end_time: moment().endOf('day').format(),
        },
      ],
    },
    {
      day: 'tuesday',
      slots: [
        {
          start_time: moment().startOf('day').format(),
          end_time: moment().endOf('day').format(),
        },
      ],
    },
    {
      day: 'wednesday',
      slots: [
        {
          start_time: moment().startOf('day').format(),
          end_time: moment().endOf('day').format(),
        },
      ],
    },
    {
      day: 'thursday',
      slots: [
        {
          start_time: moment().startOf('day').format(),
          end_time: moment().endOf('day').format(),
        },
      ],
    },
    {
      day: 'friday',
      slots: [
        {
          start_time: moment().startOf('day').format(),
          end_time: moment().endOf('day').format(),
        },
      ],
    },
    {
      day: 'saturday',
      slots: [
        {
          start_time: moment().startOf('day').format(),
          end_time: moment().endOf('day').format(),
        },
      ],
    },
  ];

  let defaultValues = {
    city: '',
    name: storeName,
    ref_id: storeReference,
    min_pickup_time: 0,
    min_delivery_time: 0,
    contact_phone: '',
    notification_phones: [],
    min_order_value: 0,
    // hide_from_ui: false,
    address: '',
    notification_emails: [],
    zip_codes: [],
    geo_longitude: 0,
    geo_latitude: 0,
    // active: false,
    ordering_enabled: true,
    // excluded_platforms: [],
    // included_platforms: [],
    // translations: [
    //   {
    //     language: '',
    //     name: '',
    //   },
    // ],
    platform_data: [
      {
        name: 'swiggy',
        url: '',
        platform_store_id: '',
      },
      {
        name: 'zomato',
        url: '',
        platform_store_id: '',
      },
    ],
    timings: defaultDaySlots,
  };

  if (openAddOnlineOrderDialog?.data) {
    defaultValues = openAddOnlineOrderDialog?.data;
  }

  const phoneRegex = /^[0-9]{10}$/;
  const zipCodeRegex = /^[0-9]{6}$/;

  const schema = Yup.object().shape({
    min_pickup_time: Yup.number()
      .transform((value) => (!value ? null : value))
      .nullable()
      .required('Minimum pickup time is required'),

    min_delivery_time: Yup.number()
      .transform((value) => (!value ? null : value))
      .nullable()
      .required('Minimum delivery time is required'),

    min_order_value: Yup.number()
      .transform((value) => (!value ? null : value))
      .nullable()
      .required('Minimum order value is required'),

    contact_phone: Yup.string()
      .matches(/^[0-9]{8,11}$/, 'Phone number must be between 8 and 11 digits')
      .nullable()
      .transform((value) => (value === '' ? null : value))
      .required('Contact phone is required'),
    notification_phones: Yup.array().of(
      Yup.string()
        .matches(/^[0-9]{8,11}$/, 'Notification number must be between 8 and 11 digits')
        .nullable()
        .transform((value) => (value === '' ? null : value))
    ),
    notification_emails: Yup.array().of(
      Yup.string().email('Invalid email format').required('Email is required')
    ),
    city: Yup.string().required('City is required'),

    address: Yup.string().required('Address is required'),

    zip_codes: Yup.array().of(
      Yup.string()
        .matches(zipCodeRegex, 'Zip code must be exactly 6 digits')
        .required('Phone number is required')
    ),

    geo_longitude: Yup.number()
      .transform((value) => (!value ? null : value))
      .nullable()
      .test(
        'is-exactly-four-decimal-float',
        'Geo longitude must be a number with exactly 4 decimal places',
        (value) => value === null || /^[+-]?\d+\.\d{4}$/.test(value.toString())
      ),

    geo_latitude: Yup.number()
      .transform((value) => (!value ? null : value))
      .nullable()
      .test(
        'is-exactly-four-decimal-float',
        'Geo latitude must be a number with exactly 4 decimal places',
        (value) => value === null || /^[+-]?\d+\.\d{4}$/.test(value.toString())
      ),

    // translations: Yup.array()
    //   .of(
    //     Yup.object({
    //       language: Yup.string().required('Language is required'),
    //       name: Yup.string().required('Name is required'),
    //     })
    //   )
    //   .min(1, 'At least one object is required')
    //   .required('Data is required'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const {
    reset,
    setError,
    setValue,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    clearErrors,
    control,
  } = methods;

  const values = watch();

  const isEditData = isEqual(values, openAddOnlineOrderDialog?.data);

  const watchTranslations = watch('translations');
  const watchPlatformData = watch('platform_data');
  const watchTimings = watch('timings');
  const watchRefId = watch('ref_id');
  const watchName = watch('name');

  console.log('watchTimings', watchTimings, values);

  const onSubmit = async (data) => {
    const isAvailablePlatformData = some(data?.platform_data, (_item) => {
      return get(_item, 'url') && get(_item, 'platform_store_id');
    });

    const isAvailableTimingsData = some(data?.timings, (_item) => {
      return !isEmpty(get(_item, 'slots'));
    });

    if (!isAvailablePlatformData) {
      return toast.error('Please fill atleast one platform data');
    }
    if (!isAvailableTimingsData) {
      return toast.error('Please fill atleast one day slot');
    }

    const filterDataTimings = filter(get(data, 'timings'), (_item) => {
      return get(_item, 'slots');
    });

    const formatDataTimings = map(filterDataTimings, (_timing) => {
      return {
        ..._timing,
        slots: map(get(_timing, 'slots'), (_slot) => {
          return {
            start_time: `${formatTimeWithoutSec(get(_slot, 'start_time'))}:00`,
            end_time: `${formatTimeWithoutSec(get(_slot, 'end_time'))}:00`,
          };
        }),
      };
    });

    const formatData = {
      ...data,
      notification_phones: map(get(data, 'notification_phones'), (_item) => {
        return `91${_item}`;
      }),

      included_platforms: compact(
        map(get(data, 'platform_data'), (_item) => {
          if (get(_item, 'url') && get(_item, 'platform_store_id')) {
            return get(_item, 'name');
          }
          return null;
        })
      ),
      platform_data: filter(get(data, 'platform_data'), (_item) => {
        return get(_item, 'url') && get(_item, 'platform_store_id');
      }),
      timings: formatDataTimings,
    };

    if (isEmpty(get(formatData, 'zip_codes'))) {
      delete formatData?.zip_codes;
    }

    try {
      const response = await ONLINE_STORES.createOnlineStore({
        storeConfig: {
          stores: [formatData],
        },
        storeId: selectedStore,
        actionType: 'CREATE/UPDATE_STORE',
        storeName: storeName,
        storeReference,
        ...(openAddOnlineOrderDialog?.data ? {} : { active: true }),
      });
      if (response) {
        if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
          toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
        }
        if (response?.data?.recResponse?.status !== ERROR) {
          setIsShowVerifyButton(true);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleDeliveryZip = () => {
    setIsZipCodeEnabled(!isZipCodeEnabled);
  };
  useEffect(() => {
    if (openAddOnlineOrderDialog?.status) {
      setIsShowVerifyButton(false);
      setValue(`timings.${getDayIndex(daysOfObject.SUNDAY)}.day`, daysOfObject.SUNDAY);
    }
  }, [openAddOnlineOrderDialog]);

  const getDayIndex = (day) => {
    return days.indexOf(day);
  };

  // useEffect(() => {
  //   if (watchTranslations[0].language) {
  //     setValue('translations[0].name', watchName);
  //   }
  // }, [watchTranslations[0].language]);

  const handleCancelWithAlert = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to cancel? This action
      cannot be undone.`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            handleClose();
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

  const handleCopyAndPasteTimes = () => {
    const newDaySlotsData = map(days, (_day) => {
      return {
        day: _day,
        slots: watchTimings[getDayIndex(day)]?.slots || [],
      };
    });
    setValue('timings', newDaySlotsData);
    toast.success(SuccessConstants.REPLACED_SUCCESSFULLY);
  };

  const handleCopyAndPasteTimesWithAlert = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to replace ${day} slot in all days ?`,
      actions: {
        primary: {
          text: 'Ok',
          onClick: (onClose) => {
            handleCopyAndPasteTimes();
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.success.main,
            '&:hover': {
              backgroundColor: theme.palette.success.main,
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
    <Dialog
      maxWidth={'md'}
      open={openAddOnlineOrderDialog?.status}
      onClose={isShowVerifyButton ? handleCancelWithAlert : handleClose}
    >
      <Stack
        flexDirection={'row'}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          backgroundColor: '#fff',
          p: 1,
          width: '100%',
          mt: 1,
          ml: 1,
        }}
      >
        <Stack flexDirection={'row'} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ ml: 1, pb: 1 }}>
            {openAddOnlineOrderDialog?.data ? 'Edit' : 'Add'} online store
          </Typography>
        </Stack>
      </Stack>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid
          container
          sx={{
            px: 2,
            height: 'calc(100vh - 280px)',
            overflow: 'auto',
            // pt: 1,
          }}
          spacing={2}
        >
          <Grid item xs={12} md={6}>
            <RHFTextField
              fullWidth
              variant="outlined"
              name="name"
              label="Name"
              inputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RHFTextField
              fullWidth
              variant="outlined"
              name="ref_id"
              label="Ref ID"
              inputProps={{ readOnly: true }}
              disabled
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(watchRefId);
                        toast.success(SuccessConstants.COPY_CLIPBOARD);
                      }}
                    >
                      <CopyAllIcon />
                    </Stack>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <RHFTextField
              fullWidth
              variant="outlined"
              name="min_pickup_time"
              label={
                <div>
                  Min pickup time (sec) <span style={{ color: 'red' }}>*</span>
                </div>
              }
              placeholder="Seconds"
              type="number"
              onWheel={(e) => {
                e.target.blur();
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RHFTextField
              fullWidth
              variant="outlined"
              name="min_delivery_time"
              label={
                <div>
                  Min delivery time (sec) <span style={{ color: 'red' }}>*</span>
                </div>
              }
              placeholder="Seconds"
              type="number"
              onWheel={(e) => {
                e.target.blur();
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RHFTextField
              fullWidth
              variant="outlined"
              name="min_order_value"
              label={
                <div>
                  Min order value (₹) <span style={{ color: 'red' }}>*</span>
                </div>
              }
              type="number"
              onWheel={(e) => {
                e.target.blur();
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RHFTextField
              fullWidth
              variant="outlined"
              name="contact_phone"
              label={
                <div>
                  Store number <span style={{ color: 'red' }}>*</span>
                </div>
              }
              type="number"
              onWheel={(e) => {
                e.target.blur();
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MultiTextFields
              fullWidth
              variant="outlined"
              name="notification_phones"
              label="Notification phone numbers (Enter to add multiple)"
              type="number"
              onWheel={(e) => {
                e.target.blur();
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MultiTextFields
              fullWidth
              variant="outlined"
              name="notification_emails"
              label="Notification emails (Enter to add multiple)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RHFTextField
              fullWidth
              variant="outlined"
              name="city"
              label={
                <div>
                  City <span style={{ color: 'red' }}>*</span>
                </div>
              }
              placeholder="Optional"
            />
          </Grid>

          <Grid item xs={12}>
            <RHFTextField
              multiline
              minRows={4}
              fullWidth
              variant="outlined"
              name="address"
              label={
                <div>
                  Address <span style={{ color: 'red' }}>*</span>
                </div>
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Card
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Stack
                sx={{ width: '100%' }}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography sx={{ fontWeight: 'semibold', pb: 2 }}>Delivery</Typography>
              </Stack>
              <Stack
                sx={{ width: '100%', gap: 2 }}
                flexDirection="row"
                mb={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <RHFTextField
                  fullWidth
                  variant="outlined"
                  name="geo_longitude"
                  label="Geo longitude"
                  type="number"
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                />
                <RHFTextField
                  fullWidth
                  variant="outlined"
                  name="geo_latitude"
                  label="Geo latitude"
                  type="number"
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                />
              </Stack>
              <Stack flexDirection={'row'} alignItems={'center'} mb={2}>
                <Typography sx={{ fontWeight: 'semibold' }}>Self delivery</Typography>

                <Switch
                  checked={isZipCodeEnabled}
                  onChange={handleDeliveryZip}
                  disabled
                  sx={{ opacity: 0.4, cursor: 'not-allowed' }}
                />

                <Typography sx={{ fontWeight: 'semibold', color: 'gray' }}>(Optional)</Typography>
                <Typography
                  sx={{ fontWeight: 'semibold', fontSize: '10px', pl: 1, color: '#1da1f1' }}
                >
                  Note: used for self delivery orders
                </Typography>
              </Stack>
              {isZipCodeEnabled && (
                <MultiTextFields
                  fullWidth
                  variant="outlined"
                  name="zip_codes"
                  label="Delivery codes (Enter to add multiple)"
                />
              )}
            </Card>
          </Grid>

          {/* <Grid item xs={12}>
            <Card
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Stack
                sx={{ width: '100%' }}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography sx={{ fontWeight: 'semibold' }} mb={2}>
                  Translations
                </Typography>
              </Stack>

              {map(watchTranslations, (_item, _index) => {
                return (
                  <Stack flexDirection="row" sx={{ width: '100%', mb: 2 }} gap={2}>
                    <RHFSelect
                      name={`translations[${_index}].language`}
                      label={
                        <div>
                          Language <span style={{ color: 'red' }}>*</span>
                        </div>
                      }
                      variant="outlined"
                    >
                      <MenuItem value={'en'}>EN</MenuItem>
                    </RHFSelect>

                    <RHFTextField
                      fullWidth
                      variant="outlined"
                      name={`translations[${_index}].name`}
                      label={
                        <div>
                          Name <span style={{ color: 'red' }}>*</span>
                        </div>
                      }
                    />
                  </Stack>
                );
              })}
            </Card>
          </Grid> */}

          <Grid item xs={12}>
            <Card
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Stack
                sx={{ width: '100%' }}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography sx={{ fontWeight: 'semibold' }} mb={2}>
                  {
                    <div>
                      Platform data <span style={{ color: 'red' }}>*</span>
                    </div>
                  }
                </Typography>
              </Stack>

              {map(watchPlatformData, (_item, _index) => {
                return (
                  <Stack
                    flexDirection="row"
                    alignItems={'center'}
                    sx={{ width: '100%', mb: 2 }}
                    gap={2}
                  >
                    <img
                      src={`/assets/images/${_item?.name === 'zomato' ? 'zomato' : 'Swiggy'}.png`}
                      style={{ width: '3rem', height: '1rem' }}
                      alt=""
                    />
                    <RHFTextField
                      fullWidth
                      variant="outlined"
                      name={`platform_data[${_index}].url`}
                      label="Platform URL"
                    />

                    <RHFTextField
                      fullWidth
                      variant="outlined"
                      name={`platform_data[${_index}].platform_store_id`}
                      label="Platform ID"
                    />
                  </Stack>
                );
              })}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Stack
                sx={{
                  width: '100%',
                  mb: 2,
                  flexDirection: {
                    sx: 'column',
                    sm: 'row',
                  },
                  alignItems: {
                    sx: 'start',
                    sm: 'center',
                  },
                  gap: 2,
                }}
                justifyContent="space-between"
              >
                <Typography sx={{ fontWeight: 'semibold' }}>
                  <div>
                    Timings <span style={{ color: 'red' }}>*</span>
                  </div>
                </Typography>

                <Stack flexDirection="row" gap={1}>
                  <Chip
                    label="S"
                    color="primary"
                    variant={day === daysOfObject.SUNDAY ? '' : 'outlined'}
                    sx={{ width: 37 }}
                    onClick={() => {
                      setDay('');
                      setTimeout(() => {
                        setDay(daysOfObject.SUNDAY);
                        setValue(
                          `timings.${getDayIndex(daysOfObject.SUNDAY)}.day`,
                          daysOfObject.SUNDAY
                        );
                      }, 50);
                    }}
                  />
                  <Chip
                    label="M"
                    color="primary"
                    variant={day === daysOfObject.MONDAY ? '' : 'outlined'}
                    sx={{ width: 37 }}
                    onClick={() => {
                      setDay('');
                      setTimeout(() => {
                        setDay(daysOfObject.MONDAY);
                        setValue(
                          `timings.${getDayIndex(daysOfObject.MONDAY)}.day`,
                          daysOfObject.MONDAY
                        );
                      }, 50);
                    }}
                  />
                  <Chip
                    label="T"
                    color="primary"
                    variant={day === daysOfObject.TUESDAY ? '' : 'outlined'}
                    sx={{ width: 37 }}
                    onClick={() => {
                      setDay('');
                      setTimeout(() => {
                        setDay(daysOfObject.TUESDAY);
                        setValue(
                          `timings.${getDayIndex(daysOfObject.TUESDAY)}.day`,
                          daysOfObject.TUESDAY
                        );
                      }, 50);
                    }}
                  />
                  <Chip
                    label="W"
                    color="primary"
                    variant={day === daysOfObject.WEDNESDAY ? '' : 'outlined'}
                    sx={{ width: 37 }}
                    onClick={() => {
                      setDay('');
                      setTimeout(() => {
                        setDay(daysOfObject.WEDNESDAY);
                        setValue(
                          `timings.${getDayIndex(daysOfObject.WEDNESDAY)}.day`,
                          daysOfObject.WEDNESDAY
                        );
                      }, 50);
                    }}
                  />
                  <Chip
                    label="T"
                    color="primary"
                    variant={day === daysOfObject.THURSDAY ? '' : 'outlined'}
                    sx={{ width: 37 }}
                    onClick={() => {
                      setDay('');
                      setTimeout(() => {
                        setDay(daysOfObject.THURSDAY);
                        setValue(
                          `timings.${getDayIndex(daysOfObject.THURSDAY)}.day`,
                          daysOfObject.THURSDAY
                        );
                      }, 50);
                    }}
                  />
                  <Chip
                    label="F"
                    color="primary"
                    variant={day === daysOfObject.FRIDAY ? '' : 'outlined'}
                    sx={{ width: 37 }}
                    onClick={() => {
                      setDay('');
                      setTimeout(() => {
                        setDay(daysOfObject.FRIDAY);
                        setValue(
                          `timings.${getDayIndex(daysOfObject.FRIDAY)}.day`,
                          daysOfObject.FRIDAY
                        );
                      }, 50);
                    }}
                  />
                  <Chip
                    label="S"
                    color="primary"
                    variant={day === daysOfObject.SATURDAY ? '' : 'outlined'}
                    sx={{ width: 37 }}
                    onClick={() => {
                      setDay('');
                      setTimeout(() => {
                        setDay(daysOfObject.SATURDAY);
                        setValue(
                          `timings.${getDayIndex(daysOfObject.SATURDAY)}.day`,
                          daysOfObject.SATURDAY
                        );
                      }, 50);
                    }}
                  />
                </Stack>
              </Stack>

              <Card
                sx={{
                  padding: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%',
                }}
              >
                <Stack
                  sx={{ width: '100%' }}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography sx={{ fontWeight: 'semibold' }} mb={2}>
                    Slots
                  </Typography>

                  <Stack flexDirection="row" gap={0.5} sx={{ mb: 2 }}>
                    {/* {!!day && !!watchDaySlots[getDayIndex(day)]?.slots?.length && ( */}
                    <IconButton onClick={handleCopyAndPasteTimesWithAlert}>
                      <ContentPasteIcon sx={{ fontSize: '20px' }} />
                    </IconButton>
                    {/* )} */}

                    <IconButton
                      // sx={{ mb: 2 }}
                      onClick={() => {
                        setValue(`timings.${getDayIndex(day)}.slots`, [
                          ...(watchTimings[getDayIndex(day)]?.slots || []),
                          {
                            start_time: moment().startOf('day').format(),
                            end_time: moment().endOf('day').format(),
                          },
                        ]);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                {day &&
                  map(watchTimings[getDayIndex(day)]?.slots, (_slot, _slotIndex) => {
                    return (
                      <Stack
                        flexDirection="row"
                        sx={{ width: '100%', mb: 2 }}
                        gap={2}
                        key={_slotIndex}
                      >
                        <RHFTimePicker
                          fullWidth
                          variant="outlined"
                          name={`timings[${getDayIndex(day)}].slots[${_slotIndex}].start_time`}
                          label="Start time"
                          sx={{ width: '100%' }}
                        />

                        <RHFTimePicker
                          fullWidth
                          variant="outlined"
                          name={`timings[${getDayIndex(day)}].slots[${_slotIndex}].end_time`}
                          label="End time"
                          sx={{ width: '100%' }}
                        />

                        <IconButton
                          onClick={() => {
                            const filterData = filter(
                              watchTimings[getDayIndex(day)]?.slots,
                              (__item, __index) => __index !== _slotIndex
                            );

                            setValue(`timings.${getDayIndex(day)}.slots`, [...filterData]);
                          }}
                          disabled={_slotIndex === 0}
                        >
                          <DeleteForeverIcon
                            sx={{ color: _slotIndex === 0 ? 'lightgray' : 'red' }}
                          />
                        </IconButton>
                      </Stack>
                    );
                  })}
              </Card>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <RHFCheckbox name="ordering_enabled" label="Ordering enabled" disabled />
          </Grid>
        </Grid>
        <Stack
          sx={{ ml: 'auto' }}
          flexDirection="row"
          alignItems="center"
          justifyContent="flex-end"
          gap={2}
          mt={4}
          mb={3}
          mr={3}
        >
          <Button
            size="large"
            variant="text"
            onClick={isShowVerifyButton ? handleCancelWithAlert : handleClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={(isEditData && openAddOnlineOrderDialog?.data) || isShowVerifyButton}
          >
            Submit
          </LoadingButton>
          {isShowVerifyButton && (
            <Button
              size="large"
              variant="contained"
              sx={{
                backgroundColor: 'green',
                '&:hover': {
                  backgroundColor: 'green',
                },
              }}
              onClick={() => {
                setIsMarkedAsPublished(true);
                window.open(FDNavigateLink);
              }}
            >
              {isMarkedAsPublished ? 'Mark as published' : 'Publish'}
            </Button>
          )}
        </Stack>
      </FormProvider>
    </Dialog>
  );
};

export default CreateOnlineStoresDialog;
