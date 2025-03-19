import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const TransactionSkeletonLoader = () => {
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <Skeleton variant="text" height={40} />
        </Grid>
        <Grid item xs={3}>
          <Skeleton variant="text" height={40} />
        </Grid>
        <Grid item xs={3}>
          <Skeleton variant="text" height={40} />
        </Grid>
        <Grid item xs={3}>
          <Skeleton variant="text" height={40} />
        </Grid>
      </Grid>

      {[1, 2, 3].map((index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Skeleton variant="text" height={30} />
          </Grid>
          <Grid item xs={3}>
            <Skeleton variant="text" height={30} />
          </Grid>
          <Grid item xs={3}>
            <Skeleton variant="text" height={30} />
          </Grid>
          <Grid item xs={3}>
            <Skeleton variant="text" height={30} />
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default TransactionSkeletonLoader;

