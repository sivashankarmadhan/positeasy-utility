import { Card, CardContent, Typography, useTheme, Stack } from '@mui/material';
import { alpha, Box, styled } from '@mui/system';
// import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { Divider } from '@mui/material';
import Label from '../components/label';
import Iconify from '../components/iconify';
import { fCurrency, fPercent } from '../utils/formatNumber';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Icon } from '@iconify/react';

const BestSellerCard1 = (props) => {
  const theme = useTheme();
  const { title, subtitle1, subtitle2, titleSubPre, titleSubAbs, isTerminal } = props;

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
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
      <CardContent>
       {!isTerminal ? <br></br> : null}

        <Stack direction="row" spacing={1} alignItems={'center'} justifyContent={'center'} >
         
            <Stack direction="column" spacing={0.5} alignItems={'center'} justifyContent={'center'} >
            {isTerminal ?
            <>
              <Typography sx={{ wordWrap: 'break-word', textAlign: 'center' }} variant="h6">
                {titleSubPre}
              </Typography>
              <Typography sx={{ wordWrap: 'break-word', textAlign: 'center' }} variant="h6">
                <Label variant="soft" color='success'>
                  {subtitle1}
                </Label>
              </Typography>
              </>
            : <Typography sx={{ wordWrap: 'break-word', textAlign: 'center' }} variant="h6">
              {subtitle2}
            </Typography>
          }
            </Stack>


      {isTerminal  &&  <Divider orientation="vertical" flexItem />}
         
            <Stack direction="column" spacing={0.5} alignItems={'center'} justifyContent={'center'} >
               {isTerminal ?
               <>
              <Typography sx={{ wordWrap: 'break-word', textAlign: 'center' }} variant="h6">
                {titleSubAbs}
              </Typography>
              <Typography sx={{ wordWrap: 'break-word', textAlign: 'center' }} variant="h6">
                <Label variant="soft" color='success'>
                  {subtitle2}
                </Label>
              </Typography>
              </>
             :
            <Typography sx={{ wordWrap: 'break-word', textAlign: 'center' }} variant="h6">
              {subtitle1}
            </Typography>
        
                }
                </Stack>
          


      </Stack>

      

    </CardContent>
    </Card >
  );
};
const BestSellerCard2 = (props) => {
  const theme = useTheme();
  const { title, subtitle } = props;

  return (
    <Card
      sx={{
        backgroundColor: 'white',
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        mr: 1,
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
      <CardContent>
        <br />
        <Stack direction="column" spacing={1} alignItems={'center'}>
          <Typography
            sx={{ wordWrap: 'break-word', fontSize: '20px', fontWeight: 'bold' }}
            variant="h4"
          >
            {subtitle}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
export { BestSellerCard1, BestSellerCard2 };
