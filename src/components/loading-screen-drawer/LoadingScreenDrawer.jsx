import { m } from 'framer-motion';
import { useLocation } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, LinearProgress } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// config
import { NAV, HEADER } from '../../config-global';
// auth
//
import Logo from '../logo';
import ProgressBar from '../progress-bar';
import { useSettingsContext } from '../settings';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,

  zIndex: 9998,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
}));

// ----------------------------------------------------------------------
const StyledRootDrawer = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  left: 80,
  zIndex: 9998,
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
}));
export default function LoadingScreenDrawer({ isDrawer, isNormal }) {
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');

  const isMobile = useResponsive('down', 'sm');

  const { themeLayout } = useSettingsContext();

  const isDashboard = pathname.includes('/dashboard') && isDesktop;

  const size =
    (themeLayout === 'mini' && NAV.W_DASHBOARD_MINI) ||
    (themeLayout === 'vertical' && NAV.W_DASHBOARD) ||
    144;
  console.log('size', size);
  if (isNormal) {
    return (
      <>
        <ProgressBar />
        <StyledRoot
          sx={{
            ...(isDashboard && {
              width: `calc(100% - ${size}px)`,
              height: `calc(100% - ${HEADER.H_DASHBOARD_DESKTOP}px)`,
              ...(themeLayout === 'horizontal' && {
                width: 1,
                height: `calc(100% - ${size}px)`,
              }),
            }),
          }}
        >
          <>
            <m.div
              animate={{
                scale: [1, 0.9, 0.9, 1, 1],
                opacity: [1, 0.48, 0.48, 1, 1],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeatDelay: 1,
                repeat: Infinity,
              }}
            >
              <Logo disabledLink sx={{ width: 64, height: 64 }} />
            </m.div>

            <Box
              component={m.div}
              animate={{
                scale: [1.6, 1, 1, 1.6, 1.6],
                rotate: [270, 0, 0, 270, 270],
                opacity: [0.25, 1, 1, 1, 0.25],
                borderRadius: ['25%', '25%', '50%', '50%', '25%'],
              }}
              transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
              sx={{
                width: 100,
                height: 100,
                position: 'absolute',
                border: (theme) => `solid 3px ${alpha(theme.palette.primary.dark, 0.24)}`,
              }}
            />

            <Box
              component={m.div}
              animate={{
                scale: [1, 1.2, 1.2, 1, 1],
                rotate: [0, 270, 270, 0, 0],
                opacity: [1, 0.25, 0.25, 0.25, 1],
                borderRadius: ['25%', '25%', '50%', '50%', '25%'],
              }}
              transition={{
                ease: 'linear',
                duration: 3.2,
                repeat: Infinity,
              }}
              sx={{
                width: 120,
                height: 120,
                position: 'absolute',
                border: (theme) => `solid 8px ${alpha(theme.palette.primary.dark, 0.24)}`,
              }}
            />
          </>
        </StyledRoot>
      </>
    );
  } else if (isDrawer) {
    return (
      <>
        <ProgressBar />

        <StyledRootDrawer
          sx={{
            ...(isDashboard && {
              width: `calc(100% - ${size}px)`,
              height: `calc(100% - ${HEADER.H_DASHBOARD_DESKTOP}px)`,
              ...(themeLayout === 'horizontal' && {
                width: 1,
                height: `calc(100% - ${size}px)`,
              }),
            }),
            left: isMobile
              ? -10
              : size === NAV.W_DASHBOARD
              ? 140
              : size === NAV.W_DASHBOARD_MINI
              ? 10
              : 20,
          }}
        >
          <>
            <m.div
              animate={{
                scale: [1, 0.9, 0.9, 1, 1],
                opacity: [1, 0.48, 0.48, 1, 1],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
                repeatDelay: 1,
                repeat: Infinity,
              }}
            >
              <Logo disabledLink sx={{ width: 25, height: 25 }} />
            </m.div>

            <Box
              component={m.div}
              animate={{
                scale: [1.6, 1, 1, 1.6, 1.6],
                rotate: [270, 0, 0, 270, 270],
                opacity: [0.25, 1, 1, 1, 0.25],
                borderRadius: ['25%', '25%', '50%', '50%', '25%'],
              }}
              transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
              sx={{
                width: 70,
                height: 70,
                position: 'absolute',
                border: (theme) => `solid 3px ${alpha(theme.palette.primary.dark, 0.24)}`,
              }}
            />

            <Box
              component={m.div}
              animate={{
                scale: [1, 1.2, 1.2, 1, 1],
                rotate: [0, 270, 270, 0, 0],
                opacity: [1, 0.25, 0.25, 0.25, 1],
                borderRadius: ['25%', '25%', '50%', '50%', '25%'],
              }}
              transition={{
                ease: 'linear',
                duration: 3.2,
                repeat: Infinity,
              }}
              sx={{
                width: 90,
                height: 90,
                position: 'absolute',
                border: (theme) => `solid 8px ${alpha(theme.palette.primary.dark, 0.24)}`,
              }}
            />
          </>
        </StyledRootDrawer>
      </>
    );
  }
}
