import {
  alpha,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { capitalize, filter, get, isEmpty, map } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  PaymentModeTypeConstants,
  ROLES_DATA,
  KDS_ORDER_STATUS_TYPES,
  BILLING_SCAN_KEYS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  terminalConfigurationState,
} from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import DefaultCounterDialog from './DefaultCounterDialog';
import SettingServices from 'src/services/API/SettingServices';
import EndShiftContactDialog from 'src/components/EndShiftContactDialog';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import { DefaultAliasLanguage } from 'src/constants/LanguageConstants';
import LanguageSelectionDialog from './LanguageSelectionDialog';
import CashDrawerPaymentDialog from './CashDrawerPaymentDialog';
import BillingScanQrSelectionDialog from './BillingScanQrSelectionDialog';
import AdditionalDiscountDialog from 'src/components/AdditionalDiscountDialog';
import AdditionalPackingChargesDialog from 'src/components/AdditionalPackingChargesDialog';
import AdditionalDeliveryChargesDialog from 'src/components/AdditionalDeliveryChargesDialog';
import AdditionalChargesDialog from 'src/components/AdditinalChargesDialog';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
export default function TerminalConfiguration() {
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole;
  const configuration = useRecoilValue(allConfiguration);
  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);
  const [openDefaultCounterDialog, setOpenDefaultCounterDialog] = useState(false);
  const [openAliasDiaog, setOpenAliasDialog] = useState(false);
  const [openCashDrawerDialog, setOpenCashDrawerDialog] = useState(false);
  const [terminalConfiguration, setTerminalConfiguration] = useRecoilState(
    terminalConfigurationState
  );
  const [selectedValue, setSelectedValue] = useState('1');
  const kdsSoundNotification = get(terminalConfiguration, 'kdsNotificationSound', '');
  const isCaptainView = get(terminalConfiguration, 'isCaptainView', false);
  const isKitchenDisplay = get(terminalConfiguration, 'isKitchenDisplay', false);
  const isBypassRequest = get(terminalConfiguration, 'isBypassRequest', false);
  const kdsOrderSettings = get(terminalConfiguration, 'kdsOrderSettings', []);
  const isDisableRoundedOff = get(terminalConfiguration, 'isDisableRoundedOff', false);

  const isShowProductCategoryAlias = get(terminalConfiguration, 'alias.isActive', false);
  const isShowBillingScanQr = get(terminalConfiguration, 'billingScanQr.isActive', false);
  const isShowAdditionalDiscount = get(terminalConfiguration, 'additionalDiscount.isActive', false);
  const isShowAdditionalCharges = get(terminalConfiguration, 'additionalCharges.isActive', false);
  const isShowAdditionalPacking = get(
    terminalConfiguration,
    'additionalPackingCharges.isActive',
    false
  );
  const isShowAdditionalDelivery = get(
    terminalConfiguration,
    'additionalDeliveryCharges.isActive',
    false
  );
  const audioRefs = useRef([]);
  const isSplitPaymentMode = get(terminalConfiguration, 'isSplitPaymentMode', false);
  const isEnableNotParcelBilling = get(terminalConfiguration, 'isEnableNotParcelBilling', false);
  const removeTableKOTButton = get(terminalConfiguration, 'removeTableKOTButton', true);
  const disableClose = get(terminalConfiguration, 'disableClose', true);
  const disablePrint = get(terminalConfiguration, 'disablePrint', true);
  const addTableEstimate = get(terminalConfiguration, 'addTableEstimate', false);
  const disableEstimate = get(terminalConfiguration, 'disableEstimate', true);
  const showPrintAndClose = get(terminalConfiguration, 'showPrintAndClose', false);
  const isCashDrawerOpen = get(terminalConfiguration, 'cashDrawerSettings.isActive', false);
  const defaultCashDrawerValue = [PaymentModeTypeConstants.CASH];
  const drawerOpenPaymentModes =
    get(terminalConfiguration, 'cashDrawerSettings.drawerOpenPaymentModes') ||
    defaultCashDrawerValue;
  const isDisableCounter = get(terminalConfiguration, 'isDisableCounter', false);
  const isDefaultCounterEnabled = get(terminalConfiguration, 'defaultCounterConfig.isActive');
  const [playingAudio, setPlayingAudio] = useState(null);
  const shiftSummaryMsg = get(terminalConfiguration, 'isShiftSummaryMsg', {
    sendMsg: false,
    contactNumber: [],
  });
  const shiftSummaryMail = get(terminalConfiguration, 'isShiftSummaryMail', {
    sendMail: false,
    email: [],
  });
  console.log('isShowAdditionalDelivery', isShowAdditionalDelivery);
  const enabledEndShiftForEmail = get(terminalConfiguration, 'isShiftSummaryMail.sendMail', false);
  const enabledEndShiftForWhatsapp = get(terminalConfiguration, 'isShiftSummaryMsg.sendMsg', false);

  const [openEndShiftContactsForEmail, setOpenEndShiftContactsForEmail] = useState(false);
  const [openEndShiftContactsForWhatsapp, setOpenEndShiftContactsForWhatsapp] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [openBillingScanQrDialog, setOpenBillingScanQrDialog] = useState(false);

  const isBulkOrderClose = get(terminalConfiguration, 'isBulkOrderClose', false);
  const isMultipleKot = get(terminalConfiguration, 'isMultipleKot', false);
  const isCustomerShow = get(terminalConfiguration, 'isCustomerShow', false);

  const [bulkOrderClose, setBulkOrderClose] = useState(false);
  const [multipleClose, setMultipleClose] = useState(false);
  const [customerShow, setCustomerShow] = useState(false);

  const [openAdditionalDiscountDialog, setOpenAdditionalDiscountDialog] = useState(false);
  const [openAdditionalPackingDialog, setOpenAdditionalPackingDialog] = useState(false);
  const [openAdditionalDeliveryDialog, setOpenAdditionalDeliveryDialog] = useState(false);
  const [openAdditionalChargesDialog, setOpenAdditionalChargesDialog] = useState(false);
  const initialFetch = async () => {
    if (!currentStore || !currentTerminal) return;
    try {
      const response = await SettingServices.getTerminalConfiguration(
        currentStore,
        currentTerminal
      );
      setTerminalConfiguration(get(response, 'data.0.terminalSettings') || {});
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const add91InContacts = (contacts) => {
    return map(contacts, (_contact) => {
      return `91${_contact}`;
    });
  };

  const handleDisableDefaultCounter = async () => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        terminalSettings: {
          ...terminalConfiguration,
          defaultCounterConfig: {
            isActive: false,
            selectedCounters: [],
          },
        },
      };
      await SettingServices.postTerminalConfiguration(options);
      initialFetch();
    } catch (e) {
      console.log(e);
    }
  };
  const handleDisableCashDrawerCounter = async () => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        terminalSettings: {
          ...terminalConfiguration,
          cashDrawerSettings: {
            isActive: false,
            drawerOpenPaymentModes: [],
          },
        },
      };
      await SettingServices.postTerminalConfiguration(options);
      initialFetch();
    } catch (e) {
      console.log(e);
    }
  };
  const handleChangeProductAlias = async () => {
    try {
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        terminalSettings: {
          ...terminalConfiguration,
          alias: {
            isActive: !isShowProductCategoryAlias,
            ...(!isShowProductCategoryAlias
              ? {
                  language: DefaultAliasLanguage,
                }
              : {}),
          },
        },
      };
      await SettingServices.postTerminalConfiguration(options);
      initialFetch();
      if (!isShowProductCategoryAlias) handleOpenAliasDialog();
    } catch (e) {
      console.log(e);
    }
  };
  const handleAudioPlay = (index) => {
    if (playingAudio !== null && playingAudio !== index) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }

    setPlayingAudio(index);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    handlePostConfiguration('kdsNotificationSound', event.target.value);
  };

  const handleChangeScanQR = async () => {
    try {
      if (!isShowBillingScanQr) {
        handleOpenBillingScanQrDialog();
      } else {
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          terminalSettings: {
            ...terminalConfiguration,
            billingScanQr: {
              isActive: !isShowBillingScanQr,
            },
          },
        };
        await SettingServices.postTerminalConfiguration(options);
        initialFetch();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangeAdditionalDiscount = async () => {
    try {
      if (!isShowAdditionalDiscount) {
        handleOpenAdditionalDiscountDialog();
      } else {
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          terminalSettings: {
            ...terminalConfiguration,
            additionalDiscount: {
              isActive: !isShowAdditionalDiscount,
            },
          },
        };
        await SettingServices.postTerminalConfiguration(options);
        initialFetch();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleChangeAdditionalCharges = async () => {
    try {
      if (!isShowAdditionalCharges) {
        handleOpenAdditionalChargesDialog();
      } else {
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          terminalSettings: {
            ...terminalConfiguration,
            additionalCharges: {
              isActive: !isShowAdditionalCharges,
            },
          },
        };
        await SettingServices.postTerminalConfiguration(options);
        initialFetch();
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleChangeAdditionalPacking = async () => {
    try {
      if (!isShowAdditionalPacking) {
        handleOpenAdditionalPackingDialog();
      } else {
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          terminalSettings: {
            ...terminalConfiguration,
            additionalPackingCharges: {
              isActive: !isShowAdditionalPacking,
            },
          },
        };
        await SettingServices.postTerminalConfiguration(options);
        initialFetch();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangeAdditionalDelivery = async () => {
    try {
      if (!isShowAdditionalDelivery) {
        handleOpenAdditionalDeliveryDialog();
      } else {
        const options = {
          storeId: currentStore,
          terminalId: currentTerminal,
          terminalSettings: {
            ...terminalConfiguration,
            additionalDeliveryCharges: {
              isActive: !isShowAdditionalDelivery,
            },
          },
        };
        await SettingServices.postTerminalConfiguration(options);
        initialFetch();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpenDefaultCounterDialog = () => {
    setOpenDefaultCounterDialog(true);
  };
  const handleCloseDefaultCounterDialog = () => {
    setOpenDefaultCounterDialog(false);
  };
  const handleOpenCashDrawerDialog = () => {
    setOpenCashDrawerDialog(true);
  };
  const handleCloseCashDrawerDialog = () => {
    setOpenCashDrawerDialog(false);
  };

  const handleOpenAliasDialog = () => {
    setOpenAliasDialog(true);
  };
  const handleCloseAliasDialog = () => {
    setOpenAliasDialog(false);
  };

  const handleOpenBillingScanQrDialog = () => {
    setOpenBillingScanQrDialog(true);
  };

  const handleOpenAdditionalDiscountDialog = () => {
    setOpenAdditionalDiscountDialog(true);
  };
  const handleOpenAdditionalChargesDialog = () => {
    setOpenAdditionalChargesDialog(true);
  };

  const handleCloseAdditionalChargesDialog = () => {
    setOpenAdditionalChargesDialog(false);
  };

  const handleOpenAdditionalPackingDialog = () => {
    setOpenAdditionalPackingDialog(true);
  };

  const handleOpenAdditionalDeliveryDialog = () => {
    setOpenAdditionalDeliveryDialog(true);
  };

  const handleCloseBillingScanQrDialog = () => {
    setOpenBillingScanQrDialog(false);
  };

  const handleCloseAdditionalDiscountDialog = () => {
    setOpenAdditionalDiscountDialog(false);
  };

  const handleCloseAdditionalPackingDialog = () => {
    setOpenAdditionalPackingDialog(false);
  };
  const handleCloseAdditionalDeliveryDialog = () => {
    setOpenAdditionalDeliveryDialog(false);
  };

  const handleDefaultCounterDialog = () => {
    if (isDefaultCounterEnabled) {
      handleDisableDefaultCounter();
    } else {
      handleOpenDefaultCounterDialog();
    }
  };
  const handleDefaultCashDrawerDialog = () => {
    if (isCashDrawerOpen) {
      handleDisableCashDrawerCounter();
    } else {
      handleOpenCashDrawerDialog();
    }
  };

  const handleBulkOrderClose = async (bulkOrderClose) => {
    try {
      await handlePostConfiguration('isBulkOrderClose', !isBulkOrderClose);
      setBulkOrderClose(false);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handleMultipleKot = async () => {
    try {
      await handlePostConfiguration('isMultipleKot', !isMultipleKot);
      setMultipleClose(false);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handleCustomerTable = async (customerShow) => {
    try {
      await handlePostConfiguration('isCustomerShow', !isCustomerShow);
      setCustomerShow(false);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    initialFetch();
  }, [currentStore, currentTerminal]);

  const handlePostConfiguration = async (key, value) => {
    setIsLoading(true);
    try {
      if (!currentStore || !currentTerminal) return;
      const options = {
        storeId: currentStore,
        terminalId: currentTerminal,
        terminalSettings: {
          ...terminalConfiguration,
          [key]: value,
        },
      };
      const response = await SettingServices.postTerminalConfiguration(options);
      initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (_order) => {
    let payload = kdsOrderSettings.includes(_order) ? [] : [_order];
    handlePostConfiguration('kdsOrderSettings', payload);
  };

  const handleEndSummaryForEmail = () => {
    if (enabledEndShiftForEmail) {
      handlePostConfiguration('isShiftSummaryMail', {
        ...shiftSummaryMail,
        sendMail: false,
      });
    } else {
      setOpenEndShiftContactsForEmail(true);
    }
  };

  const handleEndSummaryForWhatsapp = () => {
    if (enabledEndShiftForWhatsapp) {
      handlePostConfiguration('isShiftSummaryMsg', {
        ...shiftSummaryMsg,
        sendMsg: false,
      });
    } else {
      setOpenEndShiftContactsForWhatsapp(true);
    }
  };

  const handleSubmitForEmail = async (contactList) => {
    try {
      await handlePostConfiguration('isShiftSummaryMail', {
        ...shiftSummaryMail,
        sendMail: true,
        email: add91InContacts(contactList),
      });
      setOpenEndShiftContactsForEmail(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitForWhatsapp = async (contactList) => {
    try {
      await handlePostConfiguration('isShiftSummaryMsg', {
        ...shiftSummaryMsg,
        sendMsg: true,
        contactNumber: add91InContacts(contactList),
      });
      setOpenEndShiftContactsForWhatsapp(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box
      sx={{
        pointerEvents: isAuthorizedRoles ? 'default' : 'none',
      }}
    >
      <Grid container rowGap={2}>
        {isCountersEnabled && (
          <Grid xs={12}>
            <Typography variant="h6" sx={{ my: 2 }}>
              Counter options
            </Typography>
            <Grid container gap={2}>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={4}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
              >
                <Box
                  spacing={0.5}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                    Default counter
                    {isDefaultCounterEnabled && (
                      <Button
                        sx={{ ml: 2 }}
                        onClick={handleOpenDefaultCounterDialog}
                        variant="outlined"
                        size="small"
                      >
                        View
                      </Button>
                    )}
                  </Typography>
                  <Switch
                    name="defaultCounterConfig"
                    checked={isDefaultCounterEnabled || false}
                    onChange={handleDefaultCounterDialog}
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
                  Enable to view and manage default counter
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={4}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
              >
                <Box
                  spacing={0.5}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                    Disable counter
                  </Typography>
                  <Switch
                    name="isDisableCounter"
                    checked={isDisableCounter}
                    onChange={() =>
                      handlePostConfiguration('isDisableCounter', !isDisableCounter || false)
                    }
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
                  Disable counter in terminal
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            View
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Captain
                </Typography>
                <Switch
                  name="isCaptainView"
                  checked={isCaptainView}
                  onChange={() => handlePostConfiguration('isCaptainView', !isCaptainView || false)}
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
                Enable to change the staff app as captain view
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Alias
                  {isShowProductCategoryAlias && (
                    <Button
                      sx={{ ml: 2 }}
                      onClick={handleOpenAliasDialog}
                      variant="outlined"
                      size="small"
                    >
                      View
                    </Button>
                  )}
                </Typography>
                <Switch
                  name="isShowProductCategoryAlias"
                  checked={isShowProductCategoryAlias}
                  onChange={handleChangeProductAlias}
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
                Enable to view and add the product alias & category alias shown instead of default
                name
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={12}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            Billing
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  {' '}
                  Disable rounded off
                </Typography>
                <Switch
                  name="isDisableRoundedOff"
                  checked={isDisableRoundedOff}
                  onChange={() =>
                    handlePostConfiguration('isDisableRoundedOff', !isDisableRoundedOff || false)
                  }
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
                Enable to disable rounded off in print
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Barcode scan
                </Typography>
                <FormControl>
                  <RadioGroup
                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
                    aria-labelledby="demo-billingScanBy"
                    name="billingScanBy"
                    value={get(
                      terminalConfiguration,
                      'billingScanBy',
                      BILLING_SCAN_KEYS.PRODUCT_ID
                    )}
                    onChange={(e) => handlePostConfiguration('billingScanBy', e.target.value)}
                  >
                    <FormControlLabel
                      value={BILLING_SCAN_KEYS.PRODUCT_ID}
                      control={<Radio />}
                      label="Product ID"
                    />
                    <FormControlLabel
                      value={BILLING_SCAN_KEYS.BARCODE}
                      control={<Radio />}
                      label="Barcode"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Choose the key to scan in billing
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Box width={'100%'}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            Table
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Restrict KOT Print
                </Typography>
                <Switch
                  name="removeTableKOTButton"
                  checked={removeTableKOTButton}
                  onChange={() =>
                    handlePostConfiguration('removeTableKOTButton', !removeTableKOTButton || false)
                  }
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
                Enabling will remove the KOT button once a KOT has been printed
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Show print and close
                </Typography>
                <Switch
                  name="showPrintAndClose"
                  checked={showPrintAndClose}
                  onChange={() =>
                    handlePostConfiguration('showPrintAndClose', !showPrintAndClose || false)
                  }
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
                Enabling will show always the print and close button in table order.
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: '500',
                  fontSize: '10px',
                  color: 'black',
                  p: 1,
                  pl: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '5px',
                  opacity: '80%',
                  mt: 1,
                }}
              >
                <b>Note:</b> If you turn this ON, make sure to turn OFF "Disable Print and Close".
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Allow Editing Estimates
                </Typography>
                <Switch
                  name="addTableEstimate"
                  checked={addTableEstimate}
                  onChange={() =>
                    handlePostConfiguration('addTableEstimate', !addTableEstimate || false)
                  }
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 2,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Enabling editing estimates after it FROZEN
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: '500',
                  fontSize: '10px',
                  color: 'black',
                  p: 1,
                  pl: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '5px',
                  opacity: '80%',
                  mt: 1,
                }}
              >
                <b>Note:</b> If you turn this ON, make sure to turn OFF "Disable Estimate Button".
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Disable Estimate Button
                </Typography>
                <Switch
                  name="disableEstimate"
                  checked={disableEstimate}
                  onChange={() =>
                    handlePostConfiguration('disableEstimate', !disableEstimate || false)
                  }
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 2,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Disable estimates will hide the Estimate button
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: '500',
                  fontSize: '10px',
                  color: 'black',
                  p: 1,
                  pl: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '5px',
                  opacity: '80%',
                  mt: 1,
                }}
              >
                <b>Note:</b> If you turn this ON, make sure to turn OFF "Allow Editing Estimate ".
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Disable Close Button
                </Typography>
                <Switch
                  name="disableClose"
                  checked={disableClose}
                  onChange={() => handlePostConfiguration('disableClose', !disableClose || false)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 2,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Disable close will hide the close button
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Disable Print and Close Button
                </Typography>
                <Switch
                  name="disablePrint"
                  checked={disablePrint}
                  onChange={() => handlePostConfiguration('disablePrint', !disablePrint || false)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.light,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.light,
                    },
                    mx: 2,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: '300' }}>
                Disable close will hide the close button
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: '500',
                  fontSize: '10px',
                  color: 'black',
                  p: 1,
                  pl: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '5px',
                  opacity: '80%',
                  mt: 1,
                }}
              >
                <b>Note:</b> If you turn this ON, make sure to turn OFF "Show print and close".
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Box width={'100%'}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            Store Purchase
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  ByPass purchase request
                </Typography>
                <Switch
                  name="isBypassRequest"
                  checked={isBypassRequest}
                  onChange={() =>
                    handlePostConfiguration('isBypassRequest', !isBypassRequest || false)
                  }
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
                Enable to show the bypass create view
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box width={'100%'}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            Kitchen Display options
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Kitchen display view
                </Typography>
                <Switch
                  name="isKitchenDisplay"
                  checked={isKitchenDisplay}
                  onChange={() =>
                    handlePostConfiguration('isKitchenDisplay', !isKitchenDisplay || false)
                  }
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
                Enable to change the staff app as KDS view
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {/* <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Whatsapp
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
                  checked={enabledEndShiftForWhatsapp}
                  onChange={handleEndSummaryForWhatsapp}
                /> */}
              </Box>

              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Kitchen display order Configuration
              </Typography>
              <FormGroup
                sx={{
                  position: 'flex',
                  flexDirection: 'row',
                }}
              >
                {map(KDS_ORDER_STATUS_TYPES, (_order, _index) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          // disabled={
                          //   _order === KDS_ORDER_STATUS_TYPES.ORDER_PLACED ||
                          //   _order === KDS_ORDER_STATUS_TYPES.DELIVERED
                          // }
                          defaultChecked={false}
                          checked={
                            isEmpty(kdsOrderSettings)
                              ? _order === KDS_ORDER_STATUS_TYPES.ORDER_PLACED
                              : kdsOrderSettings.includes(_order)
                          }
                          onChange={() => handleCheckboxChange(_order)}
                          name={_order}
                        />
                      }
                      label={
                        (_order === KDS_ORDER_STATUS_TYPES.ORDER_PLACED && 'Order placed') ||
                        (_order === KDS_ORDER_STATUS_TYPES.READY_TO_SERVE && 'Ready to serve') ||
                        (_order === KDS_ORDER_STATUS_TYPES.DELIVERED && 'Delivered') ||
                        capitalize(_order)
                      }
                    />
                  );
                })}
              </FormGroup>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={3.8}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', width: '80vw', gap: 2, p: 2 }}
            >
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="1"
                  value={selectedValue || kdsSoundNotification}
                  name="radio-buttons-group"
                >
                  {[1, 2, 3, 4, 5].map((item, index) => {
                    return (
                      <FormControlLabel
                        value={item}
                        control={<Radio />}
                        onChange={handleChange}
                        label={
                          <audio
                            ref={(el) => (audioRefs.current[index] = el)}
                            controls
                            controlsList="nodownload noremoteplayback nofullscreen"
                            onPlay={() => handleAudioPlay(index)}
                          >
                            <source
                              src={`https://audio-pos.s3.ap-south-1.amazonaws.com/ringtone-${item}.mp3`}
                              type="audio/mpeg"
                            />
                            Your browser does not support the audio element.
                          </audio>
                        }
                      ></FormControlLabel>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Grid xs={12}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            More options
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Split payment mode
                </Typography>
                <Switch
                  name="isSplitPaymentMode"
                  checked={isSplitPaymentMode}
                  onChange={() =>
                    handlePostConfiguration('isSplitPaymentMode', !isSplitPaymentMode || false)
                  }
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
                Enable to split payment mode in billing
              </Typography>
            </Grid>{' '}
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Cash Drawer
                  {isCashDrawerOpen && (
                    <Button
                      sx={{ ml: 2 }}
                      onClick={handleOpenCashDrawerDialog}
                      variant="outlined"
                      size="small"
                    >
                      View
                    </Button>
                  )}
                </Typography>

                <Switch
                  name="cashDrawerSettings"
                  checked={isCashDrawerOpen}
                  onChange={handleDefaultCashDrawerDialog}
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
                If enabled, cash drawer open automatically while print.
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Setup UPI ID
                  {isShowBillingScanQr && (
                    <Button
                      sx={{ ml: 2 }}
                      onClick={handleOpenBillingScanQrDialog}
                      variant="outlined"
                      size="small"
                    >
                      View
                    </Button>
                  )}
                </Typography>
                <Switch
                  name="isShowBillingScanQr"
                  checked={isShowBillingScanQr}
                  onChange={handleChangeScanQR}
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
                Enables static QR payment in billing screen
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Additional predefined discount
                  {isShowAdditionalDiscount && (
                    <Button
                      sx={{ ml: 2 }}
                      onClick={handleOpenAdditionalDiscountDialog}
                      variant="outlined"
                      size="small"
                    >
                      View
                    </Button>
                  )}
                </Typography>
                <Switch
                  name="isShowAdditionalDiscount"
                  checked={isShowAdditionalDiscount}
                  onChange={handleChangeAdditionalDiscount}
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
                Enables predefined discount values
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Additional predefined charges
                  {isShowAdditionalCharges && (
                    <Button
                      sx={{ ml: 2 }}
                      onClick={handleOpenAdditionalChargesDialog}
                      variant="outlined"
                      size="small"
                    >
                      View
                    </Button>
                  )}
                </Typography>
                <Switch
                  name="isShowAdditionalCharges"
                  checked={isShowAdditionalCharges}
                  onChange={handleChangeAdditionalCharges}
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
                Enables predefined additional charges values
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Additional predefined packing charges
                  {isShowAdditionalPacking && (
                    <Button
                      sx={{ ml: 2 }}
                      onClick={handleOpenAdditionalPackingDialog}
                      variant="outlined"
                      size="small"
                    >
                      View
                    </Button>
                  )}
                </Typography>
                <Switch
                  name="isShowAdditionalPacking"
                  checked={isShowAdditionalPacking}
                  onChange={handleChangeAdditionalPacking}
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
                Enables predefined packing charges values
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Additional predefined delivery charges
                  {isShowAdditionalDelivery && (
                    <Button
                      sx={{ ml: 2 }}
                      onClick={handleOpenAdditionalDeliveryDialog}
                      variant="outlined"
                      size="small"
                    >
                      View
                    </Button>
                  )}
                </Typography>
                <Switch
                  name="isShowAdditionalDelivery"
                  checked={isShowAdditionalDelivery}
                  onChange={handleChangeAdditionalDelivery}
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
                Enables predefined delivery charges values
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Parcel not allowed
                </Typography>
                <Switch
                  name="isEnableNotParcelBilling"
                  checked={isEnableNotParcelBilling}
                  onChange={() =>
                    handlePostConfiguration(
                      'isEnableNotParcelBilling',
                      !isEnableNotParcelBilling || false
                    )
                  }
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
                Enable to show parcel not allowed feature
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={14}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            Staff Permission
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Close Bulk Orders
                </Typography>
                <Switch
                  name="isBulkOrderClose"
                  checked={isBulkOrderClose}
                  onChange={() =>
                    handleBulkOrderClose('isBulkOrderClose', !isBulkOrderClose || false)
                  }
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
                Enable the staff to close all orders of Customer in bulk
              </Typography>
            </Grid>

            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Customer Orders{' '}
                </Typography>
                <Switch
                  name="isCustomerShow"
                  checked={isCustomerShow}
                  onChange={() => handleCustomerTable('isCustomerShow', !isCustomerShow || false)}
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
                Enable the staff to view Customer orders
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid xs={14}>
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            Food Delivery
          </Typography>
          <Grid container gap={2}>
            <Grid
              item
              xs={12}
              sm={5.8}
              md={4}
              sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
            >
              <Box
                spacing={0.5}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                  Allow Multiple KOT
                </Typography>
                <Switch
                  name="isMultipleKot"
                  checked={isMultipleKot}
                  onChange={() => handleMultipleKot('isMultipleKot', !isMultipleKot || false)}
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
                Enable Multiple KOT to generate separate kitchen tickets for efficient order
                processing.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {openDefaultCounterDialog && (
        <DefaultCounterDialog
          open={openDefaultCounterDialog}
          handleClose={handleCloseDefaultCounterDialog}
          initialFetch={initialFetch}
          previous={get(terminalConfiguration, 'defaultCounterConfig.selectedCounters') || []}
        />
      )}
      {openCashDrawerDialog && (
        <CashDrawerPaymentDialog
          open={openCashDrawerDialog}
          handleClose={handleCloseCashDrawerDialog}
          initialFetch={initialFetch}
          previous={
            get(terminalConfiguration, 'cashDrawerSettings.drawerOpenPaymentModes') ||
            defaultCashDrawerValue
          }
        />
      )}
      {openAliasDiaog && (
        <LanguageSelectionDialog
          open={openAliasDiaog}
          handleClose={handleCloseAliasDialog}
          initialFetch={initialFetch}
        />
      )}

      {openBillingScanQrDialog && (
        <BillingScanQrSelectionDialog
          open={openBillingScanQrDialog}
          handleClose={handleCloseBillingScanQrDialog}
          initialFetch={initialFetch}
        />
      )}

      {openAdditionalDiscountDialog && (
        <AdditionalDiscountDialog
          open={openAdditionalDiscountDialog}
          handleClose={handleCloseAdditionalDiscountDialog}
          initialFetch={initialFetch}
          terminalConfiguration={terminalConfiguration}
        />
      )}

      {openAdditionalChargesDialog && (
        <AdditionalChargesDialog
          open={openAdditionalChargesDialog}
          handleClose={handleCloseAdditionalChargesDialog}
          initialFetch={initialFetch}
          terminalConfiguration={terminalConfiguration}
        />
      )}

      {openAdditionalPackingDialog && (
        <AdditionalPackingChargesDialog
          open={openAdditionalPackingDialog}
          handleClose={handleCloseAdditionalPackingDialog}
          initialFetch={initialFetch}
          terminalConfiguration={terminalConfiguration}
        />
      )}
      {openAdditionalDeliveryDialog && (
        <AdditionalDeliveryChargesDialog
          open={openAdditionalDeliveryDialog}
          handleClose={handleCloseAdditionalDeliveryDialog}
          initialFetch={initialFetch}
          terminalConfiguration={terminalConfiguration}
        />
      )}
      {openEndShiftContactsForEmail && (
        <EndShiftContactDialog
          open={openEndShiftContactsForEmail}
          handleClose={() => {
            setOpenEndShiftContactsForEmail(false);
          }}
          handlePostConfiguration={handlePostConfiguration}
          endShiftConfig={{
            isActive: enabledEndShiftForEmail,
            contactList: get(shiftSummaryMail, 'email', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForEmail}
        />
      )}
      {openEndShiftContactsForWhatsapp && (
        <EndShiftContactDialog
          open={openEndShiftContactsForWhatsapp}
          handleClose={() => {
            setOpenEndShiftContactsForWhatsapp(false);
          }}
          handlePostConfiguration={handlePostConfiguration}
          endShiftConfig={{
            isActive: enabledEndShiftForWhatsapp,
            contactList: get(shiftSummaryMsg, 'contactNumber', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForWhatsapp}
        />
      )}
    </Box>
  );
}
