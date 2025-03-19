import { Card, CardContent, Typography, useTheme, Stack, Divider } from '@mui/material';
import { alpha, Box, styled } from '@mui/system';
// import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { fCurrency, formatAmountToIndianCurrency } from '../utils/formatNumber';
import Label from '../components/label';

const PerformanceCardSplitThrece = (props) => {
  const theme = useTheme();
  const { title, subtitle, customMinHeight, isGst } = props;

  const { name1, value1, name2, value2, name3, value3 } = subtitle || {};

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
        maxHeight: '7.65rem',
        minHeight: customMinHeight || 0,
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
        sx={
          isGst
            ? {
                minHeight: customMinHeight || 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                bottom: 30,
                mt: 3,
              }
            : {}
        }
      >
        <Stack spacing={1} direction="row" mt={2.5}>
          <Stack spacing={0.5} sx={{ width: '33%' }}>
            <Typography fontWeight={'bold'} sx={{ fontSize: '12px' }}>
              <stack>{name1}</stack>
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#A9A9A9' }} fontWeight={'bold'}>
              {fCurrency(value1)}
            </Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack spacing={0.5} sx={{ width: '33%' }}>
            <Typography fontWeight={'bold'} sx={{ fontSize: '12px' }}>
              <stack>{name2}</stack>
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#A9A9A9' }} fontWeight={'bold'}>
              {fCurrency(value2)}
            </Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack spacing={0.5} sx={{ width: '33%' }}>
            <Typography fontWeight={'bold'} sx={{ fontSize: '12px' }}>
              <stack>{name3}</stack>
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#A9A9A9' }} fontWeight={'bold'}>
              {fCurrency(value3)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
export default PerformanceCardSplitThrece;
