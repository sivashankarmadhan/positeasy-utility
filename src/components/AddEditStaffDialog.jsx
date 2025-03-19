import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Avatar,
  IconButton,
  Stack,
  Typography,
  Dialog,
  Card,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { RHFTextField } from './hook-form';
import FormProvider from './FormProvider';

import toast from 'react-hot-toast';
import { useRecoilValue } from 'recoil';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentStoreId } from 'src/global/recoilState';

import { SuccessConstants } from 'src/constants/SuccessConstants';
import STORES_API from 'src/services/stores';
import RegexValidation from 'src/constants/RegexValidation';

import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { S3Service } from 'src/services/S3Service';
import { parseISO } from 'date-fns';
import { get, omit, isObject, isEqual } from 'lodash';
import RHFDatePicker from './hook-form/RHFDatePicker';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';

export default function AddEditStaffDialog(props) {
  const { open, handleClose, getStaffs, staffData } = props;
  const currentStore = useRecoilValue(currentStoreId);
  const theme = useTheme();

  const RegisterSchema = Yup.object().shape({
    name: Yup.string().max(30, 'Name should not exceed 30 characters').required('Name required'),
    email: Yup.string().email().required('Email is required'),
    contactNumber: Yup.string()
      .matches(RegexValidation.PHONE_NUMBER, 'Enter a valid contact number')
      .required('Contact number is required'),
    dateOfJoining: Yup.date()
      .nullable()
      .typeError('Enter a valid date')
      .required('Date of joining is required'),
    staffImage: Yup.mixed(),
  });

  const dateString = get(staffData, 'staffAttribute.DateOfJoining');

  const parsedDate = dayjs(dateString, 'DD-MM-YYYY');

  const isoDate = () => {
    if (!parsedDate.isValid()) {
    } else {
      const isoDate = parsedDate.toISOString();
      return isoDate;
    }
  };

  const isoStringDate = isoDate();

  const defaultValues = {
    name: get(staffData, 'name') || '',
    email: get(staffData, 'email') || '',
    contactNumber: get(staffData, 'contactNumber') || '',
    dateOfJoining: get(staffData, 'staffAttribute.DateOfJoining') || null,
    staffImage: get(staffData, 'staffImage') || '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = methods;

  const value = watch();

  const oldData = {
    contactNumber: staffData?.contactNumber || '',
    dateOfJoining: moment(get(staffData, 'staffAttribute.DateOfJoining') || null),
    email: staffData?.email || '',
    name: staffData?.name || '',
    staffImage: staffData?.staffImage || '',
  };

  const editData = {
    contactNumber: value?.contactNumber || '',
    dateOfJoining: moment(value?.dateOfJoining || null),
    email: value?.email || '',
    name: value?.name || '',
    staffImage: value?.staffImage || '',
  };

  const hasChanges = isEqual(oldData, editData);

  const [photo, setPhoto] = useState(staffData?.photo || null);

  const onSubmit = async (data) => {
    if (!currentStore) {
      toast.error(ErrorConstants.SELECT_STORE);
      return;
    }

    const formattedDate = data.dateOfJoining ? new Date(data.dateOfJoining).toISOString() : null;

    let options = {
      accessId: get(staffData, 'accessId'),
      staffId:get(staffData,"staffId"),
      name: data.name,
      email: data.email,
      contactNumber: data.contactNumber,
      staffAttribute: {
        DateOfJoining: formattedDate || null,
      },
      staffImage: data.staffImage,
    };
    try {
      let response;
      if (staffData) {
        response = await STORES_API.updateStaff(options);
        if (response) {
          toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
          handleCloseDialog();
          getStaffs();
        }
      } else {
        response = await STORES_API.addStaff(options);
        if (response) {
          toast.success(SuccessConstants.STAFF_ADDED);
          handleCloseDialog();
          getStaffs();
        }
      }
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const rawDate = staffData?.staffAttribute?.DateOfJoining;

  const handleCloseDialog = () => {
    handleClose();
    reset();
    setPhoto(null);
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      setValue('photo', file);

      try {
        const linkResponse = await S3Service.getStaffPhotoURL();
        if (linkResponse?.data?.URL) {
          await S3Service.sendFile({
            s3URL: linkResponse.data.URL,
            file: file,
          });
          const staffImageUrl = linkResponse.data.URL.split('?')[0];
          setValue('staffImage', staffImageUrl);
        }
      } catch (error) {
        toast.error('Error uploading photo:', error);
      }
    }
  };
  const parseCustomDate = (dateString) => {
    if (!dateString) return null;
    try {
      const parsedDate = parseISO(dateString);
      return isNaN(parsedDate) ? null : parsedDate;
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };
  useEffect(() => {
    if (staffData) {
      const rawDate = staffData.staffAttribute?.DateOfJoining;
      console.log('Raw Date:', rawDate);

      if (rawDate) {
        const parsedDate = new Date(rawDate);
        console.log('Parsed Date:', parsedDate);
      }
    }
  }, [staffData]);

  useEffect(() => {
    if (staffData) {
      reset(defaultValues);
    }
  }, [staffData]);

  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: { xs: 310, md: 360, sm: 400 } }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {staffData ? 'Edit Staff' : 'Add new staff'}
          </Typography>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() => handleCloseDialog()}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <label htmlFor="upload-avatar">
                <Avatar
                  src={photo ? URL.createObjectURL(photo) : staffData?.staffImage || ''}
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    cursor: 'pointer',
                  }}
                />
              </label>
              <input
                hidden
                id="upload-avatar"
                accept="image/*"
                type="file"
                onChange={handlePhotoChange}
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
                sx={{ position: 'absolute', bottom: 0, right: 0 }}
              >
                <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
              </IconButton>
            </Box>

            <RHFTextField name="name" label="Name" />
            <RHFTextField name="email" label="Email address" />
            <RHFTextField name="contactNumber" label="Contact number" />
            <RHFDatePicker name="dateOfJoining" label="Date of Joining" />

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={hasChanges}
            >
              {staffData ? 'Update Staff' : 'Add new staff'}{' '}
            </LoadingButton>
          </Stack>
        </FormProvider>
      </Card>
    </Dialog>
  );
}
