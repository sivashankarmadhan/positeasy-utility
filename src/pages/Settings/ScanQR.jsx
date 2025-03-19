import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { capitalize, filter, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  QR_LINK,
  ROLES_DATA,
  SCAN_QR_ORDER_STATUS_TYPES,
  SCAN_QR_PAYMENT_MODE,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from '../../../src/constants/SuccessConstants';
import {
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  qrCheck,
  stores,
  terminalConfigurationState,
} from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import COUNTERS_API from 'src/services/counters';
import DefaultCounterDialog from './DefaultCounterDialog';
import SettingServices from 'src/services/API/SettingServices';
import { stubFalse } from 'lodash';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import { GstData } from 'src/global/SettingsState';
import {
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Card,
  Dialog,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  OrderTypeConstants,
  PRINT_CONSTANT,
  SUMMARY_DEFAULT_PIN,
} from 'src/constants/AppConstants';
import RouterConstants from 'src/constants/RouterConstants';
import { SettingsTourPrintModeConfiguration } from 'src/constants/TourConstants';
import {
  alertDialogInformationState,
  billingState,
  currentEndDate,
  currentStartDate,
  isEstimateWithNoItemsEnableState,
  isOrderTypeEnableState,
  orderTypeConfiguration,
  printDefaultConfiguration,
} from 'src/global/recoilState';
import { PATH_DASHBOARD } from 'src/routes/paths';

import BluetoothIcon from '@mui/icons-material/Bluetooth';
import UsbIcon from '@mui/icons-material/Usb';
import ExpenseServices from 'src/services/API/ExpenseServices';
import CategoryRankingDialog from 'src/components/CategoryRankingDialog';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';
import { addTimeInCurrentDate, formatTime, formatTimeWithoutSec } from 'src/utils/formatTime';
import UpdateStaffPIN from '../Auth/UpdateStaffPIN';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import GenerateQRCode from 'src/components/GenerateQrCode';
import BillingStaffDialog from './BillingStaffDialog';
import AddEbillPrintInformation from 'src/components/AddEbillPrintInformation';
import AddScanQrInformation from 'src/components/AddScanQrInformation';
import PRODUCTS_API from 'src/services/products';
import SelectCountersList from 'src/components/SelectCountersList';
import { InfoIcon } from 'src/theme/overrides/CustomIcons';
import AddScanQrEbillPrintInformation from 'src/components/AddScanQrEbillPrintInformation';
import getTerminalsByStoreId from 'src/helper/getTerminalsByStoreId';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import LocationAddDialog from './LocationAddDialog';

function ScanQR() {
  const theme = useTheme();

  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [storesData, setStoresData] = useRecoilState(stores);
  const [isQrEnable, setIsQrEnable] = useState(false);
  const [isCustomerEnable, setIsCustomerEnable] = useState(false);
  const [isDirectEnable, setIsDirectEnable] = useState(false);
  const [scanQrDetails, setScanQrDetails] = useState({});
  const [ebillConfig, setEbillConfig] = useState({});
  console.log('scanQrDetails', scanQrDetails);
  const generalSettings = get(scanQrDetails, 'generalSettings', {});
  const ebillSettings = get(scanQrDetails, 'ebillSettings', {});
  // const generalSettings = get(configuration, 'scanQrSettings.generalSettings', {});
  const QrStatus = get(scanQrDetails, 'isActive', false);
  const isCounterEnabled = get(scanQrDetails, 'counterSettings.isActive', false) || false;
  const isLocationEnabled = get(scanQrDetails, 'locationSettings.isActive', false) || false;
  console.log('isLocationEnabled', scanQrDetails);
  const counterSettings = get(scanQrDetails, 'counterSettings', {});
  const locationSettings = get(scanQrDetails, 'locationSettings', {});
  console.log('generalSettings', generalSettings, QrStatus);
  const [currentTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);

  console.log('isQrEnable', isQrEnable);
  const isQrCodeConfig = get(scanQrDetails, 'configuration', {});
  const orderSettings = get(isQrCodeConfig, 'orderSettings', []);
  const paymentSettings = get(isQrCodeConfig, 'paymentSettings', []);

  const [openDefaultCounterDialog, setOpenDefaultCounterDialog] = useState(false);
  const [terminalConfiguration, setTerminalConfiguration] = useRecoilState(
    terminalConfigurationState
  );
  const [isQrState, setIsQrState] = useRecoilState(qrCheck);
  const isCaptainView = get(terminalConfiguration, 'isCaptainView', false);
  const isDefaultCounterEnabled = get(terminalConfiguration, 'defaultCounterConfig.isActive');
  const [selectedLocationList, setSelectedLocationList] = useState([]);

  const currentStore = useRecoilValue(currentStoreId);

  const [openInformation, setOpenInformation] = useState(false);
  const [openEbillInformation, setOpenEbillInformation] = useState(false);
  const [isBillingState, setIsBillingState] = useRecoilState(billingState);

  const customerCodeMode = get(configuration, 'customerManagement', false);

  const isEstimateMode = get(configuration, 'isEstimator', false);

  const [openQrCode, setOpenQrCode] = useState(false);
  const [isSelectCount, setIsSelectCount] = useState(false);

  const defaultOrderTypeValue = {
    value1: OrderTypeConstants.DineIn,
    value2: OrderTypeConstants.Parcel,
  };
  const isMobile = useMediaQuery('(max-width:600px)');

  const [orderTypeValue, setOrderTypeValues] = useState({});
  const [orderTypeCharges, setOrderTypeCharges] = useState({});
  const [locationDialog, setLocationDialog] = useState(false);
  const [gstData, setGstData] = useRecoilState(GstData);
  const API = import.meta.env.VITE_REMOTE_URL;
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole;

  const { merchantId } =
    JSON.parse(window.atob(AuthService._getAccessToken()?.split?.('.')?.[1])) || '';
  let QRString =
    API === QR_LINK.STAGE_POSITEASY
      ? `${QR_LINK.POSITEASY_PUBLIC_WEB}/?merchantId=${merchantId}&storeId=${currentStore}`
      : `${QR_LINK.PUBLIC_POSITEASY}/?merchantId=${merchantId}&storeId=${currentStore}`;

  const handleOpenQrCode = () => {
    setOpenQrCode(true);
  };
  const handleCloseQrCode = () => {
    setOpenQrCode(false);
  };

  const handleOpenPrintInformation = () => {
    setOpenEbillInformation(true);
  };
  const handleClosePrintInformation = () => {
    setOpenEbillInformation(false);
  };

  const handleCustomerInformationEnable = () => {
    setIsCustomerEnable(!isCustomerEnable);
    customerInformation(!isCustomerEnable);
  };

  const handleDefaultCounterDialog = () => {
    console.log('reached');
    if (isCounterEnabled) {
      handleDisableDefaultCounter();
    } else {
      handleOpenDefaultCounterDialog();
    }
  };
  const [locationEditDialog, setLocationEditDialog] = useState(false);
  const handleEditLocationClose = () => {
    setLocationEditDialog(false);
    setSelectedLocation(null);
  };

  const handleOpenScanQrInformation = () => {
    if (!isQrEnable) {
      setOpenInformation(true);
      console.log('open modal');
    } else {
      setIsQrEnable(false);
      statusInformation(!isQrEnable);
      console.log('open modal false');
    }
  };
  const handleDirectCompleteEnable = () => {
    setIsDirectEnable(!isDirectEnable);
    directComplete(!isDirectEnable);
  };
  console.log('isQrEnable', isQrEnable);
  const handleCloseScanQrInformation = () => {
    setOpenInformation(false);
  };
  const onSubmitPrintInformation = async (data, reset) => {
    console.log('data2', data);
    try {
      const options = {
        scanQrSettings: {
          isActive: true,
          configuration: isQrCodeConfig,
          ebillSettings: ebillSettings,
          locationSettings: { ...locationSettings },
          isLocationEnabled: { ...isLocationEnabled },
          counterSettings: { ...counterSettings },
          generalSettings: {
            isOrderAck: get(data, 'isOrderAck', false),
            isOrderDelivered: get(data, 'isOrderDelivered', false),
            aboutus: get(data, 'aboutus', ''),
            termsAndCondition: get(data, 'termsAndCondition', false),
            CancellationPolicy: get(data, 'CancellationPolicy', false),
            isOrderCompleted: get(data, 'isOrderCompleted', false),
            storeNumber: get(data, 'storeNumber', ''),
            isName: get(data, 'isName', true),
            isWhatsappNumber: get(data, 'isWhatsappNumber', true),
            isDeliveryAddress: get(data, 'isDeliveryAddress', false),
            isDeliveryNotes: get(data, 'isDeliveryNotes', false),
            minimumAmount: get(data, 'minimumAmount', false),
            isOrderOFD: get(data, 'isOrderOFD', false),
            isOrderPlaced: get(data, 'isOrderPlaced', true),
            isOrderRjtd: get(data, 'isOrderRjtd', false),
            isOrderReady: get(data, 'isOrderReady', false),
            storeLogo: get(data, 'storeLogo', ''),
            // isDirectComplete: get(data, 'isDirectComplete', false),
            storeName: get(data, 'storeName', ''),
          },
        },
      };

      await SettingServices.postScanQrConfiguration(options);

      const terminalList = getTerminalsByStoreId({ storeId: currentStore, storesData });
      console.log('terminalList', terminalList);
      setSelectedTerminal(get(terminalList, '0.terminalId'));
      const currentStoreAndTerminal = {
        storeId: currentStore,
        terminalId: get(terminalList, '0.terminalId'),
      };
      ObjectStorage.setItem(StorageConstants.SELECTED_STORE_AND_TERMINAL, currentStoreAndTerminal);

      initialFetch();
      if (!isQrEnable) {
        setIsQrEnable(true);
      }

      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      handleCloseScanQrInformation();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const customerInformation = async (data) => {
    try {
      const options = {
        scanQrSettings: {
          isActive: isQrEnable,
          generalSettings: { ...generalSettings, isCustomerComplete: data },
          ebillSettings: { ...ebillSettings },
          configuration: { ...isQrCodeConfig },
          counterSettings: { ...counterSettings },
        },
      };

      const response = await SettingServices.postScanQrConfiguration(options);
      initialFetch();
      if (!isQrEnable) {
        setIsQrEnable(true);
      }
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      handleCloseScanQrInformation();
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const onSubmitEbillInformation = async (data, reset) => {
    console.log('data2', data);
    try {
      const options = {
        scanQrSettings: {
          isActive: true,
          configuration: isQrCodeConfig,
          generalSettings: generalSettings,
          locationSettings: { ...locationSettings },
          isLocationEnabled: { ...isLocationEnabled },
          counterSettings: { ...counterSettings },
          ebillSettings: {
            gst: get(data, 'GST', ''),
            address: get(data, 'address', ''),
            contactNumber: get(data, 'contactNumber', ''),
            footer: get(data, 'footer', ''),
            reviewChannel: get(data, 'reviewChannel', ''),
            reviewLink: get(data, 'reviewLink', ''),
            tandc: get(data, 'tandc', ''),
            shopName: get(data, 'shopName', ''),
          },
        },
      };

      await SettingServices.postScanQrConfiguration(options);

      initialFetch();
      if (!isQrEnable) {
        setIsQrEnable(true);
      }

      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      handleClosePrintInformation();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLocationOpen = async (notDisable = true) => {
    try {
      if (!isLocationEnabled) {
        setLocationDialog(true);
      } else {
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          scanQrSettings: {
            ...scanQrDetails,
            locationSettings: {
              isActive: false,
              selectedLocations: [],
            },
          },
        };
        await SettingServices.postScanQrConfiguration(options);
        initialFetch();
      }
    } catch (e) {
      toast.error('Error in handleLocationOpen');
    }
  };

  const statusInformation = async (data) => {
    try {
      const options = {
        scanQrSettings: {
          isActive: data,
          locationSettings: { ...locationSettings },
          generalSettings: { ...generalSettings },
          ebillSettings: { ...ebillSettings },
          configuration: { ...isQrCodeConfig },
          counterSettings: { ...counterSettings },
          isLocationEnabled: { ...isLocationEnabled },
        },
      };

      console.log('options', options);
      const response = await SettingServices.postScanQrConfiguration(options);
      initialFetch();
      if (!isQrEnable) {
        setIsQrEnable(true);
      }

      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      handleCloseScanQrInformation();
    } catch (error) {
      console.error(error);
    }
  };
  console.log('isDirectEnable', isDirectEnable);
  const directComplete = async (data) => {
    try {
      const options = {
        scanQrSettings: {
          isActive: isQrEnable,
          generalSettings: { ...generalSettings, isDirectComplete: data },
          ebillSettings: { ...ebillSettings },
          configuration: { ...isQrCodeConfig },
          isLocationEnabled: { ...isLocationEnabled },
          locationSettings: { ...locationSettings },
          counterSettings: { ...counterSettings },
        },
      };

      const response = await SettingServices.postScanQrConfiguration(options);
      initialFetch();
      if (!isQrEnable) {
        setIsQrEnable(true);
      }

      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      handleCloseScanQrInformation();
    } catch (error) {
      console.error(error);
    }
  };

  const initialFetch = async () => {
    if (!currentStore && !currentTerminal) return;
    try {
      const scanQr = await SettingServices.getScanQrConfiguration();
      setScanQrDetails(scanQr?.data[0]?.scanQrSettings);
      setIsQrEnable(scanQr?.data[0]?.scanQrSettings?.isActive);
      setIsQrState(scanQr?.data[0]?.scanQrSettings?.isActive);
      setIsDirectEnable(scanQr?.data[0]?.scanQrSettings?.generalSettings?.isDirectComplete);
      setEbillConfig(scanQr?.data[0]?.scanQrSettings?.ebillSettings);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleDisableDefaultCounter = async (notDisable = true) => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,

        scanQrSettings: {
          ...scanQrDetails,

          counterSettings: {
            isActive: false,
            selectedCounters: [],
          },
        },
      };
      await SettingServices.postScanQrConfiguration(options);
      initialFetch();
    } catch (e) {
      toast.error('Failed to disable the default counter. Please try again.');
    }
  };
  const handleDefaultOpen = async (notDisable = true) => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        scanQrSettings: { ...scanQrDetails, locationSettings: { isActive: false } },
      };
      await SettingServices.postScanQrConfiguration(options);
      initialFetch();
    } catch (e) {
      toast.error('Failed to update location settings. Please try again.');
    }
  };
  const handleLocationClose = () => {
    setLocationDialog(false);
  };

  const handleOpenDefaultCounterDialog = () => {
    setOpenDefaultCounterDialog(true);
  };
  const handleCloseDefaultCounterDialog = () => {
    setOpenDefaultCounterDialog(false);
  };

  useEffect(() => {
    initialFetch();
  }, [currentStore, currentTerminal]);
  console.log('klsskljkls', get(generalSettings, 'isOrderAck'));
  const handlePostConfiguration = async (key, value) => {
    console.log('data1');
    try {
      if (!currentStore || !currentTerminal) return;

      const options = {
        scanQrSettings: {
          isActive: isQrEnable,
          locationSettings: { ...locationSettings },
          isLocationEnabled: { ...isLocationEnabled },
          generalSettings: { ...generalSettings },
          ebillSettings: { ...ebillSettings },
          counterSettings: { ...counterSettings },
          configuration: {
            ...isQrCodeConfig,
            [key]: value,
          },
        },
      };
      const response = await SettingServices.postScanQrConfiguration(options);
      initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  return (
    <Box
      sx={{
        pointerEvents: isAuthorizedRoles ? 'default' : 'none',
        // mt: 2,
      }}
    >
      <Stack flexDirection={'column'} sx={{ gap: 2, mb: 2 }}>
        <Stack
          className="settingConfigStep8"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mr={1}
          ml={1}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
              QrCode
            </Typography>

            <Typography pb={1} variant="body2">
              Add Qrcode feature to your restaurant
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              {isQrEnable && (
                <Stack flexDirection="row" gap={1} alignItems="center">
                  <Button variant="contained" onClick={handleOpenQrCode}>
                    Generate Qr
                  </Button>
                  <Tooltip title="Copy">
                    <CopyAllIcon
                      sx={{ fontSize: '20px', cursor: 'pointer' }}
                      onClick={() => {
                        navigator.clipboard.writeText(QRString);
                        toast.success(SuccessConstants.COPY_CLIPBOARD);
                      }}
                    />
                  </Tooltip>
                </Stack>
              )}
            </Typography>
          </Box>
          <Stack
            flexDirection={'column'}
            sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
          >
            <Switch
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
                // mx: 1.35,
              }}
              checked={isQrEnable}
              // onChange={handleQrCodeMode}
              onChange={handleOpenScanQrInformation}
            />
          </Stack>
        </Stack>
        <Divider />
      </Stack>

      <Stack>
        {isQrEnable && (
          <Box sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2 }}>
            <Stack mb={2} flexDirection="column">
              <Stack flexDirection={'row'} justifyContent={'space-between'} sx={{ mb: 1 }}>
                <Typography variant="h6">General Settings</Typography>
                <Button size="small" onClick={() => setOpenInformation(true)} variant="contained">
                  Add/Update
                </Button>
              </Stack>

              <Stack gap={1}>
                <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography>Shop name</Typography>
                  <Typography>{get(generalSettings, 'storeName')}</Typography>
                </Stack>
                <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography>Contact Number</Typography>
                  <Typography>{get(generalSettings, 'storeNumber')}</Typography>
                </Stack>
                <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography>Minimum order amount</Typography>
                  <Typography>₹{get(generalSettings, 'minimumAmount', '-')}</Typography>
                </Stack>
                <Stack sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2, gap: 1 }}>
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
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Order placed</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isOrderPlaced')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isOrderPlaced') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>

                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Order acknowledge</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isOrderAck')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isOrderAck') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Order Ready</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isOrderReady')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isOrderReady') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Order reject</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isOrderRjtd')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isOrderRjtd') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Order out for delivery</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isOrderOFD')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isOrderOFD') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>

                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Order completed</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isOrderCompleted')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isOrderCompleted') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2, gap: 1 }}>
                  <Stack flexDirection={'row'} alignItems={'center'}>
                    <Typography variant="subtitle1">Customer information</Typography>
                    <Tooltip
                      title="if enabled, the field will show in customer info dialogue box in scanqr app"
                      arrow
                    >
                      <IconButton>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Name</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isName')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isName') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>

                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Whatsapp number</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isWhatsappNumber')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isWhatsappNumber') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Delivery Address</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isDeliveryAddress')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isDeliveryAddress') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Delivery Notes</Typography>
                    <Typography
                      sx={{
                        ...(get(generalSettings, 'isDeliveryNotes')
                          ? {
                              color: 'green',
                              border: '1px solid green',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }
                          : {
                              color: 'red',
                              border: '1px solid red',
                              borderRadius: '12px',
                              padding: 0.5,
                              fontSize: '12px',
                            }),
                      }}
                    >
                      {get(generalSettings, 'isDeliveryNotes') ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2, gap: 1 }}>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography>Direct completed</Typography>

                    <Switch
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.light,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                          backgroundColor: theme.palette.primary.light,
                        },
                        // mx: 1.35,
                      }}
                      checked={isDirectEnable}
                      // onChange={handleQrCodeMode}
                      onChange={handleDirectCompleteEnable}
                    />
                  </Stack>
                </Stack>
                <Stack sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2, gap: 1 }}>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Stack>
                      <Typography>Customer information</Typography>
                      <Typography sx={{ fontSize: '12px' }}>
                        If enabled customer info dialogue will be shown in home page
                      </Typography>
                    </Stack>
                    <Switch
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.light,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                          backgroundColor: theme.palette.primary.light,
                        },
                      }}
                      checked={isCustomerEnable}
                      onChange={handleCustomerInformationEnable}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
            <Stack>
              <Box sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', p: 2 }}>
                <Stack mb={2} flexDirection="column">
                  <Stack flexDirection={'row'} justifyContent={'space-between'} sx={{ mb: 1 }}>
                    <Typography variant="h6">E-bill Information</Typography>
                    <Button size="small" onClick={handleOpenPrintInformation} variant="contained">
                      Add/Update
                    </Button>
                  </Stack>

                  <Stack gap={1}>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="subtitle1">Shop name</Typography>
                      <Typography>{get(ebillConfig, 'shopName') || '-'}</Typography>
                    </Stack>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="subtitle1">Address</Typography>
                      <Typography>{get(ebillConfig, 'address', '-')}</Typography>
                    </Stack>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="subtitle1">Contact Number</Typography>
                      <Typography>{get(ebillConfig, 'contactNumber', '-')}</Typography>
                    </Stack>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="subtitle1">GST</Typography>
                      <Typography>{get(ebillConfig, 'gst', '-')}</Typography>
                    </Stack>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="subtitle1">Review Link</Typography>
                      <Typography>
                        {/* <a href={reviewLink} target="_blank"> */}
                        {get(ebillConfig, 'reviewChannel', '-')}
                        {/* </a> */}
                      </Typography>
                    </Stack>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="subtitle1">Footer</Typography>
                      <Typography>{get(ebillConfig, 'footer', '-')}</Typography>
                    </Stack>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography variant="subtitle1">T & C</Typography>
                      <Typography>{get(ebillConfig, 'tandc', '-')}</Typography>
                    </Stack>
                  </Stack>
                </Stack>

                {openEbillInformation && (
                  <AddScanQrEbillPrintInformation
                    open={openEbillInformation}
                    handleClose={handleClosePrintInformation}
                    onSubmitEbillInformation={onSubmitEbillInformation}
                    // printInformationData={printInformationData}
                    ebillConfig={ebillConfig}
                  />
                )}
              </Box>
            </Stack>
            <Stack flexDirection={'column'} sx={{ gap: 4 }}>
              <Divider />
              <Stack sx={{ justifyContent: 'space-between', flexDirection: 'row', p: 1 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                    Location settings
                    {isLocationEnabled && (
                      <Button
                        sx={{ ml: 2 }}
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setLocationDialog(true);
                        }}
                      >
                        Manage Locations
                      </Button>
                    )}
                  </Typography>

                  <Typography variant="body2">Add Location feature Details</Typography>
                </Box>
                <Stack
                  flexDirection={'column'}
                  sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
                >
                  <Switch
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                    }}
                    checked={isLocationEnabled || false}
                    onChange={handleLocationOpen}
                  />
                </Stack>
              </Stack>
              <Divider />
              <Stack
                className="settingConfigStep8"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mr={1}
                ml={1}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                    Counter settings
                    {isCounterEnabled && (
                      <Button
                        sx={{ ml: 2 }}
                        size="small"
                        variant="contained"
                        onClick={handleOpenDefaultCounterDialog}
                      >
                        Manage Counters
                      </Button>
                    )}
                  </Typography>

                  <Typography variant="body2">
                    Add Qrcode feature to your selected counter
                  </Typography>
                </Box>
                <Stack
                  flexDirection={'column'}
                  sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
                >
                  <Switch
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      // mx: 1.35,
                    }}
                    checked={isCounterEnabled || false}
                    // onChange={handleQrCodeMode}
                    onChange={handleDefaultCounterDialog}
                  />
                </Stack>
              </Stack>
              {locationDialog && (
                <LocationAddDialog
                  scanQrDetails={scanQrDetails}
                  initialFetch={initialFetch}
                  locationSettings={locationSettings}
                  locationDialog={locationDialog}
                  handleLocationClose={handleLocationClose}
                />
              )}
              <Divider />
              {isQrEnable && (
                <Box>
                  <Grid container rowGap={4}>
                    <Grid item xs={12} sm={7}>
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mr: {
                            md: 5,
                            xs: 0,
                          },
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
                            Order Settings
                          </Typography>
                          <FormGroup
                            sx={{
                              position: 'flex',
                              flexDirection: 'row',
                            }}
                          >
                            {map(SCAN_QR_ORDER_STATUS_TYPES, (_order, _index) => {
                              return (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      disabled={
                                        _order === SCAN_QR_ORDER_STATUS_TYPES.ORDER_PLACED ||
                                        _order === SCAN_QR_ORDER_STATUS_TYPES.DELIVERED
                                      }
                                      defaultChecked={false}
                                      checked={
                                        _order === SCAN_QR_ORDER_STATUS_TYPES.ORDER_PLACED ||
                                        orderSettings.includes(_order)
                                      }
                                      onChange={(event) => {
                                        let payload = [];

                                        if (event.target.checked) {
                                          payload = [...orderSettings, _order];
                                        } else {
                                          payload = filter(orderSettings, (_item) => {
                                            return _order !== _item;
                                          });
                                        }

                                        handlePostConfiguration('orderSettings', payload);
                                      }}
                                      name={_order}
                                    />
                                  }
                                  label={
                                    (_order === SCAN_QR_ORDER_STATUS_TYPES.ORDER_PLACED &&
                                      'Order placed') ||
                                    (_order === SCAN_QR_ORDER_STATUS_TYPES.READY_TO_SERVE &&
                                      'Ready to serve') ||
                                    (_order === SCAN_QR_ORDER_STATUS_TYPES.OUT_FOR_DELIVERY &&
                                      'Out for delivery') ||
                                    capitalize(_order)
                                  }
                                />
                              );
                            })}
                          </FormGroup>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Stack
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mr: {
                            md: 5,
                            xs: 0,
                          },
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
                            Payment settings
                          </Typography>
                          <FormGroup
                            sx={{
                              position: 'flex',
                              flexDirection: 'row',
                            }}
                          >
                            {map(SCAN_QR_PAYMENT_MODE, (_mode) => {
                              return (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      defaultChecked={false}
                                      checked={paymentSettings.includes(_mode)}
                                      disabled={_mode === 'CARD'}
                                      onChange={(event) => {
                                        let payload = [];

                                        if (event.target.checked) {
                                          payload = [...paymentSettings, _mode];
                                        } else {
                                          payload = filter(paymentSettings, (_item) => {
                                            return _mode !== _item;
                                          });
                                        }
                                        if (!isEmpty(payload)) {
                                          handlePostConfiguration('paymentSettings', payload);
                                        } else {
                                          toast.error('Select atleast one payment mode');
                                        }
                                      }}
                                      name={_mode}
                                    />
                                  }
                                  label={
                                    SCAN_QR_PAYMENT_MODE.UPI === _mode ? _mode : capitalize(_mode)
                                  }
                                />
                              );
                            })}
                          </FormGroup>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
              {/* <Divider /> */}
            </Stack>
          </Box>
        )}
      </Stack>

      {openInformation && (
        <AddScanQrInformation
          open={openInformation}
          scanQRSettingsData={generalSettings}
          handleClose={handleCloseScanQrInformation}
          onSubmitPrintInformation={onSubmitPrintInformation}
        />
      )}
      {openDefaultCounterDialog && (
        <SelectCountersList
          open={openDefaultCounterDialog}
          handleClose={handleCloseDefaultCounterDialog}
          initialFetch={initialFetch}
          scanQrDetails={scanQrDetails}
        />
      )}

      {openQrCode && <GenerateQRCode open={openQrCode} handleClose={handleCloseQrCode} />}
    </Box>
  );
}

export default ScanQR;
