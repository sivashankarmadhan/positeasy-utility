import { Card, CardContent, Typography, useTheme, Stack, Divider } from '@mui/material';
import { alpha, Box, styled } from '@mui/system';
// import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';
import Label from '../components/label';

const PerformanceCardSplitTwice = (props) => {
  const theme = useTheme();
  const { title, subtitle, customMinHeight, isGst } = props;

  const { name1, value1, name2, value2 } = subtitle || {};

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
        maxHeight: '7.65rem',
        minHeight: '10rem',
        // minHeight: customMinHeight || 0,
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
        <Stack spacing={1} alignItems={'center'} justifyContent={'center'} direction="row">
          <Stack alignItems={'center'} justifyContent={'center'} spacing={0.5}>
            <Typography fontWeight={'bold'}>
              <stack>{name1}</stack>
            </Typography>
            <Typography>
              <Label variant="soft" color="success">
                {value1}
              </Label>
            </Typography>
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Stack alignItems={'center'} justifyContent={'center'} spacing={0.5}>
            <Typography fontWeight={'bold'}>
              <stack>{name2}</stack>
            </Typography>
            <Typography>
              <Label variant="soft" color="success">
                {value2}
              </Label>
            </Typography>
          </Stack>
          {/* {formatAmountToIndianCurrency(subtitle)} */}
        </Stack>
        {/* <Stack spacing={1} alignItems={'center'} justifyContent={'center'}>
          <Typography sx={{ wordWrap: 'break-word' }} variant={'h4'}>
            {formatAmountToIndianCurrency(subtitle)}
          </Typography>
        </Stack> */}
      </CardContent>
    </Card>
  );
};
export default PerformanceCardSplitTwice;
