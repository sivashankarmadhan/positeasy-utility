import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// @mui
import { Box, Button, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import Card from '@mui/material/Card';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import { useSettingsContext } from '../../components/settings';
//
import Main from './Main';
import Header from './header';
import NavMini from './nav/NavMini';
import NavVertical from './nav/NavVertical';
import NavHorizontal from './nav/NavHorizontal';
import { useRecoilValue } from 'recoil';
import { storeLogo, stores } from 'src/global/recoilState';
import { get } from 'lodash';
import { ROLES_DATA, TERMINAL_STATUS } from 'src/constants/AppConstants';
import AuthService from 'src/services/authService';
import { CustomAvatar } from 'src/components/custom-avatar';
import OverflowTruncate from 'src/components/OverflowTruncate';
import StoreServices from 'src/services/API/StoreServices';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import UpgradeIcon from '../../assets/UploadIcon.png';
import Image from '../../components/image';
import { PATH_DASHBOARD } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const { themeLayout, onToggleLayout } = useSettingsContext();
  const storeData = useRecoilValue(stores);
  const isDesktop = useResponsive('up', 'lg');
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const user = AuthService._getMerchantDetails();
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles = ROLES_DATA.master.role === currentRole;
  const [isFreemium, setIsFreemium] = useState(
    get(user, 'accountType') === TERMINAL_STATUS.FREEMIUM
  );
  const [isTrial, setIsTrial] = useState(get(user, 'accountType') === TERMINAL_STATUS.TRIAL_ACOUNT);
  const [isExpired, setIsExpired] = useState(get(user, 'accountType') === TERMINAL_STATUS.EXPIRED);
  const [accountType, setAccountType] = useState(get(user, 'accountType'));
  const logo = useRecoilValue(storeLogo);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavVertical = themeLayout === 'vertical';

  const isNavMini = themeLayout === 'mini';

  const [remainingDaysMsgForExpiry, setRemainingDaysMsgForExpiry] = useState(null);

  const isPayCard = isTrial || isFreemium || isExpired;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (get(storeData, '0.terminalStatus') !== accountType) {
      if (isAuthorizedRoles) getRemainingDaysForExpiry();
    }
  }, [storeData]);

  useEffect(() => {
    if ((pathname?.includes('report') || pathname?.includes('settings')) && isNavVertical) {
      console.log('pathname', pathname);
      onToggleLayout();
      handleOpen();
    } else if (!(pathname?.includes('report') || pathname?.includes('settings')) && isNavMini) {
      onToggleLayout();
      handleOpen();
    }
  }, [pathname]);

  const getRemainingDaysForExpiry = async () => {
    try {
      const res = await StoreServices.getRemainingDaysForExpiry();
      setRemainingDaysMsgForExpiry(get(res, 'data.message'));
      setAccountType(get(res, 'data.accountType'));
      if (get(res, 'data.accountType') === TERMINAL_STATUS.FREEMIUM) {
        setIsFreemium(true);
        setIsTrial(false);
        setIsExpired(false);
      }
      if (get(res, 'data.accountType') === TERMINAL_STATUS.TRIAL_ACOUNT) {
        setIsFreemium(false);
        setIsTrial(true);
        setIsExpired(false);
      }
      if (get(res, 'data.accountType') === TERMINAL_STATUS.EXPIRED) {
        setIsExpired(true);
        setIsFreemium(false);
        setIsTrial(false);
      }
      if (get(res, 'data.accountType') === TERMINAL_STATUS.PAID) {
        setIsExpired(false);
        setIsFreemium(false);
        setIsTrial(false);
      }
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (isAuthorizedRoles) getRemainingDaysForExpiry();
  }, []);

  const expiryContent = (isMiniNav) => {
    if (isPayCard) {
      return (
        <Stack>
          {/* <Divider sx={{ borderStyle: 'dashed' }} /> */}
          <Stack
            flexDirection={isMiniNav ? 'column' : 'row'}
            justifyContent="center"
            alignItems="center"
            gap={3}
          >
            {!isMiniNav && isAuthorizedRoles && (
              <>
                <Card sx={{ p: 2 }}>
                  <Stack alignItems="center" spacing={0.5}>
                    <Image src={UpgradeIcon} sx={{ width: '1.5rem', height: '1.5rem' }} />
                    <Box sx={{ width: '7rem', textAlign: 'center' }}>
                      <Typography fontWeight="bold" fontSize="0.9rem">
                        Upgrade to Pro
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.6rem', mt: 1 }}>
                        {remainingDaysMsgForExpiry}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        navigate(PATH_DASHBOARD.subscriptionPlan);
                      }}
                      sx={{ fontSize: '0.6rem', width: '8rem' }}
                    >
                      Upgrade now
                    </Button>
                  </Stack>
                </Card>
              </>
            )}
            {isMiniNav && isAuthorizedRoles && (
              <>
                <Tooltip title={remainingDaysMsgForExpiry}>
                  <Stack alignItems="center" mt={1}>
                    <Stack sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar
                        sx={{
                          backgroundColor: '#E0E3E5',
                          color: theme.palette.primary.main,
                          height: 30,
                          width: 30,
                          mb: 1,
                        }}
                        src={logo}
                        alt={
                          get(user, 'email')?.slice(0, 1) ||
                          get(user, 'terminalNumber')?.slice(0, 1)
                        }
                        name={get(user, 'email') || get(user, 'terminalNumber')}
                      />
                      <Box
                        sx={{
                          width: 'auto',

                          backgroundColor: theme.palette.primary.lighter,
                          color: theme.palette.primary.main,
                          borderRadius: 1,
                          textAlign: 'center',
                          fontSize: '8px',
                          fontWeight: 'semibold',
                          whiteSpace: 'nowrap',
                          px: 1,
                          mb: 1,
                        }}
                      >
                        {accountType}
                      </Box>
                    </Stack>

                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        navigate(PATH_DASHBOARD.subscriptionPlan);
                      }}
                    >
                      Upgrade
                    </Button>
                  </Stack>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>
      );
    }
  };

  const renderNavVertical = (
    <NavVertical
      expiryContent={expiryContent}
      openNav={open}
      onCloseNav={handleClose}
      isTrial={isTrial}
      isFreemium={isFreemium}
      isExpired={isExpired}
      isNavMini={isNavMini}
      isPayCard={isPayCard}
    />
  );

  if (isNavHorizontal) {
    return (
      <>
        <Header onOpenNav={handleOpen} />
        {isDesktop ? <NavHorizontal /> : renderNavVertical}
        <Main>
          <Outlet />
        </Main>
      </>
    );
  }

  if (isNavMini) {
    return (
      <>
        <Header onOpenNav={handleOpen} />

        <Box
          sx={{
            display: { lg: 'flex' },
            minHeight: { lg: 1 },
          }}
        >
          {renderNavVertical}
          <Main>
            <Outlet />
          </Main>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header onOpenNav={handleOpen} />

      <Box
        sx={{
          display: { lg: 'flex' },
          minHeight: { lg: 1 },
          overflow: 'hidden',
        }}
      >
        {renderNavVertical}
        <Main>
          <Outlet />
        </Main>
      </Box>
    </>
  );
}
