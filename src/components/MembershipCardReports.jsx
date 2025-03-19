import { Grid, useMediaQuery } from '@mui/material';
import PerformanceCard from 'src/components/PerformanceCard';
import AppPaymentType from 'src/components/AppPaymentType';
import AttendaceCard from './AttendaceCard';

export default function MembershipCardReports({
  titleDcard1,
  subtitleDcard1,
  titleDcard2,
  subtitleDcard2,
  titleDcard3,
  subtitleDcard3,
  subtitleDcard4,
  subtitleDcard5,
  isMembership,
  titleDcard4,
  titleDcard5,
  titleDcard6,
  titleDcard7,
}) {

  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <Grid container spacing={2} width={isMobile ? '106%' : '102%'} mt={0.1}>
      <Grid className='step2' item xs={12} sm={4}>
        {isMembership ? <AttendaceCard title={titleDcard1} subtitle={subtitleDcard1} /> : <PerformanceCard title={titleDcard1} subtitle={subtitleDcard1} />}
      </Grid>
      <Grid className='step3' item xs={12} sm={4}>
        {isMembership ? <AttendaceCard title={titleDcard2} titleSubPre={titleDcard4} titleSubAbs={titleDcard5} subtitle={subtitleDcard2} subtitle1={subtitleDcard3} showTwoValues /> : <PerformanceCard title={titleDcard2} subtitle={subtitleDcard2} />}
      </Grid>
      <Grid className='step4' item xs={12} sm={4}>
        {isMembership ? <AttendaceCard title={titleDcard3} titleSubPre={titleDcard6} titleSubAbs={titleDcard7} subtitle={subtitleDcard4} subtitle1={subtitleDcard5} showTwoValues /> : <PerformanceCard title={titleDcard3} subtitle={subtitleDcard3} />}
      </Grid>
    </Grid>
  );
}
