import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Drawer, IconButton, Stack, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// config
import { NAV } from '../../../config-global';
// components
import Logo from '../../../components/logo';
import { NavSectionVertical } from '../../../components/nav-section';
import Scrollbar from '../../../components/scrollbar';
//
import { formatNavConfigByRole } from 'src/helper/formatNavConfigByRole';
import AuthService from 'src/services/authService';
import NavToggleButton from './NavToggleButton';
import navConfig from './config-navigation';
import { useRecoilValue } from 'recoil';
import {
  allConfiguration,
  estimateMode,
  isOfflineState,
  offlineOrdersListCountState,
  offlineToOnlineSyncingState,
  whatsappDetailsState,
} from 'src/global/recoilState';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { get } from 'lodash';
import SyncIcon from '@mui/icons-material/Sync';

import WifiOffIcon from '@mui/icons-material/WifiOff';
import { useSettingsContext } from 'src/components/settings';
import NavMini from './NavMini';

// ----------------------------------------------------------------------

NavVertical.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function NavVertical({
  openNav,
  onCloseNav,
  expiryContent,
  isTrial,
  isFreemium,
  isExpired,
  isNavMini,
  isPayCard,
}) {
  const offlineToOnlineSyncing = useRecoilValue(offlineToOnlineSyncingState);

  const isOffline = useRecoilValue(isOfflineState);

  const offlineOrdersListCount = useRecoilValue(offlineOrdersListCountState);

  const { pathname } = useLocation();
  const role = AuthService.getCurrentRoleInLocal();
  const configuration = useRecoilValue(allConfiguration);
  const isEstimate = get(configuration, 'isEstimator');
  const featureSettings = get(configuration, 'featureSettings', {});
  const isTable = get(featureSettings, 'isTable', false);

  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);

  const whatsappDetails = useRecoilValue(whatsappDetailsState);

  const blockedNavigation = !isEstimate
    ? [PATH_DASHBOARD.createestimate, PATH_DASHBOARD.viewestimate]
    : [];

  if (!isTable) {
    blockedNavigation.push(PATH_DASHBOARD.table);
    blockedNavigation.push(PATH_DASHBOARD.reservation);
  }

  if (!isTable) {
    blockedNavigation.push(PATH_DASHBOARD.table);
  }
  if (!isCountersEnabled) {
    blockedNavigation.push(PATH_DASHBOARD.inventory.counters);
  }

  const newNavConfig = formatNavConfigByRole(role, navConfig, blockedNavigation);
  const isDesktop = useResponsive('up', 'lg');

  const renderContent = (
    <Stack justifyContent="space-between" sx={{ p: 1 }}>
      {!isNavMini && (
        <Stack flexDirection="row" alignItems="center" gap={1}>
          <Logo />

          {offlineToOnlineSyncing && (
            <Tooltip title="Offline Mode">
              <Box
                sx={{
                  backgroundColor: 'green',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  color: '#fff',
                  right: 20,
                  bottom: 1.5,
                  width: 42,
                  height: 38,
                  borderRadius: '50%',
                }}
              >
                <SyncIcon
                  sx={{
                    color: '#fff',
                    animation: 'spin 2s linear infinite',
                    '@keyframes spin': {
                      '0%': {
                        transform: 'rotate(360deg)',
                      },
                      '100%': {
                        transform: 'rotate(0deg)',
                      },
                    },
                  }}
                />
              </Box>
            </Tooltip>
          )}
          {isOffline && !offlineToOnlineSyncing && (
            <Box sx={{ position: 'relative' }}>
              <Tooltip title="Offline Mode">
                <Box
                  sx={{
                    backgroundColor: 'red',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    color: '#fff',
                    right: 20,
                    bottom: 1.5,
                    width: 42,
                    height: 38,
                    borderRadius: '50%',
                  }}
                >
                  <WifiOffIcon
                    sx={{
                      color: '#fff',
                    }}
                  />
                </Box>
              </Tooltip>
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: offlineOrdersListCount?.toString()?.length > 2 ? 0 : 5,
                  minWidth: 26,
                  minHeight: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'green',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  p: 0.5,
                }}
              >
                {offlineOrdersListCount}
              </Box>
            </Box>
          )}
        </Stack>
      )}

      {!isNavMini ? (
        <NavSectionVertical
          sx={{
            height: isPayCard ? 'calc(100vh - 300px)' : 'calc(100vh - 130px)',
            overflow: 'auto',
          }}
          data={newNavConfig}
          onCloseNav={onCloseNav}
          isNavMini={isNavMini}
        />
      ) : (
        <NavMini
          sx={{
            height: isPayCard ? 'calc(100vh - 300px)' : 'calc(100vh - 130px)',
            overflow: 'auto',
          }}
          expiryContent={expiryContent}
          onCloseNav={onCloseNav}
          isPayCard={isPayCard}
        />
      )}

      <div style={{ minHeight: '200px', position: 'fixed', bottom: 10, left: NAV.W_DASHBOARD / 6 }}>
        {expiryContent()}
      </div>

      <Stack sx={{ position: 'fixed', bottom: 10, left: NAV.W_DASHBOARD / 5 }}>
        <Typography
          component="span"
          variant="caption"
          textAlign="center"
          sx={{ opacity: 0.5, mt: 1 }}
        >
          &copy; 2025 POSITEASY
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_DASHBOARD },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              zIndex: 0,
              width: NAV.W_DASHBOARD,
              bgcolor: 'transparent',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV.W_DASHBOARD,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
