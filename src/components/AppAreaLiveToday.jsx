import { Stack, Typography } from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { isEmpty } from 'lodash';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { formatTimeRange } from 'src/helper/FormatTime';
export default function AppAreaLiveToday({
  title,
  subheader,
  total,
  chartLabels,
  chartData,
  ...other
}) {
  const isMobile = useMediaQuery('(max-width:600px)');

  const chartProperties = {
    options: {
      chart: {
        type: 'line',
        stacked: false,
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        y: {
          formatter: (seriesName) => seriesName,
          title: {
            formatter: (seriesName) => `Earnings ₹`,
          },
        },
        x: {
          formatter: (seriesData) => {
            return formatTimeRange(seriesData);
          },
        },
      },
      xaxis: {
        categories: chartLabels,
        labels: {
          style: {
            fontSize: isMobile ? '6px' : '12px',
            fontWeight: 500,
          },
        },
      },

      series: chartData.map((item) => ({
        name: item.year,
        data: item.data.find((dataItem) => dataItem.name === 'LiveData').data,
      })),
      stroke: {
        curve: 'smooth',
      },
    },
  };

  return (
    <Stack>
      <Stack>
        {!isEmpty(chartData) && (
          <ReactApexChart
            type="line"
            options={chartProperties.options}
            series={chartProperties.options.series}
            height={260}
            width={'100%'}
          />
        )}
      </Stack>
    </Stack>
  );
}
