import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Button, Container, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Logo from '../../components/logo/Logo';
// sections
import ResetPasswordForm from '../../sections/auth/reset-password/ResetPasswordForm';

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

export default function ResetPassword() {
  return (
    <Page title="Reset Password">
      <Container>
        <ContentStyle sx={{ textAlign: 'center' }}>
          <Logo sx={{ mb: 5, mx: 11 }} height="60%" width="60%" />
          <Typography variant="h3" paragraph>
            Forgot your password?
          </Typography>

          <Typography sx={{ color: 'text.secondary', mb: 5 }}>
            Please enter the email address associated with your account and We will email you a link
            to reset your password.
          </Typography>

          <ResetPasswordForm />

          <Button fullWidth size="large" sx={{ mt: 1 }} component={RouterLink} to={PATH_AUTH.login}>
            Back
          </Button>
        </ContentStyle>
      </Container>
    </Page>
  );
}
