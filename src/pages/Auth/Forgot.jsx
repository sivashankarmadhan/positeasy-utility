import { Box, Card, Container, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import Page from 'src/components/Page';
// hooks
// sections
import LoginForm from '../Auth/LoginForm';
import { base64_images } from 'src/constants/ImageConstants';
import ForgotForm from './ForgotForm';
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
  backgroundColor: 'transparent',
  boxShadow: 'none',
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

const Forgot = () => {
  return (
    <Page title="Login">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Card sx={{ p: 3, px: 4, display: 'flex', m: 2 }}>
          <Stack flexDirection={'column'} sx={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 250, justifyContent: 'center' }}>
              <img src={base64_images.Logo_pos} />
            </div>
            <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Update
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
              </Box>
            </Stack>
            <ForgotForm />
          </Stack>
        </Card>
      </div>
    </Page>
  );
};
export default Forgot;
