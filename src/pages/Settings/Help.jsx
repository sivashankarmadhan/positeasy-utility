import { Box, Button, Stack, Typography, useTheme, Link, Divider, useMediaQuery } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import { SettingTourHelp } from 'src/constants/TourConstants';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import { CONTACT_INFO } from 'src/constants/AppConstants';

export default function Help() {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box className="SettingLogoStep1" mx={{ xs: 0, sm: 3 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mt: 2 }}>
        Welcome! How can we help?
      </Typography>
      <Box mt={4} maxWidth={isMobile ? 350 : 700} mx="auto">
        <Stack sx={{ flexDirection: 'column', alignItems: 'left' }}>
          <Typography variant="subtitle1">Contact us</Typography>

          <Stack
            py={{ xs: 3, sm: 3 }}
            px={{ xs: 1, sm: 3 }}
            sx={{ backgroundColor: '#F7F7F7' }}
            flexDirection="row"
            alignItems="center"
            gap={2}
          >
            <Stack direction="row" alignItems="center" gap={2}></Stack>
            <EmailIcon />
            {/* <Stack flexGrow={1} sx={{ flexDirection: 'column', spacing: '5px' }}> */}
            <Typography variant="subtitle2">
              For any other inquiries please email us{' '}
              <Link href="mailto:admin@positeasy.in" style={{ textDecoration: 'underline' }}>
               {CONTACT_INFO.EMAIL_ID}
              </Link>
            </Typography>
          </Stack>
        </Stack>
        <Divider />
        <Stack sx={{ flexDirection: 'column', alignItems: 'left' }}>
          <Stack
            py={{ xs: 3, sm: 3 }}
            px={{ xs: 1, sm: 3 }}
            sx={{ backgroundColor: '#F7F7F7' }}
            flexDirection="row"
            alignItems="center"
            gap={2}
          >
            <Stack direction="row" alignItems="center" gap={2}></Stack>
            <ContactPhoneIcon />
            {/* <Stack flexGrow={1} sx={{ flexDirection: 'column', spacing: '5px' }}> */}
            <Typography variant="subtitle2">
              Contact number : {CONTACT_INFO.CONTACT_NUMBER}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <TakeATourWithJoy config={SettingTourHelp} />
    </Box>
  );
}
