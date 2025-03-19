import { Typography, Card, useTheme } from '@mui/material';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
//import { Divider } from '@mui/material';
import { alpha, Box, Stack } from '@mui/system';
import { map } from 'lodash';

export default function BestSeller({ title, chartDataRadial, total, subtitle1card3D }) {
  const theme = useTheme();
  let percentageData = {};

  const perArr = map(chartDataRadial, (data) => {
    const percent = (data.value / total) * 100;
    percentageData[percent] = data.value;
    return percent;
  });

  const stateRadial = {
    options: {
      chart: {
        height: 120,
        type: 'radialBar',
      },

      labels: map(chartDataRadial, (data) => data.label),
      series: perArr,
      plotOptions: {
        radialBar: {
          offsetY: 8,
          startAngle: -90,
          endAngle: 90,

          dataLabels: {
            name: {
              show: true,
              offsetY: 30,
            },
            value: {
              offsetY: -25,
              formatter: function (w) {
                const val = percentageData[w];
                // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                return val;
              },
            },
            total: {
              show: true,
              label: chartDataRadial?.[0]?.label,
              offsetY: -25,
              formatter: function (w) {
                // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                return `${subtitle1card3D}`;
              },
            },
          },
        },
      },

      colors: [
        theme.palette.chartcolorconstants.BESTSELLINGFIRST,
        theme.palette.chartcolorconstants.BESTSELLINGSECOND,
        theme.palette.chartcolorconstants.BESTSELLINGTHIRD,
      ],
    },
  };

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
        minHeight: '12.75rem',
        maxHeight: '12.75rem',
        maxWidth: '32rem',
      }}
    >
      <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.2), p: 1 }}>
        <Typography
          noWrap
          sx={{ fontWeight: 'bold', fontSize: '14px' }}
          color={theme.palette.primary.main}
        >
          {title}
        </Typography>
      </Box>
      <ReactApexChart
        type="radialBar"
        options={stateRadial.options}
        series={stateRadial.options.series}
        height={250}
      />
    </Card>
  );
}
