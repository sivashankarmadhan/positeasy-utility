// @mui
import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';
// components
import Page from '../../components/Page';
import Logo from '../../components/logo/Logo';
// sections
import NewPasswordForm from '../../sections/auth/new-password/NewPasswordForm';
// ----------------------------------------------------------------------

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

export default function NewPassword() {
  return (
    <Page title="New Password">
      <Container>
        <ContentStyle sx={{ textAlign: 'center' }}>
          <Logo sx={{ mb: 5, mx: 11 }} height="60%" width="60%" />
          <Typography variant="h3" gutterBottom>
            Enter your new password
          </Typography>

          <Box sx={{ mt: 5, mb: 3 }}>
            <NewPasswordForm />
          </Box>
        </ContentStyle>
      </Container>
    </Page>
  );
}
