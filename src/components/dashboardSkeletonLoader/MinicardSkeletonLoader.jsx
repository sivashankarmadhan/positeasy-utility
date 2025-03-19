import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

const PaymentCardSkeletonLoader = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 2,
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: 1,
        }}
      >
        <Skeleton variant="circular" width={56} height={56} sx={{ mb: 1 }} />
  
        <Skeleton variant="text" width={120} height={30} sx={{ mb: 1 }} />
  
        <Skeleton variant="text" width={40} height={50} />
      </Box>
    );
  };
  export default PaymentCardSkeletonLoader;