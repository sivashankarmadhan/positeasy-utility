import { Card, CardContent, Typography, useTheme, Stack } from '@mui/material';
import { alpha, Box, styled } from '@mui/system';
// import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';

const PerformanceCard = (props) => {
  const theme = useTheme();
  const { title, subtitle, customMinHeight, isGst } = props;
  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
        // maxHeight: '7.65rem',
        minHeight: '10rem',
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
        <Stack spacing={1} alignItems={'center'} justifyContent={'center'}>
          <Typography sx={{ wordWrap: 'break-word' }} variant={'h4'}>
            {formatAmountToIndianCurrency(subtitle)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
export default PerformanceCard;
