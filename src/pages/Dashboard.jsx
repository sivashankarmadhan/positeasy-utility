import {
  Box,
  Card,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import {
  find,
  forEach,
  get,
  isEmpty,
  merge,
  filter,
  orderBy,
  slice,
  findIndex,
  maxBy,
} from 'lodash';
import { map } from 'lodash';
import split from 'lodash/split';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Helmet } from 'react-helmet-async';
import { BaseOptionChart } from 'src/components/chart';
import { fCurrency, formatAmountToIndianCurrency } from 'src/utils/formatNumber';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUp from '@mui/icons-material/TrendingUp';
import MiniCard from 'src/sections/dashboard/MiniCard';
import LiveTransactions from '../sections/dashboard/LiveTransactions';
import TrendingItem from 'src/sections/dashboard/TrendingItem';
import PRODUCTS_API from 'src/services/products';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentStoreId,
  currentTerminalId,
  allConfiguration,
  stores,
} from 'src/global/recoilState';
import { reduce } from 'lodash';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import CustomScrollbar from '../components/CustomScrollbar';
import STORES_API from 'src/services/stores';
import Auth_API from 'src/services/auth';
import toast from 'react-hot-toast';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  AppConstants,
  BillingKeyVerification,
  LIVE_TRANSACTION_UPDATE_TIMER,
  ROLES_DATA,
  TERMINAL_STATUS,
  TREND_STATUS,
} from 'src/constants/AppConstants';
import AuthService from 'src/services/authService';
import {
  getLast7DaysWithDay,
  getLastNDaysWithDay,
  IndFormat,
  currentTimeWithoutSec,
  getCustomDateDaysWithDay,
  fDatesWithTimeStampWithDayjs,
  fDatesWithTimeStamp,
  formatDate,
  dateWithTimeFormat,
  formatIndDateWithOutUtc,
  fDatesWithTimeStampFromUtc,
  formatIndDateWithOutUtcStartingWithDate,
} from 'src/utils/formatTime';
import getHoursBetween from 'src/utils/getHoursBetween';
import removeTrailingZeros from 'src/utils/removeTrailingZeros';
import DateRangePicker from 'rsuite/DateRangePicker';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import dayjs from 'dayjs';
import NumbersIcon from '@mui/icons-material/Numbers';
import { toFixedIfNecessary } from '../../src/utils/formatNumber';
import ChartSkeletonLoader from 'src/components/dashboardSkeletonLoader/ChartSkeletonLoader';
import CircularChartSkeletonLoader from 'src/components/dashboardSkeletonLoader/CircularChartLoader';
import PaymentCardSkeletonLoader from 'src/components/dashboardSkeletonLoader/MinicardSkeletonLoader';
import ItemListSkeletonLoader from 'src/components/dashboardSkeletonLoader/TrendingSkeletonLoader';

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

const recentTransaction = [
  {
    label: 'Completed',
    value: 'COMPLETED',
  },
  {
    label: 'Cancelled',
    value: 'CANCELLED',
  },
  {
    label: 'Failed',
    value: 'FAILED',
  },
];

const salesOrPaymentsTabsOptions = [
  {
    label: 'Sales',
    value: 'sales',
  },
  {
    label: 'Payments',
    value: 'payments',
  },
];

