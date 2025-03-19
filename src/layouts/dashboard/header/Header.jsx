import PropTypes from 'prop-types';
// @mui
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  AppBar,
  Autocomplete,
  Button,
  Card,
  Chip,
  Dialog,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
// utils
// hooks
import useOffSetTop from '../../../hooks/useOffSetTop';
// config
import { HEADER, NAV } from '../../../config-global';
// components
import Logo from '../../../components/logo';
import { useSettingsContext } from '../../../components/settings';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { find, get, groupBy, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  ALL_CONSTANT,
  hideScrollbar,
  ROLES_DATA,
  ROLES_WITHOUT_STORE_STAFF,
  RouteName,
  SCAN_QR_CONSTANT,
  VendorsAndPurchaseSections,
} from 'src/constants/AppConstants';
import {
  allConfiguration,
  breadcrumbData,
  currentStoreId,
  currentTerminalId,
  isTourOpenState,
  offlineHoldOnListState,
  prevTerminalIdState,
  selectedHoldIdState,
  stores,
  qrCheck,
  cart,
} from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import STORES_API from 'src/services/stores';
import AccountPopover from './AccountPopover';

import StoreMallDirectoryIcon from '@mui/icons-material/StoreMallDirectory';

import MenuIcon from '@mui/icons-material/Menu';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { SettingsSections, ReportAnalyticsSections } from '../../../constants/AppConstants';
import { PATH_DASHBOARD } from '../../../routes/paths';
import RouterConstants from 'src/constants/RouterConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import { ROLE_STORAGE, StorageConstants } from 'src/constants/StorageConstants';
import useExecuteAfterCheck from 'src/hooks/useExecuteAfterCheck';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import getTerminalByStoreId from 'src/helper/getTerminalByStoreId';
import getTerminalsByStoreId from 'src/helper/getTerminalsByStoreId';
import getFirstTerminalIdInAll from 'src/helper/getFirstTerminalId';
import { useParams } from 'react-router';
import SettingServices from 'src/services/API/SettingServices';

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    borderRadius: '50px',
    position: 'relative',
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 13,
    padding: '5px 10px 5px 10px',
    alignItems: 'center',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    width: '7rem',
    // Use the system font instead of the default Roboto font.
    '&:focus': {
      borderRadius: '50px',
      boxShadow: `0 0 0 0.1rem ${theme.palette.primary.light}`,
      backgroundColor: theme.palette.common.white,
    },
  },
  '& .MuiSvgIcon-root': {
    right: '7px',
  },
}));
Header.propTypes = {
  onOpenNav: PropTypes.func,
};

