import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilValue ,useRecoilState } from 'recoil';
import UpgradePlan from 'src/components/subscriptionPlan/UpgradePlan';
import { TERMINAL_STATUS } from 'src/constants/AppConstants';
import { currentStoreId, currentTerminalId, storeIdState,couponDetailsState } from 'src/global/recoilState';
import SubscriptionPlan_API from 'src/services/API/SubscriptionServices';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import { fCurrency } from 'src/utils/formatNumber';
import { fDates } from 'src/utils/formatTime';
import subscriptionDate from 'src/utils/subscriptionDate';
import Icon1 from '../assets/icons/Icon1.png';
import Icon2 from '../assets/icons/Icon2.png';
import Icon3 from '../assets/icons/Icon3.png';

import { ErrorConstants } from '../constants/ErrorConstants';

export default function SubscriptionPlan() {
  const storeId = useRecoilValue(storeIdState);
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [isToggled, setIsToggled] = useState('year');
  const [Toggled, setToggled] = useState('Software');
  const [openForm, isOpenForm] = useState(true);
  const [subScriptionCard, setSubScriptionCard] = useState([]);
  const [disabledCardId, setDisabledCardId] = useState(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlanDetails, setActivePlanDetails] = useState({});
  const [couponDetails, setCouponDetails] = useRecoilState(couponDetailsState);

console.log('coupons',couponDetails);

  const CustomToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: '#FBFBFB',
    '& .MuiToggleButton-root': {
      '&.Mui-selected': {
        backgroundColor: '#5a2c4a',
        color: 'white',
      },
    },
  }));

  const handleChangeToggle = (event, value) => {
    if (value !== null) {
      setIsToggled(value);
    }
  };

  const handleChange = (event, value) => {
    if (value !== null) {
      setToggled(value);
    }
  };

  const handleClick = async (plan) => {
    setSelectedPlan(plan); // Show selected plan details
    isOpenForm(false);
    setIsChangingPlan(true);
    console.log('Plan clicked:', plan);
  };

  const getSubScriptionCard = async () => {
    try {
      const res = await SubscriptionPlan_API.getSubScriptionCard(Toggled);
      setSubScriptionCard(get(res, 'data', []));
    } catch (e) {
      console.log('Error fetching subscription cards:', e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    console.log('openFormmmmm', openForm);
    if (openForm) {
      getSubScriptionCard();
    }
  }, [Toggled, openForm]);

  const getIconByPlanName = (planName) => {
    switch (planName) {
      case 'Growth':
        return Icon1;
      case 'Unlimited':
        return Icon2;
      case 'Enterprise':
        return Icon3;
      default:
        return Icon1; // Fallback icon
    }
  };
  const currentDate = dayjs().format('YYYY-MM-DD');
  console.log('currentDate', currentDate);
  const nextRenewalDate = dayjs(activePlanDetails?.recentSubscription?.nextRenewal).format(
    'YYYY-MM-DD'
  );
  console.log('nextRenewalDate', nextRenewalDate);

  const isExpired = currentDate >= nextRenewalDate;
  // const isExpired = 'Aug 23 2024 11:10:13' <= 'Aug 23 2024 17:43:07';

  const matchedCard = subScriptionCard.find((card) => card.subscriptionId === disabledCardId);

  const user = AuthService._getMerchantDetails();
  const [selectedCardId, setSelectedCardId] = useState(null);

  const getAmount = (amount, type) => {
    if (type === 'monthly') {
      return isToggled === 'month' ? amount : amount * 6; // Multiply by 6 for a half-yearly view
    } else if (type === 'half-yearly') {
      return isToggled === 'month' ? amount : amount; // Divide by 6 for a monthly view
    } else if (type === 'yearly') {
      return isToggled === 'month' ? amount : amount; // Divide by 12 for a monthly view
    }
    return amount;
  };
  const filteredSubscriptionCard = subScriptionCard.filter((card) =>
    isToggled === 'month'
      ? card.type === 'monthly'
      : isToggled === 'year'
      ? card.type === 'yearly'
      : isToggled === 'half-yearly'
      ? card.type === 'half-yearly'
      : false
  );

  // Helper function to get the label based on the toggle state
  const getLabel = (type) => {
    if (isToggled === 'month') {
      return type === 'monthly'
        ? 'per month'
        : type === 'half-yearly'
        ? 'for 6 months'
        : 'for 1 year';
    } else {
      return type === 'monthly'
        ? 'per month'
        : type === 'half-yearly'
        ? 'for 6 months'
        : 'for 1 year';
    }
  };

  const getActivePlanDetails = async () => {
    try {
      const response = await SubscriptionPlan_API.getActiveSubscriptionPlanDetails();
      setActivePlanDetails(get(response, 'data') || {});
      // if (response?.data?.recentSubscription?.nextRenewal) {
      setDisabledCardId(response?.data?.recentSubscription?.subscriptionId);
      // }
    } catch (error) {
      toast.error(error?.message || error?.errorResponse?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    if (currentStore && openForm) {
      getActivePlanDetails();
    }
  }, [currentStore, openForm]);

  console.log('disabledCardId', disabledCardId);

  return (
    <>
      <Box sx={{ m: 2 }}>
        {openForm && activePlanDetails?.recentSubscription?.paymentStatus === 'COMPLETED' && (
          <Stack
            sx={{
              display: 'flex',
              border: '1px solid #DEDEDE',
              borderRadius: '6px',
              width: '100%',
              p: 2,
              mb: 2,
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { sm: 'row', xs: 'column' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Chip
                label={`Active Plan ${subscriptionDate(
                  dayjs(activePlanDetails?.recentSubscription?.nextRenewal).diff(
                    dayjs(activePlanDetails?.recentSubscription?.dateOfSubscription),
                    'day'
                  )
                )}`}
                sx={{ background: '#dcf6e5', color: '#118d57', fontSize: 12, fontWeight: '700' }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{ fontSize: '10px', fontWeight: '300', borderRadius: '4px' }}
              >
                Plan validity : {fDates(activePlanDetails?.recentSubscription?.dateOfSubscription)}{' '}
                - {fDates(activePlanDetails?.recentSubscription?.nextRenewal)}
              </Button>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { md: 'row', xs: 'column' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { sm: 'row', xs: 'column' },
                  alignItems: { sm: 'center', xs: 'flex-start' },
                  gap: 1,
                }}
              >
                <Typography variant="h4">
                  {activePlanDetails?.recentSubscription?.planName || '--'}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { sm: 'row', xs: 'column' },
                  alignItems: { sm: 'center', xs: 'flex-start' },
                  justifyContent: { md: 'center' },
                  gap: 1,
                }}
              >
                <Typography fontSize={14}>Paid through </Typography>
                <Chip
                  label={activePlanDetails?.mode || 'UPI'}
                  sx={{ borderRadius: '4px', height: 25 }}
                />
                <Divider orientation="vertical" flexItem />
                <Typography fontSize={14}>Amount :</Typography>
                <Typography variant="h4">
                  ₹{Number(activePlanDetails?.recentSubscription?.totalAmount || 0) / 100}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: { md: 'flex-end' },
              }}
            >
              <Chip
                label="Inclusive of GST"
                sx={{ fontSize: 10, fontWeight: '400', borderRadius: '4px', height: 20 }}
              />
              {(isExpired || activePlanDetails?.status === 'EXPIRED') && (
                <Button
                  variant="contained"
                  onClick={() => handleClick(matchedCard)}
                  sx={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    textAlign: 'center',
                    ml: 2,
                    fontSize: '12px',
                    fontWeight: '400',
                    '&:hover': {
                      backgroundColor: '#d32f2f', // Darker red for hover effect
                    },
                  }}
                >
                  Your plan has been expired.Renew now !.
                </Button>
              )}
            </Box>
          </Stack>
        )}

        {openForm && (
          <Stack
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #DEDEDE',
              borderRadius: '6px',
              width: '100%',
              p: 2,
            }}
          >
            <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="h3">Find Your Perfect Plan</Typography>
              <Box sx={{ p: 2 }}>
                <CustomToggleButtonGroup
                  size="small"
                  value={Toggled}
                  exclusive
                  onChange={handleChange}
                  aria-label="Platform"
                  sx={{ height: '42px' }}
                >
                  <ToggleButton value="Software">Software</ToggleButton>
                  <ToggleButton
                    value="Hardware"
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Typography variant="caption">Hardware</Typography>
                  </ToggleButton>
                </CustomToggleButtonGroup>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ pt: 1, mb: 3 }}>
              Discover the ideal plan to fuel the business growth. Easy billing & Efficient
              Insights, Get started at just ₹10 per day
            </Typography>

            {/* <Box sx={{ p: 2 }}>
              <CustomToggleButtonGroup
                size="small"
                value={isToggled}
                exclusive
                onChange={handleChangeToggle}
                aria-label="Platform"
                sx={{ height: '42px' }}
              >
                <ToggleButton value="month">Monthly</ToggleButton>
                <ToggleButton
                  value="half-yearly"
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Typography variant="caption">Half-Yearly</Typography>
                  <Typography variant="caption" sx={{ color: '#1682fc', fontSize: '8px' }}>
                    SAVE UP TO 10%
                  </Typography>
                </ToggleButton>
                <ToggleButton
                  value="year"
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Typography variant="caption">Yearly</Typography>
                  <Typography variant="caption" sx={{ color: '#1682fc', fontSize: '8px' }}>
                    SAVE UP TO 20%
                  </Typography>
                </ToggleButton>
              </CustomToggleButtonGroup>
            </Box> */}
            <Grid container spacing={3}>
              {Toggled === 'Software' && (
                <>
                  {filteredSubscriptionCard
                    .sort((a, b) => {
                      // Sort so that the disabled card appears first
                      if (a.subscriptionId === disabledCardId) return -1;
                      if (b.subscriptionId === disabledCardId) return 1;
                      return 0;
                    })
                    .map((card) => (
                      <Grid item xs={12} sm={6} md={4} key={card.subscriptionId}>
                        <Card
                          sx={{
                            p: 2,
                            height: card.planName === 'Enterprise' ? '16rem' : '100%',
                            opacity: card.subscriptionId === disabledCardId ? 0.5 : 1,
                            pointerEvents: card.subscriptionId === disabledCardId ? 'none' : 'auto',
                            backgroundColor:
                              card.subscriptionId === disabledCardId ? ' #D1C4E9' : 'white', // Light purple tint
                            border:
                              card.subscriptionId === disabledCardId
                                ? '1px solid #D1C4E9'
                                : '1px solid #DEDEDE',
                            '&:hover': {
                              boxShadow:
                                card.subscriptionId === selectedCardId
                                  ? '0px 0px 10px rgba(0,0,0,0.5)'
                                  : '0px 4px 6px rgba(0,0,0,0.1)',
                              cursor:
                                card.subscriptionId === disabledCardId ? 'default' : 'pointer',
                            },
                            '&:active': {
                              // Active effect when clicked
                              backgroundColor:
                                card.subscriptionId === selectedCardId
                                  ? '#B39DDB'
                                  : card.subscriptionId === disabledCardId
                                  ? '#D1C4E9'
                                  : '#F5F5F5',
                              boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
                            },
                          }} // Optional: lighter border for disabled state
                        >
                          {card?.planName !== 'Enterprise' && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Typography
                                sx={{
                                  fontSize: '12px',
                                  background: '#5a0a45',
                                  color: '#fff',
                                  px: 2,
                                  borderRadius: '4px',
                                }}
                              >
                                +{card?.GST || 0}% GST
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ pt: 2 }}>
                            {/* Use an actual image URL or placeholder */}
                            <img src={getIconByPlanName(card.planName)} alt={card.planName} />
                          </Box>
                          <Typography variant="h4">{card.planName}</Typography>
                          <Typography sx={{ fontSize: '11px' }}>{card.description}</Typography>

                          <Typography
                            variant="h4"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}
                          >
                            {card.planName === 'Enterprise'
                              ? getAmount(card.amount, card.type)
                              : fCurrency(getAmount(card.amount, card.type))}{' '}
                            <span style={{ fontSize: '12px', fontWeight: '300' }}>
                              {card.planName !== 'Enterprise' && getLabel(card.type)}
                            </span>
                          </Typography>

                          {card.planName !== 'Enterprise' && <Divider />}

                          {card.planName !== 'Enterprise' && (
                            <Button
                              variant="contained"
                              sx={{ mt: 1, borderRadius: '4px', fontSize: '12px', width: '100%' }}
                              onClick={() => handleClick(card)}
                              disabled={card.subscriptionId === disabledCardId} // Disable button if the card is disabled
                            >
                              {card.subscriptionId === disabledCardId
                                ? 'Current Plan'
                                : 'Change Plan'}
                            </Button>
                          )}
                        </Card>
                      </Grid>
                    ))}
                </>
              )}

              {Toggled === 'Hardware' && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      p: 2,
                      height: '16rem',
                      opacity: 1,
                      pointerEvents: 'auto',
                      backgroundColor: 'white', // Light purple tint
                      border: '1px solid #DEDEDE',
                      '&:hover': {
                        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      },
                      '&:active': {
                        // Active effect when clicked
                        backgroundColor: '#F5F5F5',
                        boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
                      },
                    }} // Optional: lighter border for disabled state
                  >
                    <Box sx={{ pt: 2 }}>
                      {/* Use an actual image URL or placeholder */}
                      <img src={getIconByPlanName('Enterprise')} alt={'Enterprise'} />
                    </Box>
                    <Typography variant="h4">{'Enterprise'}</Typography>
                    <Typography sx={{ fontSize: '11px' }}>
                      Contact us for enterprise plans
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Stack>
        )}
        {!openForm && <UpgradePlan selectedPlan={selectedPlan} isOpenForm={isOpenForm} couponDetails={couponDetails} />}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ p: 2 }}
        >
          <Typography variant="h6">For more details:</Typography>
          <IconButton
            aria-label="phoneIcon"
            color="secondary"
            sx={{ background: '#5a0a45', color: '#fff', width: 20, height: 20 }}
          >
            <PhoneIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <Typography>+91-90439 41910</Typography>

          <IconButton
            aria-label="websiteIcon"
            color="secondary"
            sx={{ background: '#5a0a45', color: '#fff', width: 20, height: 20 }}
          >
            <PublicIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <Typography>positeasy.in</Typography>

          <IconButton
            aria-label="emailIcon"
            color="secondary"
            sx={{ background: '#5a0a45', color: '#fff', width: 20, height: 20 }}
          >
            <PhoneIcon sx={{ fontSize: '12px' }} />
          </IconButton>
          <Typography>admin@positeasy.in</Typography>
        </Stack>
      </Box>
    </>
  );
}
