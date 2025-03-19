import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import { Grid, Stack } from '@mui/material';

const ReportCardSkeletonLoader = () => {
    return (
    <Grid container spacing={2}  minHeight={'10rem'}>
    <Grid className="step2" item xs={12} sm={4} sx={{display: 'flex',justifyContent:'center',alignItems:'center', }}>
         <Skeleton variant="circular" width={56} height={56} sx={{ mb: 1 }}  />
      </Grid>
      <Grid className="step3" item xs={12} sm={4} sx={{display: 'flex',justifyContent:'center',alignItems:'center', }}>
        <Skeleton variant="circular" width={56} height={56} sx={{ mb: 1 }} />
      </Grid>
      <Grid className="step4" item xs={12} sm={4} sx={{display: 'flex',justifyContent:'center',alignItems:'center', }}>
       <Skeleton variant="circular" width={56} height={56} sx={{ mb: 1 }} />
      </Grid>
      </Grid>
    );
  };
  export default ReportCardSkeletonLoader;