import React, { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';


const CircularChartSkeletonLoader = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton variant="circular" width={260} height={260} />
            <Skeleton variant="text" width={80} height={35} sx={{ mt: 2 }} />
        </Box>
    );
};



export default CircularChartSkeletonLoader;