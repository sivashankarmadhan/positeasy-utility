import PropTypes from 'prop-types';
// @mui
import { Box } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// config
import { HEADER, NAV } from '../../config-global';
// components
import { useSettingsContext } from '../../components/settings';
import { hideScrollbar } from 'src/constants/AppConstants';
// ----------------------------------------------------------------------

const SPACING = 8;

Main.propTypes = {
  sx: PropTypes.object,
  children: PropTypes.node,
};

export default function Main({ children, sx, ...other }) {
  const { themeLayout } = useSettingsContext();

  const isNavHorizontal = themeLayout === 'horizontal';

  const isNavMini = themeLayout === 'mini';

  const isDesktop = false;
  useResponsive('up', 'lg');

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          pt: `${HEADER.H_MOBILE + SPACING}px`,
          pb: `${HEADER.H_MOBILE + SPACING}px`,
          ...(isDesktop && {
            px: 2,
            pt: `${HEADER.H_DASHBOARD_DESKTOP + 80}px`,
            pb: `${HEADER.H_DASHBOARD_DESKTOP + SPACING}px`,
          }),
          ...hideScrollbar,
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        pt: `${HEADER.H_MOBILE + SPACING}px`,
        ...(isDesktop && {
          px: 2,
          py: `${HEADER.H_DASHBOARD_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.W_DASHBOARD}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_DASHBOARD_MINI}px)`,
          }),
        }),
        ...sx,
        ...hideScrollbar,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}
