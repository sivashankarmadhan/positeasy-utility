import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const ChartSkeletonLoader = () => {
  return (
    <Box sx={{ p: 2, borderRadius: '8px', position: 'relative', width: '100%', height: '325px' }}>
      <Grid container spacing={1} direction="column" sx={{ height: '100%' }}>
        {[2, 1, 0].map((value) => (
          <Grid item key={value} sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="text" width={20} height={30} sx={{ mr: 1 }} />
            <Skeleton variant="rectangular" height={1} width="100%" />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>
        <Skeleton variant="text" width={60} height={20} />
      </Box>
    </Box>
  );
};
export default ChartSkeletonLoader;