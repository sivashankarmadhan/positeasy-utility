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
} from '@mui/material';
// components

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PostAddIcon from '@mui/icons-material/PostAdd';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  clone,
  filter,
  find,
  findIndex,
  forEach,
  get,
  groupBy,
  isEmpty,
  map,
  some,
  sortBy,
} from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import uuid from 'react-uuid';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import BillingProduct from 'src/components/BillingProduct';
import BillingSearch from 'src/components/BillingSearch';
import Categories from 'src/components/Categories';
import GetAdditionalInformationDialog from 'src/components/GetAdditionalInformationDialog';
import ProductLoader from 'src/components/ProductLoader';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import DropDown from 'src/components/cart/DropDown';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { useSettingsContext } from 'src/components/settings';
import {
  NAVIGATION_STATE_KEY,
  PaymentModeTypeConstants,
  ROLES_DATA,
  SYNC_UP_CONSTANTS,
  SYNC_UP_CONTENT,
  StatusConstants,
  hideScrollbar,
} from 'src/constants/AppConstants';
import { estimateProductTourConfig, estimateTourConfig } from 'src/constants/TourConstants';
import { GstData } from 'src/global/SettingsState';
import {
  alertDialogInformationState,
  allConfiguration,
  billingProducts,
  currentStoreId,
  currentTerminalId,
  customCode,
  customerCode,
  estimateCart,
  isTourOpenState,
  noStockProducts,
} from 'src/global/recoilState';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { filterShortCode } from 'src/helper/filterShortCode';
import { PATH_DASHBOARD } from 'src/routes/paths';
import EstimateList from 'src/sections/Estimate/EstimateList';
import EstimateSummary from 'src/sections/Estimate/EstimateSummary';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import PRODUCTS_API from 'src/services/products';
import STORES_API from 'src/services/stores';
import convertPercentageToValue from 'src/utils/convertPercentageToValue';
import { fCurrency } from 'src/utils/formatNumber';
import AddCustomerInfo from '../Customer/AddCustomerInfo';
import VirtualizeSearchBox from 'src/components/VirtualizeSearchBox';
import BillingProductSmallGrid from 'src/components/BillingProductSmallGrid';
import BillingProductSmallGridImage from 'src/components/BillingProductSmallGridImage';
import BillingProductList from 'src/components/BillingProductList';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------

const ALL = 'all';

