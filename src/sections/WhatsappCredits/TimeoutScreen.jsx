import React, { useState } from 'react';
import useResponsive from '../../hooks/useResponsive';
import { Box, Paper, Typography, Button, CircularProgress, Link } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router';
import { base64_images } from '../../constants/ImageConstants';

const TimeoutScreen = ({ callVerifyPaymentApi, paymentErrorMsg, isSentPaymentApiCall }) => {
  const navigate = useNavigate();

  const [isCheckStateOneTime, setIsCheckStateOneTime] = useState(true);

  const isMobile = useResponsive('between', 'md', 'xs', 'sm');
  const isTab = useResponsive('between', 'md', 'sm', 'md');

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={3}
      // py={8}
      mx="auto"
    >
      {/* <Paper
        elevation={3}
        sx={{
          width: '94%',
          height: 'calc(100vh - 115px)',
          mt: 0,
          py: 3,
          px: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      > */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1.5}
        mt={2}
      >
        <Box
          component="img"
          src={base64_images.Timeout}
          alt="timeout"
          sx={{ height: 90, width: 90 }}
        />
        <Typography
          variant={isTab ? 'h4' : 'h5'}
          fontWeight="bold"
          textAlign="center"
          color="warning.main"
        >
          Time out
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          position="relative"
        >
          <Button
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              px: 3,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}
            onClick={() => navigate('/dashboard/menu', { replace: true })}
            endIcon={<ArrowForwardIosIcon sx={{ width: 15, height: 15 }} />}
          >
            Retry
          </Button>

          {isCheckStateOneTime && (
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Money got debited? check your status here{' '}
              <Link
                component="button"
                color="primary"
                onClick={() => {
                  callVerifyPaymentApi(true);
                  setIsCheckStateOneTime(false);
                }}
                sx={{ mb: 0.4, ml: 0.5, textDecoration: 'underline' }}
              >
                click
              </Link>
            </Typography>
          )}

          {isSentPaymentApiCall && (
            <Box display="flex" justifyContent="center" position="absolute" top={7} left={7}>
              <CircularProgress size={50} color="secondary" />
            </Box>
          )}
          {paymentErrorMsg && (
            <Typography variant="body1" color="error">
              {paymentErrorMsg}
            </Typography>
          )}
        </Box>
      </Box>
      {/* </Paper> */}
    </Box>
  );
};

export default TimeoutScreen;
