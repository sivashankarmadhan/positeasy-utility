import { Grid, useMediaQuery } from '@mui/material';
import PerformanceCard from 'src/components/PerformanceCard';
import AppPaymentType from 'src/components/AppPaymentType';
import PerformanceCardSplitTwice from './PerformanceCardSplitTwice';
import { isArray, isPlainObject } from 'lodash';

export default function ReportAndAnalyticsCard({
  titleDcard1,
  subtitleDcard1,
  titleDcard2,
  subtitleDcard2,
  chartTitle,
  chartData,
  isNotRupeeForChartData,
}) {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Grid container spacing={2} width={isMobile ? '106%' : '102%'} minHeight={'10rem'}>
      <Grid className="step2" item xs={12} sm={4}>
        {isPlainObject(subtitleDcard1) ? (
          <PerformanceCardSplitTwice title={titleDcard1} subtitle={subtitleDcard1} />
        ) : (
          <PerformanceCard title={titleDcard1} subtitle={subtitleDcard1} />
        )}
      </Grid>
      <Grid className="step3" item xs={12} sm={4}>
        {isArray(subtitleDcard2) ? (
          <AppPaymentType title={titleDcard2} chartDataPie={subtitleDcard2} />
        ) : (
          <PerformanceCard title={titleDcard2} subtitle={subtitleDcard2} />
        )}
      </Grid>
      <Grid className="step4" item xs={12} sm={4}>
        <AppPaymentType
          title={chartTitle}
          chartDataPie={chartData}
          isNotRupee={isNotRupeeForChartData}
        />
      </Grid>
    </Grid>
  );
}
