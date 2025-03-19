import { Helmet } from 'react-helmet-async';
// @mui
import { Typography, useTheme } from '@mui/material';
// components
import { useState } from 'react';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { useSettingsContext } from '../components/settings';
// ----------------------------------------------------------------------

export default function Settlement() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();

  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) return <LoadingScreen />;
  return (
    <>
      <Helmet>
        <title> Settlements | POSITEASY</title>
      </Helmet>
      <Typography
        sx={{
          position: 'absolute',
          left: '45%',
          top: 350,
        }}
      >
        <h1>Coming Soon</h1>
      </Typography>
    </>
  );
}
