import { Grid, useMediaQuery, useTheme } from '@mui/material';
import { get, reduce } from 'lodash';
import React from 'react';
import PerformanceCard from 'src/components/PerformanceCard';
import AppPaymentType from 'src/components/AppPaymentType';
import { toFixedIfNecessary } from 'src/utils/formatNumber';
import ReportAndAnalyticsCard from 'src/components/ReportAndAnalyticsCard';
import { BestSellerCard1 } from 'src/components/BestSellerCard';

const CardsGst = ({
  totalCollectedAmount,
  totalGSTAmount,
  tableData,
  chartData,
  withoutGstAmount,
}) => {
  const theme = useTheme();

  const totalAmount = reduce(
    tableData,
    (accumulator, currentValue) =>
      accumulator + (get(currentValue, 'orderAmount') / 100 - get(currentValue, 'gstPrice') / 100),
    0
  );

  const totalGst = reduce(
    tableData,
    (accumulator, currentValue) => accumulator + get(currentValue, 'gstPrice') / 100,
    0
  );

  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Grid container spacing={2} sx={{ mb: 4 }} width={isMobile ? '106%' : '102%'}>
      <Grid className="step2" item xs={12} sm={4}>
        <PerformanceCard
          customMinHeight="5.7rem"
          title="Total amount incl. GST (₹)"
          subtitle={toFixedIfNecessary(totalCollectedAmount, 2)}
          isGst
        />
      </Grid>
      <Grid className="step3" item xs={12} sm={4}>
        <BestSellerCard1
          title={'Collected GST & WO GST Amount (₹)'}
          titleSubPre={'GST'}
          titleSubAbs={'WO GST '}
          subtitle1={toFixedIfNecessary(totalGSTAmount, 2)}
          subtitle2={toFixedIfNecessary(withoutGstAmount, 2)}
          isTerminal
        />
      </Grid>

      <Grid className="step4" item xs={12} sm={4}>
        {/* <Chart
          title="Type"
          chartData={[
            { label: 'Total Amount', value: totalAmount },
            { label: 'Total GST', value: totalGst },
          ]}
          chartColors={[theme.palette.warning.main, theme.palette.info.dark]}
        /> */}
        <AppPaymentType title={'Type'} chartDataPie={chartData} />
      </Grid>
    </Grid>
  );
};

export default CardsGst;
