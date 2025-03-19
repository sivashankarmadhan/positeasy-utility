import React, { useState, useEffect } from 'react';
import { Box, Dialog, Typography, IconButton, Stack, Button, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import * as Yup from 'yup';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import toString from 'lodash/toString';

import { SuccessConstants } from '../../../src/constants/SuccessConstants';
import { ErrorConstants } from '../../../src/constants/ErrorConstants';
import RegexValidation from '../../../src/constants/RegexValidation';

import {
  REQUIRED_CONSTANTS,
  DEFAULT_GOOGLE_MAP_LOCATION,
  LATITUDE_REGEX,
  LONGITUDE_REGEX,
  RADIUS_REGEX,
} from '../../../src/constants/AppConstants';
import FormProvider from '../../../src/components/hook-form/FormProvider';
import MapView from '../../pages/Settings/MapView';
import useDebounce, { RHFTextField } from '../../../src/components/hook-form';
import MultiTextFields from 'src/components/hook-form/MultiTextFields';
import SettingServices from 'src/services/API/SettingServices';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import toast from 'react-hot-toast';

function LocationAddDialog({
  locationDialog,
  scanQrDetails,
  handleLocationClose,
  getStaffLocation,
  locationSettings,
  initialFetch,
}) {
  const [markerLocation, setMarkerLocation] = useState(null);

  const [searchLocationList, setSearchLocationList] = useState([]);

  const [searchQuery, setSearchQuery] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearchLocationSelected, setIsSearchLocationSelected] = useState(false);
  const RegisterSchema = Yup.object().shape({
    Latitude: Yup.string()
      .matches(LATITUDE_REGEX, 'Invalid latitude format')
      .required(REQUIRED_CONSTANTS.LATITUDE),
    Longitude: Yup.string()
      .matches(LONGITUDE_REGEX, 'Invalid longitude format')
      .required(REQUIRED_CONSTANTS.LONGITUDE),
    Radius: Yup.number().required(REQUIRED_CONSTANTS.RADIUS),
  });

  const defaultValues = {
    Latitude: get(locationSettings, 'latLongInfo.latitude') || '',
    Radius: get(locationSettings, 'latLongInfo.radius') || '',
    Longitude: get(locationSettings, 'latLongInfo.longitude') || '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  function handleClose() {
    reset();
    handleLocationClose();
    setSelectedLocation(null);
    setMarkerLocation(null);
    setSearchLocationList([]);
  }

  const currentStore = useRecoilValue(currentStoreId);
  const [currentTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);
  const handleData = async (data) => {
    const lat = data.Latitude;
    const lon = data.Longitude;
    const rad = data.Radius;

    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        scanQrSettings: {
          ...scanQrDetails,
          locationSettings: {
            isActive: true,

            latLongInfo: {
              latitude: lat,
              longitude: lon,
              radius: rad,
            },
            selectedLocations: [],
          },
        },
      };
      await SettingServices.postScanQrConfiguration(options);

      initialFetch();
      handleClose();
      toast.success('Location enabled successfully!');
    } catch (e) {
      toast.error('Failed to enable location. Please try again.');
    }
  };

  function handleRadius(value) {
    if (RegexValidation.RADIUS?.test(value) || value === '') {
      setValue('Radius', value);
    }
  }

  useEffect(() => {
    setValue(
      'Latitude',
      toString(get(markerLocation, 'lat') || locationSettings?.latLongInfo?.latitude)
    );

    setValue(
      'Longitude',
      toString(get(markerLocation, 'lng') || locationSettings?.latLongInfo?.longitude)
    );
  }, [markerLocation, locationSettings]);

  useEffect(() => {
    if (!isEmpty(selectedLocation)) {
      fetchLatLongForSelectedLocation();
    }
  }, [selectedLocation]);

  return (
    <>
      <Dialog open={locationDialog} onClose={handleClose} fullWidth>
        <Box p={2}>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant="h6">Add New Location</Typography>
            <Tooltip title="close">
              <IconButton onClick={handleLocationClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <hr />
          <FormProvider methods={methods} onSubmit={handleSubmit(handleData)}>
            <Stack spacing={2} mt={1}>
              <Stack direction="row" spacing={2}>
                <RHFTextField type="number" name="Latitude" label="Latitude" />

                <RHFTextField type="number" name="Longitude" label="Longitude" />
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <RHFTextField
                  type="text"
                  inputMode="decimal"
                  name="Radius"
                  label="Radius"
                  onInput={(e) => {
                    const value = e.target.value;
                    if (RADIUS_REGEX.test(value)) {
                      setValue('Radius', value);
                    }
                  }}
                  onChange={(e) => {
                    handleRadius(e.target.value);
                  }}
                  error={Boolean(errors.Latitude)}
                  helperText={errors.Radius?.message}
                />
              </Stack>

              <Box sx={{ height: '300px' }}>
                <MapView
                  defaultCenter={
                    isEmpty(markerLocation) ? DEFAULT_GOOGLE_MAP_LOCATION : markerLocation
                  }
                  locationSettings={locationSettings}
                  setValue={setValue}
                  markerLocation={markerLocation}
                  setMarkerLocation={setMarkerLocation}
                  isSearchLocationSelected={isSearchLocationSelected}
                />
              </Box>

              <Box display={'flex'} justifyContent={'flex-end'} direction={'row'} gap={2}>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
                <LoadingButton
                  size="small"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Add Location
                </LoadingButton>
              </Box>
            </Stack>
          </FormProvider>
        </Box>
      </Dialog>
    </>
  );
}

export default LocationAddDialog;
