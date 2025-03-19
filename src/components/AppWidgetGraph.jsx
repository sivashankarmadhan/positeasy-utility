import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Box, Divider, Stack, Typography } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
// utils
import { fNumber, fPercent } from '../utils/formatNumber';
// components
import { isEmpty } from 'lodash';
import Iconify from '../components/iconify';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import OrderExpenseCardFooter from './OrderExpenseCardFooter';

// ----------------------------------------------------------------------

const IconWrapperStyle = styled('div')(({ theme }) => ({
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.success.main,
  backgroundColor: alpha(theme.palette.success.main, 0.16),
}));

// ----------------------------------------------------------------------

AppWidgetGraph.propTypes = {
  chartColor: PropTypes.string.isRequired,
  chartData: PropTypes.arrayOf(PropTypes.number).isRequired,
  chartExpenseData: PropTypes.arrayOf(PropTypes.number).isRequired,
  percent: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  percentReference: PropTypes.string.isRequired,
  total: PropTypes.number,
  sx: PropTypes.object,
};

export default function AppWidgetGraph({
  title,
  percentReference,
  percent,
  total,
  totalMoney,
  totalExpenses,
  chartColor,
  chartLabels,
  chartData,
  chartExpenseData,
  sx,
  ...other
}) {
  const theme = useTheme();

  const chartOptions = {
    colors: [
      theme.palette.chartcolorconstants.DASHBOARD_EARNINGS,
      theme.palette.chartcolorconstants.DASHBOARD_EXPENSES,
    ],
    chart: {
      sparkline: { enabled: true },
      type: 'bar',

      stacked: true,
    },
    plotOptions: {
      bar: {
        columnWidth: '68%',
        // borderRadius: 4,
      },
    },
    xaxis: {
      categories: chartLabels,
    },
    tooltip: {
      y: {
        formatter: (seriesName) => seriesName,
        title: {
          formatter: (seriesName, { seriesIndex }) => {
            if (seriesIndex === 0) {
              // First series (earnings)
              return `Earnings: ₹`;
            } else if (seriesIndex === 1) {
              // Second series (expenses)
              return `Expenses: ₹`;
            } else return '';
          },
        },
      },
      x: {
        formatter: (seriesData) => {
          function formatTimeRange(input) {
            const hour = parseInt(input, 10);
            const period = input.slice(-2).toUpperCase();
            const startHour = hour === 12 ? 12 : hour;
            const endHour = (hour + 1) % 12 || 12;
            const endPeriod = hour + 1 < 12 ? period : period === 'AM' ? 'PM' : 'AM';
            return `${startHour}${period}-${endHour}${endPeriod}`;
          }

          if (seriesData.includes('AM') || seriesData.includes('PM')) {
            return formatTimeRange(seriesData);
          } else {
            return seriesData;
          }
        },
      },
      marker: { show: false },
    },
  };

  return (
    <Stack sx={{ height: '19.25rem' }}>
      <Stack flexDirection={'column'} justifyContent={'space-between'} p={2} gap={1}>
        <Typography variant="h5">{title}</Typography>
        <Stack direction="row" spacing={1}>
          <IconWrapperStyle
            sx={{
              ...(percent < 0 && {
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.16),
              }),
            }}
          >
            <Iconify
              width={16}
              height={16}
              icon={percent >= 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
            />
          </IconWrapperStyle>
          <Typography component="span" variant="subtitle2">
            {percent > 0 && '+'}
            {fPercent(Number(percent))}
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.4 }}>
            than {percentReference}
          </Typography>
        </Stack>
      </Stack>
      <Stack>
        {!isEmpty(chartData) && !isEmpty(chartExpenseData) && (
          <ReactApexChart
            type="bar"
            series={[{ data: chartData }, { data: chartExpenseData }]}
            options={chartOptions}
            width={'100%'}
            height={'120px'}
          />
        )}
      </Stack>

      <OrderExpenseCardFooter
        content1={{ title: 'Orders', value: fNumber(total) }}
        content2={{
          title: 'Earnings',
          value: fNumber(totalMoney),
          svg: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15">
              <rect
                width="10"
                height="10"
                fill={theme.palette.chartcolorconstants.DASHBOARD_EARNINGS}
                rx="5"
                ry="5"
                y="5"
              />
            </svg>
          ),
        }}
        content3={{
          title: 'Expenses',
          value: fNumber(totalExpenses),
          svg: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15">
              <rect
                width="10"
                height="10"
                fill={theme.palette.chartcolorconstants.DASHBOARD_EXPENSES}
                rx="5"
                ry="5"
                y="5"
              />
            </svg>
          ),
        }}
      />
    </Stack>
  );
}
