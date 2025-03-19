import PropTypes from 'prop-types';
import { memo } from 'react';
// @mui
import { AppBar, Box, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// config
import { HEADER } from '../../../config-global';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// components
import { NavSectionHorizontal } from '../../../components/nav-section';
//
import { formatNavConfigByRole } from 'src/helper/formatNavConfigByRole';
import AuthService from 'src/services/authService';
import navConfig from './config-navigation';
import { useRecoilValue } from 'recoil';
import { allConfiguration, estimateMode, whatsappDetailsState } from 'src/global/recoilState';
import { get, map } from 'lodash';
import { PATH_DASHBOARD } from 'src/routes/paths';

// ----------------------------------------------------------------------

function NavHorizontal() {
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
  }
  if (!isCountersEnabled) {
    blockedNavigation.push(PATH_DASHBOARD.inventory.counters);
  }

  if (!isTable) {
    blockedNavigation.push(PATH_DASHBOARD.table);
    blockedNavigation.push(PATH_DASHBOARD.reservation);
  }

  const newNavConfig = formatNavConfigByRole(role, navConfig, blockedNavigation);
  const theme = useTheme();

  return (
    <AppBar
      component="nav"
      color="transparent"
      sx={{
        boxShadow: 0,
        top: HEADER.H_DASHBOARD_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <NavSectionHorizontal data={newNavConfig} />
      </Toolbar>

      <Shadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);

// ----------------------------------------------------------------------

Shadow.propTypes = {
  sx: PropTypes.object,
};

function Shadow({ sx, ...other }) {
  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        height: 24,
        zIndex: -1,
        width: 1,
        m: 'auto',
        borderRadius: '50%',
        position: 'absolute',
        boxShadow: (theme) => theme.customShadows.z8,
        ...sx,
      }}
      {...other}
    />
  );
}
