import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Card,
  Typography,
  Stack,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';
import { get, isBoolean, isEmpty, map, omit, omitBy } from 'lodash';
import trimDescription from 'src/helper/trimDescription';
import S3ImageCaching from 'src/components/S3ImageCaching';
import AddIcon from '@mui/icons-material/Add';
import COUNTERS_API from 'src/services/counters';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/FormProvider';
import { RHFRadioGroup, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import {
  PRINT_CONSTANT_LAN_CONSTANT,
  REQUIRED_CONSTANTS,
  StatusConstants,
} from 'src/constants/AppConstants';
import UploadImage from 'src/components/upload/UploadImage';
import { S3Service } from 'src/services/S3Service';
import toast from 'react-hot-toast';
import { alertDialogInformationState, currentStoreId } from 'src/global/recoilState';
import { textReplaceAll } from 'src/helper/textReplaceAll';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useLocation } from 'react-router';
import CloseIcon from '@mui/icons-material/Close';

const Counters = () => {
  const [countersList, setCountersList] = useState([]);
  const [openNewCounter, setOpenNewCounter] = useState(false);
  const [currentCounter, setCurrentCounter] = useState({});
  const currentStore = useRecoilValue(currentStoreId);
  const location = useLocation();
  const theme = useTheme();

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const handleOpenNewCounter = () => {
    setOpenNewCounter(true);
  };

  useEffect(() => {
    if (location?.state?.isDrawerOpen) {
      handleOpenNewCounter();
    }
  }, [location]);

  const handleItem = (e) => {
    setCurrentCounter(e);
    handleOpenNewCounter();
  };

  const handleCloseNewCounter = () => {
    setCurrentCounter({});
    reset(defaultValues);
    setOpenNewCounter(false);
  };

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().required(REQUIRED_CONSTANTS.COUNTER_NAME),
    description: Yup.string(),
    counterImage: Yup.mixed().nullable(),
  });
  const defaultValues = {
    name: '',
    description: '',
    counterImage: '',
  };
  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const {
    reset,
    setError,
    setValue,
    getValues,
    handleSubmit,
    watch,
    formState: { errors },
    clearErrors,
  } = methods;

  const watchIsKotEnabled = watch('isKotEnabled');

  const values = watch();

  const disableUpdate = JSON.stringify(values) === JSON.stringify(currentCounter);
  const onSubmit = async (data) => {
    try {
      let updatedData = omit(
        {
          ...data,
          description: textReplaceAll(get(data, 'description', ''), '\n', ','),
        },
        ['lanHost', 'lanPort', 'lanType']
      );
      if (typeof get(data, 'counterImage') === 'object' && get(data, 'counterImage') !== null) {
        const linkResponse = await S3Service.getCountersLink();
        console.log('linkresponse,', linkResponse);
        const payload = {
          s3URL: get(linkResponse, 'data.URL'),
          file: get(data, 'counterImage'),
        };
        const imageResponse = await S3Service.sendFile(payload);
        updatedData = {
          ...updatedData,
          counterImage: get(imageResponse, 'url').split('?')[0],
        };
      }
      if (get(updatedData, 'counterId')) {
        const response = await COUNTERS_API.updateCounter(updatedData);
      } else {
        const response = await COUNTERS_API.addCounter([updatedData]);
      }
      reset(defaultValues);
      handleCloseNewCounter();
      getCountersList();
    } catch (error) {
      setError('afterSubmit', 'Something Went Wrong');
      console.log(error);
    }
  };

  const handleDeleteCounter = async (counterId, onClose) => {
    try {
      const response = await COUNTERS_API.removeCounter(counterId);
      reset(defaultValues);
      handleCloseNewCounter();
      getCountersList();
      onClose();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteCounterWithAlert = (counterId) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to remove counter?`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            handleDeleteCounter(counterId, onClose);
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

  useEffect(() => {
    if (currentStore) getCountersList();
  }, [currentStore]);

  useEffect(() => {
    if (!isEmpty(currentCounter)) {
      reset({
        ...(currentCounter || {}),
      });
    }
  }, [currentCounter]);

  const getCountersList = async () => {
    try {
      const response = await COUNTERS_API.getAllCounters();
      setCountersList(get(response, 'data'));
    } catch (e) {
      setCountersList([]);
      console.log(e);
    }
  };

  useEffect(() => {
    getCountersList();
  }, []);

  return (
    <>
      <Stack
        sx={{
          p: 2,
          // width: { xs: 360, md: 400 },
          minHeight: 300,
          maxHeight: 600,
          overflowY: 'scroll',
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Button
            onClick={handleOpenNewCounter}
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
          >
            New
          </Button>
        </Stack>
        {isEmpty(countersList) ? (
          <Typography
            variant="subtitle1"
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3 }}
          >
            Counters not found
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {map(countersList, (e, index) => (
              <Grid key={get(e, 'counterId', index)} item xs={12} md={6} lg={4}>
                <Paper
                  sx={{
                    border: 1,
                    borderColor: 'rgba(0,0,0,0.1)',
                    height: 100,
                    width: '100%',
                    p: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Stack
                    sx={{ cursor: 'pointer' }}
                    onClick={(event) => {
                      handleItem(e);
                    }}
                    flexDirection={'row'}
                  >
                    <Stack flexDirection={'row'}>
                      <div
                        style={{
                          height: 80,
                          minWidth: 80,
                          width: 80,
                          overflow: 'hidden',
                          borderRadius: 5,
                          opacity: get(e, 'status') === StatusConstants.ACTIVE ? 1 : 0.3,
                        }}
                      >
                        <S3ImageCaching
                          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                          src={get(e, 'counterImage')}
                          alt="image"
                        />
                      </div>
                      <Stack
                        sx={{
                          ml: 1,
                          flexDirection: 'column',
                          opacity: get(e, 'status') === StatusConstants.ACTIVE ? 1 : 0.3,
                        }}
                      >
                        <Typography
                          noWrap
                          variant="subtitle1"
                          sx={{ fontSize: get(e, 'name', '').length > 12 ? 14 : 16 }}
                        >
                          {trimDescription(get(e, 'name', ''), 25)}
                        </Typography>

                        <Typography variant="caption">
                          {trimDescription(get(e, 'description', ''), 100)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
      <Dialog open={openNewCounter}>
        <Card sx={{ px: 2, pt: 2, width: { xs: 360, md: 450 }, minHeight: 300, overflow: 'auto' }}>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6">Enter New Counter Details</Typography>
            <IconButton onClick={handleCloseNewCounter}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RHFTextField name="name" fullWidth placeholder="Counter name" />
              <RHFTextField name="description" fullWidth placeholder="Description" />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <UploadImage name={'counterImage'} setValue={setValue} values={values} />
              </div>
            </Stack>

            <Stack
              flexDirection={'row'}
              gap={2}
              sx={{
                justifyContent: 'flex-end',
                mt: 2,
                position: 'sticky',
                py: 2,
                bottom: 0,
                backgroundColor: '#fff',
              }}
            >
              {!isEmpty(currentCounter) && (
                <Button
                  onClick={() => handleDeleteCounterWithAlert(get(currentCounter, 'counterId'))}
                  color="error"
                  variant="contained"
                >
                  Delete
                </Button>
              )}
              <Button
                onClick={() =>
                  isEmpty(currentCounter) ? reset(defaultValues) : reset(currentCounter)
                }
                color="warning"
                variant="contained"
              >
                Reset
              </Button>
              <Button disabled={disableUpdate} type="submit" variant="contained">
                {isEmpty(currentCounter) ? `Add Counter` : 'Update Counter'}
              </Button>
            </Stack>
          </FormProvider>
        </Card>
      </Dialog>
    </>
  );
};

export default Counters;
