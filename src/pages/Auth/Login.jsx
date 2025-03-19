import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
// @mui
import { Box, Card, Button, Link, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
// routes
import { PATH_AUTH } from '../../routes/paths';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Image from 'src/components/image/Image';
import Logo from 'src/components/logo/Logo';
import Page from '../../components/Page';
// sections
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { map, remove } from 'lodash';
import { useRecoilState } from 'recoil';
import { ROLES_DATA, SignInTypes } from 'src/constants/AppConstants';
import { base64_images } from 'src/constants/ImageConstants';
import { signInAs } from 'src/global/recoilState';
import LoginForm from './LoginForm';
import SignedInAs from './SignedInAs';
import Carousel from './Carousel';
import useMediaQuery from '@mui/material/useMediaQuery';

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
  maxHeight: '95vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
}));

// ----------------------------------------------------------------------

export default function Login() {
  const theme = useTheme();
  const [signedInAs, setSignedInAs] = useRecoilState(signInAs);
  const [curr, setCurr] = useState(0);
  // const [carousel, setCarousel] = useState(true);

  const smUp = useResponsive('up', 'sm');

  const mdUp = useResponsive('up', 'md');

  const tabPort = useResponsive('up', 'md', 'sm');

  const mobileView = useMediaQuery('(max-width:420px)');

  const slides = [
    '/assets/background/img2.png',
    '/assets/background/img3.png',
    '/assets/background/img1.png',
  ];
  // const handleClick = () => {
  //   setCarousel(!carousel);
  // };

  return (
    <Page title="Login">
      {tabPort && (
        <RootStyle>
          <>
            <Stack style={{ width: '50%', height: '100%' }}>
              <HeaderStyle>
                <Logo
                  sx={{ mx: -3, mt: { md: -1, lg: -0.75, xl: 1, height: '60px', width: '280px' } }}
                />
              </HeaderStyle>

              <Stack sx={{ height: '100%', width: '100%' }}>
                <Carousel sx={{ height: '100%', width: '100%' }}>
                  {[
                    ...slides.map((images, index) => (
                      <img
                        className="tab-image"
                        src={images}
                        style={{
                          width: '100vw',
                          height: '60vh',
                          textAlign: 'center',
                          display: 'flex',
                          justifyContent: 'center',
                          paddingLeft: '10rem',
                          paddingRight: '7rem',
                        }}
                      />
                    )),
                  ]}
                </Carousel>
              </Stack>
            </Stack>
            <ContentStyle>
              <Stack sx={{ width: '27rem' }}>
                <Stack direction="row" alignItems="center" sx={{ mb: 5 }} className="welcome-text">
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack
                      flexDirection={'row'}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '30px',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h4" gutterBottom>
                        Welcome Back!
                      </Typography>
                      <SignedInAs />
                    </Stack>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Please sign in to continue
                    </Typography>
                  </Box>
                </Stack>
                <LoginForm className="login-form" />
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Don't have account?{' '}
                  <Link
                    variant="subtitle2"
                    to={PATH_AUTH.register}
                    component={RouterLink}
                    sx={{ color: '#1682fc' }}
                  >
                    Go to Registration
                  </Link>
                </Typography>
                <Stack
                  sx={{
                    width: '27rem',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: '10px',
                    fontSize: '14px',
                  }}
                >
                  <Typography sx={{ opacity: 0.5, fontSize: '12px' }}>
                    &copy; 2024 Positeasy app
                  </Typography>
                </Stack>
              </Stack>
            </ContentStyle>
          </>
        </RootStyle>
      )}

      {/* {!tabPort && carousel && (
          <Stack style={{ width: '100%', height: '100%', backgroundColor: '#eee' }}>
            <Button variant="text" sx={{ display: 'flex', justifyContent: 'end', p: '1rem' }}>
              <Typography variant="h4" onClick={handleClick}>
                skip
              </Typography>
            </Button>
            <Logo sx={{ pt: '20px', margin: 'auto', height: '92px', width: '290px' }} />

            <Stack sx={{ height: '100%', width: '100%' }}>
              <Carousel
                sx={{ height: '100%', width: '100%' }}
                autoSlide={false}
                handleClick={handleClick}
              >
                {[
                  ...slides.map((images) => (
                    <img
                      className="tab-image"
                      src={images}
                      style={{ textAlign: 'center' }}
                    />
                  )),
                ]}
              </Carousel>
            </Stack>
          </Stack>
        )} */}
      {!tabPort && (
        <ContentStyle>
          <Logo
            sx={{ mb: 5, mx: 11, objectFit: 'contain' }}
            marginTop="30px"
            height="40%"
            width="60%"
            className="logo-img"
            isObjectFix
          />
          <Stack sx={{ margin: 'auto', width: mobileView ? '17rem' : '25rem' }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Stack
                  flexDirection={'row'}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: mobileView ? '5px' : '30px',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    gutterBottom
                    sx={{ fontSize: mobileView ? '16px' : '24px', fontWeight: '700' }}
                  >
                    Welcome Back!
                  </Typography>
                </Stack>

                <Typography
                  sx={{ color: 'text.secondary', fontSize: mobileView ? '15px' : '16px' }}
                >
                  Please sign in to continue
                </Typography>
              </Box>
            </Stack>

            <Stack sx={{ width: '14.5rem', mb: 1.5 }}>
              <SignedInAs />
            </Stack>

            <LoginForm className="login-form" />
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
              Don't have account?{' '}
              <Link
                variant="subtitle2"
                to={PATH_AUTH.register}
                component={RouterLink}
                sx={{ color: '#1682fc' }}
              >
                Go to Registration
              </Link>
            </Typography>
            <Stack
              sx={{
                width: mobileView ? '17rem' : '25rem',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                position: 'absolute',
                bottom: '10px',
                fontSize: '14px',
              }}
            >
              <Typography sx={{ opacity: 0.5, fontSize: '12px' }}>
                &copy; 2024 Positeasy app
              </Typography>
            </Stack>
          </Stack>
        </ContentStyle>
      )}
    </Page>
  );
}
