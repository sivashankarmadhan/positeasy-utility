import { Typography } from '@mui/material';
import React from 'react';
import { ComingSoonIllustration } from 'src/assets/illustrations';

export default function ComingSoon() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <ComingSoonIllustration />
      <Typography
        variant="h6"
        sx={{ position: 'absolute', bottom: 10, right: 10, color: 'text.secondary' }}
      >
        Coming soon...
      </Typography>
    </div>
  );
}
