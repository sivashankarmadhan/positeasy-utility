import { Helmet } from 'react-helmet-async';
// @mui
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  Dialog,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
  TableContainer,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  FormControlLabel,
} from '@mui/material';
// components
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person';
import QueuePlayNextTwoToneIcon from '@mui/icons-material/QueuePlayNextTwoTone';
import SettingsIcon from '@mui/icons-material/Settings';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import { compact, find, get, groupBy, includes, isEmpty, map, startCase, stubFalse } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import ManageStoreAccessDialog from 'src/components/ManageStoreAccessDialog';
import StoresAddDialog from 'src/components/StoresAddDialog';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import TerminalAddDialog from 'src/components/TerminalAddDialog';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  ROLES_DATA,
  ROLES_DATA_ID,
  TERMINAL_STATUS,
  TERMINAL_STATUS_COLORS,
  TerminalTypeLabels,
  USER_AGENTS,
  hideScrollbar,
  days,
  ENABLE,
  DISABLE,
  SWIGGY,
  ZOMATO,
  ElementNames,
  ERROR,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { StoresTourConfig } from 'src/constants/TourConstants';
import {
  alertDialogInformationState,
  currentStoreId,
  fdSelectedStoreDetailsState,
  storeNameState,
  storeReferenceState,
  stores,
} from 'src/global/recoilState';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import AuthService from 'src/services/authService';
import STORES_API from 'src/services/stores';
import { useSettingsContext } from '../components/settings';
import Configuration from './Settings/Configuration';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Auth_API from 'src/services/auth';
import DeleteTerminalDialog from 'src/components/DeleteTerminalDialog';
import BridgeConstants from 'src/constants/BridgeConstants';
import NativeService from 'src/services/NativeService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ObjectStorage from 'src/modules/ObjectStorage';
import { ROLE_STORAGE, StorageConstants } from 'src/constants/StorageConstants';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { useNavigate } from 'react-router';
import CreateOnlineStoresDialog from 'src/sections/OnlineStores/CreateOnlineStoresDialog';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import {
  AddTimeWithCurrentDate,
  fDatesWithTimeStamp,
  timeAndSecFormat,
} from 'src/utils/formatTime';
import dayjs from 'dayjs';
import moment from 'moment';
import convertTo12Hour from 'src/utils/convertTo12Hour';
import DialogComponent from 'src/sections/WhatsappCredits/Dialog';
import { LoadingButton } from '@mui/lab';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FDAutoEnableDialog from 'src/components/FDAutoEnableDialog';
import SoundConfigDialog from 'src/components/SoundConfigDialog';

// ----------------------------------------------------------------------

