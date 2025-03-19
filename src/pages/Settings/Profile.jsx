import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { Box, Chip, Grid, Stack, Typography, useTheme, Button } from '@mui/material';
import { get, map } from 'lodash';
import { useEffect, useState } from 'react';
import AuthService from 'src/services/authService';
import BillingLogout from '../Auth/BillingLogout';
import UpdatePassword from '../Auth/UpdatePassword';
import OutletAddressDialog from './OutletAddressDialog';
import profileImg from '../../../src/assets/profileImg.webp';
import { useRecoilValue } from 'recoil';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import { ROLES_DATA, ROLES_DATA_ID } from 'src/constants/AppConstants';
import { SettingsTourProfile } from 'src/constants/TourConstants';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import STORES_API from 'src/services/stores';
import { Tab, Switch } from '@mui/material';
import { Tabs } from '@mui/material';
import OptionsDialog from './AccountDialog';
import PaymentGateway from 'src/pages/Settings/PaymentGateway';
import RemoveAccessDialog from './RemoveAccessDialog';
import CachedIcon from '@mui/icons-material/Cached';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingServices from '../../services/API/SettingServices';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { toast } from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';

const tabsOptions = [
  {
    label: 'Profile',
    value: 'profile',
  },
  {
    label: 'Others',
    value: 'others',
  },
  // {
  //   label: 'Payment gateway',
  //   value: 'paymentGateway',
  // },
];

