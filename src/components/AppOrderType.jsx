import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { map } from 'lodash';
import _ from 'lodash';
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import PaymentStatusCardFooter from './PaymentStatusCardFooter';
import { PaymentStatusConstants } from 'src/constants/AppConstants';

export default function AppOrderType({ title, chartData }) {
  const theme = useTheme();
  const state = {
    options: {
      chart: {
        width: 90,
        type: 'donut',
      },
      labels: map(chartData, (data) => data.label),
      series: map(chartData, (data) => data.value),
      dataLabels: {
        enabled: false,
      },
      colors: [
        theme.palette.chartcolorconstants.COMPLETED,
        theme.palette.chartcolorconstants.CANCELLED,
        theme.palette.chartcolorconstants.PENDING,
        theme.palette.chartcolorconstants.FAILED,
      ],
      
      legend: {
        show: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '90%',
          },
        },
      },

    },
  };

  return (
    <Box pb={2} my="auto">
    <Stack
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <ReactApexChart
        type="donut"
        options={state.options}
        series={state.options.series}
        height={312}
        width={400}
      />
      </Stack>
      <Stack>
      <PaymentStatusCardFooter
      content1={{ svg: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15">
          <rect
            width="10"
            height="10"
            fill={theme.palette.chartcolorconstants.COMPLETED}
            rx="5"
            ry="5"
            y="5"
          />
        </svg>),
        label: _.startCase(_.toLower(chartData[0].label)),
        value:chartData[0].value,
       }}
         content2={{ svg: (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15">
            <rect
              width="10"
              height="10"
              fill={theme.palette.chartcolorconstants.CANCELLED}
              rx="5"
              ry="5"
              y="5"
            />
          </svg>),
          label: _.startCase(_.toLower(chartData[1].label)),
          value: chartData[1].value,}}
           content3={{ svg: (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15">
              <rect
                width="10"
                height="10"
                fill={theme.palette.chartcolorconstants.PENDING}
                rx="5"
                ry="5"
                y="5"
              />
            </svg>),
            label:_.startCase(_.toLower(chartData[2].label)),
            value: chartData[2].value,}}
            
             content4={{ svg: (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15">
                <rect
                  width="10"
                  height="10"
                  fill={theme.palette.chartcolorconstants.FAILED}
                  rx="5"
                  ry="5"
                  y="5"
                />
              </svg>),
               label:_.startCase(_.toLower(chartData[3].label)),
               value: chartData[3].value,}}
      />
    </Stack>
    </Box>
  );
}