export default function OnlineStores() {
  const theme = useTheme();
  const currentRole = AuthService.getCurrentRoleInLocal();
  const [storesData, setStoresData] = useRecoilState(stores);
  const [storesDetails, setStoresDetails] = useState([]);
  const audioRefs = useRef([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const setCurrentStoresDetails = useSetRecoilState(fdSelectedStoreDetailsState);
  const { themeStretch } = useSettingsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [openAddOnlineOrderDialog, setOpenAddOnlineOrderDialog] = useState({
    status: false,
    data: null,
  });

  const [fdEnableOrEnableDialog, setFdEnableOrEnableDialog] = useState(false);
  const [soundEnableDialog, setSoundEnableDialog] = useState(false);

  const [selectedStore, setSelectedStore] = useState(null);
  const currentStore = useRecoilValue(currentStoreId);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const [storeList, setStoreList] = useState([]);
  const [soundConfiguration, setSoundConfiguration] = useState({});

  const [activeInFD, setActiveInFD] = useState(null);

  const actualStoreList = useRecoilValue(stores);
  const storeReference = useRecoilValue(storeReferenceState);

  const groupedStoresListData = groupBy(storesData, 'storeId');
  const storeLabelList = map(groupedStoresListData, (terminal, store) => {
    return {
      storeId: get(terminal, '0.storeId'),
      storeName: get(terminal, '0.storeName'),
    };
  });
  const storeName = useRecoilValue(storeNameState);

  const [enableSwiggy, setEnableSwiggy] = useState(false);
  const [enableZomato, setEnableZomato] = useState(false);

  const navigate = useNavigate();

  const isMobile = useMediaQuery('(max-width:800px)');

  const copyToClipboardReactNative = async (text) => {
    const nativeRequest = [
      {
        name: BridgeConstants.COPY_TO_CLIPBOARD,
        data: { text: text },
      },
    ];
    return NativeService.sendAndReceiveNativeData(nativeRequest).then((response) => {
      const nativeItem = response.filter(
        (responseItem) => responseItem.name === BridgeConstants.COPY_TO_CLIPBOARD
      );
      return nativeItem[0].data.message;
    });
  };

  const handleAudioPlay = (index) => {
    if (playingAudio !== null && playingAudio !== index) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }
    setPlayingAudio(index);
  };

  const handleOpenAddOnlineOrderDialog = (data) => {
    setOpenAddOnlineOrderDialog({ status: true, data: data || null });
  };
  const handleCloseAddOnlineOrderDialog = () => {
    setOpenAddOnlineOrderDialog({ status: false, data: null });
  };

  const getStoresDetails = async () => {
    try {
      setIsLoading(true);
      const response = await ONLINE_STORES.onlineStoreDetails(selectedStore);
      if (response) {
        setStoresDetails(get(response, 'data.FDStoreSettings'));
        if (currentStore === selectedStore) {
          setCurrentStoresDetails(get(response, 'data.FDStoreSettings'));
        }
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      setIsLoading(false);
    }
  };

  const getStoreName = (storeId) => {
    const terminals = find(actualStoreList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };

  useEffect(() => {
    if (selectedStore) {
      getStoresDetails();
    }
  }, [selectedStore]);

  useEffect(() => {
    if (!isEmpty(storeList)) {
      if (isMobile) {
        setSelectedStore(null);
      } else {
        setSelectedStore(storeList[0]?.storeId);
      }
    }
  }, [isMobile, storeList]);

  useEffect(() => {
    if (copied)
      setTimeout(() => {
        setCopied('');
      }, 2000);
  }, [copied]);

  const { role } = ObjectStorage.getItem(ROLE_STORAGE.ROLE) || {};
  const isManager = role === ROLES_DATA.store_manager.role;

  const getStoreList = async () => {
    try {
      setIsLoading(true);
      const response = await ONLINE_STORES.getStoreAllList();
      setStoreList(get(response, 'data'));
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isManager) {
      setStoreList(storeLabelList);
    } else {
      getStoreList();
    }
  }, []);

  const handleFoodDelivery = async (activeIn, platforms, status) => {
    try {
      setIsButtonLoading(true);

      const payload = {
        storeReference: storeReference,
        platforms: platforms,
        action: status ? ENABLE : DISABLE,
        activeIn: activeIn,
        storeId: selectedStore,
        ...(!status && activeInFD
          ? { turnOnAt: moment(activeInFD, 'YY-MM-DD hh:mm A').unix() * 1000 }
          : {}),
        actionType: 'TOGGLE_STORE',
        storeName,
      };

      const response = await ONLINE_STORES.toggleFoodDelivery(payload);

      if (response?.data?.recResponse?.message && response?.data?.recResponse?.status) {
        toast?.[response?.data?.recResponse?.status]?.(response?.data?.recResponse?.message);
      } else {
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }

      if (response?.data?.recResponse?.status !== ERROR) {
        getStoresDetails();
      }
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
      console.log(error);
    } finally {
      setIsButtonLoading(false);
    }
  };

  useEffect(() => {
    setEnableSwiggy(includes(get(storesDetails, 'activeIn'), SWIGGY));
    setEnableZomato(includes(get(storesDetails, 'activeIn'), ZOMATO));
  }, [storesDetails]);

  let isDisableSetSwiggyOrZomatoEnable = true;

  if (
    enableZomato === includes(get(storesDetails, 'activeIn'), ZOMATO) &&
    enableSwiggy === includes(get(storesDetails, 'activeIn'), SWIGGY)
  ) {
    isDisableSetSwiggyOrZomatoEnable = true;
  } else if (enableZomato && enableSwiggy) {
    isDisableSetSwiggyOrZomatoEnable = false;
  } else if (!enableZomato && !enableSwiggy) {
    isDisableSetSwiggyOrZomatoEnable = false;
  } else if (
    (includes(get(storesDetails, 'activeIn'), SWIGGY) ===
      includes(get(storesDetails, 'activeIn'), ZOMATO) ||
      !includes(get(storesDetails, 'activeIn'), SWIGGY) ===
        !includes(get(storesDetails, 'activeIn'), ZOMATO)) &&
    ((enableZomato && includes(get(storesDetails, 'activeIn'), SWIGGY)) ||
      (enableSwiggy && includes(get(storesDetails, 'activeIn'), ZOMATO)))
  ) {
    isDisableSetSwiggyOrZomatoEnable = false;
  }

  const toggleOnlineStore = (platform, onClose) => {
    const dateWithTime = event.view.document.getElementsByName(
      ElementNames.ENABLE_ONLINE_STORE_DATE_AND_TIME_FOR_OPTION
    )?.[0]?.value;
    setActiveInFD(dateWithTime || null);
    if (platform === SWIGGY) {
      setEnableSwiggy(false);
    } else if (platform === ZOMATO) {
      setEnableZomato(false);
    }
    onClose();
  };

  const toggleOnlineItemWithAlertDialog = (platform) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: (
        <Stack flexDirection="column" gap={1.5}>
          <Typography>Are you sure You want to disable online status</Typography>
          <FDAutoEnableDialog
            DateTimePickerName={ElementNames.ENABLE_ONLINE_STORE_DATE_AND_TIME_FOR_OPTION}
          />
        </Stack>
      ),
      actions: {
        primary: {
          text: 'Disable',
          onClick: (onClose, onLoading, event) => {
            toggleOnlineStore(platform, onClose);
          },
          sx: {
            backgroundColor: 'red',
            '&:hover': {
              backgroundColor: 'red',
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

  if (isLoading) return <LoadingScreen />;

  const AddAndSwitchStoreContent = () => {
    return (
      <Stack
        flexDirection={'row'}
        sx={{
          display: 'flex',
          alignItems: 'center',
          top: 10,
          left: 0,
          zIndex: 99,
          width: '100%',
          py: 2,
          gap: 1,
        }}
      >
        <Autocomplete
          sx={{ width: '100%' }}
          size="small"
          disableClearable
          options={map(storeList, (_item) => get(_item, 'storeId'))}
          onChange={(e, val) => setSelectedStore(val)}
          getOptionLabel={(option) => getStoreName(option)}
          renderOption={(props, option, { selected }) => (
            <li {...props}>{`${getStoreName(option)}`}</li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search stores"
              InputProps={{
                ...params.InputProps,
                type: 'search',
              }}
            />
          )}
        />
      </Stack>
    );
  };

  const renderBackIcon = () => {
    return (
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          backgroundColor: 'lightgray',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={() => {
          setSelectedStore(null);
        }}
      >
        <ArrowBackIcon color="primary" fontSize="small" />
      </Box>
    );
  };

  const isActiveFD = storesDetails?.turnOnAt
    ? storesDetails?.turnOnAt <= moment().unix() * 1000
    : false;

  const cardDetails = () => {
    return (
      <Stack
        p={2}
        borderRadius={'20px'}
        sx={{
          border: 0.1,
          borderColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
          width: '100%',
          height: isMobile ? 'calc(100vh - 12rem)' : 'calc(100vh - 8rem)',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {!isEmpty(storesDetails) && (
          <Stack
            flexDirection={'row'}
            sx={{
              mb: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'absolute',
              top: 10,
              left: 0,
              zIndex: 99,
              width: '100%',
              p: 2,
            }}
          >
            <Stack
              flexDirection={'column'}
              sx={{
                gap: 1,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {isMobile && renderBackIcon()}

              <Stack
                sx={{
                  flexDirection: {
                    xs: 'column',
                    md: 'row',
                  },
                  alignItems: {
                    xs: 'start',
                    md: 'center',
                  },
                  marginTop: {
                    xs: 2,
                    md: 0,
                  },
                  gap: {
                    xs: 1,
                    md: 0,
                  },
                }}
                justifyContent="space-between"
                mb={2}
              >
                <Stack flexDirection="row" alignItems="center" gap={0.5}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={'/assets/images/swiggy-logo.png'}
                      style={{ width: 18, height: 20, marginRight: 10 }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        top: -8,
                        left: 11,
                        // backgroundColor: theme.palette.success.main,
                        borderRadius: 20,
                        height: 15,
                        width: 15,
                        color: theme.palette.common.white,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 10,
                          background:
                            isActiveFD || includes(get(storesDetails, 'activeIn'), 'swiggy')
                              ? 'green'
                              : 'red',
                        }}
                      ></Typography>
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <img
                      src={'/assets/images/zomato-logo.png'}
                      style={{ width: 70, height: 70, marginRight: 10 }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        top: 21,
                        right: 4,
                        // backgroundColor: theme.palette.success.main,
                        borderRadius: 20,
                        height: 15,
                        width: 15,
                        color: theme.palette.common.white,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 10,
                          background:
                            isActiveFD || includes(get(storesDetails, 'activeIn'), 'zomato')
                              ? 'green'
                              : 'red',
                        }}
                      ></Typography>
                    </div>
                  </div>

                  <Stack flexDirection="row" alignItems="center" gap={1}>
                    {storesDetails?.turnOnAt && !isActiveFD && (
                      <Typography sx={{ fontSize: '12px' }}>
                        (Auto online at {fDatesWithTimeStamp(storesDetails?.turnOnAt)})
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                <Stack flexDirection="row" justifyContent="flex-end">
                  <Stack
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setFdEnableOrEnableDialog(true);
                    }}
                  >
                    <img
                      src={`/assets/swiggy-zomato-logo.svg`}
                      style={{ width: 20, height: 20, marginRight: 7 }}
                    />
                  </Stack>

                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    gap={0.5}
                    sx={{ textDecoration: 'underline', cursor: 'pointer', ml: 1.5 }}
                    onClick={() => {
                      const formatData = {
                        ...(get(storesDetails, 'storeConfig.stores.0') || {}),
                        ...(get(storesDetails, 'soundConfig') || {}),
                        notification_phones: map(
                          get(storesDetails, 'storeConfig.stores.0.notification_phones'),
                          (_item) => {
                            return _item?.length === 12 ? _item?.substring?.(2) : _item;
                          }
                        ),

                        timings: map(days, (_day) => {
                          const findData = find(
                            get(storesDetails, 'storeConfig.stores.0.timings'),
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
                          return findData
                            ? { ...findData, slots: formatTimingSlot }
                            : { day: _day };
                        }),
                      };

                      handleOpenAddOnlineOrderDialog(formatData);
                    }}
                  >
                    <EditNoteIcon color="primary" />
                  </Stack>
                  <Stack
                    sx={{ cursor: 'pointer', ml: 1.5 }}
                    onClick={() => {
                      const soundConfigData = {
                        ...(get(storesDetails, 'soundConfig') || {}),
                      };
                      setSoundConfiguration(soundConfigData);
                      setSoundEnableDialog(true);
                    }}
                  >
                    <CircleNotificationsIcon color="primary" />
                  </Stack>
                </Stack>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      City
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.city')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Name
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.name')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Ref ID
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.ref_id')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Contact phone
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.contact_phone')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Notification phones
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.notification_phones')?.join(', ')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Min delivery time (sec)
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.min_delivery_time')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Min pickup time (sec)
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.min_pickup_time')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Min order value (₹)
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.min_order_value')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Geo latitude
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.geo_latitude')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Geo longitude
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.geo_longitude')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Address
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.address')}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Notification emails
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.notification_emails')?.join(', ')}
                    </Typography>
                  </Stack>
                </Grid>
                {/* <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Zip codes
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.zip_codes')?.join(', ')}
                    </Typography>
                  </Stack>
                </Grid> */}

                <Grid item xs={12} sm={6} lg={4}>
                  <Stack flexDirection={'column'} justifyContent={'space-between'} sx={{ mt: 1 }}>
                    <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                      Included platforms
                    </Typography>
                    <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                      {get(storesDetails, 'storeConfig.stores.0.included_platforms')?.join(', ')}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              {get(storesDetails, 'soundConfig.isActive') && (
                <>
                  <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />

                  <Stack gap={2}>
                    <Stack gap={2} flexDirection={'row'} alignItems={'center'}>
                      <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
                        Sound configuration :
                      </Typography>

                      <audio
                        ref={(el) => (audioRefs.current[1] = el)}
                        controls
                        controlsList="nodownload noremoteplayback nofullscreen"
                        onPlay={() => handleAudioPlay(1)}
                      >
                        <source
                          src={`https://audio-pos.s3.ap-south-1.amazonaws.com/ringtone-${get(
                            storesDetails,
                            'soundConfig.soundKeyValue'
                          )}.mp3`}
                          type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                      </audio>
                    </Stack>

                    <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />
                  </Stack>
                </>
              )}

              {/* <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
                Translations
              </Typography>

              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                        align="left"
                      >
                        Language
                      </TableCell>
                      <TableCell
                        sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                        align="left"
                      >
                        Name
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {map(
                      get(storesDetails, 'storeConfig.stores.0.translations'),
                      (_item, _index) => (
                        <TableRow>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            align="left"
                          >
                            {get(_item, 'language')}
                          </TableCell>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            align="left"
                          >
                            {get(_item, 'name')}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer> */}

              <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />

              <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
                Platform data
              </Typography>

              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                        align="left"
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                        align="left"
                      >
                        URL
                      </TableCell>
                      <TableCell
                        sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                        align="left"
                      >
                        platform store ID
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {map(
                      get(storesDetails, 'storeConfig.stores.0.platform_data'),
                      (_item, _index) => (
                        <TableRow>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            align="left"
                          >
                            {get(_item, 'name')}
                          </TableCell>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            align="left"
                          >
                            {get(_item, 'url')}
                          </TableCell>
                          <TableCell
                            sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            align="left"
                          >
                            {get(_item, 'platform_store_id')}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1, mb: 2, width: '100%' }} />

              {map(get(storesDetails, 'storeConfig.stores.0.timings'), (_item) => {
                return (
                  <>
                    <Typography variant="subtitle1" sx={{ textAlign: 'start' }}>
                      Slot{' '}
                      <span style={{ color: 'gray', fontSize: '14px' }}>({get(_item, 'day')})</span>
                    </Typography>

                    <TableContainer>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                              align="left"
                            >
                              Start time
                            </TableCell>
                            <TableCell
                              sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                              align="left"
                            >
                              End time
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {map(get(_item, 'slots'), (_slot) => (
                            <TableRow>
                              <TableCell
                                sx={{ color: '#212B36', fontWeight: 700, fontSize: '13px' }}
                                align="left"
                              >
                                {convertTo12Hour(get(_slot, 'start_time'))}
                              </TableCell>
                              <TableCell
                                sx={{ color: '#212B36', fontWeight: 700, fontSize: '13px' }}
                                align="left"
                              >
                                {convertTo12Hour(get(_slot, 'end_time'))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                );
              })}
            </Stack>
          </Stack>
        )}
        {isEmpty(storesDetails) && (
          <Tooltip title="Click to add online store">
            <Stack
              className="managerStep1"
              onClick={() => handleOpenAddOnlineOrderDialog()}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                cursor: 'pointer',
                alignItems: 'center',
                border: `1.5px dotted ${theme.palette.primary.main}`,
                padding: 2,
                borderRadius: 2,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.lighter, 0.4) },
              }}
            >
              <LocalShippingIcon sx={{ fontSize: '40px' }} />
              <Typography noWrap>Create online store</Typography>
            </Stack>
          </Tooltip>
        )}
      </Stack>
    );
  };

  const storeCard = () => {
    return (
      <Grid container sx={{ pt: 0, gap: 1, overflow: 'auto', ...hideScrollbar }}>
        {map(storeList, (e) => {
          const getStoreName = (storeId) => {
            const terminals = find(actualStoreList, (e) => e.storeId === storeId);
            if (isEmpty(terminals)) return '';
            return terminals;
          };

          return (
            <Grid
              md={12}
              xs={10}
              sm={10}
              item
              onClick={() => {
                setSelectedStore(e?.storeId);
              }}
              key={e?.storeId}
              sx={{ p: 0.2, margin: 'auto' }}
            >
              <Tooltip title={`Click to select ${e?.storeName || storeName}`}>
                <Card
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 100,
                    width: '100%',
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover':
                      selectedStore === e?.storeId
                        ? {}
                        : {
                            backgroundColor: '#E9E9EB',
                            color: '#000',
                          },
                    ...(selectedStore === e?.storeId
                      ? {
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.common.white,
                        }
                      : {}),
                  }}
                >
                  <Stack flexDirection={'column'}>
                    <Typography sx={{ fontSize: '20px' }} variant="subtitle1">
                      {e?.storeName || storeName || '-'}
                    </Typography>
                  </Stack>
                </Card>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <>
      <Helmet>
        <title> Stores | POSITEASY</title>
      </Helmet>
      <Container
        className="storesStep1"
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          mt: 2,
          '&.MuiContainer-root': {
            p: 1.5,
          },
        }}
      >
        <Stack flexDirection={'row'} gap={2}>
          {!isMobile && (
            <Stack
              gap={2}
              p={2}
              pt={4}
              borderRadius={'20px'}
              sx={{
                border: 0.2,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                width: { xs: '100%', md: '32%', sm: '32%', lg: '32%' },
                height: 'calc(100vh - 8rem)',
                overflow: 'auto',
                position: 'relative',
                margin: 'auto',
              }}
            >
              {AddAndSwitchStoreContent()}
              {storeCard()}
            </Stack>
          )}
          {isMobile && isEmpty(selectedStore) && (
            <Stack
              gap={2}
              p={2}
              pt={4}
              borderRadius={'20px'}
              sx={{
                border: 0.2,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                width: { xs: '100%', md: '32%', sm: '85%', lg: '32%' },
                height: 'calc(100vh - 8rem)',
                overflow: 'auto',
                position: 'relative',
                margin: 'auto',
              }}
            >
              {AddAndSwitchStoreContent()}
              {storeCard()}
            </Stack>
          )}

          {selectedStore && <>{cardDetails()}</>}

          {openAddOnlineOrderDialog?.status && (
            <CreateOnlineStoresDialog
              openAddOnlineOrderDialog={openAddOnlineOrderDialog}
              handleClose={handleCloseAddOnlineOrderDialog}
              selectedStore={selectedStore}
              storeList={storeList}
              soundConfiguration={soundConfiguration}
              onSubmit={() => {}}
              storeName={
                find(storeList, (_list) => get(_list, 'storeId') === selectedStore)?.storeName
              }
              storeReference={
                find(storeList, (_list) => get(_list, 'storeId') === selectedStore)?.storeReference
              }
            />
          )}
        </Stack>
      </Container>
      <TakeATourWithJoy config={StoresTourConfig} />
      <SoundConfigDialog
        soundEnableDialog={soundEnableDialog}
        getStoresDetails={getStoresDetails}
        setSoundEnableDialog={setSoundEnableDialog}
        soundConfiguration={soundConfiguration}
        storesDetails={storesDetails}
      />
      <DialogComponent
        open={fdEnableOrEnableDialog}
        onClose={() => {
          setFdEnableOrEnableDialog(false);
        }}
        title="Toggle status"
      >
        <>
          <Stack flexDirection="row" alignItems="center" gap={1}>
            <Stack flexDirection="row" alignItems="center">
              <img
                src={`/assets/images/Swiggy.png`}
                style={{ width: '4rem', height: '1rem' }}
                alt=""
              />

              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={enableSwiggy}
                onChange={() => {
                  if (enableSwiggy) {
                    toggleOnlineItemWithAlertDialog(SWIGGY);
                  } else {
                    setEnableSwiggy(!enableSwiggy);
                  }
                }}
              />
            </Stack>
            <Stack flexDirection="row" alignItems="center">
              <img
                src={`/assets/images/zomato.png`}
                style={{ width: '3rem', height: '1rem' }}
                alt=""
              />
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={enableZomato}
                onChange={() => {
                  if (enableZomato) {
                    toggleOnlineItemWithAlertDialog(ZOMATO);
                  } else {
                    setEnableZomato(!enableZomato);
                  }
                }}
              />
            </Stack>
          </Stack>
          <Stack
            sx={{ ml: 'auto' }}
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
          >
            <LoadingButton
              size="medium"
              variant="contained"
              disabled={isDisableSetSwiggyOrZomatoEnable}
              onClick={() => {
                handleFoodDelivery(
                  compact([enableZomato ? ZOMATO : '', enableSwiggy ? SWIGGY : '']),
                  compact([
                    enableZomato === includes(get(storesDetails, 'activeIn'), ZOMATO) ? '' : ZOMATO,
                    enableSwiggy === includes(get(storesDetails, 'activeIn'), SWIGGY) ? '' : SWIGGY,
                  ]),
                  enableZomato || enableSwiggy
                );
              }}
              loading={isButtonLoading}
            >
              Set
            </LoadingButton>
          </Stack>
        </>
      </DialogComponent>
    </>
  );
}