const Dashboard = () => {
  const theme = useTheme();
  var currentDate = new Date();
  var hours = currentDate.getHours();
  const configuration = useRecoilValue(allConfiguration);
  const { data: orderResetTime } = ObjectStorage.getItem(StorageConstants.ORDER_RESET_TIME);
  const resetTime = get(configuration, 'orderReset.resetTime') ?? orderResetTime;
  const currentSelectedRole = AuthService.getCurrentRoleInLocal();
  const user = AuthService._getMerchantDetails();
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTab, setSelectedTab] = React.useState(get(tabsOptions, '1.value'));
  const [isLoading, setIsLoading] = useState(false);
  const [isChart, setIsChart] = useState('line-chart');
  const [salesOrPayment, setSalesOrPayment] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isPriceView, setIsPriceView] = useState(false);
  const [isSale, setIsSale] = useState('sale');
  const last7DaysWithDay = getLast7DaysWithDay();
  const lastMonthWithDay = getLastNDaysWithDay();
  const customDateWithDay = getCustomDateDaysWithDay({ startDate, endDate });
  const [totalIncome, setTotalIncome] = useState(0);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const isYesterday = selectedTab === tabsOptions[0].value;
  const isToday = selectedTab === tabsOptions[1].value;
  const isWeek = selectedTab === tabsOptions[2].value;
  const isMonth = selectedTab === tabsOptions[3].value;
  const isMobile = useMediaQuery('(max-width:600px)');
  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;
  const [selectedValue, setSelectedValue] = useState('quantity');
  const [selected, setSelected] = React.useState(get(recentTransaction, '0.value'));

  const isCompleted = selected === recentTransaction[0].value;
  const isCancelled = selected === recentTransaction[1].value;
  const isFailed = selected === recentTransaction[2].value;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const [loadings, setLoadings] = useState(true);

  const dateValues = {
    today: {
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
    },
    yesterday: {
      startDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
      endDate: moment().add(-1, 'days').format('YYYY-MM-DD'),
    },
    'last-oneweek': {
      startDate: moment().add(-6, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
    },
    'last-onemonth': {
      startDate: moment().add(-29, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
    },
    'custom-date': {
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
    },
  };

  const startDateData = get(dateValues, `${selectedTab}.startDate`, '');
  const endDateData = get(dateValues, `${selectedTab}.endDate`, '');

  const isCustomDate = selectedTab === tabsOptions[4].value && startDateData !== endDateData;

  const [selectedSaleOrPaymentTab, setSelectedSaleOrPaymentTab] = useState(
    get(salesOrPaymentsTabsOptions, '0.value')
  );

  const isSalesTab = selectedSaleOrPaymentTab === get(salesOrPaymentsTabsOptions, '0.value');

  const expensiveValue =
    (isWeek || isMonth || isCustomDate
      ? get(salesOrPayment, 'expenseData.0.totalExpense', 0)
      : get(salesOrPayment, 'expenseData.0.totalExpense') || 0) / 100;

  const purchaseValue =
    (isWeek || isMonth || isCustomDate
      ? get(salesOrPayment, 'purchaseData.0')?.['purchaseBills.paidTotal'] || 0
      : get(salesOrPayment, 'purchaseData.0')?.['purchaseBills.paidTotal'] || 0) / 100;

  console.log('hhhh', salesOrPayment);

  const isMobileView = useMediaQuery('(max-width:600px)');
  const storesData = useRecoilValue(stores);

  const formatTrendingCategories = map(trendingCategories, (e, index) => {
    let value;

    if (isSalesTab) {
      if (isWeek || isMonth || isCustomDate) {
        value = isSale === 'income' ? 'totalOrders' : 'orderAmount';
      } else {
        value = isSale === 'income' ? 'totalOrders' : 'orderAmount';
      }
    } else {
      if (isWeek || isMonth || isCustomDate) {
        value = 'paid_amount';
      } else {
        value = 'paidAmount';
      }
    }

    return {
      label: isSalesTab ? get(e, 'status') : get(e, 'mode'),
      value: get(e, value),
    };
  });

  const formatLast7Days = map(last7DaysWithDay, (e) => {
    if (isWeek && !isEmpty(salesOrPayment)) {
      const data = find(
        get(salesOrPayment, isSalesTab ? 'data' : 'data', []),
        (d) => e.date === d.date
      );

      if (data) {
        return {
          date: e.date,
          value: data[isSalesTab ? 'orderAmount' : 'paid_amount'] / 100,
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
      const data = find(
        get(salesOrPayment, isSalesTab ? 'data' : 'data', []),
        (d) => e.date === d.date
      );

      if (data) {
        return {
          date: new Date(e.date).toLocaleString().slice(0, 5),
          value: data[isSalesTab ? 'orderAmount' : 'paid_amount'] / 100,
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

  const formatCustomDateDays = map(customDateWithDay, (e) => {
    if (isCustomDate && !isEmpty(salesOrPayment)) {
      const data = find(
        get(salesOrPayment, isSalesTab ? 'data' : 'data', []),
        (d) => e.date === d.date
      );

      if (data) {
        return {
          date: new Date(e.date).toLocaleString().slice(0, 5),
          value: data[isSalesTab ? 'orderAmount' : 'paid_amount'] / 100,
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
  });

  let totalIncomeLabelsValueName;

  if (isWeek) {
    if (isSalesTab) {
      totalIncomeLabelsValueName = isSale === 'income' ? 'statusData' : 'saleData';
    } else {
      totalIncomeLabelsValueName = 'paymentModeData';
    }
  } else if (isMonth) {
    if (isSalesTab) {
      totalIncomeLabelsValueName = isSale === 'income' ? 'statusData' : 'saleData';
    } else {
      totalIncomeLabelsValueName = 'paymentModeData';
    }
  } else if (isCustomDate) {
    if (isSalesTab) {
      totalIncomeLabelsValueName = isSale === 'income' ? 'statusData' : 'saleData';
    } else {
      totalIncomeLabelsValueName = 'paymentModeData';
    }
  } else {
    if (isSalesTab) {
      totalIncomeLabelsValueName = isSale === 'income' ? 'statusData' : 'saleData';
    } else {
      totalIncomeLabelsValueName = 'paymentModeData';
    }
  }

  const totalIncomeLabels = map(get(salesOrPayment, totalIncomeLabelsValueName), (_item) => {
    let name;

    if (isSalesTab) {
      name = get(_item, 'status');
    } else {
      name = get(_item, 'mode');
    }
    return name === null ? 'Others' : name;
  });

  const chartSeries = map(formatTrendingCategories, (e) => {
    return isSalesTab && isSale === 'income'
      ? get(e, 'value') || 0
      : Number(get(e, 'value')) / 100 || 0;
  });

  const chartIncome = [
    {
      data: [chartSeries.reduce((a, b) => a + b, 0), expensiveValue, purchaseValue],
    },
  ];

  const chartOptions = merge(BaseOptionChart(), {
    colors: ['#826af9', '#fec93f', '#58ddfb', '#5a0945'],
    labels:
      isSalesTab && (isWeek || isMonth || isCustomDate)
        ? map(formatTrendingCategories, (_item) => get(_item, 'label'))
        : [...totalIncomeLabels],
    stroke: { colors: [theme.palette.background.paper] },
    legend: { horizontalAlign: 'center', position: 'bottom' },

    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        return (
          '<div class="arrow_box" style="padding-left:10px;padding-right:10px;background-color:#5a0b45;color:#fff">' +
          '<span>' +
          (isSalesTab
            ? isSale === 'income'
              ? series[seriesIndex]
              : fCurrency(series[seriesIndex])
            : fCurrency(series[seriesIndex])) +
          '</span>' +
          '</div>'
        );
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          offsetY: 10,
          labels: {
            value: {
              formatter: (val) => fCurrency(val),
              offsetY: -8,
            },
            total: {
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);

                return isSalesTab ? (isSale === 'income' ? sum : fCurrency(sum)) : fCurrency(sum);
              },
            },
          },
        },
      },
    },
  });

  const incomeOptions = merge(BaseOptionChart(), {
    colors: ['#FFC4C4', '#FFC4C4', '#FFC4C4'],
    legend: { horizontalAlign: 'center', position: 'bottom' },
    chart: {
      type: 'bar',
    },

    plotOptions: {
      bar: {
        columnWidth: '12%',
      },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        return (
          '<div class="arrow_box" style="padding-left:10px;padding-right:10px;background-color:#5a0b45;color:#fff">' +
          '<span>' +
          fCurrency(series[seriesIndex][dataPointIndex]) +
          '</span>' +
          '</div>'
        );
      },
    },

    xaxis: {
      categories: ['SALE', 'EXPENSE', 'PURCHASE'],
    },

    yaxis: {
      labels: {
        formatter: function (val) {
          return val;
        },
      },
    },
  });

  const trendCalculate = (currentSale, lastSale) => {
    currentSale = currentSale / 100;
    lastSale = lastSale / 100;
    if (lastSale === 0) {
      if (currentSale === 0) {
        return 0;
      } else {
        return 100;
      }
    }
    const percentageChange = Math.round(((currentSale - lastSale) / Math.abs(lastSale)) * 100);

    return percentageChange;
  };

  const storeTrendingCategories = (data) => {
    let trendingCategoriesValueName;

    if (isWeek) {
      if (isSalesTab) {
        trendingCategoriesValueName = isSale === 'income' ? 'data.statusData' : 'data.salesData';
      } else {
        trendingCategoriesValueName = 'data.paymentModeData';
      }
    } else if (isMonth) {
      if (isSalesTab) {
        trendingCategoriesValueName = isSale === 'income' ? 'data.statusData' : 'data.salesData';
      } else {
        trendingCategoriesValueName = 'data.paymentModeData';
      }
    } else if (isCustomDate) {
      if (isSalesTab) {
        trendingCategoriesValueName = isSale === 'income' ? 'data.statusData' : 'data.salesData';
      } else {
        trendingCategoriesValueName = 'data.paymentModeData';
      }
    } else {
      if (isSalesTab) {
        trendingCategoriesValueName = isSale === 'income' ? 'data.statusData' : 'data.saleData';
      } else {
        trendingCategoriesValueName = 'data.paymentModeData';
      }
    }

    setTrendingCategories(get(data, trendingCategoriesValueName, []));
  };

  const getSalesOrPayment = async () => {
    setLoadings(true);
    try {
      let apiEndPointFn = null;
      if (isSalesTab) {
        if (isToday || isYesterday || startDateData === endDateData) {
          apiEndPointFn = PRODUCTS_API.getSalesForOneDay;
        } else {
          apiEndPointFn = PRODUCTS_API.getSales;
        }
      } else {
        if (isToday || isYesterday || startDateData === endDateData) {
          apiEndPointFn = PRODUCTS_API.getPaymentsForOneDay;
        } else {
          apiEndPointFn = PRODUCTS_API.getPayments;
        }
      }

      const resSalesOrPayments = await apiEndPointFn({
        date: selectedTab,
        startDate: IndFormat({ startDate: startDateData }),
        endDate: IndFormat({ endDate: endDateData }),
      });

      console.log(resSalesOrPayments);

      setSalesOrPayment(get(resSalesOrPayments, 'data'));
      setTotalIncome(get(resSalesOrPayments, 'data.todaySale', 0));

      storeTrendingCategories(resSalesOrPayments);

      if (isSalesTab) {
        setIsSale('sale');
      }
    } catch (err) {
      console.log('err', err);
    } finally {
      setLoadings(false);
    }
  };

  useEffect(() => {
    storeTrendingCategories({ data: salesOrPayment });
  }, [isSale]);

  const getRecentTransactions = async () => {
    setLoading(true);
    try {
      const resSales = await PRODUCTS_API.getRecentTransactions(selected);
      setRecentTransactions(get(resSales, 'data'));
    } catch (err) {
      console.log('err', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingProducts = async () => {
    try {
      const resSales = await PRODUCTS_API.getTrendingProducts({
        startDate: IndFormat({ startDate: get(dateValues, `${selectedTab}.startDate`, '') }),
        endDate: IndFormat({ endDate: get(dateValues, `${selectedTab}.endDate`, '') }),
      });
      setTrendingProducts(get(resSales, 'data'));
    } catch (err) {
      console.log('err', err);
    } finally {
    }
  };

  const getTrendingPrice = async () => {
    try {
      const resSalesPrice = await PRODUCTS_API.getTrendingPrice({
        startDate: IndFormat({ startDate: get(dateValues, `${selectedTab}.startDate`, '') }),
        endDate: IndFormat({ endDate: get(dateValues, `${selectedTab}.endDate`, '') }),
      });
      setTrendingProducts(get(resSalesPrice, 'data'));
    } catch (err) {
      console.log('err', err);
    } finally {
    }
  };

  const totalOrderTrendPercentage = trendCalculate(
    get(salesOrPayment, 'totalOrders', 0),
    get(salesOrPayment, 'prevDayData.0.totalOrders', 0)
  );
  const yesterdayOrderTrendPercentage = trendCalculate(
    get(salesOrPayment, 'totalOrders', 0),
    get(salesOrPayment, 'prevDayData.0.totalOrders', 0)
  );
  const lastWeekTotalOrderPercentage = trendCalculate(
    get(salesOrPayment, 'lastWeekData.totalOrders', 0),
    get(salesOrPayment, 'preWeekData.0.totalOrders', 0)
  );
  const lastMonthTotalOrderPercentage = trendCalculate(
    get(salesOrPayment, 'lastMonthData.totalOrders', 0),
    get(salesOrPayment, 'preMonthData.0.totalOrders', 0)
  );
  const CustomToDateTalOrderPercentage = trendCalculate(
    get(salesOrPayment, 'customData.totalOrders', 0),
    get(salesOrPayment, 'preCustomData.0.totalOrders', 0)
  );

  const totalSalesTrendPercentage = trendCalculate(
    get(salesOrPayment, 'todaySale', 0),
    get(salesOrPayment, 'prevDayData.0')?.['payments.prevDaySale'] || 0
  );

  const yesterdaySalesTrendPercentage = trendCalculate(
    get(salesOrPayment, 'yestSale', 0),
    get(salesOrPayment, 'prevDayData.0')?.['payments.prevDaySale'] || 0
  );
  const lastWeekTotalSalesTrendPercentage = trendCalculate(
    get(salesOrPayment, 'lastWeekData.last7daySales', 0),
    get(salesOrPayment, 'preWeekData.0')?.['payments.paidAmount'] || 0
  );
  const lastMonthTotalSalesTrendPercentage = trendCalculate(
    get(salesOrPayment, 'lastMonthData.last30daySales', 0),
    get(salesOrPayment, 'preMonthData.0')?.['payments.paidAmount'] || 0
  );

  const CustomDateTotalSalesTrendPercentage = trendCalculate(
    get(salesOrPayment, 'customData.customSalesAmount', 0),
    get(salesOrPayment, 'preCustomData.0')?.['payments.paidAmount'] || 0
  );

  const trendSalesStatus =
    (isYesterday
      ? yesterdaySalesTrendPercentage
      : isWeek
      ? lastWeekTotalSalesTrendPercentage
      : isMonth
      ? lastMonthTotalSalesTrendPercentage
      : isCustomDate
      ? CustomDateTotalSalesTrendPercentage
      : totalSalesTrendPercentage) > 0
      ? 'up'
      : 'down';
  const totalIncomeTrendingPercentage = isYesterday
    ? yesterdaySalesTrendPercentage
    : isWeek
    ? lastWeekTotalSalesTrendPercentage
    : isMonth
    ? lastMonthTotalSalesTrendPercentage
    : isCustomDate
    ? CustomDateTotalSalesTrendPercentage
    : totalSalesTrendPercentage;

  const formatOrderResetTime = Number(orderResetTime?.split?.(':')?.[0]);

  const hoursBetween = getHoursBetween({
    startHour: formatOrderResetTime,
    endHour: formatOrderResetTime,
  });
  hoursBetween.pop();

  const salesChartData = removeTrailingZeros(
    map(hoursBetween, (_t) => {
      let totalAmount = 0;

      forEach(get(salesOrPayment, isSalesTab ? 'hourlyData' : 'hoursData', []), (_res) => {
        const formatDate = isSalesTab ? get(_res, 'hour') : get(split(get(_res, 'hour'), 'T'), '1');

        if (Number(formatDate) === Number(_t)) {
          totalAmount = Number(get(_res, isSalesTab ? 'orderAmount' : 'paidAmount', 0));
        }
      });
      return totalAmount / 100;
    })
  );

  const timeSalesLabel = map(
    map(hoursBetween, (hour) => {
      if (Number(hour) <= 11) {
        if (Number(hour) === 0) return '12:00 am';
        return `${hour}:00 am`;
      } else if (Number(hour) === 12) return '12:00 pm';
      else {
        return `${hour - 12}:00 pm`;
      }
    })
  );

  const finalTimeSalesLabel = timeSalesLabel?.slice?.(0, Number(salesChartData?.length) + 1);

  const finalTimeSalesLabelLast = timeSalesLabel
    ?.slice?.(0, Number(salesChartData?.length) + 2)
    ?.at?.(-1);

  const isAddZeroSalesChartData =
    Number(salesChartData.length) !== Number(finalTimeSalesLabel?.length);

  const saleDashboard = isWeek
    ? map(formatLast7Days, (e) => get(e, 'value') || 0)
    : isMonth
    ? map(formatLast30Days, (e) => get(e, 'value') || 0)
    : isCustomDate
    ? map(formatCustomDateDays, (e) => get(e, 'value') || 0)
    : isAddZeroSalesChartData
    ? [...salesChartData, 0]
    : salesChartData;
  const dailySalesChartOptions = {
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
      categories: finalTimeSalesLabel,
      tickAmount: isMobile ? 2 : 4,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        formatter: (value) => {
          return formatAmountToIndianCurrency(Number(value)?.toFixed());
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: 'smooth',
      width: 0.5,
    },

    // tooltip: { enabled: false },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const xValue = w.globals.categoryLabels[dataPointIndex] || w.globals.labels[dataPointIndex];
        const xNextValue =
          w.globals.categoryLabels[dataPointIndex + 1] || w.globals.labels[dataPointIndex + 1];

        return (
          '<div class="arrow_box" style="display:flex;flex-direction:column;justify-content: center;align-items:center;padding-left:10px;padding-right:10px;background-color:#5a0b45;color:#fff;font-size:10px">' +
          '<span>' +
          fCurrency(series[seriesIndex][dataPointIndex]) +
          '</span>' +
          '<span>' +
          xValue +
          `${
            xNextValue
              ? `&nbsp;&nbsp;-&nbsp;&nbsp;${xNextValue}`
              : `&nbsp;&nbsp;-&nbsp;&nbsp;${finalTimeSalesLabelLast}`
          }` +
          '</span>' +
          '</div>'
        );
      },
    },
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
      categories: isMonth
        ? map(formatLast30Days, (e) => get(e, 'date', ''))
        : isCustomDate
        ? map(formatCustomDateDays, (e) => get(e, 'date', ''))
        : map(formatLast7Days, (e) => get(e, 'day', '')),
      tickAmount: isMobile ? 2 : 4,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        formatter: (value) => {
          return formatAmountToIndianCurrency(Number(value)?.toFixed());
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      curve: 'smooth',
      width: 0.5,
    },

    // tooltip: { enabled: false },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const xValue = w.globals.categoryLabels[dataPointIndex] || w.globals.labels[dataPointIndex];
        return (
          '<div class="arrow_box" style="display:flex;flex-direction:column;justify-content: center;align-items:center;padding-left:10px;padding-right:10px;background-color:#5a0b45;color:#fff;font-size:10px">' +
          '<span>' +
          fCurrency(series[seriesIndex][dataPointIndex]) +
          '</span>' +
          '<span>' +
          xValue +
          '</span>' +
          '</div>'
        );
      },
    },
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

  function handleGreetMessage() {
    const currentStoreName = find(storesData, (e) => get(e, 'storeId') === currentStore);
    var greetMessage;
    if (hours < 12) greetMessage = 'Good morning';
    else if (hours >= 12 && hours <= 17) greetMessage = 'Good afternoon';
    else if (hours >= 17 && hours <= 24) greetMessage = 'Good evening';
    return `${greetMessage}, ${get(currentStoreName, 'storeName') || get(user, 'storeName')}`;
  }
  const sales = chartSeries.reduce((a, b) => a + b, 0) - expensiveValue - purchaseValue;

  const liveTransactionData = map(recentTransactions, (item) => {
    return {
      orderId: get(item, 'orderId'),
      date: formatIndDateWithOutUtcStartingWithDate(get(item, 'dateTz')),
      orderAmount: get(item, 'orderAmount') / 100 || 0,
      status: get(item, 'paymentStatus'),
      createdAt: get(item, 'dateTz'),
    };
  });
  useEffect(() => {
    if (!isEmpty(configuration)) {
      if (selectedTab && currentStore && currentTerminal) {
        if (selectedValue === 'price') {
          getTrendingPrice();
        } else {
          getTrendingProducts();
        }
      }
    }
  }, [selectedTab, currentStore, currentTerminal, startDate, endDate, configuration]);

  useEffect(() => {
    if (!isEmpty(configuration)) {
      if (selectedTab && currentStore && currentTerminal) {
        getSalesOrPayment();
      }
    }
  }, [
    selectedTab,
    currentStore,
    currentTerminal,
    startDate,
    endDate,
    selectedSaleOrPaymentTab,
    configuration,
  ]);

  useEffect(() => {
    if (selected && currentStore && currentTerminal) {
      getRecentTransactions();
    }
  }, [currentStore, currentTerminal, selected]);

  // useEffect(() => {
  //   if (currentStore && currentTerminal) {
  //     getRecentTransactions();
  //   }
  //   const intervalTime = setInterval(() => {
  //     getRecentTransactions();
  //   }, LIVE_TRANSACTION_UPDATE_TIMER);

  //   return () => {
  //     isMounted.current = false;
  //     clearInterval(intervalTime);
  //   };
  // }, [currentStore, currentTerminal]);

  // ---------------------------------------------------------------------------------------------------------

  const onChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
      setSelectedTab('custom-date');
    }
  };

  const getStartDate = () => {
    return startOfMonth(addMonths(new Date(), -3)), endOfMonth(addMonths(new Date(), -1));
  };

  const predefinedRanges = [
    {
      label: 'This week',
      value: [startOfWeek(new Date()), new Date()],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'Last week',
      value: [
        addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), -7),
        addDays(endOfWeek(new Date(), { weekStartsOn: 0 }), -7),
      ],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'This month',
      value: [startOfMonth(new Date()), new Date()],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'Last month',
      value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'Last three month',
      value: [startOfMonth(addMonths(new Date(), -3)), endOfMonth(addMonths(new Date(), -1))],
      ...(!isMobile && { placement: 'left' }),
    },
  ];

  const disabledDate = (date) => {
    const startDate = dayjs(startOfMonth(addMonths(new Date(), -3))).format('YYYY-MM-DD');
    const endDate = dayjs().format('YYYY-MM-DD');
    return (
      dayjs(date).format('YYYY-MM-DD') < startDate || dayjs(date).format('YYYY-MM-DD') > endDate
    );
  };

  const selectedTerminalDetails = find(
    storesData,
    (_item) => get(_item, 'terminalId') === currentTerminal
  );

  const isAll = !selectedTerminalDetails;
  const isMaster = get(selectedTerminalDetails, 'terminalName') === 'master';

  const isBetweenDate = moment(get(liveTransactionData, '0.createdAt')).from(moment());

  // ---------------------------------------------------------------------------------------------------------

  if (isLoading) return <LoadingScreen />;
  return (
    <>
      <Helmet>
        <title>Dashboard | POSITEASY</title>
      </Helmet>
      <Box p={isMobile ? 1.5 : 1} m={1.2}>
        <Stack
          flexDirection="row"
          justifyContent={isMobile ? 'flex-end' : 'space-between'}
          alignItems="center"
        >
          {!isMobile && (
            <Typography
              fontWeight="bold"
              fontSize={isMobile ? '0.7rem' : isTab ? '0.9rem' : '1.2rem'}
            >
              {handleGreetMessage()}
            </Typography>
          )}

          <Stack flexDirection="row" gap={1} alignItems="center" justifyContent="flex-end">
            {!isAll && !isMaster && (
              <>
                {isBetweenDate === 'a few seconds ago' ? (
                  <>
                    <WifiIcon sx={{ width: '14px', height: '14px', color: '#00000070' }} />
                    <Typography sx={{ fontSize: '12px', color: '#00000070', fontWeight: 'bold' }}>
                      Last synced just now
                    </Typography>
                  </>
                ) : (
                  <>
                    <WifiOffIcon sx={{ width: '14px', height: '14px', color: '#00000070' }} />
                    <Typography sx={{ fontSize: '12px', color: '#00000070', fontWeight: 'bold' }}>
                      Last synced on{' '}
                      {moment(get(liveTransactionData, '0.createdAt')).from(moment())}
                    </Typography>
                  </>
                )}
                {/* <Typography sx={{ fontSize: '12px', color: '#00000070', fontWeight: 'bold' }}>
              Your terminal is not synced from last 36hrs,Turn off offline mode
            </Typography> */}
              </>
            )}
          </Stack>
        </Stack>

        <Stack flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between">
          <Tabs
            sx={{
              width: '10rem',
              mb: 1,
              '& .MuiTabs-scroller': {
                borderBottom: '2px solid #ecebeb',
              },
              '& .MuiButtonBase-root': {
                color: '#a6a6a6',
              },
            }}
            value={selectedSaleOrPaymentTab}
            onChange={(event, newValue) => {
              setSelectedSaleOrPaymentTab(newValue);
            }}
            indicatorColor="primary"
          >
            {map(salesOrPaymentsTabsOptions, (_tab) => {
              return <Tab value={get(_tab, 'value')} label={get(_tab, 'label')} />;
            })}
          </Tabs>

          <Box sx={{ position: 'relative' }}>
            <Stack
              width="4rem"
              sx={{
                position: 'absolute',
                right: -1,
                top: 6,
                zIndex: 10,
                opacity: 0.00001,
                cursor: 'pointer',
              }}
            >
              <DateRangePicker
                ranges={predefinedRanges}
                showOneCalendar={isMobileView}
                placement="auto"
                onChange={onChange}
                cleanable={false}
                appearance="default"
                size="lg"
                format="yyyy-MM-dd"
                disabledDate={disabledDate}
                value={[startDate, endDate]}
              />
            </Stack>

            <Tabs
              sx={{
                mb: 1,
                '& .MuiTabs-scroller': {
                  borderBottom: '2px solid #ecebeb',
                },
                '& .MuiButtonBase-root': {
                  color: '#a6a6a6',
                },
              }}
              value={selectedTab}
              onChange={(event, newValue) => {
                setStartDate(null);
                setEndDate(null);
                setSelectedTab(newValue);
              }}
              indicatorColor="primary"
            >
              {map(tabsOptions, (_tab) => {
                return <Tab value={get(_tab, 'value')} label={get(_tab, 'label')} />;
              })}
            </Tabs>
          </Box>
        </Stack>

        <Stack>
          <Stack gap={1}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={5}>
                <Grid>
                  <Card
                    sx={{
                      width: '100%',
                      borderRadius: '10px',
                      border: `1px solid ${theme.palette.grey[300]}`,
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
                            <TimelineIcon fontSize="small" sx={{ marginTop: '1px' }} />
                          </ToggleButton>
                          <ToggleButton
                            value="bar-chart"
                            aria-label="bar-chart"
                            style={{ width: '25px', height: '25px' }}
                          >
                            <BarChartIcon fontSize="small" sx={{ marginTop: '1px' }} />
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                    </Box>

                    {loadings ? (
                      <ChartSkeletonLoader />
                    ) : (
                      <>
                        {isChart === 'bar-chart' && (
                          <ReactApexChart
                            options={
                              isWeek || isMonth || isCustomDate
                                ? lastWeekSalesChartOptions
                                : dailySalesChartOptions
                            }
                            series={[
                              {
                                name: 'time',
                                data: saleDashboard,
                              },
                            ]}
                            type="bar"
                            height={!isEmpty(saleDashboard) ? 340 : 346}
                          />
                        )}

                        {isChart === 'line-chart' && (
                          <ReactApexChart
                            options={
                              isWeek || isMonth || isCustomDate
                                ? lastWeekSalesChartOptions
                                : dailySalesChartOptions
                            }
                            series={[
                              {
                                name: 'time',
                                data: saleDashboard,
                              },
                            ]}
                            type="area"
                            height={!isEmpty(saleDashboard) ? 340 : 346}
                          />
                        )}
                      </>
                    )}
                  </Card>
                </Grid>
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack
                  sx={{
                    width: '100%',
                    flexDirection: {
                      xs: 'column',
                      md: 'row',
                    },
                  }}
                  gap={1}
                >
                  <Card
                    sx={{
                      height: '100%',
                      width: {
                        xs: '100%',
                        md: '65%',
                      },
                      borderRadius: '10px',
                      border: `1px solid ${theme.palette.grey[300]}`,
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.15)',
                      p: 3,
                      pb: 2,
                      pr: 2,
                      '& .apexcharts-datalabels-group > .apexcharts-text:first-child': {
                        fill: '#fff !important',
                      },
                    }}
                  >
                    <Stack flexDirection="row" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {isSalesTab
                          ? isSale === 'income'
                            ? 'No.of Sales'
                            : 'Total Sales'
                          : isSale === 'income'
                          ? 'Total Income'
                          : 'Payments mode'}
                      </Typography>
                      <Stack flexDirection="row" gap={0.5} mt={0.5}>
                        <Box
                          sx={{
                            p: 0.5,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '50%',
                            // backgroundColor: TREND_STATUS[trendSalesStatus].light,
                            height: '17px',
                          }}
                        >
                          <Box>
                            <ToggleButtonGroup
                              type="button"
                              orientation="Horizontal"
                              value={isSale}
                              exclusive
                              onChange={(event, newValue) => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (newValue) {
                                  setIsSale(newValue);
                                }
                              }}
                              size="small"
                              sx={{
                                '& .MuiButtonBase-root': {
                                  marginTop: '4px !important',
                                },
                              }}
                            >
                              <ToggleButton
                                aria-label="smallModule"
                                style={{ width: '25px', height: '25px' }}
                                value="sale"
                              >
                                {isSalesTab ? (
                                  <CurrencyRupeeIcon fontSize="small" sx={{ marginTop: '1px' }} />
                                ) : (
                                  <TrendingUpIcon fontSize="small" sx={{ marginTop: '1px' }} />
                                )}
                              </ToggleButton>
                              <ToggleButton
                                aria-label="module"
                                style={{ width: '25px', height: '25px' }}
                                value="income"
                              >
                                {isSalesTab ? (
                                  <NumbersIcon fontSize="small" sx={{ marginTop: '1px' }} />
                                ) : (
                                  <CurrencyRupeeIcon fontSize="small" sx={{ marginTop: '1px' }} />
                                )}
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </Box>

                          {/* {Object.keys(TREND_STATUS)[0] === trendSalesStatus ? (
                            <TrendingUpIcon
                              sx={{
                                width: 10,
                                height: 10,
                                color: TREND_STATUS[trendSalesStatus].dark,
                              }}
                            />
                          ) : (
                            <TrendingDownIcon
                              sx={{
                                width: 10,
                                height: 10,
                                color: TREND_STATUS[trendSalesStatus].dark,
                              }}
                            />
                          )} */}
                        </Box>
                        {/* <Typography
                          variant="overline"
                          sx={{ color: TREND_STATUS[trendSalesStatus].dark }}
                        >
                          {`${
                            totalIncomeTrendingPercentage >= 0
                              ? TREND_STATUS[trendSalesStatus].symbol
                              : ''
                          } ${totalIncomeTrendingPercentage}%`}
                        </Typography> */}
                      </Stack>
                    </Stack>
                    {loadings ? (
                      <CircularChartSkeletonLoader />
                    ) : (
                      <>
                        {!isSalesTab && (
                          <Typography variant="h4" sx={{ color: sales > 0 ? 'green' : 'red' }}>
                            {isSale === 'income' ? `₹${toFixedIfNecessary(sales, 2)}` : ''}
                          </Typography>
                        )}

                        {isSale === 'sale' && isSalesTab && (
                          <ReactApexChart
                            type="donut"
                            series={chartSeries}
                            options={chartOptions}
                            height={!isEmpty(chartIncome) ? 344 : 376}
                          />
                        )}

                        {isSale === 'income' && isSalesTab && (
                          <ReactApexChart
                            type="donut"
                            series={chartSeries}
                            options={chartOptions}
                            height={!isEmpty(chartIncome) ? 344 : 378}
                          />
                        )}

                        {isSale === 'sale' && !isSalesTab && (
                          <ReactApexChart
                            type="donut"
                            series={chartSeries}
                            options={chartOptions}
                            height={!isEmpty(chartIncome) ? 341 : 376}
                          />
                        )}

                        {isSale === 'income' && !isSalesTab && (
                          <ReactApexChart
                            type="bar"
                            series={chartIncome}
                            options={incomeOptions}
                            height={!isEmpty(chartIncome) ? 290 : 350}
                          />
                        )}
                      </>
                    )}
                  </Card>

                  <Stack
                    sx={{
                      flexDirection: {
                        xs: 'column',
                        sm: 'row',
                        md: 'column',
                      },
                      width: {
                        xs: '100%',
                        md: '35%',
                      },
                      '& .MuiCard-root': {
                        borderRadius: '10px',
                      },
                    }}
                    gap={1}
                  >
                    <Stack
                      sx={{
                        border: `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.15)',
                        borderRadius: '10px',
                        height: '50%',
                      }}
                    >
                      {loadings ? (
                        <PaymentCardSkeletonLoader />
                      ) : (
                        <>
                          <MiniCard
                            logo="/assets/images/Box_icon.png"
                            title={isSalesTab ? 'Total No.of Orders' : 'Total No.of Payments'}
                            // trendStatus={
                            //   (isYesterday
                            //     ? yesterdayOrderTrendPercentage
                            //     : isWeek
                            //     ? lastWeekTotalOrderPercentage
                            //     : isMonth
                            //     ? lastMonthTotalOrderPercentage
                            //     : isCustomDate
                            //     ? CustomToDateTalOrderPercentage
                            //     : totalOrderTrendPercentage) > 0
                            //     ? 'up'
                            //     : 'down'
                            // }
                            trendValue={
                              isYesterday
                                ? yesterdayOrderTrendPercentage
                                : isWeek
                                ? lastWeekTotalOrderPercentage
                                : isMonth
                                ? lastMonthTotalOrderPercentage
                                : isCustomDate
                                ? CustomToDateTalOrderPercentage
                                : totalOrderTrendPercentage
                            }
                            value={
                              isYesterday
                                ? get(
                                    salesOrPayment,
                                    isSalesTab ? 'totalOrders' : 'totalPayments',
                                    0
                                  )
                                : isWeek
                                ? get(
                                    salesOrPayment,
                                    isSalesTab ? 'totalOrders' : 'totalPayments',
                                    0
                                  )
                                : isMonth
                                ? get(
                                    salesOrPayment,
                                    isSalesTab ? 'totalOrders' : 'totalPayments',
                                    0
                                  )
                                : isCustomDate
                                ? get(
                                    salesOrPayment,
                                    isSalesTab ? 'totalOrders' : 'totalPayments',
                                    0
                                  )
                                : get(
                                    salesOrPayment,
                                    isSalesTab ? 'totalOrders' : 'totalPayments'
                                  ) || 0
                            }
                            bar={{ color: '#5a0b45' }}
                            progress={
                              isYesterday
                                ? get(salesOrPayment, 'totalOrders', 0)
                                : isWeek
                                ? get(salesOrPayment, 'lastWeekData.totalOrders', 0)
                                : isMonth
                                ? get(salesOrPayment, 'lastMonthData.totalOrders', 0)
                                : isCustomDate
                                ? get(salesOrPayment, 'customData.totalOrders', 0)
                                : get(salesOrPayment, 'totalOrders') || 0
                            }
                          />{' '}
                        </>
                      )}
                    </Stack>

                    <Stack
                      sx={{
                        border: `1px solid ${theme.palette.grey[300]}`,
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.15)',
                        borderRadius: '10px',
                        height: '50%',
                      }}
                    >
                      {loadings ? (
                        <PaymentCardSkeletonLoader />
                      ) : (
                        <>
                          {' '}
                          <MiniCard
                            logo="/assets/images/expense_icon.png"
                            title="Expenses"
                            value={fCurrency(
                              (isWeek || isMonth || isCustomDate
                                ? get(salesOrPayment, 'expenseData.0.totalExpense', 0)
                                : get(salesOrPayment, 'expenseData.0.totalExpense') || 0) / 100
                            )}
                            bar={{ color: '#fec93f' }}
                            progress={
                              isWeek || isMonth || isCustomDate
                                ? get(salesOrPayment, 'expenseData.0.amountSpent', 0)
                                : get(salesOrPayment, 'expenseData.0.totalExpense') || 0
                            }
                          />{' '}
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid item xs={12} md={5}>
                <Grid>
                  <Card
                    sx={{
                      height: 350,
                      borderRadius: '10px',
                      p: 2,
                      border: `1px solid ${theme.palette.grey[300]}`,
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.15)',
                      borderRadius: '10px',
                    }}
                  >
                    <Stack flexDirection="row" justifyContent="space-between">
                      <Typography variant="subtitle1">Trending Items</Typography>

                      <Box>
                        <ToggleButtonGroup
                          type="button"
                          orientation="Horizontal"
                          value={selectedValue}
                          exclusive
                          onChange={(event, newValue) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (newValue === 'quantity') {
                              setIsPriceView(false);
                              getTrendingProducts();
                              setSelectedValue('quantity');
                            } else if (newValue === 'price') {
                              setIsPriceView(true);
                              getTrendingPrice();
                              setSelectedValue('price');
                            }
                          }}
                          // onChange={(event, newValue) => setSelectedValue(newValue)}
                          size="small"
                          sx={{
                            '& .MuiButtonBase-root': {
                              marginTop: '4px !important',
                            },
                          }}
                        >
                          <ToggleButton
                            value="quantity"
                            aria-label="smallModule"
                            style={{ width: '25px', height: '25px' }}
                          >
                            <ProductionQuantityLimitsIcon
                              fontSize="small"
                              sx={{ marginTop: '1px' }}
                            />
                          </ToggleButton>
                          <ToggleButton
                            value="price"
                            aria-label="module"
                            style={{ width: '25px', height: '25px' }}
                          >
                            <CurrencyRupeeIcon fontSize="small" sx={{ marginTop: '1px' }} />
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                    </Stack>
                    {loadings ? (
                      <ItemListSkeletonLoader />
                    ) : (
                      <>
                        <Stack flexDirection="row" justifyContent="space-between" my={2}>
                          <Typography variant="body1" sx={{ opacity: 0.3, fontWeight: 'bold' }}>
                            Items
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.3, fontWeight: 'bold' }}>
                            {selectedValue === 'price' ? 'Sold Price' : 'Sold Quantity'}
                          </Typography>
                        </Stack>
                        {
                          <CustomScrollbar style={{ height: '230px', paddingRight: '10px' }}>
                            <Stack gap={2} mt={2} sx={{ paddingRight: '10px' }}>
                              {map(trendingProducts, (_item, _index) => {
                                return (
                                  <TrendingItem
                                    logo={get(_item, 'productImage')}
                                    title={get(_item, 'name')}
                                    category={get(_item, 'category')}
                                    value={
                                      selectedValue === 'price'
                                        ? get(_item, 'prodPrice')
                                        : get(_item, 'sold_quantity')
                                    }
                                    isPrimary={_index % 2 === 0}
                                  />
                                );
                              })}
                              {isEmpty(trendingProducts) && (
                                <Stack
                                  flexDirection="row"
                                  justifyContent="center"
                                  alignItems="center"
                                  color="lightgray"
                                >
                                  <Typography variant="subtitle2">No data available</Typography>{' '}
                                </Stack>
                              )}
                            </Stack>
                          </CustomScrollbar>
                        }
                      </>
                    )}
                  </Card>
                </Grid>
              </Grid>
              <Grid item xs={12} md={7}>
                <LiveTransactions
                  title="Recent Orders"
                  tableData={liveTransactionData}
                  getRecentTransactions={getRecentTransactions}
                  selected={selected}
                  setSelected={setSelected}
                  recentTransaction={recentTransaction}
                  isCompleted={isCompleted}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default Dashboard;
