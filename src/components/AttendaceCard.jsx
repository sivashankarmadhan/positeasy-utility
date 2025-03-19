import { Card, CardContent, Typography, useTheme, Stack, Divider } from '@mui/material';
import { alpha, Box, styled } from '@mui/system';
import login from 'src/layouts/login';
import Label from '../components/label';

// import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { formatAmountToIndianCurrency } from '../utils/formatNumber';

const AttendaceCard = (props) => {
    const theme = useTheme();
    const { title, subtitle,subtitle1, customMinHeight, isGst, showTwoValues,titleSubPre,titleSubAbs } = props;
    return (
        <Card
            sx={{
                backgroundColor: 'white',
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.2),
                mr: 1,
                // maxHeight: '7.65rem',
                // minHeight: customMinHeight || 0,
                minHeight:'10rem'
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
                            // minHeight: customMinHeight || 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            bottom: 30,
                            mt: 3,
                        }
                        : {
                        }
                }
            >
                {!showTwoValues &&
                    <Stack spacing={1} alignItems={'center'} pb={2} justifyContent={'center'} >
                        <Typography sx={{ wordWrap: 'break-word' }} variant={'h4'}>
                            {subtitle}
                        </Typography>
                    </Stack>}
                {showTwoValues &&
                    <Stack spacing={1} alignItems={'center'} justifyContent={'center'} direction='row'>
                        <Stack alignItems={'center'} justifyContent={'center'} spacing={0.5}><Typography fontWeight= {'bold'} ><stack >{titleSubPre}</stack></Typography><Typography><Label variant="soft" color='success'>{subtitle}</Label ></Typography></Stack>
                        <Divider orientation="vertical" flexItem/>
                        <Stack alignItems={'center'} justifyContent={'center'} spacing={0.5}><Typography fontWeight= {'bold'} ><stack >{titleSubAbs}</stack></Typography><Typography><Label variant="soft" color='error' sx={{  maxWidth: '100%' }}>{subtitle1}</Label></Typography></Stack>
                        {/* {formatAmountToIndianCurrency(subtitle)} */}
                        

                    </Stack>}
            </CardContent>
        </Card>
    );
};
export default AttendaceCard;