export default function Profile() {
  const theme = useTheme();
  const currentRole = AuthService.getCurrentRoleInLocal();
  const merchantDetails = AuthService._getMerchantDetails();
  const [openPassword, setOpenPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState({});
  const [otherAccountInfo, setOtherAccountInfo] = useState({});
  const [openOptionsDialog, setOpenOptionsDialog] = useState(false);
  const [isOpenOutletAddressDialog, setIsOpenOutletAddressDialog] = useState(false);
  const [merchantSettings, setMerchantSettings] = useState({});

  const [openEditMerchantIdDialog, setOpenEditMerchantIdDialog] = useState(false);

  const PRIMARY_LIGHT = theme.palette.primary.light;

  const PRIMARY_DARK = theme.palette.primary.dark;

  const [selected, setSelected] = useState(get(tabsOptions, '0.value'));

  const handleOpenPassword = () => {
    setOpenPassword(true);
  };
  const handleClosePassword = () => {
    setOpenPassword(false);
  };
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const getAccountInfo = async () => {
    try {
      const response = await STORES_API.getAccountInfo({
        storeId: merchantDetails?.storeId,
        terminalId: merchantDetails?.terminalId,
      });
      if (response) {
        setAccountInfo(get(response, 'data'));
        setMerchantSettings(get(response, 'data.dataValues.merchantSettings'))
      }
    } catch (e) {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };

  const getOtherAccountInfo = async () => {
    try {
      const response = await STORES_API.getOtherAccountInfo();
      if (response) {
        setOtherAccountInfo(get(response, 'data'));
      }
    } catch (e) {
      toast.error(ErrorConstants.SOMETHING_WRONG);
    }
  };
  const [openRemoveAccessDialog, setOpenRemoveAccessDialog] = useState(false);

  const handleOpenRemoveAccessDialog = () => {
    setOpenRemoveAccessDialog(true);
  };

  const handleCloseRemoveAccessDialog = () => {
    setOpenRemoveAccessDialog(false);
  };

  const handleMerchantwiseCustomers = async (key, value) => {
    try {
      const payload = {
        merchantSettings: {
          ...merchantSettings,
          [key]: value,
        },
      };
      await SettingServices.merchantWiseConfiguration(payload);
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      getAccountInfo();
    } catch (err) {
      toast.error(
        get(err, 'errorResponse.message') ||
          get(err, 'errorResponse.code') ||
          ErrorConstants.UNABLE_MERCHANTWISE_CUSTOMER
      );
    }
  };

  const isMasterStore =
    get(ROLES_DATA_ID[get(otherAccountInfo, 'roleId')], 'role') === ROLES_DATA.master.role;
  const isCurrentRole = get(ROLES_DATA_ID[get(otherAccountInfo, 'roleId')], 'role') === currentRole;

  const isShowLogoutButton =
    (get(otherAccountInfo, 'keyVerified') &&
      currentRole === ROLES_DATA.master.role &&
      isMasterStore) ||
    (get(otherAccountInfo, 'keyVerified') && isCurrentRole) ||
    (get(otherAccountInfo, 'accessId') && !isMasterStore && !isCurrentRole);

  useEffect(() => {
    getAccountInfo();
  }, []);

  useEffect(() => {
    if (selected === get(tabsOptions, '1.value')) {
      getOtherAccountInfo();
    }
  }, [selected, currentStore, currentTerminal]);

  const isMasterOrAll = isMasterStore || currentTerminal === 'all' || currentTerminal === 'scanQR';

  return (
    <Box className="settingProfileStep1">
      <Typography variant="h6" sx={{ mb: 3.5, ml: 1.5 }}>
        <Tabs
          sx={{
            width: '145px',
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
          {map(tabsOptions, (_tab) => {
            return <Tab value={get(_tab, 'value')} label={get(_tab, 'label')} />;
          })}
        </Tabs>
      </Typography>

      <Box sx={{ maxHeight: 'calc(100vh-320px)', mx: 2 }}>
        {selected === get(tabsOptions, '0.value') && (
          <Stack
            pb={1}
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: '',
              alignItems: 'center',
              flexDirection: 'row',
              // px: 2,
            }}
          >
            <img src={profileImg} style={{ width: '55px', height: '55px' }} />
            {/* <Typography px={2} variant="h6">
            Account Information
          </Typography> */}
            {get(accountInfo, 'roleId') && (
              <Chip
                size="small"
                color="primary"
                sx={{
                  // mt: 3,
                  // mb: 4,
                  fontSize: '11px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '4px' },
                }}
                label={get(ROLES_DATA_ID[get(accountInfo, 'roleId')], 'label')}
              />
            )}
            {get(accountInfo, 'name') && (
              <Chip
                size="small"
                color="primary"
                sx={{
                  // mt: 3,
                  // mb: 4,
                  fontSize: '11px',
                  fontWeight: 600,
                  '&.MuiChip-root': { borderRadius: '4px' },
                }}
                label={get(accountInfo, 'name')}
              />
            )}
            <Typography variant="caption"></Typography>
          </Stack>
        )}

        <Grid container gap={2}>
          {selected === get(tabsOptions, '0.value') && (
            <>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Typography sx={{ fontSize: '14px', fontWeight: '700' }}> Store</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: '300' }}>
                  {get(accountInfo, 'storeName')}
                </Typography>
                {/* <Typography variant="caption">Your Store name</Typography> */}
              </Grid>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>Account email</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: '300' }}>
                  {get(accountInfo, 'email') || get(accountInfo, 'terminalNumber')}
                </Typography>
                {/* <Typography variant="caption">Your Store Official Email Id</Typography> */}
              </Grid>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Stack spacing={0.5}>
                  <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                    {' '}
                    Account status
                  </Typography>
                  <Chip
                    size="small"
                    sx={{
                      backgroundColor: '#46c61b',
                      width: '5rem',
                      color: '#ffff',
                      mt: 3,
                      mb: 4,
                      fontSize: '11px',
                      fontWeight: 700,
                      '&.MuiChip-root': { borderRadius: '8px' },
                    }}
                    label={get(accountInfo, 'status')}
                  />
                </Stack>
              </Grid>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>Terminal name</Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: '300' }}>
                  {get(accountInfo, 'terminalName') || get(accountInfo, 'terminalNumber')}
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Stack className="settingProfileStep3" spacing={0.5}>
                  <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                    {' '}
                    Password update
                  </Typography>
                  <Stack
                    sx={{ textDecoration: 'underline', cursor: 'pointer', color: PRIMARY_LIGHT }}
                    flexDirection="row"
                    gap={0.5}
                    onClick={() => handleOpenPassword()}
                  >
                    <Typography variant="subtitle1">Update</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '14px' }}>
                    Update password, to change into new password
                  </Typography>
                </Stack>
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
                    Show customers merchant-wise
                  </Typography>
                  <Switch
                    name="isMerchantWiseCustomers"
                    checked={get(
                      accountInfo,
                      'dataValues.merchantSettings.isMerchantWiseCustomers',
                      false
                    )}
                    onChange={() => {
                      handleMerchantwiseCustomers(
                        'isMerchantWiseCustomers',
                        !get(
                          accountInfo,
                          'dataValues.merchantSettings.isMerchantWiseCustomers',
                          false
                        )
                      );
                    }}
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
                  Enable to show all registered customers in every store.
                </Typography>
              </Grid>
            </>
          )}

          {selected === get(tabsOptions, '1.value') && (
            <>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                    {' '}
                    Regenerate your terminal passkey
                  </Typography>

                  <Stack
                    flexDirection="row"
                    gap={1}
                    onClick={() => {
                      if (!isMasterOrAll) {
                        setOpenOptionsDialog(true);
                      }
                    }}
                  >
                    <CachedIcon
                      sx={{
                        color: !isMasterOrAll ? PRIMARY_LIGHT : '#CBCBCB',
                        cursor: 'pointer',
                      }}
                    />
                  </Stack>
                </Box>
                <Typography sx={{ fontSize: '14px', fontWeight: '300' }}>
                  Click here to regenerate your terminal passkey anytime.
                </Typography>
                {/* </Stack> */}
              </Grid>

              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Stack spacing={0.5}>
                  <Stack flexDirection="row" alignItems="center" gap={1}>
                    <Typography sx={{ fontSize: '14px', fontWeight: '700' }}>
                      Outlet address
                    </Typography>

                    <EditIcon
                      onClick={() => {
                        setIsOpenOutletAddressDialog(true);
                      }}
                      sx={{ fontSize: '16px', cursor: 'pointer' }}
                    />
                  </Stack>
                  <Stack flexDirection="row" gap={1}>
                    <Typography sx={{ fontSize: '14px', fontWeight: '300' }}>
                      {get(otherAccountInfo, 'dataValues.outletAddress') || '--'}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '14px', fontWeight: '300' }}>
                    Store address will be updated or created
                  </Typography>
                </Stack>
              </Grid>
              <Grid
                item
                xs={12}
                sm={5.8}
                md={3.8}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', p: 2 }}
              >
                <Stack spacing={0.5}>
                  <Stack flexDirection="row" alignItems="center" gap={1}>
                    <Typography
                      sx={{ fontSize: '14px', fontWeight: '700', mt: '2' }}
                      disabled={isMasterOrAll || !get(otherAccountInfo, 'accessId')}
                    >
                      Remove Access
                    </Typography>
                    <DeleteOutlineIcon
                      onClick={() => {
                        if (!isMasterOrAll && get(otherAccountInfo, 'accessId')) {
                          handleOpenRemoveAccessDialog(true);
                        }
                      }}
                      sx={{
                        cursor:
                          !isMasterOrAll || get(otherAccountInfo, 'accessId')
                            ? 'pointer'
                            : 'not-allowed',
                        color:
                          !isMasterOrAll && get(otherAccountInfo, 'accessId')
                            ? PRIMARY_LIGHT
                            : '#CBCBCB',
                      }}
                    />
                  </Stack>

                  <Typography sx={{ fontSize: '14px', fontWeight: '300' }}>
                    Remove your current terminal access
                  </Typography>
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
        <RemoveAccessDialog
          open={openRemoveAccessDialog}
          handleClose={handleCloseRemoveAccessDialog}
          terminalNumber={
            get(otherAccountInfo, 'terminalNumber') || get(accountInfo, 'terminalNumber')
          }
          getOtherAccountInfo={getOtherAccountInfo}
        />
        {/* {selected === get(tabsOptions, '2.value') && <PaymentGateway />} */}
      </Box>
      <OptionsDialog
        open={openOptionsDialog}
        handleClose={() => setOpenOptionsDialog(false)}
        otherAccountInfo={otherAccountInfo}
      />

      <BillingLogout
        storesData={otherAccountInfo}
        open={open}
        handleClose={() => {
          setOpen(false);
          getOtherAccountInfo();
        }}
      />

      <OutletAddressDialog
        isOpen={isOpenOutletAddressDialog}
        onClose={() => {
          setIsOpenOutletAddressDialog(false);
        }}
        getStoreDetails={getOtherAccountInfo}
        currentOutletAddress={get(otherAccountInfo, 'dataValues.outletAddress')}
      />

      <UpdatePassword open={openPassword} handleClose={handleClosePassword} />
      <TakeATourWithJoy config={SettingsTourProfile} />
    </Box>
  );
}
