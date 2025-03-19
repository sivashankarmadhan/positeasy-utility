import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  useTheme,
  Switch,
  Divider,
  Grid,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CustomCodeView from 'src/components/CustomCodeView';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import { ROLES_DATA, SettingsSections } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RouterConstants from 'src/constants/RouterConstants';
import { SettingTourCustom } from 'src/constants/TourConstants';
import { SelectedSection } from 'src/global/SettingsState';
import {
  allConfiguration,
  allEbillConfiguration,
  billingState,
  currentStoreId,
  currentTerminalId,
} from 'src/global/recoilState';
import AddCustomCode from 'src/sections/Settings/CustomCode/AddCustomCode';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import AddEbillPrintInformation from 'src/components/AddEbillPrintInformation';
import { Link } from 'react-router-dom';

const EBilling = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const [isBillingState, setIsBillingState] = useRecoilState(billingState);
  // const eBillPrintMode = get(configuration, 'saveEbillPrint', false);
  const [isEnablePrint, setIsEnablePrint] = useState(false);
  const [openInformation, setOpenInformation] = useState(false);
  const [isOrderBillState, setIsOrderBillState] = useState(false);
  const [ebillConfig, setEbillConfig] = useState({});
  const setSection = useSetRecoilState(SelectedSection);
  const location = useLocation();
  const [customCodes, setCustomCodes] = useState([]);
  const [eBillconfiguration, setEBillconfiguration] = useState();
  const [customCodeMode, setCustomCodeMode] = useState(false);
  const [editCustomCode, setEditCustomCode] = useState({});
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [isOpenAddCustomCodeModal, setIsOpenAddCustomCodeModal] = useState(false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole;
  const closeCustomCodeModal = () => {
    setEditCustomCode({});
    setIsOpenAddCustomCodeModal(false);
    if (!customCodes?.length) {
      setCustomCodeMode(false);
    }
  };
  const shopName = AuthService.getShopName();

  const handleOpenPrintInformation = () => {
    setOpenInformation(true);
  };
  const handleClosePrintInformation = () => {
    setOpenInformation(false);
  };

  const customCode = get(configuration, 'customCode', true);

  const initialFetch = async () => {
    // if (!currentStore && !currentTerminal) return;
    try {
      // const resp = await SettingServices.getConfiguration();
      const customCodesDetails = await SettingServices.getEbillSetting();
      console.log('customCodesDetails', customCodesDetails);
      setEBillconfiguration(customCodesDetails?.data?.ebillSettings);
      setEbillConfig(customCodesDetails?.data?.ebillSettings?.ebillInfo);
      setIsBillingState(customCodesDetails?.data?.ebillSettings?.isEbill);
      setIsOrderBillState(customCodesDetails?.data?.ebillSettings?.isOrderBill);
      // resp && setCustomCodes(get(customCodesDetails, 'data', [])); isEbill

      // if (resp) {
      //   if (isEnableSwitchMode) {
      //     setCustomCodeMode(true);
      //   } else {
      //     setConfiguration({
      //       ...(configuration || {}),
      //       ...(get(resp, 'data.0') || {}),
      //     });
      //     setCustomCodeMode(get(resp, 'data.0.customCode', false));
      //   }
      // }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    initialFetch();
  }, []);

  useEffect(() => {
    if (location?.state?.isEnableSwitchMode) {
      setIsOpenAddCustomCodeModal(true);
      setSection(SettingsSections[2].path);
    }
  }, [location]);
  const reviewLink = get(ebillConfig, 'reviewLink', '');
  const handlePostEbillOrderBill = async () => {
    try {
      setIsOrderBillState(!isOrderBillState);
      const options = {
        ebillSettings: { ...eBillconfiguration, isOrderBill: !isOrderBillState },
      };
      console.log('options', options, isOrderBillState);
      await SettingServices.sendEbillPrint(options);

      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  console.log('isBillingState', isBillingState);
  const handlePostEbillData = async () => {
    try {
      setIsBillingState(!isBillingState);
      const options = {
        ebillSettings: { isEbill: !isBillingState },
      };
      await SettingServices.sendEbillPrint(options);

      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  console.log('configuration', configuration);
  const onSubmitPrintInformation = async (data, reset) => {
    console.log('data', data);
    try {
      // const printerInfo = get(
      //   configuration,
      //   'printInfo.paperSize',
      //   PRINT_CONSTANT.POS_BLUETOOTH_80MM
      // );

      // const printType = get(configuration, 'printType', PRINT_CONSTANT.POS);
      // const printMode = get(configuration, 'savePrint', false);

      // const options = {
      //   savePrint: printMode,
      //   printType: printType,
      //   printInfo: {
      //     ...PrintInfoInConfig,
      //     paperSize: printerInfo,
      //     printInformation: data,
      //   },
      // };
      const options = {
        ebillSettings: {
          isEbill: isBillingState,
          ebillInfo: {
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
      await SettingServices.sendEbillPrint(options);
      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      handleClosePrintInformation();
      // reset();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    initialFetch();
  }, [currentTerminal, currentStore]);
  console.log('reviewLink', ebillConfig);
  //   const handleChangeCustomCodeMode = (e) => {
  //     handlePostCustomCodeMode();
  //   };

  return (
    <>
      <Stack
        sx={{
          gap: 2,
          width: '100%',
        }}
      >
        {/* <Card
          sx={{
            mb: 3,
            pl: 3,
            mx: 1,
            my: {
              xs: 2,
              md: 2,
            },
            pt: 1,
            // minHeight: 'calc(100vh - 270px)',
            xs: { width: 370 },
          }}
        >
          <Stack
            className="settingConfigStep2"
            mb={2}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                E-bill mode
              </Typography>

              <Typography variant="body2">Print your E-billing receipt everytime.</Typography>
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

                  justifySelf: 'flex-end',
                }}
                size="large"
                checked={isBillingState}
                onChange={handlePostEbillData}
              />
            </Stack>
          </Stack>
        </Card>

        <Divider />

        {isBillingState && (
          <Card
            sx={{
              mb: 3,
              pl: 3,
              mx: 1,
              my: {
                xs: 2,
                md: 2,
              },
              pt: 1,
              // minHeight: 'calc(100vh - 270px)',
              xs: { width: 370 },
            }}
          >
            <Stack
              className="settingConfigStep2"
              mb={2}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                  Send E-bill
                </Typography>

                <Typography variant="body2">Send E-bill to Customers </Typography>
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
                  checked={isOrderBillState}
                  onChange={handlePostEbillOrderBill}
                />
              </Stack>
            </Stack>
          </Card>
        )} */}
        {/* {isBillingState && ( */}
        {!isMobile ? (
          <Stack>
            <Box sx={{ borderRadius: '12px', p: isMobile?0:2 }}>
              <Stack mb={2} flexDirection="column">
                <Stack flexDirection={'row'} justifyContent={'space-between'} sx={{ mb: 1 }}>
                  <Typography variant="h6">E-bill Information</Typography>
                  {/* <Button size="small" onClick={handleOpenPrintInformation} variant="contained">
                    Add/Update
                  </Button> */}
                </Stack>

                <Stack gap={1}>
                  {/* <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">Shop name</Typography>
                    <Typography>{get(ebillConfig, 'shopName') || shopName}</Typography>
                  </Stack> */}
                  {/* <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">Address</Typography>
                    <Typography>{get(ebillConfig, 'address', '-')}</Typography>
                  </Stack> */}
                  {/* <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">Contact Number</Typography>
                    <Typography>{get(ebillConfig, 'contactNumber', '-')}</Typography>
                  </Stack> */}
                  {/* <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">GST</Typography>
                    <Typography>{get(ebillConfig, 'gst', '-')}</Typography>
                  </Stack> */}
                  {/* <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">Review Link</Typography>
                    <Typography>
                      <a href={reviewLink} target="_blank">
                        {get(ebillConfig, 'reviewChannel', '-')}
                      </a>
                    </Typography>
                  </Stack> */}
                  {/* <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">Footer</Typography>
                    <Typography>{get(ebillConfig, 'footer', '-')}</Typography>
                  </Stack> */}
                  {/* <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Typography variant="subtitle1">T & C</Typography>
                    <Typography>{get(ebillConfig, 'tandc', '-')}</Typography>
                  </Stack> */}
                  <Box>
                  
                <AddEbillPrintInformation
                  open={openInformation}
                  handleClose={handleClosePrintInformation}
                  onSubmitPrintInformation={onSubmitPrintInformation}
                  // printInformationData={printInformationData}
                  ebillConfig={ebillConfig}
                />
                  </Box>
                    
                </Stack>
              </Stack>
            </Box>
            <Grid
            item
            xs={12}
            sm={12}
            md={12}
            sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2,}}
            >
              <Stack
                className="settingConfigStep2"
                mb={2}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
               
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                    E-bill on order
                  </Typography>

                  <Typography variant="body2">
                    Send E-bill to customers during billing time{' '}
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
                      mx: 1.35,
                    }}
                    checked={eBillconfiguration?.isOrderBill}
                    onChange={handlePostEbillOrderBill}
                  />
                </Stack>
              </Stack>
            </Grid>
          </Stack>
        ) : (
          <Stack>
            <Box >
              <Stack mb={2} flexDirection="column">
                <Stack flexDirection={'row'} justifyContent={'space-between'} sx={{ mb: 1 }}>
                  <Typography variant="h6">E-bill Information</Typography>
                </Stack>
              </Stack>

                <AddEbillPrintInformation
                  open={openInformation}
                  handleClose={handleClosePrintInformation}
                  onSubmitPrintInformation={onSubmitPrintInformation}
                  ebillConfig={ebillConfig}
                />
            </Box>
            <Grid
            item
            xs={12}
            sm={12}
            md={12}
            sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2, mt: 2 }}
            >
              <Stack
                className="settingConfigStep2"
                mb={2}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                    E-bill on order
                  </Typography>

                  <Typography variant="body2">
                    Send E-bill to customers during billing time{' '}
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
                      mx: 1.35,
                    }}
                    checked={eBillconfiguration?.isOrderBill}
                    onChange={handlePostEbillOrderBill}
                  />
                </Stack>
              </Stack>
            </Grid>
          </Stack>
        )}

      </Stack>
    </>
  );
};

export default EBilling;
