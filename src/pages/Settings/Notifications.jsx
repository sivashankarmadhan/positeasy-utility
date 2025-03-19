import {
  Box,
  Divider,
  Stack,
  Switch,
  Typography,
  useTheme,
  Grid,
  Tooltip,
  Card,
  TextField,
  Button,
} from '@mui/material';
import map from 'lodash/map';
import { Tab } from '@mui/material';
import { Tabs } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { find, get, isString, split, isEmpty } from 'lodash';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import { NOTIFICATION_CONFIGURATIONS, ROLES_DATA } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { SettingsTourPrintModeConfiguration } from 'src/constants/TourConstants';
import {
  allConfiguration,
  currentStoreId,
  currentTerminalId,
  stores,
  whatsappBalanceDetailsState,
  whatsappDetailsState,
  gstSummaryDetailsState,
} from 'src/global/recoilState';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import WhatsappNumberDialog from './WhatsappNumberDialog';
import WhatsappNumberhourlyDialog from './WhatsappNumberhourlyDialog';
import RegexValidation from 'src/constants/RegexValidation';
import EndShiftContactDialog from 'src/components/EndShiftContactDialog';
import GSTsummaryContactdialog from 'src/components/GSTsummaryContactdialog';
import EndShiftEmailDialog from 'src/components/EndShiftEmailDialog';
import DailySaleNotificationDialog from 'src/components/DailySaleNotificationDialog';
import Lowstockproductcontactdialog from 'src/components/Lowstockproductdialog';
import Lowstockrawmaterialcontactdialog from 'src/components/Lowstockrawmaterialdialog';
import { PATH_DASHBOARD } from 'src/routes/paths';

const notification = [
  {
    label: 'email',
    value: 'Email',
  },
  {
    label: 'whatsapp',
    value: 'Whatsapp',
  },
];

