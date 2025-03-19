import { Grid, useMediaQuery } from '@mui/material';
import { BestSellerCard1, BestSellerCard2 } from './BestSellerCard';
import AppPaymentType from '../components/AppPaymentType';
import PerformanceCardSplitTwice from './PerformanceCardSplitTwice';
import { isPlainObject } from 'lodash';
import PerformanceCardSplitThrece from './PerformanceCardSplitThrece';

export default function ReportAndAnalyticsCard({
  titleDcard1,
  subtitle1card1D,
  isReport,
  subtitle1card2D,
  subtitle1card3D,
  titleDcard2,
  subtitleDcard2,
  subtitleDcard4D,
  chartTitle,
  chartData,
  total,
  isNotRupee,
  customMinHeight,
  titleDcard3,
  titleDcard4

}) {
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Grid container spacing={2} width={isMobile ? '106%' : '102%'}>
      <Grid className="step2" item xs={12} sm={4}>
       {isReport ?
        <BestSellerCard1
          title={titleDcard1}
          titleSubPre={titleDcard3}
          titleSubAbs={titleDcard4}
          subtitle1={subtitle1card1D}
          subtitle2={subtitle1card2D}
          isTerminal
        /> : <BestSellerCard1
        title={titleDcard1}
        subtitle1={subtitle1card1D}
        subtitle2={subtitle1card2D}
      />}
      </Grid>
      <Grid className="step3" item xs={12} sm={4}>
        {isPlainObject(subtitleDcard2) ? (
          <PerformanceCardSplitThrece
            title={titleDcard2}
            subtitle={subtitleDcard2}
            customMinHeight={customMinHeight}
          />
        ) : (
          <BestSellerCard2 title={titleDcard2} subtitle={subtitleDcard2} />
        )}
      </Grid>

      <Grid className="step4" item xs={12} sm={4}>
        <AppPaymentType
          title={chartTitle}
          chartDataPie={chartData}
          cardHeight="10rem"
          isNotRupee={isNotRupee}
        />
      </Grid>
    </Grid>
  );
}
