import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
// utils
import { toFixedIfNecessary } from '../../../utils/formatNumber';
// components
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 392;

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    position: 'absolute !important',
    width: '100%',
  },
}));

// ----------------------------------------------------------------------

export default function Chart({ title, chartData, chartColors }) {
  const theme = useTheme();

  const chartLabels = chartData.map((i) => i.label);

  const chartSeries = chartData.map((i) => i.value);

  const state = merge(BaseOptionChart(), {
    colors: chartColors,
    labels: chartLabels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: { position: 'bottom', offsetY: -10, horizontalAlign: 'center' },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
      style: {
        fontSize: '11px',
        fontWeight: 'bold',
      },
    },

    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (seriesName) => toFixedIfNecessary(seriesName, 2),
        title: {
          formatter: (seriesName) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: { donut: { labels: { show: false } } },
    },
  });

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
        maxHeight: '14.7rem',
      }}
    >
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <Typography
          noWrap
          sx={{ fontWeight: 'bold', fontSize: '14px' }}
          color={theme.palette.primary.main}
        >
          {title}
        </Typography>
      </Box>
      <CardContent
        sx={{
          padding: 0,
        }}
      >
        <Stack spacing={1}>
          <ChartWrapperStyle dir="ltr">
            <ReactApexChart type="pie" options={state} series={chartSeries} height={235} />
          </ChartWrapperStyle>
        </Stack>
      </CardContent>
    </Card>
  );
}
