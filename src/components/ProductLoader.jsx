import { Stack, useTheme } from '@mui/material';
import React from 'react';
import { RotatingLines } from 'react-loader-spinner';

export default function ProductLoader({ width = 35, visible = true }) {
  const theme = useTheme();
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <RotatingLines
        strokeColor={theme.palette.primary.main}
        strokeWidth="5"
        animationDuration="0.75"
        width={width}
        visible={visible}
      />
    </Stack>
  );
}
