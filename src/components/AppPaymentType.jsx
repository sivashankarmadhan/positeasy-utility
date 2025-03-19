import { Typography, Card, useTheme } from '@mui/material';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { alpha, Box, Stack } from '@mui/system';
import { map } from 'lodash';
import { useResponsive } from '@poriyaalar/custom-hooks';
import { fCurrency } from '../utils/formatNumber';

export default function AppPaymentType({ title, chartDataPie, cardHeight, isNotRupee = false }) {
  const theme = useTheme();

  const { isMobile, isTab, isLaptop, isDesktop, isTV } = useResponsive();

  const statePie = {
    options: {
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        stackType: '100%',
        offsetY: -70,
        sparkline: {
          enabled: true,
        },
      },
      series: map(chartDataPie, (e) => {
        return { name: e.label, data: [e.value] };
      }),

      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            position: 'top',
          },
          horizontal: true,
          barHeight: '10%',
          borderRadius: 10,
          borderRadiusWhenStacked: 'last',
        },
      },
      dataLabels: {
        enabled: true,
        offsetX: -10,
      },
      stroke: {
        width: 1,
        colors: ['#fff'],
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return isNotRupee ? val : fCurrency(val);
          },
        },
        x: {
          show: false,
        },
        position: 'top',
        fixed: {
          enabled: true,
          position: 'top',
          offsetX: 0,
          offsetY: 0,
        },
      },
      legend: {
        show: true,
        position: 'bottom',
        horizontalAlign: 'center',
        offsetX: 1,
        offsetY: cardHeight ? -30 : -52,
        fontSize: '10px',
        showForSingleSeries: true,
        markers: {
          radius: 10,
        },
      },
    },
  };

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
        // maxHeight: cardHeight ? cardHeight : '7.65rem',
        maxHeight: '7.65rem',
        minHeight: '10rem',
        // minHeight: customMinHeight || 0,
      }}
    >
      <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.2), p: 1 }}>
        <Typography
          sx={{ fontWeight: 'bold', fontSize: '14px' }}
          color={theme.palette.primary.main}
        >
          {title}
        </Typography>
      </Box>

      <Stack direction="row" display="flex" justifyContent="center">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 1,
            '& .apexcharts-bar-series.apexcharts-plot-series  .apexcharts-series:nth-child(1) path':
              {
                clipPath: 'inset(0% -20% 0% 10% round 11px)',
              },
          }}
        >
          <ReactApexChart
            type="bar"
            options={statePie.options}
            series={statePie.options.series}
            height={200}
            width={isMobile ? 220 : isTab ? 230 : isLaptop ? 220 : isDesktop ? 250 : 280}
          />
        </Box>
      </Stack>
    </Card>
  );
}
