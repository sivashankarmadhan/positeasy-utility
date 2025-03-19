import { Box, Card, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { debounce, filter, get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Helmet } from 'react-helmet-async';
import Iconify from 'src/components/iconify';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChartSkeletonLoader from 'src/components/dashboardSkeletonLoader/ChartSkeletonLoader';
import { getLast7DaysWithDay, getLastNDaysWithDay } from 'src/utils/formatTime';
import PRODUCTS_API from 'src/services/products';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import { useRecoilValue } from 'recoil';
import INTENT_API from 'src/services/IntentService';
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const chartOptions = {
  chart: {
    id: 'basic-line-chart',
    toolbar: {
      show: false, // Hide toolbar
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  },
  stroke: {
    curve: 'smooth', // Smooth line
  },
  markers: {
    size: 4, // Marker size on data points
  },
  title: {
    text: 'Monthly Sales Data',
    align: 'center',
  },
};

const chartSeries = [
  {
    name: 'Sales',
    data: [30, 40, 35, 50, 49, 60, 70], // Your data points
  },
];

const tabsOptions = [
  {
    label: 'Yesterday',
    value: 'yesterday',
  },
  {
    label: 'Today',
    value: 'today',
  },
  {
    label: 'Week',
    value: 'last-oneweek',
  },
  {
    label: '30 Days',
    value: 'last-onemonth',
  },
  {
    label: 'Custom',
    value: 'custom-date',
  },
];

export default function InventoryDashboard() {
  const [isChart, setIsChart] = useState('line-chart');
  const [loadings, setLoadings] = useState(true);
  const last7DaysWithDay = getLast7DaysWithDay();
  const lastMonthWithDay = getLastNDaysWithDay();
  const [salesOrPayment, setSalesOrPayment] = useState([]);
  const [purchaseNumber, setPurchaseNumber] = useState('');
  const [returnNumber, setReturnNumber] = useState('');
  const [saleNumber, setSaleNumber] = useState('');
  const [vendorPurchase, setVendorPurchase] = useState([]);
  const [productPurchase, setProductPurchase] = useState([]);
  const [productMonthlySale, setProductMonthlySale] = useState([]);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const [selectedTab, setSelectedTab] = useState(get(tabsOptions, '1.value'));

  const isYesterday = selectedTab === tabsOptions[0].value;
  const isToday = selectedTab === tabsOptions[1].value;
  const isWeek = selectedTab === tabsOptions[2].value;
  const isMonth = selectedTab === tabsOptions[3].value;

  const formatLast7Days = map(last7DaysWithDay, (e) => {
    if (isWeek && !isEmpty(salesOrPayment)) {
      const data = find(get(salesOrPayment, 'data', []), (d) => e.date === d.date);

      if (data) {
        return {
          date: e.date,
          value: data['orderAmount'] / 100,
          day: e.day,
          orderCount: data['totalOrders'],
        };
      } else {
        return {
          data: e.date,
          value: 0,
          day: e.day,
          orderCount: 0,
        };
      }
    } else return;
  })?.reverse();

  const formatLast30Days = map(lastMonthWithDay, (e) => {
    if (isMonth && !isEmpty(salesOrPayment)) {
      const data = find(get(salesOrPayment, 'data', []), (d) => e.date === d.date);

      if (data) {
        return {
          date: new Date(e.date).toLocaleString().slice(0, 5),
          value: data['orderAmount'] / 100,
          day: e.day,
          orderCount: data['totalOrders'],
        };
      } else {
        return {
          date: new Date(e.date).toLocaleString().slice(0, 5),
          value: 0,
          day: e.day,
          orderCount: 0,
        };
      }
    } else return;
  })?.reverse();

  const lastWeekSalesChartOptions = {
    colors: [isChart === 'bar-chart' ? '#ffb9b9' : '#ff0000'],
    chart: {
      type: isChart === 'bar-chart' ? 'bar' : 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      labels: {
        show: true,
        rotate: 0,
      },
      categories: map(formatLast30Days, (e) => get(e, 'date', '')),
      // tickAmount: isMobile ? 2 : 4,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    // yaxis: {
    //   show: true,
    //   labels: {
    //     show: true,
    //     formatter: (value) => {
    //       return formatAmountToIndianCurrency(Number(value)?.toFixed());
    //     },
    //   },
    // },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: 'smooth',
      width: 0.5,
    },

    // tooltip: { enabled: false },
    // tooltip: {
    //   custom: function ({ series, seriesIndex, dataPointIndex, w }) {
    //     return (
    //       '<div class="arrow_box" style="padding-left:10px;padding-right:10px;background-color:#5a0b45;color:#fff">' +
    //       '<span>' +
    //       fCurrency(series[seriesIndex][dataPointIndex]) +
    //       '</span>' +
    //       '</div>'
    //     );
    //   },
    // },
    grid: {
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  const getPurchaseNumber = async () => {
    try {
      const response = await INTENT_API.getPurchaseNumber(currentStore);
      if (response) setPurchaseNumber(response?.data?.NumberOfPurchases);
    } catch (e) {
      setPurchaseNumber('');
    }
  };
  const getReturnNumber = async () => {
    try {
      const response = await INTENT_API.getReturnNumber(currentStore);
      if (response) setReturnNumber(response?.data?.NumberOfReturns);
    } catch (e) {
      setReturnNumber('');
    }
  };
  const getSaleNumber = async () => {
    try {
      const response = await INTENT_API.getSaleNumber(currentStore);
      if (response) setSaleNumber(response?.data?.TotalAmount);
    } catch (e) {
      setSaleNumber('');
    }
  };
  const getVendorPurchase = async () => {
    try {
      const response = await INTENT_API.getVendorPurchase(currentStore);
      if (response) setVendorPurchase(response?.data);
    } catch (e) {
      setVendorPurchase('');
    }
  };
  const getProductPurchased = async () => {
    try {
      const response = await INTENT_API.getProductPurchasedCount(currentStore);
      if (response) setProductPurchase(response?.data);
    } catch (e) {
      setProductPurchase('');
    }
  };
  const getProductMonthlySales = async () => {
    try {
      const response = await INTENT_API.getProductMonthlySale(currentStore);
      if (response) setProductMonthlySale(response?.data?.NumberOfPurchases);
    } catch (e) {
      setProductMonthlySale('');
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) {
      getPurchaseNumber();
      getReturnNumber();
      getSaleNumber();
      getVendorPurchase();
      getProductPurchased();
      getProductMonthlySales();
    }
  }, [currentStore, currentTerminal]);

  // if (isLoading) return <LoadingScreen />;p
  return (
    <>
      <Helmet>
        <title> INVENTORY DASHBOARD | POSITEASY </title>
      </Helmet>
      <Stack p={2} gap={2}>
        <Card sx={{ width: '100%', padding: 2 }}>
          <Typography fontWeight={700}>Purchase overview</Typography>
          <Stack flexDirection={'row'} gap={3} justifyContent={'space-between'}>
            <Stack width={'100%'} pt={2}>
              <Stack
                borderRadius={'10px'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                pr={5}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#deced9' }}
              >
                <Stack>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'10px'}>
                    No of purchase
                  </Typography>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'40px'}>
                    {purchaseNumber}
                  </Typography>
                </Stack>
                <Iconify
                  width={30}
                  height={30}
                  sx={{ color: '#5a0a45' }}
                  icon={'mdi:shopping-cart-outline'}
                />
              </Stack>
            </Stack>
            <Stack width={'100%'} pt={2}>
              <Stack
                borderRadius={'10px'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                pr={5}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#deced9' }}
              >
                <Stack>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'10px'}>
                    Return order
                  </Typography>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'40px'}>
                    {returnNumber}
                  </Typography>
                </Stack>{' '}
                <Iconify
                  width={30}
                  height={30}
                  sx={{ color: '#5a0a45' }}
                  icon={'tabler:shopping-cart-cancel'}
                />
              </Stack>
            </Stack>
            <Stack width={'100%'} pt={2}>
              <Stack
                borderRadius={'10px'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                pr={5}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#deced9' }}
              >
                <Stack>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'10px'}>
                    Sale number
                  </Typography>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'40px'}>
                    {saleNumber}
                  </Typography>
                </Stack>
                <Iconify
                  width={30}
                  height={30}
                  sx={{ color: '#5a0a45' }}
                  icon={'hugeicons:money-bag-02'}
                />
              </Stack>
            </Stack>
            <Stack width={'100%'} pt={2}>
              <Stack
                borderRadius={'10px'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                pr={5}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#deced9' }}
              >
                <Stack>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'10px'}>
                    Vendor Purchase count
                  </Typography>
                  <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'40px'}>
                    {vendorPurchase?.count}
                  </Typography>
                </Stack>
                <Iconify
                  width={30}
                  height={30}
                  sx={{ color: '#5a0a45' }}
                  icon={'hugeicons:trade-up'}
                />
              </Stack>
            </Stack>
          </Stack>
        </Card>
        <Stack flexDirection={'row'} width={'100%'} gap={2}>
          <Card sx={{ width: '100%', padding: 2 }}>
            <Typography fontWeight={700}>Inventory summary</Typography>
            <Stack flexDirection={'row'} pt={2} gap={2}>
              <Stack
                borderRadius={'10px'}
                pr={5}
                width={'100%'}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#E9EAEC' }}
              >
                <Iconify
                  width={40}
                  height={40}
                  sx={{ color: '#5a0a45' }}
                  icon={'game-icons:receive-money'}
                />
                <Typography fontWeight={600} sx={{ color: '#5a0a45' }} fontSize={'15px'}>
                  Quantity in hand
                </Typography>
                <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'30px'}>
                  14
                </Typography>
              </Stack>
              <Stack
                borderRadius={'10px'}
                pr={5}
                width={'100%'}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#E9EAEC' }}
              >
                <Iconify
                  width={40}
                  height={40}
                  sx={{ color: '#5a0a45' }}
                  icon={'fluent-mdl2:quantity'}
                />
                <Typography fontWeight={600} sx={{ color: '#5a0a45' }} fontSize={'12px'}>
                  Quantity to be received
                </Typography>
                <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'30px'}>
                  4
                </Typography>
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ width: '100%', padding: 2 }}>
            <Typography fontWeight={700}>Product details</Typography>
            <Stack flexDirection={'row'} pt={2} gap={2}>
              <Stack
                borderRadius={'10px'}
                pr={5}
                width={'100%'}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#E9EAEC' }}
              >
                <Iconify
                  width={40}
                  height={40}
                  sx={{ color: '#5a0a45' }}
                  icon={'healthicons:money-bag'}
                />
                <Typography fontWeight={600} sx={{ color: '#5a0a45' }} fontSize={'15px'}>
                  Total Sales
                </Typography>
                <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'30px'}>
                  ₹814
                </Typography>
              </Stack>
              <Stack
                borderRadius={'10px'}
                pr={5}
                width={'100%'}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#E9EAEC' }}
              >
                <Iconify width={40} height={40} sx={{ color: '#5a0a45' }} icon={'uil:bill'} />
                <Typography fontWeight={600} sx={{ color: '#5a0a45' }} fontSize={'15px'}>
                  Total Expenses
                </Typography>
                <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'30px'}>
                  ₹456
                </Typography>
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ width: '100%', padding: 2 }}>
            <Typography fontWeight={700}>No.of.users</Typography>
            <Stack flexDirection={'row'} pt={2} gap={2}>
              <Stack
                borderRadius={'10px'}
                pr={5}
                width={'100%'}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#E9EAEC' }}
              >
                <Iconify
                  width={40}
                  height={40}
                  sx={{ color: '#5a0a45' }}
                  icon={'mdi:people-group-outline'}
                />
                <Typography fontWeight={600} sx={{ color: '#5a0a45' }} fontSize={'15px'}>
                  Total customers
                </Typography>
                <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'30px'}>
                  14
                </Typography>
              </Stack>
              <Stack
                borderRadius={'10px'}
                pr={5}
                width={'100%'}
                alignItems={'center'}
                p={1}
                sx={{ backgroundColor: '#E9EAEC' }}
              >
                <Iconify
                  width={40}
                  height={40}
                  sx={{ color: '#5a0a45' }}
                  icon={'ic:round-people-outline'}
                />
                <Typography fontWeight={600} sx={{ color: '#5a0a45' }} fontSize={'15px'}>
                  Total subbliers
                </Typography>
                <Typography fontWeight={700} sx={{ color: '#5a0a45' }} fontSize={'30px'}>
                  456
                </Typography>
              </Stack>
            </Stack>
          </Card>
        </Stack>
        <Card
          sx={{
            width: '100%',
            borderRadius: '10px',
            // border: `1px solid ${theme.palette.grey[300]}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.15)',
            p: 2,
            pb: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Box>
              <ToggleButtonGroup
                type="button"
                orientation="Horizontal"
                value={isChart}
                exclusive
                onChange={(event, newValue) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (newValue === 'line-chart') {
                    setIsChart('line-chart');
                  } else if (newValue === 'bar-chart') {
                    setIsChart('bar-chart');
                  }
                }}
                // onChange={(event, newValue) => console.log(newValue,'value')}
                size="small"
                sx={{
                  '& .MuiButtonBase-root': {
                    marginTop: '4px !important',
                  },
                }}
              >
                <ToggleButton
                  value="line-chart"
                  aria-label="line-chart"
                  style={{ width: '25px', height: '25px' }}
                >
                  <TimelineIcon fontSize="small" sx={{ marginTop: '1px', color: '#5a0a45' }} />
                </ToggleButton>
                <ToggleButton
                  value="bar-chart"
                  aria-label="bar-chart"
                  style={{ width: '25px', height: '25px' }}
                >
                  <BarChartIcon fontSize="small" sx={{ marginTop: '1px', color: '#5a0a45' }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="line"
            width="100%"
            height="350"
          />
        </Card>
      </Stack>
    </>
  );
}