export default function CreateEstimate() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { themeStretch } = useSettingsContext();
  const [totalProducts, setTotalProducts] = useRecoilState(billingProducts);
  const formattedProducts = filterShortCode(totalProducts);
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const isCategoryRankingEnabled = get(configuration, 'categoryRanking.isActive', false);
  const categoriesRankingList = isCategoryRankingEnabled
    ? get(configuration, 'categoryRanking.categoryRank')
    : null;
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

  const [addOrder, setaddOrder] = useRecoilState(estimateCart);
  const setCurrentCustomCode = useSetRecoilState(customCode);
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [noStocks, setNoStocks] = useRecoilState(noStockProducts);
  const [paymentMode, setPaymentMode] = useState(PaymentModeTypeConstants.CASH);
  const totalLength = !isEmpty(addOrder) ? addOrder.length : 0;
  const boxRef = useRef(null);
  const defaultBillingKeyStatus = AuthService.getBillingKeyStatus();
  const [isOpenKeyEnter, setIsOpenKeyEnter] = useState(false);
  const isTourOpen = useRecoilValue(isTourOpenState);
  const resetOrder = useResetRecoilState(estimateCart);
  const resetCurrentCustomerCode = useResetRecoilState(customerCode);
  const resetCurrentCustomCode = useResetRecoilState(customCode);
  const [bookingId, setBookingId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isCustomCodeEnabled = get(configuration, 'customCode', false);
  const isCustomerCodeEnabled = get(configuration, 'customerManagement', false);
  const isPrint = get(configuration, 'savePrint', false);
  const isAddInfoMode = get(configuration, 'billingSettingsData.isBookingInfo', false);
  const isAddonMandatory = get(configuration, 'isAddonPop', false);
  const [gstData, setGstData] = useRecoilState(GstData);
  const [customCodes, setCustomCodes] = useState([]);
  const [customerCodes, setCustomerCodes] = useState([]);
  const orderTypeValues = get(configuration, 'isOrderType.orderTypes', {});
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const [orderType, setOrderType] = useState(get(orderTypeValues, 'value1', ''));
  const [isCartScreen, setIsCartScreen] = useState(false);
  const [isError, setIsError] = useState(false);
  const isLaptop = useMediaQuery('(min-width:900px)');
  const currentRole = AuthService.getCurrentRoleInLocal();
  const defaultValueCustom = { label: '', id: '' };
  const [currentCustomCodeLabel, setCurrentCustomCodeLabel] = useState(defaultValueCustom);
  const [currentCustomerIdLabel, setCurrentCustomerCodeLabel] = useState(defaultValueCustom);
  const { themeLayout } = useSettingsContext();
  const [info, setInfo] = useState('');
  const [customerInfo, setCustomerInfo] = useState({});
  const [isOldEstimate, setIsOldEstimate] = useState(false);
  const [loadedFilteredProductCount, setLoadedFilteredProductCount] = useState(0);
  const [isInfinityScrollLoading, setIsInfinityScrollLoading] = useState(false);
  const [isEndInfinityScroll, setIsEndInfinityScroll] = useState(false);
  const captureScrollHeight = useRef();
  const isExpendedSidebar = themeLayout === 'vertical';
  const [estimateId, setEstimateId] = useState('');
  const perPageCountFilterProducts = 21;
  const [isEstimateWithoutItem, setIsEstimateWithoutItem] = useState(false);
  const [isOpenAddCustomerModal, setIsOpenAddCustomerModal] = useState(false);
  const allProductsWithUnits = useRecoilState(billingProducts);
  const [addonListDialogData, setAddonListDialogData] = useState({});
  const [openAlreadyAddedAddonDialog, setOpenAlreadyAddedAddonDialog] = useState(false);
  const [openBillingAddonDialog, setOpenBillingAddonDialog] = useState(false);
  const [decrementOrderData, setDecrementOrderData] = useState([]);
  const [openDecrementDialog, setOpenDecrementDialog] = useState(false);
  const [incrementOrderData, setIncrementOrderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole;
  const [openGetInformationDialog, setAddtionalInfoDialog] = useState(false);
  const [lastSyncTime, setSyncTime] = useState('');
  const [syncState, setSyncState] = useState(false);
  const [view, setView] = useState('GRID');
  const ENTER = ['Enter'];

  const getPrices = (curr) => {
    if (!curr) return;
    const check = find(allProductsWithUnits, (e) => e.productId === curr);
    if (check)
      return check.offerPrice
        ? check.GSTPercent > 0
          ? (check.GSTPercent * check.offerPrice) / 100 + check.offerPrice
          : check.offerPrice
        : check.GSTPercent > 0
        ? (check.GSTPercent * check.price) / 100 + check.price
        : check.price;
  };
  const getOrderDetailsById = (curr) => {
    const data = filter(addOrder, (e) => e.productId === curr);
    let orderLength = data.length;
    let withAddon = [];
    let withoutAddon = [];
    let quantity = 0;
    let totalPrice = 0;
    if (orderLength > 0) {
      forEach(data, (e) => {
        quantity += e.quantity;
        if (isEmpty(e.addOn)) {
          totalPrice += getPrices(e.productId) * e.quantity;
          withoutAddon.push(e);
        } else if (!isEmpty(e.addOn)) {
          let totalAddonPrice = 0;
          forEach(e.addOn, (d) => {
            totalAddonPrice += ((d.price * d.GSTPercent) / 100 + d.price) * d.quantity;
          });
          totalPrice += (getPrices(e.productId) + totalAddonPrice) * e.quantity;
          withAddon.push(e);
        }
      });
    }
    return {
      orderLength,
      withoutAddon,
      withAddon,
      data,
      quantity,
      totalPrice,
      productId: curr,
    };
  };

  const handleOpenNewCustomization = (e) => {
    try {
      const product = find(allProductsWithUnits, (d) => d.productId === e.productId);
      setAddonListDialogData({
        addOnData: get(product, 'addOn'),
        productData: { ...product, productAddons: get(product, 'addOn') },
      });
      setOpenAlreadyAddedAddonDialog(false);
      setOpenBillingAddonDialog(true);
    } catch (err) {
      console.log(err);
    }
  };

  const getAddonByProductId = (e) => {
    const product = find(allProductsWithUnits, (d) => d.productId === e);
    return get(product, 'addOn', []);
  };

  const isOrdered = (curr) => {
    if (!curr) return;
    const check = some(addOrder, (e) => e.productId === curr);
    return check;
  };
  const isOrderedWithAddon = (curr) => {
    if (!curr) return;
    let result = false;
    const check = filter(addOrder, (e) => e.productId === curr);
    if (isEmpty(check)) result = false;
    forEach(check, (d) => {
      if (!isEmpty(d.addOn)) result = true;
    });
    return result;
  };

  const getOrdered = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    return check;
  };
  const getAvailabileStock = (curr) => {
    let availability = true;
    const orderData = getOrderDetailsById(curr);
    const productData = find(allProductsWithUnits, (e) => e.productId === curr);

    if (get(productData, 'stockMonitor')) {
      if (get(productData, 'stockQuantity') <= get(orderData, 'quantity')) availability = false;
    } else availability = true;
    return availability;
  };

  const isStockAvailable = (curr) => {
    if (isEmpty(noStocks)) return true;
    const findedData = find(noStocks, (e) => e.productId === curr.productId);
    if (!isEmpty(findedData) && get(findedData, 'quantity') <= -1) return false;
    if (isEmpty(findedData)) return true;
  };
  const getUnits = (e) => {
    const units = filter(
      allProductsWithUnits,
      (d) =>
        get(d, 'shortCode') === get(e, 'shortCode') && get(d, 'status') === StatusConstants.ACTIVE
    );
    return units;
  };
  const handleAddonNewOrder = (e) => {
    try {
      setLoading(true);
      const data = some(addOrder, (d) => d.productId === e.productId);
      if (data) {
        setaddOrder((prevState) => {
          const newData = filter(prevState, (d) => d.productId !== e.productId);
          return [...newData];
        });
      } else {
        const addon = getAddonByProductId(e.productId);
        if (addon?.length > 0 && isAddonMandatory) {
          setAddonListDialogData({
            addOnData: addon,
            productData: { ...e, productAddons: addon },
          });
          setOpenBillingAddonDialog(true);
        } else {
          handleAddOrder({ ...e, productAddons: addon });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddOrder = (e) => {
    const currentTimestamp = new Date().getTime();
    const cartId = `${uuid()}:${currentTimestamp}`;

    setaddOrder((prevState) => {
      return [
        ...prevState,
        {
          ...e,
          cartId: cartId,
          quantity: 1,
          addOn: e.addOn && isAddonMandatory ? e.addOn : [],
          productAddons: get(e, 'productAddons', []),
        },
      ];
    });
  };
  const handleDeleteByCartId = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e !== d.cartId);
      return [...newData];
    });
    setDecrementOrderData([]);
    setOpenDecrementDialog(false);
  };
  const handleCloseDeleteCustomization = () => {
    setOpenDecrementDialog(false);
    setDecrementOrderData([]);
  };
  const handleAddonDecision = (e) => {
    const data = getOrderDetailsById(get(e, 'productData.productId'));
    if (data.orderLength === 0) {
      if (isEmpty(e.selectedAddOn)) handleAddOrder({ ...e.productData, addOn: [] });
      if (!isEmpty(e.selectedAddOn))
        handleAddOrder({ ...e.productData, addOn: get(e, 'selectedAddOn') });
    }

    if (data.orderLength > 0) {
      if (isEmpty(e.selectedAddOn)) {
        if (data.withoutAddon.length === 0) handleAddOrder({ ...e.productData, addOn: [] });
        else
          handleIncrementOrder({
            ...e.productData,
            addOn: [],
            cartId: data.withoutAddon[0].cartId,
          });
      }

      if (!isEmpty(e.selectedAddOn))
        handleAddOrder({ ...e.productData, addOn: get(e, 'selectedAddOn') });
    }
    setAddonListDialogData({});
    setIncrementOrderData([]);
  };
  const handleIncrementOrder = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e.cartId !== d.cartId);
      const data = getOrderDetailsById(get(e, 'productId'));
      const findData = find(get(data, 'withAddon'), (f) => f.cartId === e.cartId);
      return [
        ...newData,
        {
          ...e,
          quantity: isEmpty(e.addOn)
            ? (!isAddonMandatory && !isEmpty(data.withAddon)
                ? data.withAddon[0].quantity
                : data.withoutAddon[0].quantity) + 1
            : findData.quantity
            ? findData.quantity + 1
            : e.quantity + 1,
          addOn: e.addOn ? e.addOn : [],
        },
      ];
    });
  };

  const handleDecrementOrder = (e) => {
    setaddOrder((prevState) => {
      const newData = filter(prevState, (d) => e.cartId !== d.cartId);
      const data = getOrderDetailsById(get(e, 'productId'));
      const findData = find(get(data, 'withAddon'), (f) => f.cartId === e.cartId);
      return (data.quantity ? data.quantity : e.quantity) > 1
        ? [
            ...newData,
            {
              ...e,
              quantity: isEmpty(e.addOn)
                ? (!isAddonMandatory && !isEmpty(data.withAddon)
                    ? data.withAddon[0].quantity
                    : data.withoutAddon[0].quantity) - 1
                : findData.quantity
                ? findData.quantity - 1
                : e.quantity + 1,
              addOn: e.addOn ? e.addOn : [],
            },
          ]
        : [...newData];
    });

    if (!isEmpty(noStocks)) {
      setNoStocks((prevState) => {
        const currentData = find(prevState, (d) => e.productId === d.productId);
        const newData = filter(prevState, (d) => e.productId !== d.productId);
        if (isEmpty(currentData)) return [...newData];
        return currentData.quantity < -1
          ? [
              ...newData,
              {
                ...currentData,
                quantity: currentData.quantity + 1,
              },
            ]
          : [...newData];
      });
    }
  };

  const handleAddonIncrement = async (e) => {
    try {
      const data = getOrderDetailsById(get(e, 'productId'));
      const addon = getAddonByProductId(e.productId);
      if (data.orderLength > 0 && addon.length > 0 && isAddonMandatory) {
        if (isEmpty(data.withAddon)) {
          setAddonListDialogData({
            addOnData: addon,
            productData: { ...e, productAddons: addon },
          });
          setOpenBillingAddonDialog(true);
        } else {
          setIncrementOrderData(data.withAddon);
          setOpenAlreadyAddedAddonDialog(true);
        }
      } else if (!isEmpty(addon) && isAddonMandatory) {
        handleOpenNewCustomization(e);
      } else if (!isEmpty(addon) && !isAddonMandatory && !isEmpty(data.withAddon)) {
        handleIncrementOrder({
          ...e,
          addOn: [],
          cartId: data.withAddon[0].cartId,
          productAddons: addon,
        });
      } else {
        handleIncrementOrder({
          ...e,
          addOn: [],
          cartId: data.withoutAddon[0].cartId,
          productAddons: addon,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDecrement = (e) => {
    const data = getOrderDetailsById(get(e, 'productId'));
    if (data.withAddon.length > 0) {
      setDecrementOrderData([...data.withAddon, ...data.withoutAddon]);
      setOpenDecrementDialog(true);
    } else {
      handleDecrementOrder(
        !isAddonMandatory && !isEmpty(data.withAddon) ? data.withAddon[0] : data.withoutAddon[0]
      );
    }
  };

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
  };
  const handleOpenCustomerModal = () => {
    setIsOpenAddCustomerModal(true);
  };
  const StyledButton = styled(Button)(`
  text-transform: none;
  
`);

  const sortedOrders = sortBy(addOrder, [
    (e) => {
      const extractedTimestamp = e.cartId.match(/:(.*)$/)[1];
      return extractedTimestamp;
    },
  ]);

  const getProductsWithUnits = async () => {
    if ( !currentStore) return;
    try {
      setIsLoading(true);
      const response = await PRODUCTS_API.getBillingProducts();
      if (response) setTotalProducts(get(response, 'data', []));
    } catch (e) {
      console.log(e);
      setTotalProducts([]);
    } finally {
      setIsLoading(false);
    }
  };
  const syncUpProducts = async () => {
    if (!currentStore) return;
    getProductsWithUnits();
    return;
  };

  const handleChangeAddCustomCode = (value) => {
    if (value) {
      setCurrentCustomCode(value.id);
      setCurrentCustomCodeLabel(value);
    }
    if (!value) resetCurrentCustomCode();
  };
  const initialFetch = async () => {
    try {
      const resp = await SettingServices.getConfiguration();

      if (resp) {
        setConfiguration({
          ...(configuration || {}),
          ...(get(resp, 'data.0') || {}),
        });
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
  const handleOpenVerificationModal = () => {
    setIsOpenKeyEnter(true);
  };
  const handleClose = () => {
    setIsOpenKeyEnter(false);
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

  const handleReset = () => {
    resetCurrentCustomerCode();
    resetCurrentCustomCode();
    setCurrentCustomCodeLabel(defaultValueCustom);
    setCurrentCustomerCodeLabel(defaultValueCustom);
    resetOrder();
    setPaymentMode(PaymentModeTypeConstants.CASH);
    setBookingId(0);
    setCustomerInfo({});
    setOrderType(get(orderTypeValues, 'value1'));
    setInfo('');
    setIsOldEstimate(false);
    navigate(PATH_DASHBOARD.createestimate, { replace: true, state: {} });
    setIsError(false);
    setIsCartScreen(false);
  };
  const getPrice = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    if (check) return check.offerPrice ? check.offerPrice : check.price;
  };
  const getPriceWithGst = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    if (check)
      return check.offerPrice
        ? check.GSTPercent > 0
          ? (check.GSTPercent * check.offerPrice) / 100 + check.offerPrice
          : check.offerPrice
        : check.GSTPercent > 0
        ? (check.GSTPercent * check.price) / 100 + check.price
        : check.price;
  };
  const getActualPrice = (curr) => {
    if (!curr) return;
    const check = find(addOrder, (e) => e.productId === curr);
    if (check) return check.price;
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
          totalAddonPrice += ((d.price * d.GSTPercent) / 100 + d.price) * d.quantity;
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

  const handleLoadLoadedFilteredProducts = () => {
    let filterProducts = [];

    if (categorizedProduct === ALL) {
      filterProducts = totalProducts;
    } else {
      filterProducts = filter(totalProducts, (e) => get(e, 'category', '') === categorizedProduct);
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

  useEffect(() => {
    if (currentStore && currentTerminal) {
      initialFetch();
    }
  }, [currentStore, currentTerminal]);

  const generateCartId = (index = 0) => {
    let timeStamp = new Date().getTime();
    const cartId = `${uuid()}:${timeStamp + index}`;
    return cartId;
  };
  const handleUpdateEstimate = (e) => {
    try {
      let response;
      let cartList = [];
      if (get(e, 'isOldEstimate', false)) {
        setIsOldEstimate(true);
        setEstimateId(get(e, 'estimateId'));
      }
      if (get(e, 'customerInfo.0.name')) {
        setCustomerInfo(get(e, 'customerInfo.0'));
      }

      if (get(e, 'additionalInfo')) {
        let formatted = '';
        map(get(e, 'additionalInfo', []), (e, index) => {
          if (index === 0) formatted += `${get(e, 'info', '')}`;
          else formatted += `\n${get(e, 'info', '')}`;
          setInfo(formatted);
        });
      }
      if (!isEmpty(get(e, 'orderDetails', []))) {
        map(get(e, 'orderDetails'), (d, index) => {
          const product = find(
            isEmpty(totalProducts) ? get(response, 'data') : totalProducts,
            (f) => f.productId === d.productId
          );
          let addOnList = [];
          map(get(d, 'addOns'), (f) => {
            const addOn = find(product, (h) => get(h, 'addOnId') === get(f, 'addOnId'));
            addOnList.push({
              ...addOn,
              ...f,
              price: convertToRupee(get(f, 'price')),
              quantity: get(f, 'quantity') / get(d, 'quantity'),
            });
          });
          cartList.push({
            ...product,
            ...d,
            price: convertToRupee(get(d, 'price')),
            cartId: generateCartId(index),
            estimateId: get(e, 'estimateId'),
            addOn: addOnList,
          });
        });
        setaddOrder(cartList);
      }
      if (get(e, 'customCode') && !isEmpty(customCodes)) {
        const data = find(customCodes, (i) => get(i, 'codeLabel') === get(e, 'customCode'));
        if (data) {
          let options = { label: data.codeName, id: data.codeLabel };
          handleChangeAddCustomCode(options);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleFilterOptions = (options, state) => {
    const inputValue = get(state, 'inputValue').toLowerCase();
    const filtered = filter(options, (option) =>
      get(option, 'label').toLowerCase().includes(inputValue)
    );
    return filtered;
  };
  const handleChangeTab = (newValue) => {
    setOrderType(newValue);
  };

  useEffect(() => {
    if (currentStore) syncUpProducts();
  }, [ currentStore]);

  useEffect(() => {
    const data = location?.state;
    if (!isEmpty(data) && !isEmpty(totalProducts)) {
      handleUpdateEstimate(data);
    } else if ( isEmpty(data) && isEmpty(customerInfo) && !isEmpty(totalProducts)) {
      handleOpenCustomerModal();
    }
  }, [totalProducts, customCodes]);

  useEffect(() => {
    return () => {
      resetOrder();
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

  const handleClearAll = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear all current items?`,
      actions: {
        primary: {
          text: 'Clear All',
          onClick: (onClose) => {
            handleReset();
            onClose();
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
  const handleQR = (productId) => {
    setaddOrder((prevState) => {
      const index = findIndex(prevState, (d) => d.productId === productId);
      if (index !== -1) {
        let data = prevState[index];
        const currentState = clone(prevState);
        currentState[index] = { ...data, quantity: data.quantity + 1 };
        return currentState;
      } else {
        const cartId = uuid();
        const products = find(totalProducts, (e) => e.productId === productId);
        if (!isEmpty(products)) {
          return [
            ...prevState,
            { ...products, cartId, quantity: 1, productAddons: get(products, 'addOn', []) },
          ];
        } else {
          toast.error('Product not found');
          return prevState;
        }
      }
    });
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

  if (isLoading) return <LoadingScreen />;
  return (
    <>
      <Helmet>
        <title> Estimate | POSITEASY</title>
      </Helmet>
      {isEmpty(filteredProducts) && (
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
        className="EstimateStep1"
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          filter: 'blur(10px)',
          pointerEvents: 'none',
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
              <Categories
                purpose={true}
                headerRef={boxRef}
                categoriesList={sortedByRanking}
                handleChangeCategoriesProducts={handleChangeCategoriesProducts}
                categorizedProduct={categorizedProduct}
              />
              {!isEmpty(totalProducts) && (
                <VirtualizeSearchBox
                  setaddOrder={setaddOrder}
                  isAddonMandatory={isAddonMandatory}
                  totalProducts={totalProducts}
                  addOrder={addOrder}
                  syncUpProducts={syncUpProducts}
                  lastSyncTime={lastSyncTime}
                  syncState={syncState}
                  setView={setView}
                  view={view}
                />
              )}
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
                        isCartScreen || isLaptop ? 'calc(100vh - 120px)' : 'calc(100vh - 190px)',
                      overflow: 'auto',
                      ...hideScrollbar,
                    }}
                  >
                    <div style={{ height: 110 }} />

                    {view === 'GRID' && (
                      <Grid container sx={{ mb: { md: 0, xs: 1.5 }, rowGap: 0.5 }}>
                        {map(filteredProducts, (e) => (
                          <Grid
                            key={get(e, 'productId')}
                            xs={12}
                            sm={4}
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
                              syncState={syncState}
                              getOrderDetailsById={getOrderDetailsById}
                              handleOpenNewCustomization={handleOpenNewCustomization}
                              isOrdered={isOrdered}
                              isOrderedWithAddon={isOrderedWithAddon}
                              getOrdered={getOrdered}
                              getAvailabileStock={getAvailabileStock}
                              isStockAvailable={isStockAvailable}
                              getUnits={getUnits}
                              handleAddonNewOrder={handleAddonNewOrder}
                              handleAddOrder={handleAddOrder}
                              handleDeleteByCartId={handleDeleteByCartId}
                              handleCloseDeleteCustomization={handleCloseDeleteCustomization}
                              handleAddonDecision={handleAddonDecision}
                              handleIncrementOrder={handleIncrementOrder}
                              handleDecrementOrder={handleDecrementOrder}
                              handleAddonIncrement={handleAddonIncrement}
                              handleDecrement={handleDecrement}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    {view === 'SMALLGRID' && (
                      <div style={{ margin: '10px' }}>
                        <Grid container spacing={1}>
                          {map(filteredProducts, (e, index) => (
                            <Grid item key={get(e, 'productId')} xs={12} sm={6} md={2} lg={2}>
                              <BillingProductSmallGrid
                                item={e}
                                addOrder={addOrder}
                                category={e.category}
                                noStocks={noStocks}
                                setaddOrder={setaddOrder}
                                setNoStocks={setNoStocks}
                                isAddonMandatory={isAddonMandatory}
                                handleOpenNewCustomization={handleOpenNewCustomization}
                                getAddonByProductId={getAddonByProductId}
                                handleAddonNewOrder={handleAddonNewOrder}
                                handleAddonIncrement={handleAddonIncrement}
                                isOrdered={isOrdered}
                                isOrderedWithAddon={isOrderedWithAddon}
                                getOrdered={getOrdered}
                                getAvailabileStock={getAvailabileStock}
                                handleAddOrder={handleAddOrder}
                                handleDeleteByCartId={handleDeleteByCartId}
                                handleCloseDeleteCustomization={handleCloseDeleteCustomization}
                                handleAddonDecision={handleAddonDecision}
                                handleIncrementOrder={handleIncrementOrder}
                                handleDecrementOrder={handleDecrementOrder}
                                handleDecrement={handleDecrement}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </div>
                    )}
                    {view === 'SMALLGRIDIMAGE' && (
                      <Grid gap={1.5} container sx={{ mb: { md: 0, xs: 1.5 }, marginLeft: '15px' }}>
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
                            <BillingProductSmallGridImage
                              item={e}
                              addOrder={addOrder}
                              category={e.category}
                              noStocks={noStocks}
                              setaddOrder={setaddOrder}
                              setNoStocks={setNoStocks}
                              isAddonMandatory={isAddonMandatory}
                              handleOpenNewCustomization={handleOpenNewCustomization}
                              getAddonByProductId={getAddonByProductId}
                              handleAddonNewOrder={handleAddonNewOrder}
                              handleAddonIncrement={handleAddonIncrement}
                              isOrdered={isOrdered}
                              isStockAvailable={isStockAvailable}
                              isOrderedWithAddon={isOrderedWithAddon}
                              getOrdered={getOrdered}
                              getAvailabileStock={getAvailabileStock}
                              handleAddOrder={handleAddOrder}
                              handleDeleteByCartId={handleDeleteByCartId}
                              handleCloseDeleteCustomization={handleCloseDeleteCustomization}
                              handleAddonDecision={handleAddonDecision}
                              handleIncrementOrder={handleIncrementOrder}
                              handleDecrementOrder={handleDecrementOrder}
                              handleDecrement={handleDecrement}
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
                              handleOpenNewCustomization={handleOpenNewCustomization}
                              getAddonByProductId={getAddonByProductId}
                              isOrdered={isOrdered}
                              isOrderedWithAddon={isOrderedWithAddon}
                              getOrdered={getOrdered}
                              getAvailabileStock={getAvailabileStock}
                              isStockAvailable={isStockAvailable}
                              getUnits={getUnits}
                              handleDeleteByCartId={handleDeleteByCartId}
                              handleCloseDeleteCustomization={handleCloseDeleteCustomization}
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
              className="EstimateStep2"
              sx={{
                backgroundColor: '#fff',
              }}
              item
              container
              xs={12}
              sm={12}
              md={4}
              lg={4}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  overflow: 'hidden',
                  mx: 1,
                  mt: 2,
                  height:
                    isCustomCodeEnabled || isCustomerCodeEnabled
                      ? 'calc(100vh - 7rem)'
                      : 'calc(100vh-4rem)',
                }}
              >
                <Box sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
                  <>
                    <div
                      style={{
                        width: '100%',
                        alignContent: 'flex-end',

                        alignSelf: 'flex-end',
                        backgroundColor: '#FFFFFF',
                        pr: 3,
                      }}
                    >
                      <Stack
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
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
                          <Typography variant="h4">Current Estimate</Typography>
                        )}

                        <Button
                          className="EstimateStep3"
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
                      <Stack
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexDirection: { xs: 'column', sm: 'row', md: 'column', lg: 'column' },
                        }}
                      >
                        {isOrderTypeEnable && (
                          <Stack
                            flexDirection="row"
                            alignItems="center"
                            justifyContent={'flex-start'}
                            gap={2}
                          >
                            <Box
                              sx={{
                                ...(orderType === get(orderTypeValues, 'value1')
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
                                handleChangeTab(get(orderTypeValues, 'value1'));
                              }}
                            >
                              {get(orderTypeValues, 'value1')}
                            </Box>

                            <Box
                              sx={{
                                ...(orderType === get(orderTypeValues, 'value2')
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
                                handleChangeTab(get(orderTypeValues, 'value2'));
                              }}
                            >
                              {get(orderTypeValues, 'value2')}
                            </Box>
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
                            >{`${get(customerInfo, 'name', '')} (${get(
                              customerInfo,
                              'contactNumber',
                              ''
                            )})`}</Typography>
                          )}
                          <Stack flexDirection="row" alignItems="center">
                            <Tooltip title="Add new customer">
                              <IconButton
                                className="EstimateStep4"
                                onClick={handleOpenCustomerModal}
                                sx={{
                                  color: isError
                                    ? theme.palette.error.main
                                    : theme.palette.primary.main,
                                }}
                              >
                                <PersonAddAlt1Icon />
                              </IconButton>
                            </Tooltip>

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
                          </Stack>
                        </Stack>
                      </Stack>
                      <Stack flexDirection="row" gap={1} my={1}>
                        {isCustomCodeEnabled && (
                          <DropDown
                            label="Custom code"
                            value={get(currentCustomCodeLabel, 'label')}
                            handleChange={handleChangeAddCustomCode}
                            items={map(customCodes, (_item) => ({
                              label: _item.codeName,
                              id: _item.codeLabel,
                            }))}
                          />
                        )}
                      </Stack>
                    </div>

                    <EstimateList
                      isLaptop={isLaptop}
                      info={info}
                      isCustomCodeEnabled={isCustomCodeEnabled}
                      isCustomerCodeEnabled={isCustomerCodeEnabled}
                    />

                    <EstimateSummary
                      paymentMode={paymentMode}
                      setPaymentMode={setPaymentMode}
                      bookingId={bookingId}
                      setBookingId={setBookingId}
                      handleReset={handleReset}
                      orderType={orderType}
                      totalOrderValue={totalOrderValue}
                      gstAmount={gstAmount}
                      calculateTotalPrice={calculateTotalPrice}
                      getPrice={getPrice}
                      totalValueNoOffer={totalValueNoOffer}
                      getAllProducts={syncUpProducts}
                      isLaptop={isLaptop}
                      gstData={gstData}
                      info={info}
                      customerInfo={customerInfo}
                      isOldEstimate={isOldEstimate}
                      setIsError={setIsError}
                      isPrint={isPrint}
                      isCustomCodeEnabled={isCustomCodeEnabled}
                      isCustomerCodeEnabled={isCustomerCodeEnabled}
                      sortedOrders={sortedOrders}
                      estimateId={estimateId}
                    />
                  </>
                </Box>
              </Box>

              {/* <Box sx={{ width: '100%' }}>
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
                      Your current estimate is empty
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mb: 2 }}>
                      Please add some products from menu
                    </Typography>
                    {isCartScreen && (
                      <Button variant="contained" onClick={() => setIsCartScreen(false)}>
                        <ArrowBackIcon sx={{ fontSize: 20, fontWeight: 'bold', mr: 1 }} />
                        <Typography variant="h4">Back</Typography>
                      </Button>
                    )}
                  </Stack>
                </Box> */}
            </Grid>
          )}
          {!isLaptop && !isCartScreen && (
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
                mb: '3%',
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
      {isTourOpen && (
        <TakeATourWithJoy
          config={!isEmpty(addOrder) ? estimateProductTourConfig : estimateTourConfig}
        />
      )}
      <AddCustomerInfo
        isOpenAddCustomerModal={isOpenAddCustomerModal}
        closeCustomerModal={handleCloseCustomerModal}
        customerCodes={customerCodes}
        customerInfo={customerInfo}
        isCustomerCodeEnabled={isCustomerCodeEnabled}
      />
    </>
  );
}
