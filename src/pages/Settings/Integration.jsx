import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
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
  alpha,
  Chip,
  Grid,
  useMediaQuery,
} from '@mui/material';
import { get, isEmpty, map, orderBy } from 'lodash';
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
import { allConfiguration, currentStoreId, currentTerminalId } from 'src/global/recoilState';
import AddCustomCode from 'src/sections/Settings/CustomCode/AddCustomCode';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import ViewWejhaDialog from './ViewWejhaDialog';
import Iconify from 'src/components/iconify';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ViewIntegrateDialog from './ViewIntegrateDialog';
import RAW_PRODUCTS_API from 'src/services/rawproducts';
import { alertDialogInformationState } from 'src/global/recoilState';

const Integra = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTab = useMediaQuery('(max-width:900px)');
  const setSection = useSetRecoilState(SelectedSection);
  const location = useLocation();
  const [customCodes, setCustomCodes] = useState([]);
  const [indexValue, setIndexValue] = useState(0);
  const [integrateData, setIntegrateData] = useState({});
  const [integrationValue, setIntegrationValue] = useState({});
  const [integrationName, setIntegrationName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isConfiguredWejha, setIsConfiguredWejha] = useState(true);
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);
  const [isWejhaView, setIsWejhaView] = useState(false);
  const [isIntegrateView, setIsIntegrateView] = useState(false);
  const [customCodeMode, setCustomCodeMode] = useState(false);
  const [editCustomCode, setEditCustomCode] = useState({});
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
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

  const sorted_integrateData = orderBy(integrateData, ['createdAt'], ['asc']) || [];

  console.log('1234', currentStore);
  const customCode = get(configuration, 'customCode', true);
  console.log('currentStoreeeeeee', integrateData);

  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);


  const getIntegration = async () => {
    try {
      const resp = await SettingServices.getIntegration();
      setIsConfiguredWejha(resp?.data[0]?.isIntegrated);
      // const response = await SettingServices.getStoreInventory();
      console.log('resp', resp);
      setIntegrateData(resp?.data);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  console.log('selectedStore', selectedStore);

  useEffect(() => {
    if (selectedStore) {
      getIntegration();
    }
    console.log('selectedStoressss');
  }, [selectedStore]);

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  console.log('integrateData', integrateData);
  const initialFetch = async (isEnableSwitchMode) => {
    if (!currentStore && !currentTerminal) return;
    try {
      const resp = await SettingServices.getConfiguration();
      const customCodesDetails = await SettingServices.getCustomCodesData();
      console.log('customCodesDetails', customCodesDetails, resp);
      resp && setCustomCodes(get(customCodesDetails, 'data', []));

      if (resp) {
        if (isEnableSwitchMode) {
          setCustomCodeMode(true);
        } else {
          setConfiguration({
            ...(configuration || {}),
            ...(get(resp, 'data.0') || {}),
          });
          setCustomCodeMode(get(resp, 'data.0.customCode', false));
        }
      }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handleChangeWejha = async (index) => {
    console.log('isEnableSwitchMode', integrateData[index]?.id);
    try {
      const options = {
        storeId: sorted_integrateData[index]?.storeId,
        id: sorted_integrateData[index]?.id,
      };
      if (sorted_integrateData[index].isIntegrated) {
        await SettingServices.turnOffIntegration(options);
        await getIntegration();
        toast.success(SuccessConstants.TURN_OFF);
      } else {
        await SettingServices.turnOnIntegration(options);
        await getIntegration();
        toast.success(SuccessConstants.TURN_ON);
      }
      // await turnOffIntegration()
      // const resp = await SettingServices.await turnOffIntegration()();
      // const customCodesDetails = await SettingServices.getCustomCodesData();
      // resp && setCustomCodes(get(customCodesDetails, 'data', []));

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

  // useEffect(() => {
  //   initialFetch(location?.state?.isEnableSwitchMode);
  // }, [currentStore]);

  // const handleChangeCustomCodeMode = (e) => {
  //   handlePostCustomCodeMode();
  // };  
   const handleConfirmDelete = async (onClose,item) => {
    setIsLoading(true);
    const id = get(item,"id")
    // const storeId = get(item,"storeId")
    try {
      const response = await RAW_PRODUCTS_API.deleteIntegration(id);
      if(response){ 
      setIsLoading(false);
      setOpenDialog(false); 
      getIntegration();
      onClose();
      toast.success(SuccessConstants.INTEGRATION_DELETE)
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error deleting item:', error);
      toast.error(ErrorConstants.UNABLE_DELETE_INTEGRATION)
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
  };

  const handleDelete = (item) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to delete the Integration ?`,
      actions: {
        primary: {
          text: 'Delete',
          onClick: (onClose) => {
            handleConfirmDelete(onClose,item);
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

  return (
    <Stack>
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
            <Typography variant="h6">Wejha</Typography>
            <Stack flexDirection={'row'} gap={3} alignItems={'center'}><Typography variant="body2">
              Click here to integrate with wejha
            </Typography>
            { isConfiguredWejha && <Button
            // disabled={isEmpty(filterAddQuantityData)}
            onClick={()=> {addIntegration()
              setIsWejhaView(true)}}
            size="small"
            color="primary"
            variant="contained"
          >
            Integrate
          </Button>}</Stack>
          </Box>
          <Switch
            checked={isConfiguredWejha}
            onChange={handleChangeWejha}
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
      </Card> */}

      <Stack flexDirection={'row'} gap={4}>
        <Grid container spacing={3} sx={{ display: 'flex' }}>
          {!isEmpty(sorted_integrateData) &&
            map(sorted_integrateData, (item, index) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    p: 2,
                    width: '100%',
                    // height: isMobile ?'10rem': '16rem',
                    bgcolor: alpha(
                      theme.palette.primary.main,
                      theme.palette.action.selectedOpacity
                    ),
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom={2}
                  >
                    <Box>
                      <Iconify
                        width={'2rem'}
                        height={'2rem'}
                        color={theme.palette.primary.light}
                        icon={'ic:round-integration-instructions'}
                      />
                    </Box>
                    <Stack key={index} flexDirection="row" gap={1} spacing={10} >
          <DeleteOutlineIcon
          edge="end"
            color="error"
            sx={{ cursor: 'pointer',
              position: 'absolute',
              right: 73,
              top: 23
            }}
            onClick={() => {
              handleDelete(item)
              setIntegrationValue(item);
              setIndexValue(index);
            }}
          />
        </Stack>   

                    <Switch
                      checked={sorted_integrateData[index]?.isIntegrated}
                      onChange={() => handleChangeWejha(index)}
                      // disabled
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.light,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                          backgroundColor: theme.palette.primary.light,
                        },
                        // mx: 1.35,
                      }}
                    />
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    flexWrap={'wrap'}
                  >
                    <Stack>
                      <Typography variant="h6">
                        {truncateText(`${sorted_integrateData[index]?.name} Integration`, 30)}{' '}
                      </Typography>
                      <Stack flexDirection={'row'} gap={3}>
                        <Typography variant="body2">
                          {/* Click here to integrate with {sorted_array[index]?.name} */}
                          {truncateText(
                            'Click here to integrate with ' + sorted_integrateData[index]?.name,
                            36
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Button
                    // disabled={isEmpty(filterAddQuantityData)}
                    onClick={() => {
                      setIsWejhaView(true);
                      setIntegrationValue(item);
                      setIndexValue(index);
                    }}
                    size="small"
                    color="primary"
                    variant="contained"
                    sx={{
                      mt: 0.8,
                      visibility: sorted_integrateData[index]?.isIntegrated ? 'visible' : 'hidden',
                    }}
                  >
                    Setup
                  </Button>

                  {/* {isNumber(get(data, "totalAmount")) && (
        <Typography variant="h5">
          {fCurrency(get(data, "totalAmount"))}
        </Typography>
      )}
      {!isNumber(get(data, "totalAmount")) && (
        <Box sx={{ bgcolor: "white", width: "6rem", borderRadius: 2 }}>
          <Typography textAlign="center" variant="body2">
            Contact us
          </Typography>
        </Box>
      )} */}
                </Card>
              </Grid>
            ))}
          <Grid item xs={12} sm={6} md={6} lg={4}>
            <Stack
              // p={2}
              width={'100%'}
              height={'100%'}
              minHeight={'9.5rem'}
            >
              <Stack
                onClick={() => {
                  setIsIntegrateView(true);
                }}
                sx={{
                  p: 2,
                  border: `1px dashed ${theme.palette.primary.light}`,
                  cursor: 'pointer',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  alignItems: 'center',
                  width: '100%',
                  height: '100%',
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
                }}
              >
                <Iconify
                  width={40}
                  height={40}
                  color={`${theme.palette.primary.light}`}
                  icon={'ic:baseline-plus'}
                />
                <Typography
                  variant="body2"
                  sx={{ color: `${theme.palette.primary.light}`, textAlign: 'center' }}
                >
                  Click here to integrate
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      {isWejhaView && (
        <ViewWejhaDialog
          isOpen={isWejhaView}
          integrateData={integrationValue}
          getIntegration={getIntegration}
          indexValue={indexValue}
          configuration={configuration}
          onClose={() => {
            setIsWejhaView(false);
          }}
        />
      )}
      <ViewIntegrateDialog
        isOpen={isIntegrateView}
        integrateData={sorted_integrateData}
        getIntegration={getIntegration}
        integrationName={integrationName}
        configuration={configuration}
        onClose={() => {
          setIsIntegrateView(false);
        }}
      />

      <AddCustomCode
        isOpenAddCustomCodeModal={isOpenAddCustomCodeModal}
        closeCustomCodeModal={closeCustomCodeModal}
        editCustomCode={editCustomCode}
        customCodes={customCodes}
        initialFetch={initialFetch}
      />
      <TakeATourWithJoy config={SettingTourCustom} />
    </Stack>
  );
};

export default Integra;
