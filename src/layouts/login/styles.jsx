// @mui
import { styled, alpha } from '@mui/material/styles';
// utils
import { bgGradient } from '../../utils/cssStyles';

// ----------------------------------------------------------------------

export const StyledRoot = styled('main')(() => ({
  height: '100%',
  display: 'flex',
  position: 'relative',
}));

export const StyledSection = styled('div')(({ theme }) => ({
  display: 'none',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));

export const StyledSectionBg = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.9 : 0.94),
    imgUrl: '/assets/background/overlay_2.jpg',
  }),
  top: 0,
  left: 0,
  zIndex: -1,
  width: '100%',
  height: '100%',
  position: 'absolute',
  transform: 'scaleX(-1)',
}));
export const StyledSectionWhatsappBg = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.92 : 0.94),
    imgUrl: 'https://positeasy.s3.ap-south-1.amazonaws.com/whatsapp/QR_pay.png',
  }),
  bottom: 0,
  left: 230,
  zIndex: -1,
  width: '83%',
  height: '82%',
  position: 'absolute',
  // transform: 'scaleX(-1)',
}));
export const StyledSectionphoneWhatsappBg = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.92 : 0.94),
    imgUrl: 'https://positeasy.s3.ap-south-1.amazonaws.com/whatsapp/QR_pay.png',
  }),
  top: 120,
  left: 20,
  zIndex: -1,
  width: '90%',
  height: '80%',
  position: 'absolute',
  transform: 'scaleX(-1)',
}));

export const StyledContent = styled('div')(({ theme }) => ({
  width: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  justifyContent: 'center',
  padding: theme.spacing(15, 2),
  [theme.breakpoints.up('md')]: {
    flexShrink: 0,
    padding: theme.spacing(30, 8, 0, 8),
  },
}));
