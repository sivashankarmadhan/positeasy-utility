import {
  Card,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useTheme,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Autocomplete,
  TextField,
} from '@mui/material';
import { filter, find, get, isEmpty, isEqual, map } from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import PurchaseOrderServices from 'src/services/API/PurchaseOrderServices';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AuthService from 'src/services/authService';
import { ALL_CONSTANT, days, daysOfObject, USER_AGENTS } from 'src/constants/AppConstants';
import ObjectToQueryParams from 'src/utils/ObjectToQueryParams';
import { generateFilename } from 'src/helper/generateFilename';
import handleCSVDownload from 'src/utils/handleCSVDownload';
import PRODUCTS_API from 'src/services/products';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/FormProvider';
import RHFTimePicker from 'src/components/hook-form/RHFTimePicker';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import { RHFTextField } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import { AddTimeWithCurrentDate } from 'src/utils/formatTime';
import {
  alertDialogInformationState,
  currentStoreId,
  storeReferenceState,
} from 'src/global/recoilState';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import OnlineCategoryServices from 'src/services/API/OnlineCategoryServices';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { SuccessConstants } from 'src/constants/SuccessConstants';

const TimingDialog = ({
  isOpen,
  onClose: onCloseTimingDialog,
  timingOnSubmit,
  currentCategoryData,
}) => {
  const [day, setDay] = useState(daysOfObject.SUNDAY);
  const [categoryTimingTitleList, setCategoryTimingTitleList] = useState([]);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const theme = useTheme();

  const [storeList, setStoreList] = useState([]);

  const [selectCategoryTitle, setSelectCategoryTitle] = useState('');
  const [enterCategoryTitle, setEnterCategoryTitle] = useState('');

  const getSelectedStoreDetails = (storeId) => {
    const terminals = find(storeList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return terminals;
  };

  const selectedStore = useRecoilValue(currentStoreId);
  const selectedStoreDetails = getSelectedStoreDetails(selectedStore);
  const storeReference = useRecoilValue(storeReferenceState);

  const getDayIndex = (day) => {
    return days.indexOf(day);
  };

  const editTimingData = currentCategoryData?.attributes?.sessionInfo;

  const formatTimingSlot = (editTimingData) => {
    return map(days, (_day) => {
      const findData = find(
        get(editTimingData, 'day_slots') || get(editTimingData, 'daySlots'),
        (_timing) => {
          return get(_timing, 'day') === _day;
        }
      );
      const formatTimingSlot = map(get(findData, 'slots'), (_slot) => {
        return {
          start_time: AddTimeWithCurrentDate(get(_slot, 'start_time')),
          end_time: AddTimeWithCurrentDate(get(_slot, 'end_time')),
        };
      });
      return findData ? { ...findData, slots: formatTimingSlot } : { day: _day };
    });
  };

  const formatEditTimingData = {
    title: editTimingData?.title,
    daySlots: formatTimingSlot(editTimingData),
  };

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
  const methods = useForm({
    defaultValues: {
      title: '',
      daySlots: defaultDaySlots,
    },
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

  console.log('errors', errors);

  const values = watch();

  const watchDaySlots = watch('daySlots');

  console.log('watchDaySlots', values);

  // useEffect(() => {
  //   if (isOpen && !editTimingData) {
  //     setValue(`daySlots.${getDayIndex(daysOfObject.SUNDAY)}.day`, daysOfObject.SUNDAY);
  //   }
  // }, [isOpen]);

  useEffect(() => {
    if (isOpen && editTimingData) {
      reset(formatEditTimingData);
      setSelectCategoryTitle(get(editTimingData, 'title'));
    }
  }, [isOpen]);

  const isEditData = isEqual(values, formatEditTimingData);

  const getCategoryTimingTitleList = async () => {
    if (!storeReference) return;
    try {
      const res = await OnlineCategoryServices.categoryTimingTitleList({
        storeReference: storeReference,
      });
      setCategoryTimingTitleList(get(res, 'data'));
    } catch (e) {
      console.error(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    getCategoryTimingTitleList();
  }, [storeList]);

  const getStoreList = async () => {
    try {
      const response = await ONLINE_STORES.getStoreAllList();
      setStoreList(get(response, 'data'));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getStoreList();
  }, []);

  const setTimingValues = () => {
    const findSelectCategoryTitleTimesData = find(categoryTimingTitleList, (_item) => {
      return get(_item, 'title') === selectCategoryTitle;
    });

    if (findSelectCategoryTitleTimesData) {
      reset({
        title: findSelectCategoryTitleTimesData?.title,
        daySlots: formatTimingSlot({
          ...findSelectCategoryTitleTimesData,
          day_slots: findSelectCategoryTitleTimesData?.daySlots,
        }),
      });
    } else if (!editTimingData) {
      reset({ title: '', daySlots: defaultDaySlots });
      // setValue(`daySlots.${getDayIndex(daysOfObject.SUNDAY)}.day`, daysOfObject.SUNDAY);
    }
  };

  useEffect(() => {
    setTimingValues();
  }, [selectCategoryTitle, categoryTimingTitleList]);

  useEffect(() => {
    if (selectCategoryTitle !== enterCategoryTitle) {
      reset({ title: enterCategoryTitle, daySlots: defaultDaySlots });
      // setValue(`daySlots.${getDayIndex(daysOfObject.SUNDAY)}.day`, daysOfObject.SUNDAY);
    } else {
      setTimingValues();
    }
  }, [enterCategoryTitle]);

  const disabledFields = selectCategoryTitle === enterCategoryTitle;

  const handleCopyAndPasteTimes = () => {
    const newDaySlotsData = map(days, (_day) => {
      return {
        day: _day,
        slots: watchDaySlots[getDayIndex(day)]?.slots || [],
      };
    });
    setValue('daySlots', newDaySlotsData);
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
    <Dialog open={isOpen} onClose={onCloseTimingDialog}>
      <Card
        sx={{
          p: 2,
          width: { xs: '100%', sm: 450, md: 600, lg: 800 },
          maxWidth: '100%',
        }}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Timings
          </Typography>
        </Stack>

        <FormProvider
          methods={methods}
          onSubmit={handleSubmit((data) => {
            if (!(data?.title || enterCategoryTitle)) {
              toast.error('Title is required');
              return;
            }
            timingOnSubmit({ ...data, title: data?.title || enterCategoryTitle });
          })}
        >
          <Stack
            sx={{
              minHeight: 'calc(100vh - 33rem)',
              maxHeight: 'calc(100vh - 20rem)',
              overflow: 'auto',
              pt: 0.7,
            }}
          >
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                overflow: 'revert',
              }}
            >
              <Stack sx={{ width: '100%', mb: 2 }}>
                <Autocomplete
                  freeSolo
                  inputValue={enterCategoryTitle}
                  onInputChange={(event, newInputValue) => {
                    setEnterCategoryTitle(newInputValue);
                  }}
                  disablePortal
                  options={map(categoryTimingTitleList, (_order) => get(_order, 'title'))}
                  renderInput={(params) => <TextField {...params} label="Category Title" />}
                  onChange={(event, newValue) => {
                    setSelectCategoryTitle(newValue);
                  }}
                  value={selectCategoryTitle}
                />
              </Stack>

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
                justifyContent="flex-end"
              >
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
                          `daySlots.${getDayIndex(daysOfObject.SUNDAY)}.day`,
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
                          `daySlots.${getDayIndex(daysOfObject.MONDAY)}.day`,
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
                          `daySlots.${getDayIndex(daysOfObject.TUESDAY)}.day`,
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
                          `daySlots.${getDayIndex(daysOfObject.WEDNESDAY)}.day`,
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
                          `daySlots.${getDayIndex(daysOfObject.THURSDAY)}.day`,
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
                          `daySlots.${getDayIndex(daysOfObject.FRIDAY)}.day`,
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
                          `daySlots.${getDayIndex(daysOfObject.SATURDAY)}.day`,
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
                    {!!day &&
                      !!watchDaySlots[getDayIndex(day)]?.slots?.length &&
                      !disabledFields && (
                        <IconButton onClick={handleCopyAndPasteTimesWithAlert}>
                          <ContentPasteIcon sx={{ fontSize: '20px' }} />
                        </IconButton>
                      )}

                    <IconButton
                      onClick={() => {
                        setValue(`daySlots.${getDayIndex(day)}.slots`, [
                          ...(watchDaySlots[getDayIndex(day)]?.slots || []),
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
                  map(watchDaySlots[getDayIndex(day)]?.slots, (_slot, _slotIndex) => {
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
                          name={`daySlots[${getDayIndex(day)}].slots[${_slotIndex}].start_time`}
                          label="Start time"
                          sx={{ width: '100%' }}
                          disabled={disabledFields}
                        />

                        <RHFTimePicker
                          fullWidth
                          variant="outlined"
                          name={`daySlots[${getDayIndex(day)}].slots[${_slotIndex}].end_time`}
                          label="End time"
                          sx={{ width: '100%' }}
                          disabled={disabledFields}
                        />

                        <IconButton
                          onClick={() => {
                            const filterData = filter(
                              watchDaySlots[getDayIndex(day)]?.slots,
                              (__item, __index) => __index !== _slotIndex
                            );

                            setValue(`daySlots.${getDayIndex(day)}.slots`, [...filterData]);
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
            </Stack>
          </Stack>

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={onCloseTimingDialog}>
              Cancel
            </Button>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={isEditData && editTimingData}
            >
              Submit
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Dialog>
  );
};

export default TimingDialog;