export default function Header({ onOpenNav }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const theme = useTheme();
  const { themeLayout } = useSettingsContext();
  const [storesData, setStoresData] = useRecoilState(stores);
  const [isQrEnable, setIsQrEnable] = useState(false);
  const groupedStoresData = groupBy(storesData, 'storeId');
  const storeLabelList = map(groupedStoresData, (terminal, store) => store);
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);
  let currentLocation = window.location.pathname;

  const setaddOrder = useRecoilState(cart)[1];

  if (currentLocation.includes(Object.values(params)?.[0])) {
    currentLocation = currentLocation.replace(`/${Object.values(params)?.[0]}`, '');
  }

  const topHeader = currentLocation.split('/');
  const currentSelectedRole = AuthService.getCurrentRoleInLocal();
  const topName = topHeader[currentLocation.split('/').length - 1];
  const reportPath = topHeader[currentLocation.split('/').length - 2];
  const [isTourOpen, setIsTourOpen] = useRecoilState(isTourOpenState);
  const [open, setOpen] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(window.navigator.onLine);
  const isDashboardOrReport = topName === 'dashboard' || reportPath === 'report';
  const isCurrentStoreAll = selectedStore === ALL_CONSTANT.ALL;
  const activeLink = useRecoilValue(breadcrumbData);
  const {isQrState} = useRecoilState(qrCheck);
  const setBreadcrumbActiveLink = useSetRecoilState(breadcrumbData);

  console.log('location', location, params);

  const offlineHoldOnList = useRecoilValue(offlineHoldOnListState);
  const [selectedHoldId, setSelectedHoldId] = useRecoilState(selectedHoldIdState);

  const setPrevTerminalId = useSetRecoilState(prevTerminalIdState);

  const executeAfterCheck = useExecuteAfterCheck();

  const configuration = useRecoilState(allConfiguration)[0];


  const featureSettings = get(configuration, 'featureSettings', {});
  const isShowBillng = get(featureSettings, 'isShowBillng', false);


  

  // const getTerminalByStoreId = (storeId) => {
  //   if (!storeId) return [];
  //   const data = find(storesData, (terminal) => terminal.storeId === storeId);
  //   return typeof data === 'object' && !isEmpty(data) ? data.terminalId : data;
  // };

  const [selectedTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);

  // const getTerminalsByStoreId = (storeId) => {
  //   if (!storeId) return [];
  //   const data = filter(
  //     storesData,
  //     (terminal) =>
  //       terminal.storeId === storeId && terminal.terminalStatus !== TERMINAL_STATUS.MONITOR
  //   );
  //   return data;
  // };

  function getPathName(path) {
    console.log('pathhhhhh', path);
    let sections = [];
    switch (reportPath) {
      case 'report':
        sections = ReportAnalyticsSections;
        break;
      default:
        sections = SettingsSections;
        break;
    }
    const pathObject = find([...sections, ...VendorsAndPurchaseSections], (item) => {
      return get(item, 'path') === path;
    });

    setBreadcrumbActiveLink(get(pathObject, 'title') || get(pathObject, 'name'));
  }

  const isNavHorizontal = themeLayout === 'horizontal';
  const isMasterManager =
    currentSelectedRole === ROLES_DATA.master.role ||
    currentSelectedRole === ROLES_DATA.store_manager.role ||
    currentSelectedRole === ROLES_DATA.manager_and_staff.role;
  const isNavMini = themeLayout === 'mini';

  const isDesktop = useMediaQuery('(min-width:1200px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTab = useMediaQuery('(max-width:980px)');
  const isOffset = useOffSetTop(HEADER.H_DASHBOARD_DESKTOP) && !isNavHorizontal;

  const { pathname } = location;

  const isSettingScreen = location?.pathname?.includes?.('/settings/');

  const billingPath = PATH_DASHBOARD.sale.billing;
  const viewBillingPath = PATH_DASHBOARD.sale.viewbilling;

  const isEditFlow = !!get(location, 'state.orders');

  const isBillingPage = pathname === billingPath && !isEditFlow;
  const isBillingPageWithEdit = pathname === billingPath && isEditFlow;

  const isViewBillingPage = pathname === viewBillingPath;

  const user = AuthService._getMerchantDetails();

  const handleOpen = () => {
    executeAfterCheck(() => {
      setOpen(true);
    });
  };
  const handleClose = () => {
    setOpen(false);
  };
  const getStores = async () => {
    try {
      if (currentSelectedRole === ROLES_DATA.master.role) {
        const response = await STORES_API.getStoresMaster();
        if (response) {
          setStoresData(get(response, 'data'));
          ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
        }
      } else if (
        currentSelectedRole === ROLES_DATA.store_manager.role ||
        currentSelectedRole === ROLES_DATA.manager_and_staff.role
      ) {
        const response = await STORES_API.getStoresManager();
        if (response) {
          setStoresData(get(response, 'data'));
          ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
        }
      } else {
        const response = await STORES_API.getStoresByStoreId();
        if (response) {
          setStoresData(get(response, 'data'));
          ObjectStorage.setItem(StorageConstants.STORES_FULL_DETAILS, get(response, 'data'));
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const getStoreName = (storeId) => {
    const terminals = find(storesData, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  useEffect(() => {

    if (!isDashboardOrReport && selectedStore === ALL_CONSTANT.ALL) {
      setSelectedStore(storeLabelList[0]);
      const currentStoreAndTerminal = {
        storeId: storeLabelList[0],
        terminalId: selectedTerminal,
      };
      ObjectStorage.setItem(StorageConstants.SELECTED_STORE_AND_TERMINAL, currentStoreAndTerminal);
    }
  }, [topName]);

  useEffect(() => {

    if(isEmpty(storesData)) getStores();
  }, []);
  useEffect(() => {
    window.addEventListener('online', () => setNetworkStatus(true));
    window.addEventListener('offline', () => setNetworkStatus(false));
  }, []);

  const initialFetch = async () => {
    try {
      const scanQr = await SettingServices.getScanQrConfiguration();
      setIsQrEnable(scanQr?.data[0]?.scanQrSettings?.isActive);
    } catch (err) {
      // toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    initialFetch();
  }, [selectedStore, storesData, isQrState]);

  useEffect(() => {

    // if (!selectedStore) setSelectedStore(storeLabelList[0]);
    // if (selectedStore) setSelectedTerminal(getTerminalByStoreId(selectedStore));

    const storeId = AuthService.getSelectedStoreId();
    const terminalId = AuthService.getSelectedTerminal();

    if (storeId && terminalId) return;

    if (!selectedStore) {
      setSelectedStore(storeLabelList[0]);
      const currentStoreAndTerminal = {
        storeId: storeLabelList[0],
        terminalId: selectedTerminal,
      };
      ObjectStorage.setItem(StorageConstants.SELECTED_STORE_AND_TERMINAL, currentStoreAndTerminal);
    }
    if (selectedStore) {
      const terminalIdData = ROLES_WITHOUT_STORE_STAFF.includes(currentSelectedRole)
        ? ALL_CONSTANT.ALL
        : get(storesData, '0.terminalId');

      setSelectedTerminal(terminalIdData);
      const currentStoreAndTerminal = {
        storeId: selectedStore,
        terminalId: terminalIdData,
      };
      ObjectStorage.setItem(StorageConstants.SELECTED_STORE_AND_TERMINAL, currentStoreAndTerminal);
    }
  }, [selectedStore, storesData]);

  useEffect(() => {
    getPathName(currentLocation);
  }, [currentLocation]);


  const { role } = ObjectStorage.getItem(ROLE_STORAGE.ROLE) || {};
  const isManager = role === ROLES_DATA.store_manager.role;

  const renderStores = (
    <>
      {isMasterManager && (
        <Stack sx={{ flexDirection: !isMobile ? 'row' : 'column' }}>
          <FormControl sx={{ m: 1 }} variant={!isMobile ? 'standard' : 'outlined'}>
            <Select
              sx={{
                border: !isMobile ? `2px solid ${theme.palette.primary.light}` : null,
                borderRadius: !isMobile ? '50px' : null,
              }}
              disabled={isBillingPage || isBillingPageWithEdit}
              value={selectedStore}
              defaultValue={selectedStore}
              onChange={(e) => {
                executeAfterCheck(() => {
                  setSelectedStore(e.target.value);
                  const currentStoreAndTerminal = {
                    storeId: e.target.value,
                    terminalId: selectedTerminal,
                  };
                  ObjectStorage.setItem(
                    StorageConstants.SELECTED_STORE_AND_TERMINAL,
                    currentStoreAndTerminal
                  );
                });
              }}
              input={!isMobile && <BootstrapInput />}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 150,
                    width: 'auto',
                    borderRadius: 1.5,
                    color: theme.palette.primary.main,
                    '& .Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.main,
                    },
                    '& .MuiMenuItem-root': {
                      fontSize: 13,
                    },

                    ...hideScrollbar,
                  },
                },
              }}
            >
              {map(storeLabelList, (e) => (
                <MenuItem value={e}>{`${getStoreName(e)}`}</MenuItem>
              ))}
              {/* {isDashboardOrReport && <MenuItem value={ALL_CONSTANT.ALL}>All</MenuItem>} */}
            </Select>
          </FormControl>
          {!isCurrentStoreAll && selectedStore && selectedTerminal && (
            <FormControl
              sx={{ m: 1, visibility: 'none' }}
              variant={!isMobile ? 'standard' : 'outlined'}
            >
              <Select
                sx={{
                  border: !isMobile ? `2px solid ${theme.palette.primary.light}` : null,
                  borderRadius: !isMobile ? '50px' : null,
                }}
                disabled={isBillingPage || isBillingPageWithEdit}
                value={selectedTerminal}
                defaultValue={selectedTerminal}
                onChange={(e) => {
                  executeAfterCheck(() => {
                    setSelectedTerminal(e.target.value);
                    const currentStoreAndTerminal = {
                      storeId: selectedStore,
                      terminalId: e.target.value,
                    };
                    ObjectStorage.setItem(
                      StorageConstants.SELECTED_STORE_AND_TERMINAL,
                      currentStoreAndTerminal
                    );
                  });
                }}
                input={!isMobile && <BootstrapInput />}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 150,
                      width: 'auto',
                      borderRadius: 1.5,
                      '& .Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: theme.palette.primary.main,
                      },
                      '& .MuiMenuItem-root': {
                        fontSize: 13,
                      },
                      ...hideScrollbar,
                    },
                  },
                }}
              >
                {!isSettingScreen && <MenuItem value={ALL_CONSTANT.ALL}>All</MenuItem>}
                {isQrEnable && <MenuItem value={SCAN_QR_CONSTANT.SCAN_QR}>Scan QR</MenuItem>}
                {map(
                  selectedStore
                    ? getTerminalsByStoreId({ storeId: selectedStore, storesData })
                    : [],
                  (e) => (
                    <MenuItem value={e.terminalId}>
                      {`${get(e, 'terminalName') ?? get(e, 'terminalNumber')}`}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          )}
        </Stack>
      )}
    </>
  );

  const renderContent = (
    <>
      {isDesktop && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!isDesktop && (
        <IconButton onClick={onOpenNav} sx={{ mr: 1, color: theme.palette.primary.main }}>
          <MenuIcon />
        </IconButton>
      )}

      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={{ xs: 0.5, sm: 1.5 }}
        sx={{ overflowX: { xs: 'auto' }, ...hideScrollbar }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {isDesktop && (
            <Box
              sx={{
                width: '2rem',
                height: '2rem',
                borderRadius: 1,
                backgroundColor: '#F6F7F8',
                color: 'black',
                display: ' flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => {
                executeAfterCheck(() => {
                  if (pathname === PATH_DASHBOARD.inventory.addon) {
                    navigate(PATH_DASHBOARD.inventory.products);
                  } else {
                    navigate(-1);
                  }
                });
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </Box>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: isMobile ? '0.8rem' : '1rem',
                display: 'flex',
                alignItems: 'center',
                color: theme.palette.primary.main,
              }}
            >
              {RouteName[topName]?.toUpperCase() ?? ''}
              {/* {networkStatus ? (
              <CloudQueueIcon
                fontSize="small"
                sx={{ display: 'inline', ml: 1, ...(isMobile ? { fontSize: '14px' } : {}) }}
              />
            ) : (
              <CloudOffIcon
                fontSize="small"
                sx={{ display: 'inline', ml: 1, ...(isMobile ? { fontSize: '14px' } : {}) }}
              />
            )} */}
            </Typography>
            <Breadcrumbs
              links={[
                {
                  name: activeLink,
                },
              ]}
            />
          </Stack>
          {(isBillingPage || isBillingPageWithEdit) && (
            <>
              {!isEmpty(offlineHoldOnList) && (isMobile || isTab) ? (
                <Autocomplete
                  size="small"
                  disablePortal
                  options={map(offlineHoldOnList, (_item) => get(_item, 'holdId'))}
                  value={selectedHoldId}
                  onChange={(event, newValue) => {
                    executeAfterCheck(() => {
                      setSelectedHoldId(newValue);
                    });
                  }}
                  sx={{ minWidth: 100, ml: 2 }}
                  renderInput={(params) => (
                    <TextField variant="filled" {...params} label={'Holds'} />
                  )}
                />
              ) : (
                <Stack direction="row" alignItems="center" spacing={1}>
                  {map(offlineHoldOnList, (_item) => {
                    return (
                      <Chip
                        onClick={() => {
                          executeAfterCheck(() => {
                            setSelectedHoldId(get(_item, 'holdId'));
                          });
                        }}
                        sx={{ height: '1.7rem' }}
                        label={`Hold #${get(_item, 'holdId')}`}
                        color="primary"
                        variant={selectedHoldId === get(_item, 'holdId') ? 'filled' : 'outlined'}
                      />
                    );
                  })}
                </Stack>
              )}
            </>
          )}
        </Stack>

        <Stack flexDirection={'row'} sx={{ display: 'flex', alignItems: 'center' }}>
          {!(isMobile || isTab) && !isManager && (
            <>
       {isShowBillng ?  <Button
                variant="contained"
                onClick={() => {
                  executeAfterCheck(() => {
                    setSelectedHoldId(null);
                    setaddOrder([]);
                    navigate(PATH_DASHBOARD.sale.billing);
                  });
                }}
                disabled={!selectedHoldId && isBillingPage  }
              >
                Create Billing
              </Button>:""}
              &nbsp; &nbsp;
            </>
          )}
          <HelpOutlineIcon
            sx={{
              cursor: 'pointer',
              display: 'none',
              mr: 1,
              ...(isMobile ? { fontSize: '20px' } : {}),
            }}
            onClick={() => {
              executeAfterCheck(() => {
                setIsTourOpen(!isTourOpen);
              });
            }}
          />
          {(isMobile || isTab) && isMasterManager && (
            <StoreMallDirectoryIcon
              fontSize="medium"
              onClick={handleOpen}
              sx={{
                mx: 1,
                ...(isMobile ? { fontSize: '22px' } : {}),
                color: theme.palette.primary.main,
              }}
            />
          )}
          {!isMobile && !isTab && renderStores}
          <AccountPopover role={ROLES_DATA[currentSelectedRole].label} />
        </Stack>
        <Dialog open={open}>
          <Card sx={{ p: 2, minWidth: 320 }}>
            <Typography variant="subtitle1">Select store & Terminal</Typography>
            {renderStores}
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: 3 }}
            >
              <Button onClick={handleClose} variant="contained">
                Close
              </Button>
            </div>
          </Card>
        </Dialog>
      </Stack>
    </>
  );

  useEffect(() => {
    if (isBillingPage && ROLES_WITHOUT_STORE_STAFF.includes(currentSelectedRole)) {
      setPrevTerminalId(selectedTerminal);
      setSelectedStore(get(user, 'storeId'));
      setSelectedTerminal(get(user, 'terminalId'));
      const currentStoreAndTerminal = {
        storeId: get(user, 'storeId'),
        terminalId: get(user, 'terminalId'),
      };
      console.log('currentStoreAndTerminal', currentStoreAndTerminal);
      ObjectStorage.setItem(StorageConstants.SELECTED_STORE_AND_TERMINAL, currentStoreAndTerminal);
    }

    if (isSettingScreen) {
      if (selectedTerminal === ALL_CONSTANT.ALL) {
        setSelectedTerminal(getFirstTerminalIdInAll());
        const currentStoreAndTerminal = {
          storeId: selectedStore,
          terminalId: getFirstTerminalIdInAll(),
        };
        ObjectStorage.setItem(
          StorageConstants.SELECTED_STORE_AND_TERMINAL,
          currentStoreAndTerminal
        );
      }
    }
  }, [location, selectedStore]);

  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        backgroundColor: '#FFF',
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(isDesktop && {
          width: `calc(100% - ${NAV.W_DASHBOARD + 1}px)`,
          height: HEADER.H_DASHBOARD_DESKTOP - 20,
          ...(isOffset && {
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,

            bgcolor: theme.palette.primary.main,
            height: HEADER.H_DASHBOARD_DESKTOP_OFFSET - 20,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 100,
          '&.MuiToolbar-root': {
            px: 1,
          },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
