import LockIcon from '@mui/icons-material/Lock';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  styled,
  useTheme,
  Divider,
  Dialog,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
// components
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NoFoodIcon from '@mui/icons-material/NoFood';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PostAddIcon from '@mui/icons-material/PostAdd';
import useMediaQuery from '@mui/material/useMediaQuery';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import _, {
  clone,
  filter,
  find,
  findIndex,
  forEach,
  get,
  groupBy,
  isEmpty,
  isUndefined,
  map,
  omitBy,
  some,
  sortBy,
  isEqual,
  truncate,
  lowerCase,
  set,
} from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import BillingProduct from 'src/components/BillingProduct';
import Categories from 'src/components/Categories';
import GetAdditionalInformationDialog from 'src/components/GetAdditionalInformationDialog';
import ProductLoader from 'src/components/ProductLoader';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import VirtualizeSearchBox from 'src/components/VirtualizeSearchBox';
import CartList from 'src/components/cart/CartList';
import CartSummary from 'src/components/cart/CartSummary';
import DropDown from 'src/components/cart/DropDown';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  NAVIGATION_STATE_KEY,
  PAYMENT_TYPES,
  PaymentModeTypeConstants,
  ROLES_DATA,
  SYNC_UP_CONSTANTS,
  SYNC_UP_CONTENT,
  StatusConstants,
  hideScrollbar,
  ORDER_STATUS,
  UNSAVED_HOLD_CHANGES_WILL_BE_LOST_CONTINUE,
  ALL_CONSTANT,
  OrderTypeConstants,
  defaultOrderTypes,
  BILLING_SCAN_KEYS,
} from 'src/constants/AppConstants';
import { billingTourConfigIsLock, billingTourConfigIsUnlock } from 'src/constants/TourConstants';
import { GstData } from 'src/global/SettingsState';
import {
  alertDialogInformationState,
  allConfiguration,
  billingProducts,
  cart,
  currentStoreId,
  currentTerminalId,
  customCode,
  customerCode,
  isOfflineState,
  isTourOpenState,
  noStockProducts,
  offlineHoldOnListState,
  selectedHoldIdState,
  isEditHoldOnState,
  prevTerminalIdState,
  orderDateState,
  deliveryDateState,
  terminalConfigurationState,
} from 'src/global/recoilState';
import { filterShortCode } from 'src/helper/filterShortCode';
import { PATH_DASHBOARD } from 'src/routes/paths';
import AddCustomerInfo from 'src/sections/Customer/AddCustomerInfo';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import STORES_API from 'src/services/stores';
import convertPercentageToValue from 'src/utils/convertPercentageToValue';
import { fCurrency } from 'src/utils/formatNumber';
import { useSettingsContext } from '../components/settings';
import BillingProductSmallGrid from 'src/components/BillingProductSmallGrid';
import BillingProductSmallGridImage from 'src/components/BillingProductSmallGridImage';
import BillingProductList from 'src/components/BillingProductList';
import uuid from 'react-uuid';
import toast from 'react-hot-toast';
import PanToolIcon from '@mui/icons-material/PanTool';
import { currentDate, currentTime } from 'src/utils/formatTime';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import moment from 'moment';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import { getCurrentDate } from 'src/helper/FormatTime';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import useExecuteAfterCheck from 'src/hooks/useExecuteAfterCheck';
import { compareTwoTimeWithCurrentTime } from 'src/helper/compareTwoTimeWithCurrentTime';
import { fCurrentDateTIme } from 'src/utils/getCurrentDateTime';
import Iconify from 'src/components/iconify';
import AddCustomerWAInfo from 'src/sections/Customer/AddCustomerWAInfo';
import getClone from 'src/utils/getClone';
import { formatOrderTypeDataStrucutre } from 'src/utils/formatOrderTypeDataStrucutre';
import { useSearchParams } from 'react-router-dom';

// ----------------------------------------------------------------------

const ALL = 'all';

