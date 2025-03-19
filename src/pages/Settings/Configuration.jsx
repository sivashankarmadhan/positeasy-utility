import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
  Card,
  Dialog,
  Checkbox,
} from '@mui/material';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import {
  OrderTypeConstants,
  PRINT_CONSTANT,
  ROLES_DATA,
  SUMMARY_DEFAULT_PIN,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RouterConstants from 'src/constants/RouterConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { SettingsTourPrintModeConfiguration } from 'src/constants/TourConstants';
import { GstData } from 'src/global/SettingsState';
import {
  alertDialogInformationState,
  allConfiguration,
  billingState,
  currentEndDate,
  currentStartDate,
  currentStoreId,
  currentTerminalId,
  isEstimateWithNoItemsEnableState,
  isOrderTypeEnableState,
  orderTypeConfiguration,
  printDefaultConfiguration,
  stores,
} from 'src/global/recoilState';
import ObjectStorage from 'src/modules/ObjectStorage';
import { PATH_DASHBOARD } from 'src/routes/paths';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import { StorageConstants } from 'src/constants/StorageConstants';
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
import getTerminalsByStoreId from 'src/helper/getTerminalsByStoreId';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import OrderTypeDialog from './OrderTypeDialog';

export default function Configuration() {
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);

  const [currentTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [isBillingState, setIsBillingState] = useRecoilState(billingState);
  const customCodeMode = get(configuration, 'customCode', false);
  const customerCodeMode = get(configuration, 'customerManagement', false);
  const printMode = get(configuration, 'savePrint', true);
  const isAddInfoMode = get(configuration, 'billingSettings.isBookingInfo', false);
  const addOnMandatoryMode = get(configuration, 'isAddonPop', false);
  const isEstimateMode = get(configuration, 'isEstimator', false);
  const staffPermissions = get(configuration, 'staffPermissions', {});
  const staffSettings = get(configuration, 'staffSettings', {});
  const isReverseStock = get(configuration, 'isReverseStock', false);
  const [openSummaryPIN, setOpenSummaryPIN] = useState(false);
  const [orderBillStatus, setOrderBillStatus] = useState(false);
  const [openQrCode, setOpenQrCode] = useState(false);
  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);
  const featureSettings = get(configuration, 'featureSettings', {});
  const isTable = get(featureSettings, 'isTable', false);
  const isShowBillng = get(featureSettings, 'isShowBillng', false);
  const isQrCode = get(featureSettings, 'isQrCode', false);
  const isMRP = get(featureSettings, 'isMRP', false);
  const isProfitLossMode = get(featureSettings, 'isPLRatio', false);
  const isFastBilling = get(featureSettings, 'isFastBilling', false);
  const isEbillingEnabled = get(featureSettings, 'isEbillingEnabled', false);
  const isCaptainView = get(featureSettings, 'isCaptainView', false);
  const isTimeQuery = get(featureSettings, 'isTimeQuery', false);
  const printType = get(configuration, 'printType', PRINT_CONSTANT.POS);
  const printerInfo = get(configuration, 'printInfo.paperSize', PRINT_CONSTANT.POS_USB_58MM);
  const [categoryList, setCategoryList] = useState([]);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const defaultOrderTypeValue = {
    value1: OrderTypeConstants.DineIn,
    value2: OrderTypeConstants.Parcel,
  };
  const [orderTypeValue, setOrderTypeValues] = useState({});
  const [orderTypeCharges, setOrderTypeCharges] = useState({});

  const [isSaveOrderType, setIsSaveOrderType] = useState(false);

  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const isCategoryRankingEnabled = get(configuration, 'categoryRanking.isActive', false);
  const [openCategoryRanking, setOpenCategoryRanking] = useState(false);
  const [openOrderType, setOpenOrderType] = useState(false);
  const [isEstimateWithNoItemsEnable, setIsEstimateWithNoItemsEnable] = useRecoilState(
    isEstimateWithNoItemsEnableState
  );
  const [openViewMode, setOpenViewMode] = useState(false);
  const isDailyOrderReset = get(configuration, 'orderReset.isDailyOrderReset', false);
  const resetTime = get(configuration, 'orderReset.resetTime', '');
  const billingSettingsData = get(configuration, 'billingSettings', {});
  const [enteredResetTime, setEnteredResetTime] = useState(null);
  const [openBillingStaffDialog, setOpenBillingStaffDialog] = useState(false);

  const setStartDate = useSetRecoilState(currentStartDate);
  const setEndDate = useSetRecoilState(currentEndDate);

  const navigate = useNavigate();
  const [gstData, setGstData] = useRecoilState(GstData);
  const [isEditOrderText, setIsEditOrderText] = useState(false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole;
  const isDisabledOrderTypeButton =
    orderTypeValue.value1 === get(configuration, 'isOrderType.orderTypes.value1') &&
    orderTypeCharges[orderTypeValue.value1] ===
      get(configuration, `isOrderType.charges[${orderTypeValue.value1}]`) &&
    orderTypeValue.value2 === get(configuration, 'isOrderType.orderTypes.value2') &&
    orderTypeCharges[orderTypeValue.value2] ===
      get(configuration, `isOrderType.charges[${orderTypeValue.value2}]`) &&
    isSaveOrderType === get(configuration, `isOrderType.isSaveOrderType`, false);

  const isDisabledOrderTypeButtonValue1 = orderTypeValue.value1 ? false : true;
  const isDisabledOrderTypeButtonValue2 = orderTypeValue.value2 ? false : true;
  const isBillingStaffEnabled = get(staffSettings, 'isEnabledShiftLogin', false);
  const [punchOutChecked, setPunchOutChecked] = useState(false);

  const [storesData, setStoresData] = useRecoilState(stores);

  const handleOpenSummaryPIN = () => {
    setOpenSummaryPIN(true);
  };
  const handleCloseSummaryPIN = () => {
    setOpenSummaryPIN(false);
  };
  const handleOpenQrCode = () => {
    setOpenQrCode(true);
  };
  const handleCloseQrCode = () => {
    setOpenQrCode(false);
  };

  const handleOpenViewMode = () => {
    setOpenViewMode(true);
  };
  const handleCloseViewMode = (e) => {
    if (e === 'edit') {
      setOpenViewMode(false);
      setOpenCategoryRanking(true);
    } else {
      setOpenViewMode(false);
    }
  };

  const handleDisableBillingStaff = async () => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        staffSettings: {
          isEnabledShiftLogin: false,
          staffs: [],
        },
      };
      await SettingServices.postConfiguration(options);
      initialFetch(true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpenBillingStaffDialog = () => {
    setOpenBillingStaffDialog(true);
  };
  const handleCloseBillingStaffDialog = () => {
    setOpenBillingStaffDialog(false);
  };
  const handleBillingStaff = () => {
    if (isBillingStaffEnabled) {
      handleDisableBillingStaff();
    } else {
      handleOpenBillingStaffDialog();
    }
  };
  const handleCloseCategoryRankingDialog = () => {
    setOpenCategoryRanking(false);
    initialFetch();
  };

  const handleSwitchCategoryRanking = async () => {
    try {
      if (!isCategoryRankingEnabled) {
        setOpenCategoryRanking(true);
      } else {
        const options = {
          categoryRanking: {
            isActive: !isCategoryRankingEnabled,
          },
        };
        await SettingServices.postConfiguration(options);
        await initialFetch();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleCloseOrderTypeDialog = () => {
    setOpenOrderType(false);
    initialFetch();
  };
  const handleOpenOrderTypeDialog = () => {
    setOpenOrderType(true);
  };

  const handleSwitchOrderType = async () => {
    try {
      if (!isOrderTypeEnable) {
        setOpenOrderType(true);
      } else {
        const options = {
          isOrderType: {
            isActive: !isOrderTypeEnable,
          },
        };
        await SettingServices.postConfiguration(options);
        await initialFetch();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handlePostCustomerCodeMode = async (isAutoEnabled) => {
    if (customerCodeMode && isAutoEnabled) return;
    try {
      const options = {
        customerManagement: !customerCodeMode,
      };
      await SettingServices.postConfiguration(options);
      if (isEstimateMode) {
        handlePostConfiguration(
          {
            isEstimator: false,
          },
          true
        );
      }
      await initialFetch(true);
      if (!isAutoEnabled) {
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }
    } catch {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handleEditOrderText = () => {
    if (isEditOrderText) {
      setOrderTypeValues(orderTypeValue);
      setOrderTypeCharges(orderTypeCharges);
    }
    setIsEditOrderText(!isEditOrderText);
  };
  const handleOrderTypeConfiguration = () => {
    handlePostOrderType(true, orderTypeValue);
    setIsEditOrderText(!isEditOrderText);
  };
  const handleChangeOrderType = (e) => {
    setOrderTypeValues((prev) => {
      return { ...prev, [`${e.target.name}`]: e.target.value };
    });
  };
  const handleChangeOrderTypeCharges = (e) => {
    setOrderTypeCharges((prev) => {
      return { ...prev, [`${e.target.name}`]: Number(e.target.value) * 100 };
    });
  };

  const handleCustomerCodeMode = (event, isAutoEnabled) => {
    handlePostCustomerCodeMode(isAutoEnabled);
  };
  const handleProfitLossMode = () => {
    const options = {
      featureSettings: {
        ...featureSettings,
        isPLRatio: !isProfitLossMode,
      },
    };
    handlePostConfiguration(options);
  };

  const handleAddonMandatoryMode = () => {
    const options = {
      isAddonPop: !addOnMandatoryMode,
    };
    handlePostConfiguration(options);
  };
  const handleStockResetMode = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowStockReset: !get(staffPermissions, 'isAllowStockReset'),
      },
    };
    handlePostConfiguration(options);
  };

  const handleStockReduceMode = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowStockReduce: !get(staffPermissions, 'isAllowStockReduce'),
      },
    };
    handlePostConfiguration(options);
  };

  const handleEditResetMode = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowEdit: !get(staffPermissions, 'isAllowEdit'),
      },
    };
    handlePostConfiguration(options);
  };

  const handleDeleteResetMode = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowDelete: !get(staffPermissions, 'isAllowDelete'),
      },
    };
    handlePostConfiguration(options);
  };

  const handleStaffViewAllOrders = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowStaffViewAllOrders: !get(staffPermissions, 'isAllowStaffViewAllOrders'),
      },
    };
    handlePostConfiguration(options);
  };

  const handleEditViewAllOrders = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowEditViewAllOrders: !get(staffPermissions, 'isAllowEditViewAllOrders'),
      },
    };
    handlePostConfiguration(options);
  };

  const handleStaffViewOtherTermimalOrders = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isStaffViewOtherTerminal: !get(staffPermissions, 'isStaffViewOtherTerminal'),
      },
    };
    handlePostConfiguration(options);
  };

  const handleChangeStaffSummaryPIN = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isStaffViewSummary: {
          isActive: !get(staffPermissions, 'isStaffViewSummary.isActive'),
          PIN: get(staffPermissions, 'isStaffViewSummary.PIN') || SUMMARY_DEFAULT_PIN,
        },
      },
    };
    handlePostConfiguration(options);
  };

  // const handleChangeQrCode = () => {
  //   const options = {
  //     staffPermissions: {
  //       ...staffPermissions,
  //       isQrCode: {
  //         isActive: !get(staffPermissions, 'isQrCode.isActive'),
  //       },
  //     },
  //   };
  //   handlePostConfiguration(options);
  // };

  const handleSetStaffSummaryPIN = (PIN) => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isStaffViewSummary: { isActive: true, PIN },
      },
    };
    handlePostConfiguration(options);
  };

  const handleReverseStockMode = async () => {
    const apiCall = isReverseStock
      ? SettingServices.turnOffReverseStock
      : SettingServices.turnOnReverseStock;
    try {
      await apiCall();
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCountersMode = () => {
    const options = {
      counterSettings: {
        isCountersEnabled: !isCountersEnabled,
      },
    };
    handlePostConfiguration(options);
  };

  const handleTableMode = () => {
    const options = {
      featureSettings: {
        ...featureSettings,
        isTable: !isTable,
      },
    };
    handlePostConfiguration(options);
  };
  const handleHideBillingMode = () => {
    const options = {
      featureSettings: {
        ...featureSettings,
        isShowBillng: !isShowBillng,
      },
    };
    handlePostConfiguration(options);
  };
  const handleQrCodeMode = async () => {
    try {
      const options = {
        featureSettings: {
          ...featureSettings,
          isQrCode: !isQrCode,
        },
      };
      await handlePostConfiguration(options);

      if (isQrCode) {
        const terminalList = getTerminalsByStoreId({ storeId: currentStore, storesData });
        setSelectedTerminal(get(terminalList, '0.terminalId'));
        const currentStoreAndTerminal = {
          storeId: currentStore,
          terminalId: get(terminalList, '0.terminalId'),
        };
        ObjectStorage.setItem(
          StorageConstants.SELECTED_STORE_AND_TERMINAL,
          currentStoreAndTerminal
        );
      }
    } catch (err) {
      console.log('err', err);
    }
  };
  const handleMRPMode = () => {
    const options = {
      featureSettings: {
        ...featureSettings,
        isMRP: !isMRP,
      },
    };
    handlePostConfiguration(options);
  };

  const handleBillingMode = () => {
    const options = {
      featureSettings: {
        ...featureSettings,
        isFastBilling: !isFastBilling,
      },
    };
    handlePostConfiguration(options);
  };

  const handleCaptainBilling = () => {
    const options = {
      featureSettings: {
        ...featureSettings,
        isCaptainView: !isCaptainView,
      },
    };
    handlePostConfiguration(options);
  };
  const handleEbillingMode = () => {
    setIsBillingState(!isBillingState);
    const options = {
      featureSettings: {
        ...featureSettings,
        isEbillingEnabled: !isEbillingEnabled,
      },
    };
    handlePostConfiguration(options);
  };
  const handleTimeQueryMode = async () => {
    const options = {
      featureSettings: {
        ...featureSettings,
        isTimeQuery: !isTimeQuery,
      },
    };
    await handlePostConfiguration(options);

    if (!isTimeQuery) {
      const todayStartDate = new Date(new Date().setHours(0, 0, 0));
      const todayEndDate = new Date(new Date().setHours(23, 59, 59));
      ObjectStorage.setItem(StorageConstants.SELECTED_DATES, {
        startDate: todayStartDate,
        endDate: todayEndDate,
      });
      setStartDate(todayStartDate);
      setEndDate(todayEndDate);
    } else {
      ObjectStorage.setItem(StorageConstants.SELECTED_DATES, {
        startDate: new Date(),
        endDate: new Date(),
      });
      setStartDate(new Date());
      setEndDate(new Date());
    }
  };
  const handleAddInfoMode = () => {
    const options = {
      isBookingInfo: !isAddInfoMode,
    };
    handlePostConfiguration(options);
  };
  const handleEstimateMode = () => {
    const options = {
      isEstimator: !isEstimateMode,
    };
    handlePostConfiguration(options);
    handleCustomerCodeMode(null, true);
  };

  const handlePostConfiguration = async (options, isAutoEnabled) => {
    try {
      await SettingServices.postConfiguration(options);
      await initialFetch();
      if (!isAutoEnabled) {
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handlePostEBill = async () => {
    try {
      setIsBillingState(!isBillingState);
      const options = {
        storeId: configuration?.storeId,
        orderBill: !isBillingState,
      };
      await SettingServices.postEbillConfiguration(options);
      await getEbilling();
      // if (!isAutoEnabled) {
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      // }
    } catch (err) {
      console.log(err);
    }
  };
  const getEbilling = async () => {
    try {
      // setIsBillingState(!isBillingState)
      // const options = {
      //   storeId: configuration?.storeId,
      //   orderBill: isBillingState
      // }
      const res = await SettingServices.getEbillConfiguration(configuration?.storeId);
      console.log('res', res);
      setIsBillingState(res?.data?.isOrderBill);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getEbilling();
  }, []);

  const handlePostOrderType = async (isType) => {
    try {
      const options = {
        isOrderType: isType
          ? {
              isActive: isOrderTypeEnable,
              orderTypes: orderTypeValue,
              charges: orderTypeCharges,
              isSaveOrderType: isSaveOrderType,
            }
          : {
              isActive: !isOrderTypeEnable,
              ...(isOrderTypeEnable
                ? {}
                : { orderTypes: orderTypeValue, charges: orderTypeCharges }),
            },
      };
      await SettingServices.postConfiguration(options);

      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const initialFetch = async (isRefresh = false) => {
    if (!currentStore && !currentTerminal) return;
    try {
      const resp = await SettingServices.getConfiguration();
      if (resp) {
        setConfiguration({
          ...(configuration || {}),
          ...(get(resp, 'data.0') || {}),
        });
        ObjectStorage.setItem(StorageConstants.ORDER_RESET_TIME, {
          data: get(resp, 'data.0.orderReset.resetTime', '00:00'),
        });
        setGstData({
          gstNumber: get(resp, 'data.0.gstNumber'),
          gstPercent: get(resp, 'data.0.gstPercent'),
          gstEnabled: get(resp, 'data.0.gstEnabled'),
        });
        setOrderTypeValues(get(resp, 'data.0.isOrderType.orderTypes', defaultOrderTypeValue));
        setOrderTypeCharges(get(resp, 'data.0.isOrderType.charges', {}));
        setIsSaveOrderType(get(resp, 'data.0.isOrderType.isSaveOrderType', false));
      }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    initialFetch(true);
  }, [currentTerminal, currentStore]);

  const handlePostResetOrder = async (orderReset) => {
    try {
      const options = {
        orderReset,
      };
      await SettingServices.postConfiguration(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePostBillingOptionsMode = async (e) => {
    try {
      const options = {
        billingSettings: {
          ...billingSettingsData,
          [e.target.name]: !get(billingSettingsData, `${e.target.name}`, false),
        },
      };
      await SettingServices.postConfiguration(options);
      await initialFetch(true);
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    setEnteredResetTime(addTimeInCurrentDate(resetTime));
  }, [configuration]);

  const handleReverseStockModeWithAlert = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Stock monitor will be disabled. Are you sure You want to continue ?`,
      actions: {
        primary: {
          text: 'Confirm',
          onClick: async (onClose) => {
            handleReverseStockMode();
            onClose();
          },
          sx: {
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
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

  const handleDeleteAndEditResetMode = () => {
    const options = {
      staffPermissions: {
        ...staffPermissions,
        isAllowEditAndDelete: !get(staffPermissions, 'isAllowEditAndDelete'),
      },
    };
    handlePostConfiguration(options);
  };

  return (
    <Box
      sx={{
        pointerEvents: isAuthorizedRoles ? 'default' : 'none',
        // mt: 2,
        // maxHeight: 'calc(100vh-220px)',
      }}
    >
      <Grid
        container
        flexDirection={'column'}
        // sx={{ border: '1px solid #DEDEDE', borderRadius: '12px', gap: 2, p: 2 }}
      >
        {/* <Box>
          <Stack
            className="settingConfigStep1"
            mb={2}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6">Print mode</Typography>
              <Typography variant="body2">Print your billing receipt everytime.</Typography>
            </Box>
            <Stack
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                  mx: 1.35,
                  justifySelf: 'flex-end',
                }}
                size="large"
                checked={printMode}
                onChange={handleChangePrintMode}
              />
            </Stack>
          </Stack>

          <Divider />
        </Box> */}

        {/* <Box>
          <Stack
            className="settingConfigStep4"
            mb={2}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6">Add-on pop</Typography>
              <Typography variant="body2">
                Customize your add-on pop-up style with either on-screen pop-up or cart view.
              </Typography>
              <Typography variant="body2">Default: cart view</Typography>
            </Box>
            <Switch
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
                mx: 1.35,
              }}
              checked={addOnMandatoryMode}
              onChange={handleAddonMandatoryMode}
            />
          </Stack>
          <Divider />
        </Box> */}

        {/* TODO: we will uncomment in future */}
        {/* <Box>
          <Stack
            className="settingConfigStep5"
            mb={2}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6">Estimator</Typography>
              <Typography variant="body2">
                Create estimates for your products before billing them .
              </Typography>
            </Box>
            <Switch
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
                mx: 1.35,
              }}
              checked={isEstimateMode}
              onChange={handleEstimateMode}
            />
          </Stack>
          <Divider />
        </Box> */}

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Billing options
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show additional Discount
                </Typography>
                <Switch
                  name="additionalDiscount"
                  checked={get(billingSettingsData, 'additionalDiscount', false)}
                  onChange={handlePostBillingOptionsMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable to show additional discount option in your billing cart
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show delivery charges
                </Typography>
                <Switch
                  name="deliveryCharges"
                  checked={get(billingSettingsData, 'deliveryCharges', false)}
                  onChange={handlePostBillingOptionsMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable to show delivery charges option in your billing cart
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show additional charges
                </Typography>
                <Switch
                  name="additionalCharges"
                  checked={get(billingSettingsData, 'additionalCharges', false)}
                  onChange={handlePostBillingOptionsMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable to show additional charges option in your billing cart
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show packing charges{' '}
                </Typography>
                <Switch
                  name="packingCharges"
                  checked={get(billingSettingsData, 'packingCharges', false)}
                  onChange={handlePostBillingOptionsMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable to show packing charges option in your billing cart
              </Typography>
            </Grid>

            {/* TODO: we will enable in future */}
            {/* <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Show custom order date</Typography>
                <Switch
                  name="isAllowOrderDateChange"
                  checked={get(billingSettingsData, 'isAllowOrderDateChange', false)}
                  onChange={handlePostBillingOptionsMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
              Enable to accept custom order date option in your billing cart
              </Typography>
            </Grid> */}

            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Billing info</Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  name="isBookingInfo"
                  checked={get(billingSettingsData, 'isBookingInfo', false)}
                  onChange={handlePostBillingOptionsMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable additional information option to your billing
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show custom delivery date
                </Typography>
                <Switch
                  name="isAllowDeliveryDateChange"
                  checked={get(billingSettingsData, 'isAllowDeliveryDateChange', false)}
                  onChange={handlePostBillingOptionsMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable to accept custom delivery date option in your billing cart
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ my: 2 }}>
            Style options
          </Typography>
          <Grid container gap={2}>
            {/* <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Stack
                sx={{
                  width: '100%',
                  position: 'relative',
                  right: '5px',
                  left: 0,
                  bottom: '16px',
                  alignItems: 'flex-end',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    backgroundColor: '#00B8D9',
                    width: '80%',
                    px: 2,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  Default: cart view
                </Typography>
              </Stack>

              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Add-on pop
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={addOnMandatoryMode}
                  onChange={handleAddonMandatoryMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Style your add-ons pop-up with either on-screen/cart view
              </Typography>
            </Grid> */}

            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack
                  flexDirection={'row'}
                  alignItems="center"
                  width={'100%'}
                  justifyContent={'space-between'}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                    Category ranking
                  </Typography>
                  {isCategoryRankingEnabled && (
                    <Button
                      sx={{ ml: 2 }}
                      size="small"
                      variant="outlined"
                      onClick={handleOpenViewMode}
                    >
                      View
                    </Button>
                  )}
                  <Switch
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                    checked={isCategoryRankingEnabled}
                    onChange={handleSwitchCategoryRanking}
                  />
                </Stack>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Sort your categories in staff billing app by specified ranking.
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Stack
                sx={{
                  width: '100%',
                  position: 'relative',
                  right: '5px',
                  left: 0,
                  bottom: '16px',
                  alignItems: 'flex-end',
                }}
              >
                {/* <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    backgroundColor: '#00B8D9',
                    width: '80%',
                    px: 2,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  Default: Dine-in and Parcel
                </Typography> */}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                    Order type
                    {isOrderTypeEnable && (
                      <Button
                        sx={{ ml: 2 }}
                        onClick={handleOpenOrderTypeDialog}
                        variant="outlined"
                        size="small"
                      >
                        View
                      </Button>
                    )}
                  </Typography>
                </Box>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isOrderTypeEnable}
                  onChange={handleSwitchOrderType}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Create your own order types to differentiate your orders. Enable save order type to
                persist order type across orders
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ my: 2, gap: 2 }}>
            Permissions
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                  Allow stock reset
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isAllowStockReset')}
                  onChange={handleStockResetMode}
                />
              </Box>
              <Typography variant="body2">
                Enable to allow reset stock count to zero/moves entirely to wastage count
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Allow stock reduce
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isAllowStockReduce')}
                  onChange={handleStockReduceMode}
                />
              </Box>
              <Typography variant="body2">
                Enable to allow manual reduction of stock /moves to wastage count
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Allow reverse stock
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isReverseStock}
                  onChange={() => {
                    if (!isReverseStock) {
                      handleReverseStockModeWithAlert();
                    } else {
                      handleReverseStockMode();
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable to allow the stock counter to go negative without selling out of product
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Order edit
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isAllowEdit')}
                  onChange={handleEditResetMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will allow staff to edit orders
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Order delete
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isAllowDelete')}
                  onChange={handleDeleteResetMode}
                />
              </Box>
              <Typography variant="body2">Enabling will allow staff to delete orders</Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Stack
                sx={{
                  width: '100%',
                  position: 'relative',
                  right: '5px',
                  left: 0,
                  bottom: '16px',
                  alignItems: 'flex-end',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    backgroundColor: '#00B8D9',
                    width: '80%',
                    px: 2,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  Default : Last 30 orders
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                  Show all orders
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isAllowStaffViewAllOrders')}
                  onChange={handleStaffViewAllOrders}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will allow staff to search through all the orders happened
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show store orders
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isStaffViewOtherTerminal')}
                  onChange={handleStaffViewOtherTermimalOrders}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will allow staff to view all the orders happening across terminals in the
                store
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Order product edit
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isAllowEditViewAllOrders')}
                  onChange={handleEditViewAllOrders}
                />
              </Box>
              <Typography variant="body2">
                Enabling will allow staff to edit product price while billing
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Summary report
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={get(staffPermissions, 'isStaffViewSummary.isActive')}
                  onChange={handleChangeStaffSummaryPIN}
                />
              </Box>
              <Typography variant="body2">
                Enabling will show reports in staff app, we can add PIN to secure the report
                additionally
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                Default : {SUMMARY_DEFAULT_PIN}{' '}
                {get(staffPermissions, 'isStaffViewSummary.isActive') && (
                  <Button onClick={handleOpenSummaryPIN}>Update PIN</Button>
                )}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Stack
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // mr: {
                  //   md: 5,
                  //   xs: 0,
                  // },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '15px' }}>
                    Billing Staff{' '}
                    {isBillingStaffEnabled && (
                      <Button
                        sx={{ ml: 2 }}
                        onClick={handleOpenBillingStaffDialog}
                        variant="outlined"
                        size="small"
                      >
                        View
                      </Button>
                    )}
                  </Typography>
                </Box>
                <Switch
                  name="defaultCounterConfig"
                  checked={isBillingStaffEnabled}
                  onChange={handleBillingStaff}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                />
              </Stack>
              <Typography variant="body2">
                Enable and setup the cashiers with their access PIN for the staff billing app.{' '}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box mb={-10}>
          <Typography variant="h6" sx={{ my: 2, gap: 2 }}>
            Tax options
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  IGST
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  name="isIGST"
                  checked={get(billingSettingsData, 'isIGST', false)}
                  onChange={handlePostBillingOptionsMode}
                />
              </Box>
              <Typography variant="body2">
                Enable to show IGST option in your billing cart
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ my: 2 }}>
            More features
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Profit & loss
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isProfitLossMode}
                  onChange={handleProfitLossMode}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <FilterPopOver
                  IconStyle={{
                    mt: 0.5,
                    pb: 0.1,
                    width: 25,
                    height: 25,
                    '& .css-1rhksjl-MuiSvgIcon-root': {
                      pb: 0.4,
                      fontSize: '20px',
                    },
                  }}
                  IconChildren={
                    <InfoOutlinedIcon
                      sx={{
                        cursor: 'pointer',
                        fontSize: '18px',
                        // mt: 0.5,
                      }}
                    />
                  }
                  sx={{ overflow: 'hidden', width: '350px' }}
                >
                  <Typography sx={{ pt: 1, pl: 1 }}>
                    {' '}
                    Base price to be added to each product
                  </Typography>
                </FilterPopOver>

                <Typography variant="body2" sx={{ fontWeight: '300' }}>
                  Enabling will ask for base price and calculates profit and loss report for product
                </Typography>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Order reset
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isDailyOrderReset}
                  onChange={() => {
                    handlePostResetOrder({
                      resetTime: !isDailyOrderReset
                        ? formatTimeWithoutSec(enteredResetTime)
                        : '00:00',
                      isDailyOrderReset: !isDailyOrderReset,
                    });
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Allow resetting your order ID on your desired time
              </Typography>
              <Typography variant="body2">Default: 12:00 AM</Typography>

              {isDailyOrderReset && (
                <Stack gap={1} sx={{ flexDirection: { xs: 'column', sm: 'row' }, ml: 1 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer
                      components={['MobileTimePicker', 'MobileTimePicker', 'MobileTimePicker']}
                    >
                      <TimePicker
                        value={enteredResetTime}
                        onAccept={(newValue) => {
                          setEnteredResetTime(newValue);
                          handlePostResetOrder({
                            resetTime: formatTimeWithoutSec(newValue),
                            isDailyOrderReset,
                          });
                        }}
                        sx={{ width: 150 }}
                        views={['hours']}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Stack>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Counters
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isCountersEnabled}
                  onChange={handleCountersMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will show option to split your products across counters{' '}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Search with Time
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isTimeQuery}
                  onChange={handleTimeQueryMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will show option to search report with time along with date{' '}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Tables
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isTable}
                  onChange={handleTableMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will let you to manage table orders in your store
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Department store mode
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isFastBilling}
                  onChange={handleBillingMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will remove the product view and show only search bar, scanning via scanner
                will add the products to list
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  MRP
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isMRP}
                  onChange={handleMRPMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling will let you to add MRP in product attributes and printed bills{' '}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show billing
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isShowBillng}
                  onChange={handleHideBillingMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enable to show billing will allow users to generate bills.
              </Typography>
            </Grid>

            {/* <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Fast billing
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isFastBilling}
                  onChange={handleBillingMode}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Suitable for departmental store view{' '}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  QrCode
                </Typography>
                <Switch
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 1.35,
                  }}
                  checked={isQrCode}
                  onChange={handleQrCodeMode}
                />
              </Box>
              <Typography variant="body2">Add Qrcode feature to your restaurant</Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                {isQrCode && (
                  <Button variant="contained" sx={{ mt: 1 }} onClick={handleOpenQrCode}>
                    <QrCodeScannerIcon />
                    <Box sx={{ ml: 1 }}>View QrCode</Box>
                  </Button>
                )}
              </Typography>
            </Grid> */}
          </Grid>
        </Box>
        {/* <Divider /> */}
      </Grid>
      <Dialog open={openSummaryPIN}>
        <Card sx={{ width: { xs: 340, sm: 400 }, p: 3 }}>
          <Typography variant="h6">Add/Update PIN for Print Summary </Typography>
          <UpdateStaffPIN
            previous={get(staffPermissions, 'isStaffViewSummary.PIN') || SUMMARY_DEFAULT_PIN}
            handleSetStaffSummaryPIN={handleSetStaffSummaryPIN}
            handleClose={handleCloseSummaryPIN}
          />
        </Card>
      </Dialog>
      {/* <Card sx={{ width: { xs: 340, sm: 400 }, p: 3 }}>
        <GenerateQRCode open={openQrCode} handleClose={handleCloseQrCode} />
      </Card> */}
      {openBillingStaffDialog && (
        <BillingStaffDialog
          open={openBillingStaffDialog}
          handleClose={handleCloseBillingStaffDialog}
          initialFetch={initialFetch}
        />
      )}
      <CategoryRankingDialog
        viewMode={openViewMode}
        handleCloseView={handleCloseViewMode}
        open={openCategoryRanking}
        handleClose={handleCloseCategoryRankingDialog}
      />
      {openOrderType && (
        <OrderTypeDialog
          initialFetch={initialFetch}
          open={openOrderType}
          handleClose={handleCloseOrderTypeDialog}
        />
      )}
      <TakeATourWithJoy config={SettingsTourPrintModeConfiguration} />
    </Box>
  );
}