export default function Notifications() {
  const theme = useTheme();
  const navigate = useNavigate();

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole;
  const [configuration, setConfiguration] = useState({});
  const [isDaily, setIsDaily] = useState(get(configuration, 'isDaily'));
  console.log('optionnn', isDaily);

  const isReview = get(configuration, 'isReview', false);

  const isWeekly = get(configuration, 'isWeekly', false);
  const isMonthly = get(configuration, 'isMonthly', false);

  const [notifications, setNotifications] = useState([]);

  const [gstSummaryDetails, setGstSummaryDetails] = useRecoilState(gstSummaryDetailsState);
  const [whatsappNumber, setWhatsappNumber] = useState();

  const [isLoading, setIsLoading] = useState(false);

  const [whatsappDetails, setWhatsappDetails] = useRecoilState(whatsappDetailsState);
  const [whatsappNumberDialogOpen, setWhatsappNumberDialogOpen] = useState(false);

  const messageSettings = get(configuration, 'messageSettings', {});
  const mailSettings = get(configuration, 'mailSettings', {});

  const shiftSummaryMsg = get(configuration, 'messageSettings.isShiftSummaryMsg', {
    sendMsg: false,
    contactNumber: [],
  });
  const hourlySummaryMsg = get(configuration, 'messageSettings.isHourlySale', {
    sendMsg: false,
    contactNumber: [],
  });
  const productSummaryMsg = get(configuration, 'messageSettings.isProductHourlyLowStock', {
    sendMsg: false,
    contactNumber: [],
  });
  const rawmateriallowStockMsg = get(configuration, 'messageSettings.isRawProductHourlyLowStock', {
    sendMsg: false,
    contactNumber: [],
  });

  let shiftSummaryMail = get(configuration, 'mailSettings.isShiftSummaryMail', {
    sendMail: false,
    email: [],
  });

  const enabledGSTMonthlyForWhatsapp = get(
    configuration,
    'messageSettings.isMonthlyGST.sendMsg',
    false
  );
  const monthlyGST = get(configuration, 'messageSettings.isMonthlyGST', {
    sendMsg: false,
    contactNumber: [],
  });

  if (isString(get(shiftSummaryMail, 'email'))) {
    shiftSummaryMail.email = split(get(shiftSummaryMail, 'email'), ',');
  }

  const enabledEndShiftForWhatsapp = get(
    configuration,
    'messageSettings.isShiftSummaryMsg.sendMsg',
    false
  );
  const enabledhourlyForWhatsapp = get(
    configuration,
    'messageSettings.isHourlySale.sendMsg',
    false
  );
  const enabledlowstockForWhatsapp = get(
    configuration,
    'messageSettings.isProductHourlyLowStock.sendMsg',
    false
  );
  const enabledrawmaterialForWhatsapp = get(
    configuration,
    'messageSettings.isRawProductHourlyLowStock.sendMsg',
    false
  );

  const enableDailyShiftForWhatsapp = get(whatsappDetails, 'saleNotify.isDaily');

  console.log('whatsappDetails', whatsappDetails);

  const enabledEndShiftForEmail = get(
    configuration,
    'mailSettings.isShiftSummaryMail.sendMail',
    false
  );

  const saleSummaryMail = get(configuration, 'email', '') || '';

  const [openEndShiftContactsForEmail, setOpenEndShiftContactsForEmail] = useState(false);
  const [openEndShiftContactsForWhatsapp, setOpenEndShiftContactsForWhatsapp] = useState(false);
  const [openDailysaleContactsForEmail, setOpenDailysaleContactsForEmail] = useState(false);
  const [openLowstockContactsForWhatsapp, setOpenLowstockContactsForWhatsapp] = useState(false);
  const [openRawmaterialContactsForWhatsapp, setOpenRawmaterialContactsForWhatsapp] =
    useState(false);
  const [openGstMonthlyContactsForWhatsapp, setOpenGstMonthlyContactsForWhatsapp] = useState(false);
  const [openhourlyContactsForWhatsapp, setOpenhourlyContactsForWhatsapp] = useState(false);

  const [openDailyShiftContactsForWhatsapp, setOpenDailyShiftContactsForWhatsapp] = useState(false);

  const [selected, setSelected] = React.useState(get(notification, '0.value'));

  const balanceDetails = useRecoilState(whatsappBalanceDetailsState)[0];
  const whatsappBalance = (get(balanceDetails, 'whatsappCredits', 0) / 100).toFixed(2) || 0;
  const isLowBalance = Number(Math.floor(whatsappBalance)) <= 3;

  const isEmail = selected === notification[0].value;
  const isWhatsapp = selected === notification[1].value;

  const storesData = useRecoilValue(stores);

  const currentStoreName = find(storesData, (_store) => {
    return get(_store, 'storeId') === currentStore;
  })?.storeName;

  const handleUpdate = (key) => {
    let options = { email: saleSummaryMail };
    const isDailyUpdate = key.target.name === NOTIFICATION_CONFIGURATIONS.DAILY;

    if (isDailyUpdate && !isDaily) {
      options = { ...options, isDaily: true };
      setIsDaily(true);
      console.log('TEST ISDAILY', isDaily);

      if (!isDaily) {
        setOpenDailysaleContactsForEmail(true);
        return;
      }
    }

    if (isDailyUpdate && isDaily) {
      console.log('TEST ISDAILY 1', isDaily);
      options = { ...options, isDaily: false, email: '' };
      setIsDaily(false);
    }

    if (key.target.name === NOTIFICATION_CONFIGURATIONS.WEEKLY) {
      options = { ...options, isWeekly: !isWeekly };
    }
    if (key.target.name === NOTIFICATION_CONFIGURATIONS.MONTHLY) {
      options = { ...options, isMonthly: !isMonthly };
    }
    handleUpdateConfiguration(options);
  };
  const handleClose = () => {
    if (isEmpty(saleSummaryMail)) {
      setIsDaily(false);
      console.log('sal', saleSummaryMail, isDaily);
    }
    setOpenDailysaleContactsForEmail(false);
  };

  const handlePostConfigurationForSaleEmail = async (key, value) => {
    setIsLoading(true);
    try {
      if (!currentStore || !currentTerminal) return;
      const isDaily = value ? true : false;
      const emailArray = get(value, 'email', []);
      const emailString = emailArray.filter((email) => email).join(',');
      const options = {
        email: emailString,
        isDaily: isDaily,
      };
      const response = await SettingServices.updateNotificationConfiguration(options);
      initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfiguration = async (options) => {
    console.log('optionsa', options);

    try {
      await SettingServices.updateNotificationConfiguration(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateisReview = async () => {
    const payload = { isReview: isReview };

    try {
      await SettingServices.updateNotificationisReview(payload);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
    }
  };

  const initialFetch = async () => {
    if (!currentStore && !currentTerminal) return;
    try {
      const resp = await SettingServices.getNotificationConfiguration();
      setConfiguration({
        ...(configuration || {}),
        ...(get(resp, 'data') || {}),
      });
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    if (configuration) {
      console.log('conf', configuration);
      setIsDaily(get(configuration, 'isDaily'));
    }
  }, [configuration]);

  useEffect(() => {
    initialFetch();
  }, [currentTerminal, currentStore]);

  const getWhatsappDetails = async () => {
    try {
      const resp = await SettingServices.getWhatsappDetails();
      setWhatsappDetails(get(resp, 'data'));
    } catch (err) {
      console.log('err', 'err');
      // toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  console.log('setGstSummaryDetails', gstSummaryDetails);

  const getGstSummaryMonthlyDetails = async () => {
    try {
      const resp = await SettingServices.getGstSummaryMonthlyDetails(currentStore);
      setGstSummaryDetails(get(resp, 'data.mailNotificationSettings'));
    } catch (err) {
      console.log('err', 'err');
      // toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleUpdateWhatsappMsg = async (data) => {
    try {
      await SettingServices.UpdateWhatsappMsg(data);
      getWhatsappDetails();
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleUpdateWhatsappDaily = async (whatsappNumber) => {
    const formattedNumbers = map(whatsappNumber, (num) => `91${num}`);

    try {
      await SettingServices.UpdateWhatsappDaily({
        storeName: currentStoreName,
        saleNotify: {
          isDaily: !!whatsappNumber,
          ...(!isEmpty(whatsappNumber) ? { dailyWhatsappNumber: formattedNumbers } : {}),
        },
      });
      await getWhatsappDetails();
      setOpenDailyShiftContactsForWhatsapp(false);
    } catch (err) {
      console.log('isDaily', isDaily);

      // toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleUpdateGstMonthly = async () => {
    try {
      await SettingServices.UpdateGstSummaryMonthly({
        storeName: currentStoreName,
        mailNotificationSettings: !gstSummaryDetails,
      });
      await getGstSummaryMonthlyDetails();
    } catch (err) {
      console.log('err', err);
      // toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleWhatsappNumber = (event) => {
    setWhatsappNumber(event.target.value);
  };

  useEffect(() => {
    getWhatsappDetails();
  }, []);

  const add91InContacts = (contacts) => {
    return map(contacts, (_contact) => {
      return `91${_contact}`;
    });
  };

  const remove91InContacts = (contacts) => {
    return map(contacts, (_contact) => {
      return `${_contact}`;
    });
  };

  const handlePostConfigurationForWhatsapp = async (key, value) => {
    setIsLoading(true);
    try {
      if (!currentStore || !currentTerminal) return;
      const options = {
        messageSettings: {
          ...messageSettings,
          [key]: value,
        },
      };
      const response = await SettingServices.postEndShiftWhatsapp(options);
      initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.error(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostlowstockForWhatsapp = async (key, value, type) => {
    setIsLoading(true);
    try {
      if (!currentStore || !currentTerminal) return;
      const options = {
        type,
        messageSettings: {
          ...messageSettings,
          [key]: value,
        },
      };
      const response = await SettingServices.postlowStockWhatsapp(options);
      initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostConfigurationForEmail = async (key, value) => {
    setIsLoading(true);
    try {
      if (!currentStore || !currentTerminal) return;
      const options = {
        mailSettings: {
          ...mailSettings,
          [key]: value,
        },
      };
      await SettingServices.postEndShiftEmail(options);
      initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSummaryForEmail = () => {
    if (enabledEndShiftForEmail) {
      handlePostConfigurationForEmail('isShiftSummaryMail', {
        sendMail: false,
      });
    } else {
      setOpenEndShiftContactsForEmail(true);
    }
  };

  const handlesaleSummaryForEmail = () => {
    if (saleSummaryMail) {
      handlePostConfigurationForSaleEmail('emailList', {
        ...saleSummaryMail,
        sendMail: false,
      });
    } else {
      setOpenDailysaleContactsForEmail(true);
    }
  };

  const handleEndSummaryForWhatsapp = () => {
    if (enabledEndShiftForWhatsapp) {
      handlePostConfigurationForWhatsapp('isShiftSummaryMsg', {
        ...shiftSummaryMsg,
        sendMsg: false,
      });
    } else {
      setOpenEndShiftContactsForWhatsapp(true);
    }
  };
  const handlehourlySummaryForWhatsapp = () => {
    if (enabledhourlyForWhatsapp) {
      handlePostConfigurationForWhatsapp('isHourlySale', {
        ...hourlySummaryMsg,
        sendMsg: false,
      });
    } else {
      setOpenhourlyContactsForWhatsapp(true);
    }
  };

  const handleLowSummaryForWhatsapp = () => {
    if (enabledlowstockForWhatsapp) {
      handlePostlowstockForWhatsapp(
        'isProductHourlyLowStock',
        {
          ...productSummaryMsg,
          sendMsg: false,
        },
        'product'
      );
    } else {
      setOpenLowstockContactsForWhatsapp(true);
    }
  };

  const handlerawmaterialSummaryForWhatsapp = () => {
    if (enabledrawmaterialForWhatsapp) {
      handlePostlowstockForWhatsapp(
        'isRawProductHourlyLowStock',
        {
          ...rawmateriallowStockMsg,
          sendMsg: false,
        },
        'rawMaterials'
      );
    } else {
      setOpenRawmaterialContactsForWhatsapp(true);
    }
  };
  const handleDailyShiftForWhatsapp = () => {
    if (enableDailyShiftForWhatsapp) {
      handleUpdateWhatsappDaily();
    } else {
      setOpenDailyShiftContactsForWhatsapp(true);
    }
  };

  const handleSubmitForEmail = async (emailList) => {
    try {
      await handlePostConfigurationForEmail('isShiftSummaryMail', {
        ...shiftSummaryMail,
        sendMail: true,
        email: emailList?.join?.(','),
      });
      setOpenEndShiftContactsForEmail(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitForsaleEmail = async (emailList) => {
    try {
      await handlePostConfigurationForSaleEmail('emailList', {
        email: emailList,
      });
      setOpenDailysaleContactsForEmail(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitForWhatsapp = async (contactList) => {
    try {
      await handlePostConfigurationForWhatsapp('isShiftSummaryMsg', {
        ...shiftSummaryMsg,
        sendMsg: true,
        contactNumber: add91InContacts(contactList),
      });
      setOpenEndShiftContactsForWhatsapp(false);
    } catch (err) {
      console.log(err);
    }
  };
  const handleSubmitForhourlyWhatsapp = async (contactList) => {
    try {
      await handlePostConfigurationForWhatsapp('isHourlySale', {
        ...hourlySummaryMsg,
        sendMsg: true,
        contactNumber: add91InContacts(contactList),
      });
      setOpenhourlyContactsForWhatsapp(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitForWhatsappLow = async (contactList) => {
    try {
      await handlePostlowstockForWhatsapp(
        'isProductHourlyLowStock',
        {
          ...productSummaryMsg,
          sendMsg: true,
          contactNumber: add91InContacts(contactList),
        },
        'product'
      );
      setOpenLowstockContactsForWhatsapp(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitForRawmaterial = async (contactList) => {
    try {
      await handlePostlowstockForWhatsapp(
        'isRawProductHourlyLowStock',
        {
          // ...RawmaterialSummaryMsg,
          ...rawmateriallowStockMsg,
          sendMsg: true,
          contactNumber: add91InContacts(contactList),
        },
        'rawMaterials'
      );
      setOpenRawmaterialContactsForWhatsapp(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleGSTMonthlyForWhatsapp = () => {
    if (enabledGSTMonthlyForWhatsapp) {
      handlePostConfigurationForWhatsapp('isMonthlyGST', {
        ...monthlyGST,
        sendMsg: false,
      });
    } else {
      setOpenGstMonthlyContactsForWhatsapp(true);
    }
  };

  const handleSubmitGSTMonthlyForWhatsapp = async (contactList) => {
    try {
      await handlePostConfigurationForWhatsapp('isMonthlyGST', {
        ...monthlyGST,
        sendMsg: true,
        contactNumber: remove91InContacts(contactList),
      });
      setOpenGstMonthlyContactsForWhatsapp(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box
      sx={{
        pointerEvents: isAuthorizedRoles ? 'default' : 'none',
        // mt: 2,
      }}
    >
      <Typography variant="h6">
        <Tabs
          sx={{
            width: '185px',
            ml: 1,
            mb: 1,
            '& .MuiTabs-scroller': {
              borderBottom: '2px solid #ecebeb',
            },
            '& .MuiButtonBase-root': {
              color: '#a6a6a6',
            },
          }}
          value={selected}
          onChange={(event, newValue) => {
            setSelected(newValue);
          }}
          indicatorColor="primary"
        >
          {map(notification, (_tab) => {
            return <Tab value={get(_tab, 'value')} label={get(_tab, 'label')} />;
          })}
        </Tabs>
      </Typography>

      {isEmail && (
        <Box sx={{ mb: 2 }}>
          <Card sx={{ p: 1, my: 1, mx: 0.5 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 700, fontSize: '17px' }}>
              Sale Summary
            </Typography>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep7"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Stack flexDirection={'row'} alignItems="center">
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '17px' }}>
                        Daily
                      </Typography>
                      {!isEmpty(saleSummaryMail) && isDaily && (
                        <Button
                          sx={{ ml: 2 }}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setOpenDailysaleContactsForEmail(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}{' '}
                    </Stack>

                    {/* <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                      Daily
                    </Typography> */}
                    <Typography variant="body2">
                      Enable to receive daily sale notifications in mail
                    </Typography>
                  </Box>
                  <Switch
                    name={NOTIFICATION_CONFIGURATIONS.DAILY}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                    checked={!isEmpty(saleSummaryMail) && isDaily}
                    onChange={handleUpdate}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep8"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                      Weekly
                    </Typography>
                    <Typography variant="body2">
                      Enable to receive weekly sale notifications in mail
                    </Typography>
                  </Box>
                  <Stack
                    flexDirection={'column'}
                    sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
                  >
                    {/* TODO: we will enable future */}
                    {/* <Switch
              name={NOTIFICATION_CONFIGURATIONS.WEEKLY}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
                mx: 1.35,
              }}
              checked={isWeekly}
              onChange={handleUpdate}
            /> */}
                    <Tooltip title="COMING SOON">
                      <UpcomingIcon
                        sx={{ mx: 3, width: 30, height: 30, color: theme.palette.primary.main }}
                      />
                    </Tooltip>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep8"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                      Monthly
                    </Typography>

                    <Typography variant="body2">
                      Enable to receive monthly sale notifications in mail
                    </Typography>
                  </Box>
                  <Stack
                    flexDirection={'column'}
                    sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
                  >
                    {/* TODO: we will enable future */}
                    {/* <Switch
              name={NOTIFICATION_CONFIGURATIONS.MONTHLY}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
                mx: 1.35,
              }}
              checked={isMonthly}
              onChange={handleUpdate}
            /> */}
                    <Tooltip title="COMING SOON">
                      <UpcomingIcon
                        sx={{ mx: 3, width: 30, height: 30, color: theme.palette.primary.main }}
                      />
                    </Tooltip>
                  </Stack>
                </Stack>
              </Grid>

              {/* <Grid item xs={12} sm={6}>
            <Stack
              className="settingConfigStep8"
              mb={2}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                  Tables
                </Typography>

                <Typography variant="body2">Enable to allow table </Typography>
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
                    mx: 1.35,
                  }}
                  checked={isTable}
                  onChange={handleTableMode}
                />
              </Stack>
            </Stack>
          </Grid> */}

              <Box>
                <Divider />
              </Box>
            </Grid>
          </Card>
          <Card sx={{ p: 1, my: 1, mx: 0.5, mb: 2, pt: 3 }}>
            <Stack flexDirection={'row'} alignItems="center">
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '17px' }}>
                End shift summary
              </Typography>
              {enabledEndShiftForEmail && (
                <Button
                  sx={{ ml: 2 }}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setOpenEndShiftContactsForEmail(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </Stack>

            <Grid container>
              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep7"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2">
                      Enable to receive end shift notifications in mail
                    </Typography>
                  </Box>
                  <Switch
                    name={NOTIFICATION_CONFIGURATIONS.DAILY}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                    checked={enabledEndShiftForEmail}
                    onChange={handleEndSummaryForEmail}
                  />
                </Stack>
              </Grid>

              <Box>
                <Divider />
              </Box>
            </Grid>
          </Card>
          <Divider />
        </Box>
      )}

      {/* hhhhjjjjjj */}

      {isWhatsapp && (
        <Box sx={{ my: 2 }}>
          <Card sx={{ p: 1, my: 1, mx: 0.5, mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 700, fontSize: '17px' }}>
              Sale summary
            </Typography>
            <Grid container>
              {/* <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep7"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                      Hourly
                      {enabledhourlyForWhatsapp && (
                        <Button
                          sx={{ ml: 2 }}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setOpenhourlyContactsForWhatsapp(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </Typography>
                    <Typography variant="body2">
                      Enable to receive hourly sale notifications in whatsapp
                    </Typography>
                  </Box>
                  <Switch
                    name={NOTIFICATION_CONFIGURATIONS.DAILY}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                    checked={enabledhourlyForWhatsapp}
                    onChange={handlehourlySummaryForWhatsapp}
                  />
                </Stack>
              </Grid> */}
              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep7"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                      Daily
                      {enableDailyShiftForWhatsapp && (
                        <Button
                          sx={{ ml: 2 }}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setOpenDailyShiftContactsForWhatsapp(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </Typography>
                    <Typography variant="body2">
                      Enable to receive Daily sale notifications in whatsapp
                    </Typography>
                  </Box>
                  <Switch
                    name={NOTIFICATION_CONFIGURATIONS.DAILY}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                    checked={enableDailyShiftForWhatsapp}
                    onChange={handleDailyShiftForWhatsapp}
                  />
                </Stack>

                {!enableDailyShiftForWhatsapp && (
                  <WhatsappNumberDialog
                    open={openDailyShiftContactsForWhatsapp}
                    handleClose={() => {
                      setOpenDailyShiftContactsForWhatsapp(false);
                    }}
                    // handlePostConfiguration={handleUpdateWhatsappDaily}
                    endShiftConfig={{
                      isActive: enableDailyShiftForWhatsapp,
                      contactList: get(whatsappDetails, 'saleNotify.dailyWhatsappNumber', false),
                    }}
                    isLoading={isLoading}
                    handleSubmit={handleUpdateWhatsappDaily}
                    dailySummary={2}
                  />
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep8"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                      Weekly
                    </Typography>

                    <Typography variant="body2">
                      Enable to receive weekly sale notifications in whatsapp
                    </Typography>
                  </Box>
                  <Stack
                    flexDirection={'column'}
                    sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
                  >
                    <Tooltip title="COMING SOON">
                      <UpcomingIcon
                        sx={{ mx: 3, width: 30, height: 30, color: theme.palette.primary.main }}
                      />
                    </Tooltip>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep8"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                      Monthly
                    </Typography>

                    <Typography variant="body2">
                      Enable to receive monthly sale notifications in whatsapp
                    </Typography>
                  </Box>
                  <Stack
                    flexDirection={'column'}
                    sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
                  >
                    <Tooltip title="COMING SOON">
                      <UpcomingIcon
                        sx={{ mx: 3, width: 30, height: 30, color: theme.palette.primary.main }}
                      />
                    </Tooltip>
                  </Stack>
                </Stack>
              </Grid>

              <Box>
                <Divider />
              </Box>
            </Grid>
          </Card>
          <Card sx={{ p: 1, my: 1, mx: 0.5, mb: 2, pt: 3 }}>
            <Stack flexDirection={'row'} alignItems="center">
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '17px' }}>
                End shift summary
              </Typography>
              {enabledEndShiftForWhatsapp && (
                <Button
                  sx={{ ml: 2 }}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setOpenEndShiftContactsForWhatsapp(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </Stack>

            <Grid container>
              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep7"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="start"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2">
                      Enable to receive end shift notifications in whatsapp
                    </Typography>
                    <Typography variant="caption">
                      Charges apply.{' '}
                      <span
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => {
                          navigate(PATH_DASHBOARD.whatsappCredits);
                        }}
                      >
                        Recharge here
                      </span>
                      {isLowBalance && (
                        <span
                          style={{
                            backgroundColor: 'red',
                            color: '#fff',
                            fontWeight: 'bold',
                            width: 120,
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            borderRadius: 7,
                            textAlign: 'center',
                            marginLeft: '5px',
                          }}
                        >
                          Low Balance
                        </span>
                      )}
                    </Typography>
                  </Box>
                  <Switch
                    name={NOTIFICATION_CONFIGURATIONS.DAILY}
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
                  />
                </Stack>

                {whatsappNumberDialogOpen && (
                  <EndShiftContactDialog
                    open={openEndShiftContactsForWhatsapp}
                    handleClose={() => {
                      setOpenEndShiftContactsForWhatsapp(false);
                    }}
                    handlePostConfiguration={handlePostConfigurationForWhatsapp}
                    endShiftConfig={{
                      isActive: enabledEndShiftForWhatsapp,
                      contactList: get(shiftSummaryMsg, 'contactNumber', []),
                    }}
                    isLoading={isLoading}
                    handleSubmit={handleSubmitForWhatsapp}
                  />
                )}
              </Grid>

              <Box>
                <Divider />
              </Box>
            </Grid>
          </Card>
          <Card sx={{ p: 1, my: 1, mx: 0.5, mb: 2, pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 700, fontSize: '17px' }}>
              Low Stock Summary
            </Typography>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep7"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mr: {
                      md: 5,
                      xs: 0,
                    },
                  }}
                >
                  <Box>
                    <Stack flexDirection={'row'} alignItems="center">
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                        Product low stock (Hourly)
                      </Typography>
                      {enabledlowstockForWhatsapp && (
                        <Button
                          sx={{ ml: 2 }}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setOpenLowstockContactsForWhatsapp(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="body2">
                      Enable to receive product notifications in whatsapp
                    </Typography>
                    <Typography variant="caption">
                      Charges apply.{' '}
                      <span
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => {
                          navigate(PATH_DASHBOARD.whatsappCredits);
                        }}
                      >
                        Recharge here
                      </span>
                      {isLowBalance && (
                        <span
                          style={{
                            backgroundColor: 'red',
                            color: '#fff',
                            fontWeight: 'bold',
                            width: 120,
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            borderRadius: 7,
                            textAlign: 'center',
                            marginLeft: '5px',
                          }}
                        >
                          Low Balance
                        </span>
                      )}
                    </Typography>
                  </Box>
                  <Switch
                    name={NOTIFICATION_CONFIGURATIONS.DAILY}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                    checked={enabledlowstockForWhatsapp}
                    onChange={handleLowSummaryForWhatsapp}
                  />
                </Stack>

                {whatsappNumberDialogOpen && (
                  <WhatsappNumberDialog
                    open={whatsappNumberDialogOpen}
                    onClose={() => {
                      setWhatsappNumberDialogOpen(false);
                    }}
                    onSubmit={(value) => {
                      if (!RegexValidation.PHONE_NUMBER.test(value)) {
                        toast.error(ErrorConstants.INVALID_WHATSAPP_NUMBER);
                        return;
                      }
                      handleUpdateWhatsappDaily(value);
                    }}
                  />
                )}
              </Grid>
              <Box>
                <Divider />
              </Box>

              <Grid item xs={12} sm={6}>
                <Stack
                  className="settingConfigStep8"
                  mb={2}
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Stack flexDirection={'row'} alignItems="center">
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                        Raw material low stock (Hourly)
                      </Typography>
                      {enabledrawmaterialForWhatsapp && (
                        <Button
                          sx={{ ml: 2 }}
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setOpenRawmaterialContactsForWhatsapp(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                    </Stack>
                    <Typography variant="body2">
                      Enable to receive raw material notifications in whatsapp
                    </Typography>
                    <Typography variant="caption">
                      Charges apply.{' '}
                      <span
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => {
                          navigate(PATH_DASHBOARD.whatsappCredits);
                        }}
                      >
                        Recharge here
                      </span>
                      {isLowBalance && (
                        <span
                          style={{
                            backgroundColor: 'red',
                            color: '#fff',
                            fontWeight: 'bold',
                            width: 120,
                            paddingLeft: '5px',
                            paddingRight: '5px',
                            borderRadius: 7,
                            textAlign: 'center',
                            marginLeft: '5px',
                          }}
                        >
                          Low Balance
                        </span>
                      )}
                    </Typography>
                  </Box>
                  <Switch
                    name={NOTIFICATION_CONFIGURATIONS.DAILY}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                    checked={enabledrawmaterialForWhatsapp}
                    onChange={handlerawmaterialSummaryForWhatsapp}
                  />
                </Stack>

                {whatsappNumberDialogOpen && (
                  <WhatsappNumberDialog
                    open={whatsappNumberDialogOpen}
                    onClose={() => {
                      setWhatsappNumberDialogOpen(false);
                    }}
                    onSubmit={(value) => {
                      if (!RegexValidation.PHONE_NUMBER.test(value)) {
                        toast.error(ErrorConstants.INVALID_WHATSAPP_NUMBER);
                        return;
                      }
                      handleUpdateWhatsappDaily(value);
                    }}
                  />
                )}
              </Grid>
              <Box>
                <Divider />
              </Box>
            </Grid>
          </Card>
          {isWhatsapp && (
            <Card sx={{ p: 1, my: 1, mx: 0.5, mb: 2, pt: 3 }}>
              <Stack flexDirection={'row'} alignItems="center">
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '17px' }}>
                  GST summary
                </Typography>
                {enabledGSTMonthlyForWhatsapp && (
                  <Button
                    sx={{ ml: 2 }}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setOpenGstMonthlyContactsForWhatsapp(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Stack>

              <Grid container>
                <Grid item xs={12} sm={6}>
                  <Stack
                    className="settingConfigStep7"
                    mb={2}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      mr: {
                        md: 5,
                        xs: 0,
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="body2">
                        Enable to receive monthly GST notifications in whatsapp
                      </Typography>
                    </Box>
                    <Switch
                      name={NOTIFICATION_CONFIGURATIONS.DAILY}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.light,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                          backgroundColor: theme.palette.primary.light,
                        },
                        mx: 1.35,
                      }}
                      checked={enabledGSTMonthlyForWhatsapp}
                      onChange={handleGSTMonthlyForWhatsapp}
                    />
                  </Stack>
                </Grid>

                <Box>
                  <Divider />
                </Box>
              </Grid>
            </Card>
          )}
          <Divider />
        </Box>
      )}

      {/* hhhhhh */}

      {/* TODO: we will enable in future */}
      {/* <Box
        sx={{
          pointerEvents: isAuthorizedRoles ? 'default' : 'none',
          mt: 2,
        }}
      >
        <Box>
          <Stack
            className="settingConfigStep5"
            mb={2}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="subtitle1">Review</Typography>
              <Typography variant="body2">
                Enable to receive daily sale notifications in mail
              </Typography>
            </Box>
            <Switch
              name={NOTIFICATION_CONFIGURATIONS.DAILY}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
                mx: 1.35,
              }}
              checked={isReview}
              onChange={handleUpdateisReview}
            />
          </Stack>
          <Divider />
        </Box>
      </Box> */}
      {openDailysaleContactsForEmail && (
        <DailySaleNotificationDialog
          open={openDailysaleContactsForEmail}
          handleClose={handleClose}
          handlePostConfiguration={handlePostConfigurationForSaleEmail}
          endShiftConfig={{
            isActive: saleSummaryMail,
            emailList: saleSummaryMail ? saleSummaryMail.split(',') : [],
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForsaleEmail}
        />
      )}

      {openEndShiftContactsForEmail && (
        <EndShiftEmailDialog
          open={openEndShiftContactsForEmail}
          handleClose={() => {
            setOpenEndShiftContactsForEmail(false);
          }}
          handlePostConfiguration={handlePostConfigurationForEmail}
          endShiftConfig={{
            isActive: enabledEndShiftForEmail,
            emailList: get(shiftSummaryMail, 'email', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForEmail}
        />
      )}

      {openhourlyContactsForWhatsapp && (
        <WhatsappNumberhourlyDialog
          open={openhourlyContactsForWhatsapp}
          handleClose={() => {
            setOpenhourlyContactsForWhatsapp(false);
          }}
          handlePostConfiguration={handlePostConfigurationForEmail}
          endShiftConfig={{
            isActive: enabledhourlyForWhatsapp,
            contactList: get(hourlySummaryMsg, 'contactNumber', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForhourlyWhatsapp}
        />
      )}

      {openEndShiftContactsForWhatsapp && (
        <EndShiftContactDialog
          open={openEndShiftContactsForWhatsapp}
          handleClose={() => {
            setOpenEndShiftContactsForWhatsapp(false);
          }}
          handlePostConfiguration={handlePostConfigurationForEmail}
          endShiftConfig={{
            isActive: enabledEndShiftForWhatsapp,
            contactList: get(shiftSummaryMsg, 'contactNumber', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForWhatsapp}
          dailySummary={5}
        />
      )}

      {enableDailyShiftForWhatsapp && (
        <WhatsappNumberDialog
          open={openDailyShiftContactsForWhatsapp}
          handleClose={() => {
            setOpenDailyShiftContactsForWhatsapp(false);
          }}
          // handlePostConfiguration={handleUpdateWhatsappDaily}
          endShiftConfig={{
            isActive: enableDailyShiftForWhatsapp,
            contactList: get(whatsappDetails, 'saleNotify.dailyWhatsappNumber', false),
          }}
          isLoading={isLoading}
          handleSubmit={handleUpdateWhatsappDaily}
          dailySummary={2}
        />
      )}

      {openGstMonthlyContactsForWhatsapp && (
        <GSTsummaryContactdialog
          open={openGstMonthlyContactsForWhatsapp}
          handleClose={() => {
            setOpenGstMonthlyContactsForWhatsapp(false);
          }}
          handlePostConfiguration={handlePostConfigurationForEmail}
          endShiftConfig={{
            isActive: enabledGSTMonthlyForWhatsapp,
            contactList: get(monthlyGST, 'contactNumber', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitGSTMonthlyForWhatsapp}
        />
      )}

      {openLowstockContactsForWhatsapp && (
        <Lowstockproductcontactdialog
          open={openLowstockContactsForWhatsapp}
          handleClose={() => {
            setOpenLowstockContactsForWhatsapp(false);
          }}
          handlePostConfiguration={handlePostlowstockForWhatsapp}
          endShiftConfig={{
            isActive: enabledlowstockForWhatsapp,
            contactList: get(productSummaryMsg, 'contactNumber', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForWhatsappLow}
        />
      )}

      {openRawmaterialContactsForWhatsapp && (
        <Lowstockrawmaterialcontactdialog
          open={openRawmaterialContactsForWhatsapp}
          handleClose={() => {
            setOpenRawmaterialContactsForWhatsapp(false);
          }}
          handlePostConfiguration={handlePostlowstockForWhatsapp}
          endShiftConfig={{
            isActive: enabledrawmaterialForWhatsapp,
            contactList: get(rawmateriallowStockMsg, 'contactNumber', []),
          }}
          isLoading={isLoading}
          handleSubmit={handleSubmitForRawmaterial}
        />
      )}

      <TakeATourWithJoy config={SettingsTourPrintModeConfiguration} />
    </Box>
  );
}
