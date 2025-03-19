import { Box, Card, Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { get } from 'lodash';
import { TREND_STATUS } from 'src/constants/AppConstants';
import { fPercent } from 'src/utils/formatNumber';
import Image from '../../components/image';

const MiniCard = ({ logo, title, trendStatus, trendValue, value, bar, progress }) => {
  function numberToPercentage(number) {
    if (number < 100) return number;
    else {
      const numberLength = String(number).length;
      const dividedBy = Math.pow(10, numberLength);
      return (number / dividedBy) * 100;
    }
  }
  function getColor(percentage) {
    if (percentage < 10) {
      return '#FF0000';
    } else if (percentage >= 10 && percentage < 25) {
      return '#FFFF00';
    } else if (percentage >= 25 && percentage < 50) {
      return '#800080';
    } else if (percentage >= 50 && percentage < 75) {
      return '#0000FF';
    } else if (percentage >= 75) {
      return '#00FF00';
    }
  }

  return (
    <Card sx={{ height: '100%', width: '100%', borderRadius: 3.5, p: 2 }}>
      <Stack flexDirection="row" gap={1.5}>
        <Box
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            backgroundColor: '#f2f2f2',
            height: '45px',
          }}
        >
          <Image src={logo} sx={{ width: '1.8rem' }} />
        </Box>
        <Stack gap={0.2} justifyContent="center">
          <Typography variant="subtitle2">{title}</Typography>
          {trendStatus && (
            <Stack flexDirection="row" gap={0.5}>
              <Box
                sx={{
                  p: 0.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  backgroundColor: TREND_STATUS[trendStatus].light,
                  height: '17px',
                }}
              >
                {Object.keys(TREND_STATUS)[0] === trendStatus ? (
                  <TrendingUpIcon
                    sx={{ width: 10, height: 10, color: TREND_STATUS[trendStatus].dark }}
                  />
                ) : (
                  <TrendingDownIcon
                    sx={{ width: 10, height: 10, color: TREND_STATUS[trendStatus].dark }}
                  />
                )}
              </Box>
              <Typography variant="overline" sx={{ color: TREND_STATUS[trendStatus].dark }}>
                {`${trendValue >= 0 ? TREND_STATUS[trendStatus].symbol : ''} ${fPercent(
                  trendValue
                )}`}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Typography sx={{ textAlign: 'center' }} variant="h4" pt={3}>
        {value}
      </Typography>

      <Box sx={{ position: 'relative', width: '80%', mx: 'auto', mt: 2 }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: 2,
            borderRadius: 7,
            backgroundColor: '#ebeaea',
          }}
        />
        <Tooltip title={`${numberToPercentage(progress)}%`}>
          <Box
            sx={{
              backgroundColor: getColor(numberToPercentage(progress)),
              width: `${numberToPercentage(progress)}%`,
              position: 'absolute',
              top: 0,
              borderRadius: 7,
              height: 2,
            }}
          />
        </Tooltip>
      </Box>
    </Card>
  );
};

export default MiniCard;
