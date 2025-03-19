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
import { find, get, groupBy, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useSetRecoilState } from 'recoil';
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
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { StoresTourConfig } from 'src/constants/TourConstants';
import { alertDialogInformationState, stores } from 'src/global/recoilState';
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
import { useNavigate } from 'react-router-dom';
import { PATH_AUTH } from 'src/routes/paths';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ManageStoreEditAccessDialog from 'src/components/ManageStoreEditAccessDialog';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

// ----------------------------------------------------------------------

export default function Managers() {
  const theme = useTheme();
  const currentRole = AuthService.getCurrentRoleInLocal();

  const [storesData, setStoresData] = useState([]);
  const setTerminalStoresData = useSetRecoilState(stores);
  const groupedStoresData = groupBy(storesData, 'storeId');
  const { themeStretch } = useSettingsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [openAddTerminalDialog, setOpenAddTerminalDialog] = useState(false);
  const [openManageAccessDialog, setOpenManageAccessDialog] = useState(false);
  const [openAddStoresDialog, setOpenAddStoresDialog] = useState(false);
  const [openSettingsTerminalDialog, setOpenSettingsTerminalDialog] = useState(false);
  // const storeLabelList = map(groupedStoresData, (terminal, store) => store);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedTerminal, setSelectedTerminal] = useState({});
  const [openDeleteTerminalDialog, setOpenDeleteTerminalDialog] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);

  const [editManagerDetails, setEditManagerDetails] = useState({});

  // console.log('storeLabelList', storeLabelList);

  const [storeList, setStoreList] = useState([]);

  const isMobile = useMediaQuery('(max-width:800px)');

  const navigate = useNavigate();

  const isMasterManager =
    currentRole === ROLES_DATA.master.role ||
    currentRole === ROLES_DATA.store_manager.role ||
    currentRole === ROLES_DATA.manager_and_staff.role;

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
  const copyToClipboardText = async (text) => {
    if (window.navigator.userAgent.includes(USER_AGENTS.REACT_NATIVE)) {
      try {
        const response = await copyToClipboardReactNative(text);
        if (response === 'Copied') toast.success(SuccessConstants.COPIED);
      } catch (e) {
        toast.error(e?.errorResponse?.message || ErrorConstants.UNABLE_TO_COPY);
      }
    } else {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(
        () => {
          toast.success(SuccessConstants.COPIED);
        },
        (err) => {
          toast.error(err?.errorResponse?.message || ErrorConstants.UNABLE_TO_COPY);
        }
      );
    }
  };
  const handleOpenAddTerminalDialog = () => {
    setOpenAddTerminalDialog(true);
  };
  const handleCloseAddTerminalDialog = () => {
    setOpenAddTerminalDialog(false);
  };
  const handleOpenManageAccessDialog = () => {
    setOpenManageAccessDialog(true);
  };
  const handleCloseManageAccessDialog = () => {
    setOpenManageAccessDialog(false);
  };
  const handleOpenAddStoresDialog = () => {
    setOpenAddStoresDialog(true);
  };
  const handleCloseAddStoresDialog = () => {
    setOpenAddStoresDialog(false);
  };
  const handleOpenSettingsTerminalDialog = (e) => {
    setSelectedTerminal(e);
    setOpenSettingsTerminalDialog(true);
  };
  const handleCloseSettingsTerminalDialog = () => {
    setSelectedTerminal({});
    setOpenSettingsTerminalDialog(false);
  };

  const handleOpenDeleteUnpaidTerminal = (e) => {
    setSelectedTerminal(e);
    setOpenDeleteTerminalDialog(true);
  };
  const handleCloseDeleteUnpaidTerminal = () => {
    setSelectedTerminal({});
    setOpenDeleteTerminalDialog(false);
  };

  const getTerminalStores = async () => {
    try {
      setIsLoading(true);
      const response = await STORES_API.getStoresMaster(selectedStore);
      setTerminalStoresData(get(response, 'data'));
      ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const getStores = async () => {
    try {
      setIsLoading(true);
      const response = await STORES_API.getManagerAllDetails(selectedStore);
      setStoresData(get(response, 'data'));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const getStoreList = async () => {
    try {
      setIsLoading(true);
      const response = await STORES_API.getManagerAllList();
      setStoreList(get(response, 'data'));
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStoreList();
  }, []);

  const getStoreName = (storeId) => {
    const terminals = find(storeList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  useEffect(() => {
    if (selectedStore) {
      getStores();
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

  const logoutFn = async () => {
    toast.success(SuccessConstants.LOGOUT);
    AuthService.logout();
    window.location.reload();
    navigate(PATH_AUTH.login, { replace: true });
  };

  const handleRemoveManagerAccount = async (data) => {
    try {
      if (isManager) {
        await Auth_API.removeManagerAccountFromManager({
          terminalNumber: get(data, 'terminalNumber'),
          storeId: get(data, 'storeId'),
        });
        AuthService._billingLogout();
        logoutFn();
      } else {
        await Auth_API.removeManagerAccount({
          terminalNumber: get(data, 'terminalNumber'),
          storeId: get(data, 'storeId'),
        });
        toast.success(SuccessConstants.REMOVED_MANAGER_ACCOUNT_SUCCESSFULLY);
        getStores();
        getTerminalStores();
      }
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleRemoveManagerAccountWithAlert = (data) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to remove manager account ${
        isManager ? 'If so, This session will be logout' : ''
      }?`,
      actions: {
        primary: {
          text: 'yes',
          onClick: (onClose) => {
            handleRemoveManagerAccount(data);
            onClose();
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

  if (isLoading) return <LoadingScreen />;

  const AddAndSwitchStoreContent = () => {
    return (
      <Stack
        flexDirection={'row'}
        sx={{
          display: 'flex',
          alignItems: 'center',
          // position: 'absolute',
          top: 10,
          left: 0,
          zIndex: 99,
          width: '100%',
          py: 2,
          gap: 1,
        }}
      >
        <Autocomplete
          sx={{ width: '90%' }}
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

        {currentRole === ROLES_DATA.master.role && (
          <Tooltip title={'Add new stores'}>
            <IconButton
              className="storesStep2"
              sx={{
                color: theme.palette.primary.main,
                '&:disabled': { color: theme.palette.grey[400], pointerEvents: 'auto' },
              }}
              onClick={() => handleOpenAddStoresDialog()}
            >
              <AddBusinessIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        )}
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
            flexDirection={'row'}
            sx={{ gap: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {isMobile && renderBackIcon()}
            <Typography variant="h6">{`${getStoreName(selectedStore)}`}</Typography>
            {/* <StoreMonitorViewToggle /> */}
          </Stack>{' '}
          {(currentRole === ROLES_DATA.master.role ||
            currentRole === ROLES_DATA.store_manager.role) && (
            <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isManager && !isEmpty(selectedStore ? groupedStoresData[selectedStore] : []) && (
                <Tooltip title={'Manager account'}>
                  <IconButton
                    className="storesStep3"
                    onClick={() => handleOpenManageAccessDialog()}
                    sx={{
                      color: theme.palette.primary.main,
                      width: 50,
                      height: 50,
                      '&:disabled': { color: theme.palette.grey[400], pointerEvents: 'auto' },
                      display: selectedStore ? 'block' : 'none',
                    }}
                  >
                    <AdminPanelSettingsIcon fontSize="large" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}
        </Stack>
        <Grid
          container
          spacing={2}
          sx={{ gap: 1, overflow: 'auto', mt: 7, ...hideScrollbar, p: 0.2 }}
        >
          {map(selectedStore ? groupedStoresData[selectedStore] : [], (e) => (
            <Grid
              className="storesStep5"
              item
              xs={12}
              sm={12}
              md={5.9}
              lg={5.9}
              xl={3.9}
              sx={{ pt: 2 }}
            >
              {console.log('groupedStoresData', groupedStoresData)}
              {console.log('check', e)}
              <Card
                sx={{
                  minWidth: 150,
                  minHeight: 160,
                  px: 2,
                  py: 1,
                  border: get(e, 'roleId') === ROLES_DATA.master.id ? 0.2 : 0,
                  borderColor: theme.palette.primary.main,
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    flexDirection={'row'}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ pt: 0.3, mr: 0.6 }}>
                        {get(e, 'terminalName') || get(e, 'terminalId') || get(e, 'terminalStatus')}
                      </Typography>

                      <FilterPopOver
                        IconStyle={{
                          display: get(e, 'keyVerified') ? '' : 'none',
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
                              mt: 0.5,
                            }}
                          />
                        }
                        sx={{ overflow: 'hidden' }}
                      >
                        <Typography sx={{ fontWeight: 'bold', pt: 1, pl: 1 }}>Info</Typography>
                        <MenuItem>
                          <Stack
                            flexDirection={'column'}
                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                          >
                            <Typography variant="body2">Terminal Type:</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                              {TerminalTypeLabels[get(e, 'terminalType')] || '-'}
                            </Typography>
                          </Stack>
                        </MenuItem>
                        <Divider />
                        <MenuItem>
                          <Stack
                            flexDirection={'column'}
                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                          >
                            <Typography variant="body2">App Type:</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                              {get(e, 'appType') || '-'}
                            </Typography>
                          </Stack>
                        </MenuItem>
                        <Divider />
                        <MenuItem>
                          <Stack
                            flexDirection={'column'}
                            sx={{ display: 'flex', justifyContent: 'space-between' }}
                          >
                            <Typography variant="body2">Active on:</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                              {get(e, 'deviceInfo') || '-'}
                            </Typography>
                          </Stack>
                        </MenuItem>
                      </FilterPopOver>
                    </Stack>

                    <Stack direction={'row'} gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 'bold', color: 'text.secondary', ml: 1 }}
                      >
                        {get(ROLES_DATA_ID[get(e, 'roleId')], 'label')}
                      </Typography>
                      {get(e, 'terminalStatus') === TERMINAL_STATUS.UNPAID && (
                        <Tooltip title="Delete unpaid terminal">
                          <DeleteForeverIcon
                            onClick={() => handleOpenDeleteUnpaidTerminal(e)}
                            color="error"
                            sx={{ cursor: 'pointer' }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                    <Tooltip title={'Click to setup Terminal Settings'}>
                      <IconButton
                        sx={{ color: theme.palette.primary.main, display: 'none' }} //Enable Terminalwise setting api when done
                        onClick={() => handleOpenSettingsTerminalDialog(e)}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Stack
                    flexDirection={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="caption">Name</Typography>
                    {get(e, 'name') ? (
                      <Stack
                        flexDirection={'row'}
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          px: 1,
                          py: 0.3,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon
                          sx={{
                            fontSize: '16px',
                            color: theme.palette.common.white,
                            mr: 0.5,
                          }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '10px',
                            color: theme.palette.common.white,
                          }}
                        >
                          {get(e, 'name')?.toUpperCase() ?? '-'}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '10px',
                          alignItems: 'center',
                        }}
                      >
                        -
                      </Typography>
                    )}
                  </Stack>

                  <Stack
                    flexDirection={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
                  >
                    <Typography variant="caption">Terminal</Typography>
                    <Typography variant="caption" color={theme.palette.primary.main}>
                      {get(e, 'terminalNumber') || '-'}
                    </Typography>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
                  >
                    <Typography variant="caption">Status</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        border: 1,
                        px: 1,
                        borderRadius: 2,
                        backgroundColor:
                          TERMINAL_STATUS_COLORS[get(e, 'terminalStatus')] ||
                          TERMINAL_STATUS_COLORS.DEFAULT,
                        color: theme.palette.common.white,
                        fontWeight: 'bold',
                      }}
                    >
                      {get(e, 'terminalStatus') || '-'}
                    </Typography>
                  </Stack>

                  <Stack flexDirection="row" justifyContent="flex-end">
                    {get(e, 'terminalStatus') === TERMINAL_STATUS.MONITOR && (
                      <Tooltip title="Click to remove the account">
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ width: 150 }}
                          onClick={() => {
                            handleRemoveManagerAccountWithAlert(e);
                          }}
                          // sx={{ border: 1, borderColor: theme.palette.primary.main }}
                          startIcon={<CancelPresentationIcon color="error" fontSize="small" />}
                        >
                          Remove account
                        </Button>
                      </Tooltip>
                    )}

                    <Button
                      size="small"
                      variant="outlined"
                      // disabled
                      sx={{ width: isMobile ? 80 : 120, ml: 1 }}
                      onClick={() => {
                        setEditManagerDetails(e);
                      }}
                      startIcon={
                        get(e, 'multiAccessId')?.length === 1 ? (
                          <PersonIcon color="success" fontSize="small" />
                        ) : (
                          <PeopleAltIcon color="success" fontSize="small" />
                        )
                      }
                    >
                      {isMobile ? 'Edit' : 'Edit access'}
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
        {/* {isEmpty(selectedStore ? groupedStoresData[selectedStore] : []) && (
          <Stack
            sx={{
              height: 'calc(100vh - 100px)',
            }}
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            <Typography>No manager found</Typography>
          </Stack>
        )} */}

        {isEmpty(selectedStore ? groupedStoresData[selectedStore] : []) && (
          <Tooltip title="Click to add new manager">
            <Stack
              className="managerStep1"
              onClick={() => handleOpenManageAccessDialog()}
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
              <AdminPanelSettingsIcon fontSize="large" />
              <Typography noWrap>Create new Manager</Typography>
            </Stack>
          </Tooltip>
        )}
      </Stack>
    );
  };

  const storeCard = () => {
    return (
      <Grid container sx={{ pt: 0, gap: 1, overflow: 'auto', ...hideScrollbar }}>
        {map(storeList, (e) => (
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
            <Tooltip title={`Click to select ${e?.storeName}`}>
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
                    {e?.storeName || '-'}
                  </Typography>
                  {/* <Typography variant="caption">{e}</Typography> */}
                </Stack>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    );
  };

  const storeHeader = () => {
    return (
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
          flexDirection={'row'}
          sx={{ gap: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          {isMobile && renderBackIcon()}
          <Typography variant="h6">{`${getStoreName(selectedStore)}`}</Typography>
          {/* <StoreMonitorViewToggle /> */}
        </Stack>{' '}
        {(currentRole === ROLES_DATA.master.role ||
          currentRole === ROLES_DATA.store_manager.role) && (
          <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={'Manager account'}>
              <IconButton
                className="storesStep3"
                onClick={() => handleOpenManageAccessDialog()}
                sx={{
                  color: theme.palette.primary.main,
                  width: 50,
                  height: 50,
                  '&:disabled': { color: theme.palette.grey[400], pointerEvents: 'auto' },
                  display: selectedStore ? 'block' : 'none',
                }}
              >
                <AdminPanelSettingsIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title={'Add terminal'}>
              <IconButton
                className="storesStep4"
                onClick={() => handleOpenAddTerminalDialog()}
                sx={{
                  color: theme.palette.primary.main,
                  width: 50,
                  height: 50,
                  '&:disabled': { color: theme.palette.grey[400], pointerEvents: 'auto' },
                  display: selectedStore ? 'block' : 'none',
                }}
              >
                <QueuePlayNextTwoToneIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
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

          <TerminalAddDialog
            selectedStore={selectedStore}
            open={openAddTerminalDialog}
            handleClose={handleCloseAddTerminalDialog}
            getStores={getStores}
          />
          <StoresAddDialog
            open={openAddStoresDialog}
            storeLabelList={map(storeList, (_item) => get(_item, 'storeId'))}
            getStores={() => {
              getStoreList();
              getTerminalStores();
            }}
            handleClose={handleCloseAddStoresDialog}
            storeList={storeList}
            setStoreList={setStoreList}
          />
          <ManageStoreAccessDialog
            selectedStore={selectedStore}
            open={openManageAccessDialog}
            handleClose={handleCloseManageAccessDialog}
            getStores={() => {
              getStores();
              getTerminalStores();
            }}
            storeList={storeList}
          />
          <ManageStoreEditAccessDialog
            selectedStore={selectedStore}
            open={!isEmpty(editManagerDetails)}
            handleClose={() => {
              setEditManagerDetails({});
            }}
            getStores={() => {
              getStores();
              getTerminalStores();
            }}
            storeList={storeList}
            editManagerDetails={editManagerDetails}
          />
          <DeleteTerminalDialog
            selectedTerminal={selectedTerminal}
            openDeleteTerminalDialog={openDeleteTerminalDialog}
            handleCloseDeleteUnpaidTerminal={handleCloseDeleteUnpaidTerminal}
            getStores={getStores}
          />
        </Stack>
        <Dialog open={openSettingsTerminalDialog}>
          <Card sx={{ p: 2, overflow: 'auto', height: 'calc(100vh - 8rem)', minWidth: '40vw' }}>
            <Typography variant="h6">Terminal Configuration </Typography>

            <Configuration />
          </Card>
        </Dialog>
      </Container>
      <TakeATourWithJoy config={StoresTourConfig} />
    </>
  );
}