export default function Billing() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { themeStretch } = useSettingsContext();
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const isCategoryRankingEnabled = get(configuration, 'categoryRanking.isActive', false);
  const categoriesRankingList = isCategoryRankingEnabled
    ? get(configuration, 'categoryRanking.categoryRank')
    : null;
  const [totalProducts, setTotalProducts] = useRecoilState(billingProducts);
  const formattedProducts = filterShortCode(totalProducts);

  const [isCredited, setIsCredited] = useState(false);

  const categoriesList = !isEmpty(groupBy(formattedProducts, 'category'))
    ? [ALL, ...(map(groupBy(formattedProducts, 'category'), (e, category) => category) || [])]
    : [];
  const sortedByRanking = isCategoryRankingEnabled
    ? map(
        sortBy(
          map(categoriesList, (f) => {
            const findData = find(categoriesRankingList, (d) => d.category === f);
            return { ...findData, category: f };
          }),
          (g) => g.rank
        ),
        (e) => e.category
      )
    : categoriesList;
  const [categorizedProduct, setCategoriesProducts] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [addOrder, setaddOrder] = useRecoilState(cart);
  const [currentCustomCode, setCurrentCustomCode] = useRecoilState(customCode);
  const currentStore = useRecoilValue(currentStoreId);
  const [currentTerminal, setCurrentTerminal] = useRecoilState(currentTerminalId);
  const [currentCustomerCode, setCurrentCustomerCode] = useRecoilState(customerCode);
  const [noStocks, setNoStocks] = useRecoilState(noStockProducts);
  const [paymentMode, setPaymentMode] = useState(PaymentModeTypeConstants.CASH);
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.FULL_PAYMENT);
  const orderTypeValues = get(configuration, 'isOrderType.orderTypes', {});
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const previouseOrderTypeList = get(configuration, 'isOrderType.orderTypes', defaultOrderTypes);
  const orderTypesList = formatOrderTypeDataStrucutre(previouseOrderTypeList);
  const [orderType, setOrderType] = useState(OrderTypeConstants.DineIn);
  const totalLength = !isEmpty(addOrder) ? addOrder.length : 0;
  const boxRef = useRef(null);
  const isTourOpen = useRecoilValue(isTourOpenState);
  const resetOrder = useResetRecoilState(cart);
  const resetCurrentCustomerCode = useResetRecoilState(customerCode);
  const resetCurrentCustomCode = useResetRecoilState(customCode);
  const [bookingId, setBookingId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isCustomCodeEnabled = get(configuration, 'customCode', false);
  const isCustomerCodeEnabled = get(configuration, 'customerManagement', false);
  const isPrint = get(configuration, 'savePrint', false);
  const isAddInfoMode = get(configuration, 'billingSettings.isBookingInfo', false);
  const isAddonMandatory = get(configuration, 'isAddonPop', false);
  const [gstData, setGstData] = useRecoilState(GstData);
  const [customCodes, setCustomCodes] = useState([]);
  const [customerCodes, setCustomerCodes] = useState([]);
  const [isCartScreen, setIsCartScreen] = useState(false);
  const isLaptop = useMediaQuery('(min-width:900px)');
  const currentRole = AuthService.getCurrentRoleInLocal();
  const defaultValueCustom = { label: '', id: '' };
  const [currentCustomCodeLabel, setCurrentCustomCodeLabel] = useState(defaultValueCustom);
  const [currentCustomerIdLabel, setCurrentCustomerCodeLabel] = useState(defaultValueCustom);
  const { themeLayout } = useSettingsContext();
  const [info, setInfo] = useState('');
  const [loadedFilteredProductCount, setLoadedFilteredProductCount] = useState(0);
  const [isInfinityScrollLoading, setIsInfinityScrollLoading] = useState(false);
  const [isEndInfinityScroll, setIsEndInfinityScroll] = useState(false);
  const captureScrollHeight = useRef();
  const [customerInfo, setCustomerInfo] = useState({});
  const [isError, setIsError] = useState(false);
  const [isOpenAddCustomerModal, setIsOpenAddCustomerModal] = useState(false);
  const [isOpenAddCustomerWAModal, setIsOpenAddCustomerWAModal] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [orders, setOrders] = useRecoilState(cart);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [orderDate, setOrderDate] = useRecoilState(orderDateState);
  const [finalAdvance, setFinalAdvance] = useState(null);
  const [finalAdditionalDiscount, setFinalAdditionalDiscount] = useState(0);
  const [finalAdditionalCharges, setFinalAdditionalCharges] = useState(0);
  const [finalPackingCharges, setFinalPackingCharges] = useState(0);
  const [finalDeliveryCharges, setFinalDeliveryCharges] = useState(0);
  const previousDate = orderDate ? dayjs(orderDate) : dayjs();
  const [selectedOrderDate, setSelectedOrderDate] = useState(previousDate);
  const isExpendedSidebar = themeLayout === 'vertical';
  const perPageCountFilterProducts = 30;
  const allProductsWithUnits = useRecoilState(billingProducts);
  const [addonListDialogData, setAddonListDialogData] = useState({});
  const [openAlreadyAddedAddonDialog, setOpenAlreadyAddedAddonDialog] = useState(false);
  const [openBillingAddonDialog, setOpenBillingAddonDialog] = useState(false);
  const [decrementOrderData, setDecrementOrderData] = useState([]);
  const [openDecrementDialog, setOpenDecrementDialog] = useState(false);
  const [incrementOrderData, setIncrementOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openChooseOrderDate, setOpenChooseOrderDate] = useState(false);
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;
  const [openGetInformationDialog, setAddtionalInfoDialog] = useState(false);
  const [lastSyncTime, setSyncTime] = useState('');
  const [syncState, setSyncState] = useState(false);
  const [value, setValue] = useState('');
  console.log(value);
  const ENTER = ['Enter'];

  const [offlineHoldOnList, setOfflineHoldOnList] = useRecoilState(offlineHoldOnListState);
  const [selectedHoldId, setSelectedHoldId] = useRecoilState(selectedHoldIdState);
  const [isEditHoldOn, setIsEditHoldOn] = useRecoilState(isEditHoldOnState);

  const [prevTerminalId, setPrevTerminalId] = useRecoilState(prevTerminalIdState);
  const [deliveryDate, setDeliveryDate] = useRecoilState(deliveryDateState);
  const previousDeliveryDate = deliveryDate ? dayjs(deliveryDate) : dayjs();
  const [isDeliveryDateEdited, setIsDeliveryDateEdited] = useState(false);

  console.log('currentCustomCode', currentCustomCode);
  const terminalConfiguration = useRecoilState(terminalConfigurationState)[0];
  const scanBy = get(terminalConfiguration, 'billingScanBy', BILLING_SCAN_KEYS.PRODUCT_ID);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(previousDeliveryDate);
  const isReverseStock = get(configuration, 'isReverseStock', false);
  const executeAfterCheck = useExecuteAfterCheck();
  const isAllowDeliveryDateChange = get(
    configuration,
    'billingSettings.isAllowDeliveryDateChange',
    false
  );

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tableName = location?.state?.orders?.[0]?.tableName;
  const editTableCategory = get(
    location,
    'state.orders.0.additionalInfo.tableData.tableCategory',
    ''
  );
  const isEditFlow = !!get(location, 'state.orders');
  console.log('isEditFlow', isEditFlow);
  const tableCategory =
    isEditFlow && editTableCategory ? editTableCategory : searchParams.get('tableCategory');

  const [view, setView] = useState('GRID');
  const handleOpenGetInformationDialog = () => {
    setAddtionalInfoDialog(true);
  };
  const handleCloseGetInformationDialog = () => {
    setAddtionalInfoDialog(false);
  };
  const handleCloseCustomerModal = (e) => {
    setIsError(false);
    setCustomerInfo(e);
    setIsOpenAddCustomerModal(false);
    setIsOpenAddCustomerWAModal(false);
  };
  const handleOpenCustomerModal = () => {
    setIsOpenAddCustomerModal(true);
  };
  const handleOpenCustomerWAModal = () => {
    setIsOpenAddCustomerWAModal(true);
  };
  const handleChangeChooseDate = (e) => {
    console.log(e);
  };
  const handleChangeTab = (newValue) => {
    console.log(newValue);
    if (lowerCase(newValue) === lowerCase(OrderTypeConstants.Parcel)) {
      selectPackingChanges();
    } else {
      removePackingChanges();
    }
    setOrderType(newValue);
  };
  const StyledButton = styled(Button)(`
  text-transform: none;
  
`);
  const getProductsWithUnits = async () => {
    try {
      setIsLoading(true);
      const response = await PRODUCTS_API.getBillingProducts();
      if (response) {
        const today = new Date().getDay();
        const comparedProducts = filter(get(response, 'data', []), (e) => {
          const isSessionEnabled = get(e, 'sessionInfo.isSessionEnabled', false);
          if (isSessionEnabled) {
            const isEnabledtodayTimeSlot = find(
              get(e, 'sessionInfo.timeSlots', []),
              (e) => get(e, 'day') === today
            );
            if (get(isEnabledtodayTimeSlot, 'enabled')) {
              const result = compareTwoTimeWithCurrentTime(
                get(isEnabledtodayTimeSlot, 'startTime'),
                get(isEnabledtodayTimeSlot, 'endTime')
              );
              return result;
            } else return false;
          } else {
            return true;
          }
        });
        const formatData = map(comparedProducts, (_item) => {
          set(_item, 'isParcelCharges', false);
          return _item;
        });
        setTotalProducts(formatData);
        const oldCategorizedProduct = categorizedProduct;
        setCategoriesProducts(ALL !== categorizedProduct ? ALL : categorizedProduct?.[1]);
        setTimeout(() => {
          setCategoriesProducts(oldCategorizedProduct);
          infinityScrollReset();
          setTotalProducts(formatData);
        }, 10);
      }
    } catch (e) {
      console.log(e);
      // setTotalProducts([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChangeAddCustomerCode = (value) => {
    if (value) {
      setCurrentCustomerCode(value.id);
      setCurrentCustomerCodeLabel(value);
    }

    if (!value) resetCurrentCustomerCode();
  };
  const handleChangeAddCustomCode = (value) => {
    if (value) {
      setCurrentCustomCode(value.id);
      setCurrentCustomCodeLabel(value);
    }
    if (!value) resetCurrentCustomCode();
  };
  const syncUpProducts = async () => {
    if (!currentStore) return;

    getProductsWithUnits();
    return;
  };
  const initialFetch = async () => {
    try {
      const resp = await SettingServices.getConfiguration();
      const printResp = await SettingServices.getPrintConfiguration();
      if (resp || printResp) {
        if (get(resp, 'code') === 'Error') {
          //temporarly correct this if api ok
          setConfiguration({
            ...(configuration || {}),
            ...(get(printResp, 'data.0') || {}),
          });
        } else {
          setConfiguration({
            ...(configuration || {}),
            ...(get(resp, 'data.0') || {}),
            ...(get(printResp, 'data.0') || {}),
          });
        }
        setGstData({
          gstNumber: get(resp, 'data.0.gstNumber'),
          gstPercent: get(resp, 'data.0.gstPercent'),
          gstEnabled: get(resp, 'data.0.gstEnabled'),
        });
        if (get(resp, 'data.0.customCode')) {
          const customCodesDetails = await SettingServices.getCustomCodesData();
          setCustomCodes(get(customCodesDetails, 'data', []));
        }
        if (get(resp, 'data.0.customerManagement')) {
          const responseCustomerCodes = await SettingServices.getCustomerData();
          responseCustomerCodes &&
            setCustomerCodes(get(responseCustomerCodes, 'data', [])?.reverse());
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const routeToStores = () => {
    navigate(PATH_DASHBOARD.stores.terminals);
  };
  const routeToInventory = () => {
    navigate(PATH_DASHBOARD.inventory.products, {
      replace: true,
      state: { navigateFor: NAVIGATION_STATE_KEY.ADD_PRODUCT },
    });
  };
  const handleOpenCalendar = () => {
    setOpenChooseOrderDate(true);
  };
  const handleCloseCalendar = () => {
    setOpenChooseOrderDate(false);
  };
  const handleClearDate = () => {
    setOrderDate('');
    toast.success('Date Resetted');
    handleCloseCalendar();
  };

  const handleChangeDate = (e) => {
    setSelectedOrderDate(e);
  };
  const handleSubmitOrderDate = () => {
    setOrderDate(selectedOrderDate);
    handleCloseCalendar();
    toast.success(
      selectedOrderDate
        ? `Order Date ${dayjs(get(selectedOrderDate, '$d')).format('DD/MM/YYYY hh:mm:ss')}`
        : 'Date Resetted'
    );
  };
  const handleReset = (isSelectedHoldIdFlow) => {
    resetCurrentCustomerCode();
    resetCurrentCustomCode();
    setCurrentCustomCodeLabel(defaultValueCustom);
    setCurrentCustomerCodeLabel(defaultValueCustom);
    resetOrder();
    setPaymentMode(PaymentModeTypeConstants.CASH);
    setBookingId(0);
    setInfo('');
    setCustomerInfo({});
    setIsCartScreen(false);
    setIsEditHoldOn(false);
    setSelectedHoldId(null);
    setIsDeliveryDateEdited(false);

    setFinalPackingCharges(0);
    setFinalAdditionalCharges(0);
    setFinalDeliveryCharges(0);
    setFinalAdditionalDiscount(0);
    setDeliveryDate();
    setSelectedDeliveryDate('');
    setFinalAdvance(null);

    const { status: offlineStatus } = ObjectStorage.getItem(StorageConstants.OFFLINE);
    if (!offlineStatus) {
      syncUpProducts();
    }
    if (!isEmpty(get(location, 'state.orders', []))) {
      setDeliveryDate();
      setSelectedDeliveryDate('');
    }

    setIsCredited(false);

    if (!isSelectedHoldIdFlow) {
      if (configuration?.isOrderType?.isSaveOrderType) {
        ObjectStorage.setItem(StorageConstants.ORDER_TYPE, {
          data: orderType,
        });
      } else {
        setOrderType(OrderTypeConstants.DineIn);
      }
    }
  };
  console.log(paymentType);
  const getPrice = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    if (check) {
      const { withoutGstAmount } = getTotalPriceAndGst({
        price: check?.offerPrice || check?.price,
        GSTPercent: check?.GSTPercent,
        GSTInc: check?.GSTInc,
        fullData: check,
        orderType,
      });
      return withoutGstAmount;
    }
  };
  const getPriceWithGst = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    if (check) {
      const { withGstAmount, withoutGstAmount, parcelChargesWithoutGst, gstPercentageValue } =
        getTotalPriceAndGst({
          price: check?.offerPrice || check?.price,
          GSTPercent: check?.GSTPercent,
          GSTInc: check?.GSTInc,
          fullData: check,
          orderType,
        });
      return withoutGstAmount + parcelChargesWithoutGst + gstPercentageValue;
    }
  };

  const getActualPrice = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    if (check) {
      const { withoutGstAmount } = getTotalPriceAndGst({
        price: check?.price,
        GSTPercent: check?.GSTPercent,
        GSTInc: check?.GSTInc,
        fullData: check,
        orderType,
      });
      return withoutGstAmount;
    }
  };

  const calculateTotalPrice = () => {
    if (isEmpty(addOrder)) return 0;
    let totalPrice = 0;
    map(addOrder, (e) => {
      if (isEmpty(e.addOn)) {
        totalPrice += getPrice(e.productId) * e.quantity;
      } else if (!isEmpty(e.addOn)) {
        let totalAddonPrice = 0;
        map(e.addOn, (d) => {
          totalAddonPrice += d.price * d.quantity;
        });
        totalPrice += (getPrice(e.productId) + totalAddonPrice) * e.quantity;
      }
    });
    return totalPrice;
  };
  const calculateTotalPriceWithGST = () => {
    if (isEmpty(addOrder)) return 0;
    let totalPrice = 0;
    map(addOrder, (e) => {
      if (isEmpty(e.addOn)) {
        totalPrice += getPriceWithGst(e.productId) * e.quantity;
      } else if (!isEmpty(e.addOn)) {
        let totalAddonPrice = 0;
        map(e.addOn, (d) => {
          totalAddonPrice +=
            getTotalPriceAndGst({
              price: d?.price,
              GSTPercent: d?.GSTPercent,
              GSTInc: d?.GSTInc,
              fullData: d,
              orderType,
            })?.withGstAmount * d.quantity;
        });
        totalPrice += (getPriceWithGst(e.productId) + totalAddonPrice) * e.quantity;
      }
    });
    return totalPrice;
  };
  const calculateActualTotalPrice = () => {
    if (isEmpty(addOrder)) return 0;
    let totalPrice = 0;
    map(addOrder, (e) => {
      if (isEmpty(e.addOn)) {
        totalPrice += getActualPrice(e.productId) * e.quantity;
      } else if (!isEmpty(e.addOn)) {
        let totalAddonPrice = 0;
        map(e.addOn, (d) => {
          totalAddonPrice += d.price * d.quantity;
        });
        totalPrice += (getActualPrice(e.productId) + totalAddonPrice) * e.quantity;
      }
    });
    return totalPrice;
  };

  const gstAmount = get(gstData, 'gstEnabled')
    ? convertPercentageToValue(get(gstData, 'gstPercent'), calculateTotalPrice())
    : 0;
  const totalOrderValue = calculateTotalPriceWithGST();
  const totalValueNoOffer = calculateActualTotalPrice();

  const remainingAmountOrTotalAmount =
    totalOrderValue +
    Number(finalAdditionalCharges) -
    Number(finalAdditionalDiscount) -
    (finalAdvance || 0) +
    Number(finalPackingCharges) +
    Number(finalDeliveryCharges);

  const remainingTotalAmount =
    totalOrderValue +
    Number(finalAdditionalCharges) -
    Number(finalAdditionalDiscount) +
    Number(finalPackingCharges) +
    Number(finalDeliveryCharges);

  const getRoundedOff = () => {
    const splitDecimal = remainingAmountOrTotalAmount?.toFixed?.(2)?.split?.('.')[1];

    if (splitDecimal) {
      if (Number(splitDecimal) >= 50) {
        return {
          value: `0.${100 - Number(splitDecimal)}`,
          symbol: '+',
        };
      } else {
        return {
          value: `0.${Number(splitDecimal)}`,
          symbol: '-',
        };
      }
    }

    return {
      value: 0,
      symbol: '+',
    };
  };

  const handleLoadLoadedFilteredProducts = () => {
    let filterProducts = [];

    if (categorizedProduct === ALL) {
      filterProducts = formattedProducts;
    } else {
      filterProducts = filter(
        formattedProducts,
        (e) => get(e, 'category', '') === categorizedProduct
      );
    }

    const sliceData = filterProducts?.slice?.(
      loadedFilteredProductCount,
      loadedFilteredProductCount + perPageCountFilterProducts
    );

    if (!isEmpty(sliceData)) {
      setFilteredProducts((prev) => [...prev, ...sliceData]);
      setLoadedFilteredProductCount((prev) => prev + perPageCountFilterProducts);
      setIsEndInfinityScroll(false);
    } else {
      setIsEndInfinityScroll(true);
    }
  };

  const infinityScrollReset = () => {
    setIsEndInfinityScroll(false);
    setFilteredProducts([]);
    setLoadedFilteredProductCount(0);
    if (boxRef.current) {
      boxRef.current.scrollTop = 0;
    }
  };

  const handleChangeCategoriesProducts = (selectedProducts) => {
    if (selectedProducts !== categorizedProduct) {
      setCategoriesProducts(selectedProducts);
      infinityScrollReset();
    }
  };
  const validJson = (text) => {
    try {
      const data = JSON.parse(text);
      return true;
    } catch (e) {
      if (e instanceof SyntaxError) return false;
    }
  };

  useEffect(() => {
    if (currentStore && currentTerminal) {
      initialFetch();
    }
  }, [currentStore, currentTerminal]);

  useEffect(() => {
    syncUpProducts();
  }, [currentStore]);

  useEffect(() => {
    return () => {
      resetOrder();
    };
  }, []);

  const handleQR = (scannedText) => {
    if (!scannedText) return;
    const products = find(totalProducts, (e) =>
      scanBy === BILLING_SCAN_KEYS.BARCODE
        ? get(e, 'attributes.barcode') === scannedText
        : e.productId === scannedText
    );

    if (!isEmpty(products)) {
      let isSoldOut =
        get(products, 'status') === StatusConstants.SOLDOUT ||
        (products?.stockMonitor && products?.stockQuantity <= 0);
      if (isReverseStock) {
        isSoldOut = false;
      }
      if (isSoldOut) return toast.error('Soldout product');
      setaddOrder((prevState) => {
        const index = findIndex(prevState, (d) =>
          scanBy === BILLING_SCAN_KEYS.BARCODE
            ? get(d, 'attributes.barcode') === scannedText
            : d.productId === scannedText
        );
        if (index !== -1) {
          let data = prevState[index];
          const currentState = clone(prevState);
          currentState[index] = {
            ...data,
            quantity: data.quantity + 1,
            addByScanning: scannedText,
          };
          return currentState;
        } else {
          const cartId = uuid();
          return [
            ...prevState,
            {
              ...products,
              cartId,
              quantity: 1,
              productAddons: get(products, 'addOn', []),
              addByScanning: scannedText,
            },
          ];
        }
      });
    } else {
      toast.error('Product not found');
    }

    currentID = '';
  };
  let currentID = '';
  const handleKeyPress = (e) => {
    const key = e.key;
    if (ENTER.includes(key)) {
      handleQR(currentID);
      currentID = '';
    } else {
      currentID += key;
    }
  };

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress, false);
    return () => {
      document.removeEventListener('keypress', handleKeyPress, false);
    };
  }, []);
  useEffect(() => {
    handleLoadLoadedFilteredProducts();
  }, [categorizedProduct, themeLayout]);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.onscroll = () => {
        if (!isInfinityScrollLoading && !isEndInfinityScroll && boxRef.current.scrollTop) {
          const scrollableHeight = boxRef.current.scrollHeight - boxRef.current.clientHeight;
          if (boxRef.current.scrollTop + 2 >= scrollableHeight) {
            setIsInfinityScrollLoading(true);
            const currentScrollHeight = boxRef.current?.scrollHeight;
            setTimeout(() => {
              setIsInfinityScrollLoading(false);
              handleLoadLoadedFilteredProducts();
              setTimeout(() => {
                if (captureScrollHeight.current) {
                  boxRef.current.scrollTop =
                    captureScrollHeight.current *
                    Math.floor(loadedFilteredProductCount / perPageCountFilterProducts);
                } else {
                  captureScrollHeight.current =
                    boxRef.current.scrollHeight -
                    currentScrollHeight -
                    boxRef.current.offsetHeight +
                    100;
                  boxRef.current.scrollTop = captureScrollHeight.current;
                }
              }, 50);
            }, 1000);
          }
        }
      };
    }
  }, [
    isInfinityScrollLoading,
    boxRef.current,
    captureScrollHeight.current,
    isEndInfinityScroll,
    categorizedProduct,
    loadedFilteredProductCount,
    filteredProducts,
    totalProducts,
  ]);
  const sortedOrders = sortBy(addOrder, [
    (e) => {
      const extractedTimestamp = e.cartId?.match?.(/:(.*)$/)?.[1];
      return extractedTimestamp;
    },
  ]);

  const handleClearAll = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear ${
        selectedHoldId ? `#hold${selectedHoldId}` : 'all current items'
      }?`,
      actions: {
        primary: {
          text: 'Clear All',
          onClick: async (onClose) => {
            handleReset();
            if (selectedHoldId) {
              const { data: localHoldOnList } = ObjectStorage.getItem(
                StorageConstants.OFFLINE_HOLD_ON_LIST
              );
              const filterOtherHoldOnList = filter(localHoldOnList, (_item) => {
                return get(_item, 'holdId') !== selectedHoldId;
              });
              setOfflineHoldOnList(filterOtherHoldOnList);
              ObjectStorage.setItem(StorageConstants.OFFLINE_HOLD_ON_LIST, {
                data: filterOtherHoldOnList,
              });
            }
            onClose();
            navigate(PATH_DASHBOARD.sale.billing);
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };

  const serializeData = () => {
    const options = [];
    map(orders, (e) => {
      let serializeAddOn = [];

      map(e.addOn, (d) => {
        serializeAddOn.push({
          addOnId: d.addOnId,
          quantity: d.quantity * e.quantity,
          price: d.price * 100,
          name: d.name,
          GSTPercent: d.GSTPercent,
        });
      });

      const { withoutGstAmount, withGstAmount } = getTotalPriceAndGst({
        price: get(e, 'offerPrice') || get(e, 'price'),
        GSTPercent: get(e, 'GSTPercent'),
        GSTInc: get(e, 'GSTInc'),
        fullData: e,
        orderType,
      });
      console.log('customerInfo', customerInfo);

      let orderComments = {};
      map(addOrder, (list) => {
        orderComments = {
          ...orderComments,
          ...(get(list, '_additionalInfo')
            ? {
                [get(list, 'productId')]: get(list, '_additionalInfo'),
              }
            : {}),
        };
      });

      console.log('kkkkk', isCustomCodeEnabled, currentCustomCode);

      options.push({
        quantity: e.quantity,
        additionalCharges: Number(finalAdditionalCharges) * 100,
        additionalDiscount: Number(finalAdditionalDiscount) * 100,
        packingCharges: Number(finalPackingCharges) * 100,
        deliveryCharges: Number(finalDeliveryCharges) * 100,
        // whatsappTo: customerInfo.whatsappTo,
        ...(isCustomerCodeEnabled && customerInfo?.whatsappTo
          ? {
              whatsappTo: customerInfo?.whatsappTo,
            }
          : {}),
        ...(isCustomerCodeEnabled && customerInfo?.contactNumber
          ? {
              contactNumber: customerInfo?.contactNumber,
            }
          : {}),
        price: get(e, 'GSTInc') ? withGstAmount * 100 : withoutGstAmount * 100,
        ...(get(e, 'isParcelCharges')
          ? { parcelCharges: Number(get(e, 'parcelCharges')) * 100 }
          : {}),
        ...(get(e, 'counterId') ? { counterId: get(e, 'counterId') } : {}),
        productId: e.productId,
        ...(isOrderTypeEnable ? { orderType: orderType } : {}),
        paymentType: paymentType,
        ...(!isCredited ? { paymentModeType: paymentMode } : {}),
        ...(finalAdvance && finalAdvance > 0 ? { advance: finalAdvance * 100 } : {}),
        GSTPercent: e.GSTPercent,
        GSTInc: get(e, 'GSTInc'),
        productInfo: {
          name: get(e, 'name'),
          category: get(e, 'category'),
          ...(get(e, 'attributes.HSNorSACCode')
            ? { HSNorSACCode: get(e, 'attributes.HSNorSACCode') }
            : {}),
          ...(isCustomCodeEnabled && currentCustomCode
            ? {
                customCode: currentCustomCode,
              }
            : {}),
        },
        roundedOff: Number(`${getRoundedOff()?.symbol}${getRoundedOff()?.value}`),
        addOns: serializeAddOn,
        name: e.name,
        ...(info || !isEmpty(orderComments)
          ? {
              additionalInfo: [
                {
                  ...(info ? { info: info } : {}),
                  ...(!isEmpty(orderComments) ? { orderComment: orderComments } : {}),
                },
              ],
            }
          : {}),

        ...(isCustomCodeEnabled && currentCustomCode
          ? {
              customCode: currentCustomCode,
            }
          : {}),
        ...(isAllowDeliveryDateChange && deliveryDate ? { deliveryDate: deliveryDate } : {}),
        ...(isCustomerCodeEnabled && customerInfo?.id
          ? {
              customerId: customerInfo?.id,
            }
          : {}),
        ...(get(orderDate, '$d')
          ? {
              date: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[0],
              time: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[1],
            }
          : {}),
        contactNumber: get(customerInfo, 'contactNumber', ''),
        ...(get(e, 'addByScanning') ? { addByScanning: get(e, 'addByScanning') } : {}),
      });
    });
    return options;
  };

  const formatSerializeDataForHoldOn = (lastHoldId = 0) => {
    return {
      holdId: lastHoldId + 1,
      ...(get(orderDate, '$d')
        ? {
            date: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[0],
            time: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[1],
          }
        : {
            date: currentDate(),
            time: moment(new Date()).format('HH:mm:ss'),
          }),
      orderDetails: {
        orders,
        ordersSerializeData: serializeData(),
      },
    };
  };

  const postHoldOn = async () => {
    if (!selectedHoldId) {
      const { data: localHoldOnList } = ObjectStorage.getItem(
        StorageConstants.OFFLINE_HOLD_ON_LIST
      );

      const options = formatSerializeDataForHoldOn(localHoldOnList?.at?.(-1)?.holdId);

      ObjectStorage.setItem(StorageConstants.OFFLINE_HOLD_ON_LIST, {
        data: [...(localHoldOnList || []), options],
      });
      setOfflineHoldOnList([...(localHoldOnList || []), options]);
    } else {
      const { data: localHoldOnList } = ObjectStorage.getItem(
        StorageConstants.OFFLINE_HOLD_ON_LIST
      );

      const formatLocalHoldOnList = map(localHoldOnList, (_item) => {
        if (get(_item, 'holdId') === selectedHoldId) {
          return {
            holdId: selectedHoldId,
            ...(get(orderDate, '$d')
              ? {
                  date: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[0],
                  time: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[1],
                }
              : {
                  date: currentDate(),
                  time: moment(new Date()).format('HH:mm:ss'),
                }),
            orderDetails: {
              orders: addOrder,
              ordersSerializeData: serializeData(),
            },
          };
        }
        return _item;
      });

      ObjectStorage.setItem(StorageConstants.OFFLINE_HOLD_ON_LIST, {
        data: formatLocalHoldOnList,
      });
      setOfflineHoldOnList(formatLocalHoldOnList);
    }
    setFinalAdditionalDiscount(0);
    setFinalAdditionalCharges(0);
    setFinalPackingCharges(0);
    setFinalDeliveryCharges(0);
    setFinalAdvance(null);
    handleReset();
    navigate(PATH_DASHBOARD.sale.billing, { replace: true });
  };

  useEffect(() => {
    if (selectedHoldId) {
      const findOfflineHoldOnList = find(offlineHoldOnList, (_item) => {
        return get(_item, 'holdId') === selectedHoldId;
      });

      let formattedOrders = map(get(findOfflineHoldOnList, 'orderDetails.orders'), (list) => {
        let comments = get(list, `additionalInfo.0.orderComment.${get(list, 'productId')}`);
        return {
          ...list,
          ...(comments
            ? {
                _additionalInfo: comments,
              }
            : {}),
        };
      });

      setaddOrder(formattedOrders);

      if (
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.paymentType') === 'CREDIT'
      ) {
        setIsCredited(true);
        setFinalAdvance(null);
      } else if (
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.advance') !== undefined
      ) {
        setFinalAdvance(
          get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.advance', 0) / 100
        );
        setIsCredited(false);
      } else {
        setIsCredited(false);
        setFinalAdvance(null);
      }

      setFinalAdditionalDiscount(
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.additionalDiscount', 0) / 100
      );
      setFinalAdditionalCharges(
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.additionalCharges', 0) / 100
      );
      setFinalPackingCharges(
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.packingCharges', 0) / 100
      );
      setFinalDeliveryCharges(
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.deliveryCharges', 0) / 100
      );
      setCurrentCustomCode(
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.customCode', 0)
      );

      setInfo(
        get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.additionalInfo.0.info', '')
      );

      const paymentModeData = get(
        findOfflineHoldOnList,
        'orderDetails.ordersSerializeData.0.paymentModeType',
        ''
      );

      console.log('findOfflineHoldOnList', findOfflineHoldOnList);

      if (paymentModeData) {
        setPaymentMode(paymentModeData);
      }

      const editBillDeliveryDate = get(
        findOfflineHoldOnList,
        'orderDetails.ordersSerializeData.0.deliveryDate'
      );
      if (editBillDeliveryDate) {
        setDeliveryDate(editBillDeliveryDate);
        setSelectedDeliveryDate(editBillDeliveryDate);
      }

      const customerDetails = find(customerCodes, (_customer) => {
        return (
          get(_customer, 'customerId') ===
          get(findOfflineHoldOnList, 'orderDetails.ordersSerializeData.0.customerId')
        );
      });
      if (!isEmpty(customerDetails)) {
        setCustomerInfo(customerDetails);
      }
    } else {
      handleReset(true);
    }
  }, [selectedHoldId]);

  useEffect(() => {
    if (location?.state?.orders) {
      let formattedOrders = map(get(location, 'state.orders'), (list) => {
        let comments = get(list, `additionalInfo.0.orderComment.${get(list, 'productId')}`);
        return {
          ...list,
          ...(comments
            ? {
                _additionalInfo: comments,
              }
            : {}),
        };
      });

      const finalFormattedOrders = map(formattedOrders, (_order) => {
        const findData = find(formattedProducts, (_product) => {
          return get(_order, 'productId') === get(_product, 'productId');
        });
        return {
          ...(_order || {}),
          parcelCharges: get(findData, 'parcelCharges') || '',
        };
      });

      setaddOrder(finalFormattedOrders);

      console.log('locationnnnn', location);

      setFinalAdditionalDiscount(get(location, 'state.orders.0.additionalDiscount', 0));
      setFinalAdditionalCharges(get(location, 'state.orders.0.additionalCharges', 0));
      setFinalPackingCharges(get(location, 'state.orders.0.packingCharges', 0));
      setFinalDeliveryCharges(get(location, 'state.orders.0.deliveryCharges', 0));
      setCurrentCustomCode(get(location, 'state.orders.0.customCode', 0));

      setInfo(get(location, 'state.orders.0.overAllAdditionalInfo', ''));

      if (get(location, 'state.orders.0.orderType')) {
        setOrderType(get(location, 'state.orders.0.orderType'));
      }

      const paymentModeData = get(location, 'state.orders.0.payments.0.mode', '');

      if (paymentModeData) {
        setPaymentMode(paymentModeData);
      }

      if (get(location, 'state.orders.0.type') === 'CREDIT') {
        setIsCredited(true);
      } else if (get(location, 'state.orders.0.advance') !== undefined) {
        setFinalAdvance(get(location, 'state.orders.0.advance', 0));
      }

      const editBillDeliveryDate = get(location, 'state.orders.0.deliveryDate');
      if (editBillDeliveryDate) {
        setDeliveryDate(editBillDeliveryDate);
        setSelectedDeliveryDate(editBillDeliveryDate);
      }

      const customerDetails = find(customerCodes, (_customer) => {
        return get(_customer, 'customerId') === get(location, 'state.orders.0.customerId');
      });
      if (!isEmpty(customerDetails)) {
        setCustomerInfo(customerDetails);
      }
    }
  }, [location, customerCodes, totalProducts]);

  console.log('addOrder', addOrder, location);

  useEffect(() => {
    if (selectedHoldId) {
      const findOfflineHoldOnList = find(offlineHoldOnList, (_item) => {
        return get(_item, 'holdId') === selectedHoldId;
      });
      if (isEqual(get(findOfflineHoldOnList, 'orderDetails.orders'), addOrder)) {
        setIsEditHoldOn(false);
      } else {
        setIsEditHoldOn(true);
      }
    }
  }, [addOrder]);

  window.onbeforeunload = (e) => {
    if (isEditHoldOn) {
      e.preventDefault();
      return UNSAVED_HOLD_CHANGES_WILL_BE_LOST_CONTINUE;
    }
  };

  // useEffect(() => {
  //   return () => {
  //     setCurrentTerminal(prevTerminalId || '');
  //     const currentStoreAndTerminal = {
  //       storeId: currentStore,
  //       terminalId: prevTerminalId,
  //     };
  //     ObjectStorage.setItem(StorageConstants.SELECTED_STORE_AND_TERMINAL, currentStoreAndTerminal);
  //   };
  // }, [prevTerminalId]);

  const selectPackingChanges = () => {
    setaddOrder((prevState) => {
      return map(getClone(prevState), (_item) => {
        if (get(_item, 'parcelCharges')) {
          set(_item, 'isParcelCharges', true);
        }
        return _item;
      });
    });
  };

  const removePackingChanges = () => {
    setaddOrder((prevState) => {
      return map(getClone(prevState), (_item) => {
        if (get(_item, 'parcelCharges')) {
          set(_item, 'isParcelCharges', false);
        }
        return _item;
      });
    });
  };

  useEffect(() => {
    if (isEditFlow || selectedHoldId) return;
    if (lowerCase(orderType) === lowerCase(OrderTypeConstants.Parcel)) {
      selectPackingChanges();
    } else {
      removePackingChanges();
    }
  }, [orderType]);

  useEffect(() => {
    if (configuration?.isOrderType?.isSaveOrderType) {
      const { data: orderType } = ObjectStorage.getItem(StorageConstants.ORDER_TYPE);
      if (orderType) {
        setOrderType(orderType);
      }
    } else {
      ObjectStorage.removeItem(StorageConstants.ORDER_TYPE);
    }
  }, []);

  useEffect(() => {
    if (!selectedHoldId) return;
    const findOfflineHoldOnList = find(offlineHoldOnList, (_item) => {
      return get(_item, 'holdId') === selectedHoldId;
    });
    const holdOnOrderType = get(
      findOfflineHoldOnList,
      'orderDetails.ordersSerializeData.0.orderType'
    );
    if (holdOnOrderType) {
      setOrderType(holdOnOrderType);
    }
  }, [selectedHoldId]);

  useEffect(() => {
    if (isEmpty(addOrder) && !configuration?.isOrderType?.isSaveOrderType) {
      setOrderType(OrderTypeConstants.DineIn);
    }
  }, [addOrder]);

  useEffect(() => {
    if (configuration && !orderType) {
      setOrderType(OrderTypeConstants.DineIn);
    }
  }, [configuration]);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title> Billing | POSITEASY</title>
      </Helmet>
      {isEmpty(totalProducts) && (
        <Tooltip title="Click to add products to inventory">
          <Stack
            direction={'column'}
            onClick={routeToInventory}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              cursor: 'pointer',
              alignItems: 'center',
              border: `1.5px dotted ${theme.palette.primary.main}`,
              padding: 2,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.lighter, 0.4),
              },
              zIndex: 10,
            }}
          >
            <AddCircleIcon fontSize="large" sx={{ mr: 1 }} />
            <Typography variant="h6">Create new product</Typography>
          </Stack>
        </Tooltip>
      )}
      <Container
        className="billingStep3"
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          backgroundColor: '#F8F8F8',
          px: '0px !important',
        }}
      >
        <Grid
          container
          sx={{
            width: '100%',
            mt: 0,
            position: 'relative',
          }}
        >
          {(!isCartScreen || isLaptop) && (
            <>
              {!isEmpty(totalProducts) && (
                <VirtualizeSearchBox
                  setaddOrder={setaddOrder}
                  isAddonMandatory={isAddonMandatory}
                  totalProducts={totalProducts}
                  addOrder={addOrder}
                  syncUpProducts={syncUpProducts}
                  lastSyncTime={lastSyncTime}
                  syncState={syncState}
                  billing={true}
                  setView={setView}
                  view={view}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                />
              )}

              <Categories
                purpose={true}
                categoriesList={sortedByRanking}
                handleChangeCategoriesProducts={handleChangeCategoriesProducts}
                categorizedProduct={categorizedProduct}
              />

              <Grid item xs={12} sm={12} md={8} lg={8} sx={{ mt: 1 }}>
                <Box
                  sx={{
                    p: 0.5,
                    position: 'relative',
                  }}
                  id="noprint"
                >
                  <Box
                    ref={boxRef}
                    sx={{
                      minHeight: '15rem',
                      height:
                        isCartScreen || isLaptop ? 'calc(100vh - 100px)' : 'calc(100vh - 167px)',
                      overflow: 'auto',
                      ...hideScrollbar,
                    }}
                  >
                    <div style={{ height: 110 }} />

                    {view === 'GRID' && (
                      <Grid container sx={{ mb: { md: 0, xs: 1.5 }, rowGap: 0.5 }}>
                        {map(filteredProducts, (e, index) => (
                          <Grid
                            key={get(e, 'productId')}
                            xs={12}
                            sm={6}
                            md={6}
                            minxl={isExpendedSidebar ? 4 : 4}
                            item
                            id={get(e, 'productId')}
                          >
                            <BillingProduct
                              item={e}
                              addOrder={addOrder}
                              category={e.category}
                              noStocks={noStocks}
                              setaddOrder={setaddOrder}
                              setNoStocks={setNoStocks}
                              isAddonMandatory={isAddonMandatory}
                              tableName={tableName}
                              orderType={orderType}
                              tableCategory={tableCategory}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {view === 'SMALLGRID' && (
                      <div style={{ margin: '10px' }}>
                        <Grid container spacing={1}>
                          {map(filteredProducts, (e, index) => (
                            <Grid
                              key={get(e, 'productId')}
                              xs={4}
                              sm={4}
                              md={2}
                              xl={2}
                              item
                              id={get(e, 'productId')}
                            >
                              <BillingProductSmallGrid
                                item={e}
                                addOrder={addOrder}
                                category={e.category}
                                noStocks={noStocks}
                                setaddOrder={setaddOrder}
                                setNoStocks={setNoStocks}
                                isAddonMandatory={isAddonMandatory}
                                orderType={orderType}
                                tableCategory={tableCategory}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </div>
                    )}
                    {view === 'SMALLGRIDIMAGE' && (
                      <Grid
                        gap={isMobile ? 1.5 : 2.2}
                        container
                        sx={{ mb: { md: 0, xs: 1 }, marginLeft: '10px' }}
                      >
                        {map(filteredProducts, (e, index) => (
                          <Grid
                            key={get(e, 'productId')}
                            xs={5.5}
                            sm={2}
                            md={2.1}
                            xl={2}
                            item
                            id={get(e, 'productId')}
                          >
                            <BillingProductSmallGridImage
                              item={e}
                              addOrder={addOrder}
                              category={e.category}
                              noStocks={noStocks}
                              setaddOrder={setaddOrder}
                              setNoStocks={setNoStocks}
                              isAddonMandatory={isAddonMandatory}
                              orderType={orderType}
                              tableCategory={tableCategory}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {view === 'LIST' && (
                      <Grid gap={1.5} container sx={{ mb: { md: 0, xs: 1.5 } }}>
                        {map(filteredProducts, (e, index) => (
                          <Grid
                            key={get(e, 'productId')}
                            xs={12}
                            sm={12}
                            md={12}
                            xl={12}
                            item
                            id={get(e, 'productId')}
                          >
                            <BillingProductList
                              item={e}
                              addOrder={addOrder}
                              category={e.category}
                              noStocks={noStocks}
                              setaddOrder={setaddOrder}
                              setNoStocks={setNoStocks}
                              isAddonMandatory={isAddonMandatory}
                              orderType={orderType}
                              tableCategory={tableCategory}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {isInfinityScrollLoading && (
                      <Box my={1}>
                        <ProductLoader />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </>
          )}
          {(isCartScreen || isLaptop) && !isEmpty(totalProducts) && (
            <Grid
              sx={{
                backgroundColor: '#fff',
                display: (isCartScreen || isLaptop) && !isEmpty(totalProducts) ? 'flex' : 'none',
              }}
              item
              container
              xs={12}
              sm={12}
              md={4}
              lg={4}
              id="printWrapper"
            >
              {totalLength > 0 ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    mx: 1,
                    // mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      height: isLaptop ? 'calc(100vh - 85px)' : 'calc(100vh - 85px)',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        alignContent: 'flex-end',
                        alignSelf: 'flex-end',
                        backgroundColor: '#FFFFFF',
                        flexShrink: 1,
                      }}
                    >
                      <Stack
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={0.5}
                      >
                        {isCartScreen ? (
                          <Stack
                            sx={{
                              cursor: 'pointer',
                            }}
                            flexDirection="row"
                            alignItems="center"
                            gap={1}
                            onClick={() => [setIsCartScreen(false)]}
                          >
                            <ArrowBackIcon sx={{ fontSize: 20, fontWeight: 'bold' }} />
                            <Typography variant="h4">Back</Typography>
                          </Stack>
                        ) : (
                          <Typography variant="h4">Current Order</Typography>
                        )}

                        <Stack flexDirection="row" alignItems="center" gap={0.5}>
                          {((offlineHoldOnList?.length || 0) < 5 || selectedHoldId) &&
                            !get(location, 'state.orders') && (
                              <Tooltip title="Hold On">
                                <IconButton
                                  onClick={() => {
                                    postHoldOn();
                                  }}
                                >
                                  <PanToolIcon
                                    sx={{
                                      color: theme.palette.primary.main,
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}

                          <Tooltip title="Order Date">
                            <IconButton onClick={handleOpenCalendar}>
                              <CalendarMonthIcon
                                sx={{
                                  color: theme.palette.primary.main,
                                }}
                              />
                            </IconButton>
                          </Tooltip>

                          <Button
                            sx={{
                              color: theme.palette.error.main,
                              px: 1,
                              py: 0.4,
                              borderRadius: 0.7,
                              fontWeight: '600',
                              fontSize: '13px',
                              top: 0.6,
                            }}
                            onClick={handleClearAll}
                          >
                            Clear all
                          </Button>
                        </Stack>
                      </Stack>

                      <Stack
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 4,
                        }}
                      >
                        {isOrderTypeEnable && orderTypesList?.length > 2 ? (
                          <Stack
                            flexDirection="row"
                            alignItems="center"
                            justifyContent={'flex-start'}
                            gap={2}
                          >
                            <FormControl sx={{ minWidth: 75, mt: -3, mr: 1 }} size="small">
                              <InputLabel id="demo-simple-select-label">Order type</InputLabel>
                              <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                defaultValue={orderType}
                                label="Order type"
                                value={orderType}
                                autoWidth
                                onChange={(e) => handleChangeTab(e.target.value)}
                                inputProps={{ style: { height: 10 } }}
                              >
                                {map(orderTypesList, (e) => (
                                  <MenuItem key={e} value={e}>
                                    {e}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Stack>
                        ) : (
                          <Stack
                            flexDirection="row"
                            alignItems="center"
                            justifyContent={'flex-start'}
                            gap={2}
                          >
                            {map(orderTypesList, (e) => {
                              return (
                                <Box
                                  sx={{
                                    ...(orderType === e
                                      ? {
                                          backgroundColor: theme.palette.primary.main,
                                          color: '#fff',
                                        }
                                      : {
                                          backgroundColor: '#EBEBEB',
                                          color: '#989898',
                                        }),
                                    px: 1.5,
                                    py: 0.2,
                                    borderRadius: 1.3,
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                  }}
                                  onClick={() => {
                                    handleChangeTab(e);
                                  }}
                                >
                                  {e}
                                </Box>
                              );
                            })}
                          </Stack>
                        )}
                        <Stack
                          flexDirection={'row'}
                          sx={{
                            display: 'flex',
                            justifyContent: !isEmpty(customerInfo) ? 'space-between' : 'flex-end',
                            alignItems: 'center',
                          }}
                        >
                          {!isEmpty(customerInfo) && (
                            <Typography
                              variant="subtitle1"
                              fontWeight={'bold'}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              {`${get(customerInfo, 'name', '')} (+${get(
                                customerInfo,
                                'contactNumber',
                                ''
                              )})`}
                            </Typography>
                          )}
                          <Stack flexDirection="row" alignItems="center">
                            {window.navigator.onLine && (
                              <Tooltip title="Add new customer">
                                <IconButton
                                  onClick={handleOpenCustomerModal}
                                  sx={{
                                    color: isError
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                                    height: '10px',
                                  }}
                                >
                                  <PersonAddAlt1Icon />
                                </IconButton>
                              </Tooltip>
                            )}

                            {isAddInfoMode && (
                              <Tooltip title="Add information">
                                <IconButton
                                  onClick={handleOpenGetInformationDialog}
                                  sx={{ color: theme.palette.primary.main, mr: -1 }}
                                >
                                  <PostAddIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Add new customer">
                              <IconButton
                                // onClick={handleOpenCustomerModal}
                                sx={{
                                  // color: isError
                                  //   ? theme.palette.error.main
                                  //   : theme.palette.primary.main,
                                  height: '10px',
                                }}
                              >
                                <Iconify
                                  sx={{ cursor: 'pointer' }}
                                  onClick={handleOpenCustomerWAModal}
                                  icon={'logos:whatsapp-icon'}
                                  width={25}
                                />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack flexDirection="row" gap={1} my={1}>
                        {isCustomCodeEnabled && (
                          <DropDown
                            label="Custom code"
                            value={
                              find(
                                customCodes,
                                (_item) => get(_item, 'customCode') === currentCustomCode
                              )?.codeName || ''
                            }
                            handleChange={handleChangeAddCustomCode}
                            items={map(customCodes, (_item) => ({
                              label: _item.codeName,
                              id: _item.customCode,
                            }))}
                          />
                        )}
                      </Stack>
                    </Box>

                    <CartList
                      isLaptop={isLaptop}
                      info={info}
                      isCustomCodeEnable={isCustomCodeEnabled}
                      isCustomerCodeEnabled={isCustomerCodeEnabled}
                      tableName={tableName}
                      isShowAdditionalInfo={isAddInfoMode}
                      orderType={orderType}
                    />

                    <CartSummary
                      isDeliveryDateEdited={isDeliveryDateEdited}
                      setIsDeliveryDateEdited={setIsDeliveryDateEdited}
                      selectedDeliveryDate={selectedDeliveryDate}
                      setSelectedDeliveryDate={setSelectedDeliveryDate}
                      paymentMode={paymentMode}
                      setPaymentMode={setPaymentMode}
                      paymentType={paymentType}
                      setPaymentType={setPaymentType}
                      orderType={orderType}
                      // setIsUnLock={setIsUnLock}
                      bookingId={bookingId}
                      setBookingId={setBookingId}
                      handleReset={handleReset}
                      totalOrderValue={totalOrderValue}
                      gstAmount={gstAmount}
                      calculateTotalPrice={calculateTotalPrice}
                      getPrice={getPrice}
                      totalValueNoOffer={totalValueNoOffer}
                      isLaptop={isLaptop}
                      gstData={gstData}
                      info={info}
                      isPrint={isPrint}
                      isCustomCodeEnabled={isCustomCodeEnabled}
                      isCustomerCodeEnabled={isCustomerCodeEnabled}
                      sortedOrders={sortedOrders}
                      setIsError={setIsError}
                      customerInfo={customerInfo}
                      serializeData={serializeData}
                      finalAdvance={finalAdvance}
                      setFinalAdvance={setFinalAdvance}
                      finalAdditionalDiscount={finalAdditionalDiscount}
                      setFinalAdditionalDiscount={setFinalAdditionalDiscount}
                      finalAdditionalCharges={finalAdditionalCharges}
                      setFinalAdditionalCharges={setFinalAdditionalCharges}
                      // holdId={get(navigateHoldOnData, 'holdId')}
                      // setNavigateHoldOnData={setNavigateHoldOnData}
                      finalPackingCharges={finalPackingCharges}
                      setFinalPackingCharges={setFinalPackingCharges}
                      finalDeliveryCharges={finalDeliveryCharges}
                      setFinalDeliveryCharges={setFinalDeliveryCharges}
                      getRoundedOff={getRoundedOff}
                      remainingAmountOrTotalAmount={remainingAmountOrTotalAmount}
                      addOrder={addOrder}
                      isCredited={isCredited}
                      setIsCredited={setIsCredited}
                      remainingTotalAmount={remainingTotalAmount}
                      tableName={tableName}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ width: '100%' }}>
                  <Divider sx={{ border: '0.5px solid #F0F0F0' }} />

                  <Stack
                    style={{
                      width: '100%',
                      height: 'calc(100vh - 100px)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <NoFoodIcon sx={{ fontSize: '4rem' }} />
                    <Typography variant="h6" mt={1}>
                      Your current order is empty
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mb: 2 }}>
                      Please add some products from menu
                    </Typography>
                    {isCartScreen && (
                      <Button variant="contained" onClick={() => [setIsCartScreen(false)]}>
                        <ArrowBackIcon sx={{ fontSize: 20, fontWeight: 'bold', mr: 1 }} />
                        <Typography variant="h4">Back</Typography>
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}
            </Grid>
          )}

          {!isCartScreen && !isLaptop && (
            <Button
              onClick={() => {
                setIsCartScreen(true);
              }}
              type="submit"
              sx={{
                alignSelf: 'center',
                fontSize: 20,
                height: 50,
                backgroundColor: theme.palette.primary.main,
                position: 'fixed',
                width: '96%',
                bottom: 2,
                ml: '2%',
                mb: isMobile ? '3%' : '1%',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
              variant="contained"
            >
              View Cart {`${totalOrderValue ? `(${fCurrency(totalOrderValue)})` : ''}`}
            </Button>
          )}
        </Grid>
      </Container>
      <GetAdditionalInformationDialog
        info={info}
        open={openGetInformationDialog}
        setInfo={setInfo}
        handleClose={handleCloseGetInformationDialog}
      />
      {isTourOpen && <TakeATourWithJoy config={billingTourConfigIsUnlock} />}
      <AddCustomerInfo
        isOpenAddCustomerModal={isOpenAddCustomerModal}
        closeCustomerModal={handleCloseCustomerModal}
        customerCodes={customerCodes}
        customerInfo={customerInfo}
        isCustomerCodeEnabled={isCustomerCodeEnabled}
      />
      {isOpenAddCustomerWAModal && (
        <AddCustomerWAInfo
          isOpenAddCustomerWAModal={isOpenAddCustomerWAModal}
          closeCustomerModal={handleCloseCustomerModal}
          customerCodes={customerCodes}
          customerInfo={customerInfo}
          isCustomerCodeEnabled={isCustomerCodeEnabled}
        />
      )}
      {openChooseOrderDate && (
        <Dialog open={openChooseOrderDate}>
          <Card sx={{ p: 2, minHeight: 200, width: 300 }}>
            <Stack flexDirection={'column'}>
              <Typography variant="h6">Choose Order Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileDateTimePicker
                  maxDateTime={dayjs(new Date())}
                  onAccept={handleSubmitOrderDate}
                  format="DD/MM/YYYY hh:mm A"
                  onChange={handleChangeDate}
                  value={selectedOrderDate}
                  defaultValue={selectedOrderDate}
                />
              </LocalizationProvider>
              <Stack flexDirection={'row'} justifyContent={'flex-end'} sx={{ mt: 2, gap: 2 }}>
                <Button variant="outlined" onClick={handleCloseCalendar}>
                  Cancel
                </Button>
                <Button variant="outlined" onClick={handleClearDate}>
                  Clear
                </Button>
                <Button variant="contained" onClick={handleSubmitOrderDate}>
                  Submit
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Dialog>
      )}
    </>
  );
}
