import { capitalCase } from 'change-case';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Card, Link, Container, Typography, Stack, Tooltip, useTheme } from '@mui/material';
// hooks

import useResponsive from '../../hooks/useResponsive';
// routes
import { PATH_AUTH } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Logo from 'src/components/logo/Logo';
import Image from 'src/components/image/Image';
// sections
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { base64_images } from 'src/constants/ImageConstants';
import RegisterForm from './RegisterForm';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  top: -30,
  zIndex: 9,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    alignItems: 'flex-start',
    padding: theme.spacing(7, 5, 0, 7),
  },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  maxHeight: '95vh',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
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

export default function Register() {
  const theme = useTheme();
  const smUp = useResponsive('up', 'sm');

  const mdUp = useResponsive('up', 'md');
  const tabPort = useResponsive('up', 'md', 'sm');

  return (
    <Page title="Register">
      <RootStyle>
        <HeaderStyle>
          {tabPort && <Logo sx={{ mx: -3, mt: { md: -1, lg: -0.75, xl: 1 } }} />}
          {smUp && tabPort && (
            <Typography variant="body2" sx={{ mt: { xs: 4, md: 2 } }}>
              Already have an account? {''}
              <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.login}>
                Login
              </Link>
            </Typography>
          )}
        </HeaderStyle>

        {mdUp && (
          <SectionStyle>
            <Image
              sx={{ height: '90%' }}
              visibleByDefault
              disabledEffect
              src={base64_images.LoginImage}
              alt="login"
            />
            <div
              style={{
                backgroundColor: theme.palette.primary.main,
                width: '100%',
                height: '10%',
                color: theme.palette.common.white,
                padding: 3,
              }}
            >
              <Stack flexDirection={'column'} sx={{ display: 'flex', height: '100%', pl: 2 }}>
                <Typography variant="h4"># Seamlessly Simple</Typography>

                <Typography sx={{ fontSize: 16 }}>
                  To automate your end-to-end business needs
                </Typography>
              </Stack>
              {/* </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    sx={{
                      color: '#FFFFFF',
                      alignItems: 'center',
                      display: 'flex',
                      mt: 1,
                      justifyContent: 'flex-end',
                      mr: 2,
                      borderRadius: 2,
                      border: 1,
                      px: 2,
                    }}
                    variant="subtitle2"
                    component={RouterLink}
                    to={PATH_AUTH.login}
                  >
                    Login <ArrowForwardIcon />
                  </Link>
                </div>
              </Stack> */}
            </div>
          </SectionStyle>
        )}

        <Container>
          <ContentStyle>
            {!tabPort && <Logo sx={{ mb: 3, mx: 11 }} height="60%" width="60%" />}
            <Stack direction="row" alignItems="center" sx={{ mb: 3, mt: -3 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" gutterBottom>
                  Sign up
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
              </Box>
            </Stack>

            <RegisterForm />

            {(!smUp || !tabPort) && (
              <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                Already have an account?
                <Link variant="subtitle2" to={PATH_AUTH.login} component={RouterLink}>
                  Login
                </Link>
              </Typography>
            )}
          </ContentStyle>
        </Container>
      </RootStyle>
    </Page>
  );
}
