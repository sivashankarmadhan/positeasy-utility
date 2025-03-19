import {
  Box,
  Button,
  Card,
  Dialog,
  IconButton,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import {
  filter,
  find,
  forEach,
  get,
  groupBy,
  isEmpty,
  isUndefined,
  map,
  omit,
  omitBy,
} from 'lodash';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import DropDown from 'src/components/cart/DropDown';
import {
  BUTTON_LOADING_STATUS,
  PAYMENT_TYPES,
  PRINT_CONSTANT,
  PaymentModeTypeConstantsCart,
  USER_AGENTS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  allConfiguration,
  cart,
  customCode,
  customerCode,
  deliveryDateState,
  isOfflineState,
  isShowBillingSummaryState,
  noStockProducts,
  offlineHoldOnListState,
  offlineOrdersListCountState,
  offlineToOnlineSyncingState,
  orderDateState,
  selectedBLE,
  selectedHoldIdState,
  selectedLAN,
  selectedUSB,
} from 'src/global/recoilState';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import AuthService from 'src/services/authService';
import PAYMENT_API from 'src/services/payment';
import PRODUCTS_API from 'src/services/products';
import { fCurrency } from 'src/utils/formatNumber';
import LoadingScreen from '../loading-screen/LoadingScreen';

import CloseIcon from '@mui/icons-material/Close';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import BridgeConstants from 'src/constants/BridgeConstants';
import { StorageConstants } from 'src/constants/StorageConstants';
import { logoutBilling } from 'src/helper/logout';
import ObjectStorage from 'src/modules/ObjectStorage';
import { PATH_DASHBOARD } from 'src/routes/paths';
import AddAdvanceDialog from 'src/sections/Advance/AddAdvanceDialog';
import NativeService from 'src/services/NativeService';
import PrinterService from 'src/services/PrinterService';
import {
  currentDate,
  currentTimeWithoutSec,
  fDatesWithTimeStampFromUtc,
  fDatesWithTimeStampWithDayjs,
} from 'src/utils/formatTime';

import { LoadingButton } from '@mui/lab';
import dayjs from 'dayjs';
import moment from 'moment';
import ElectronService from 'src/services/ElectronService';
import formatPrint from 'src/utils/FormatPrint';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import EnterValueDialog from './EnterValueDialog';
import PrintableCart from './PrintableCart';
import { isEqual } from 'lodash';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function CartSummary({
  paymentMode,
  setPaymentMode,
  paymentType,
  setPaymentType,
  orderType,
  // setIsUnLock,
  bookingId,
  setBookingId,
  handleReset,
  totalOrderValue,
  gstAmount,
  gstData,
  calculateTotalPrice,
  totalValueNoOffer,
  isLaptop,
  info,
  isPrint,
  isCustomCodeEnabled,
  isCustomerCodeEnabled,
  customerInfo,
  setIsError,
  finalAdvance,
  setFinalAdvance,
  finalAdditionalDiscount,
  setFinalAdditionalDiscount,
  finalAdditionalCharges,
  setFinalAdditionalCharges,
  serializeData,
  finalPackingCharges,
  setFinalPackingCharges,
  finalDeliveryCharges,
  setFinalDeliveryCharges,
  getRoundedOff,
  remainingAmountOrTotalAmount,
  remainingTotalAmount,
  selectedDeliveryDate,
  setSelectedDeliveryDate,
  isDeliveryDateEdited,
  setIsDeliveryDateEdited,
  addOrder,
  setIsCredited,
  isCredited,
  tableName,
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const orders = useRecoilValue(cart);
  const currentCustomerId = useRecoilValue(customerCode);
  const currentCustomCode = useRecoilValue(customCode);
  const shopName = AuthService.getShopName();
  const address = AuthService.getAddress();
  const orderDate = useRecoilValue(orderDateState);
  const theme = useTheme();
  const resetNoStocks = useResetRecoilState(noStockProducts);
  const setNoStocks = useSetRecoilState(noStockProducts);
  const [openAdvance, setOpenAdvance] = useState(false);
  const totalOrderQuantity = calculateTotalQuantity(orders);
  const [invoiceId, setInvoiceId] = useState('');

  const [isShowBillingSummary, setIsShowBillingSummary] = useRecoilState(isShowBillingSummaryState);

  // const [finalAdvance, setFinalAdvance] = useState(null);
  const configuration = useRecoilValue(allConfiguration);
  const printInfomationData = get(configuration, 'printInfo.printInformation');
  const printType = get(configuration, 'printType', PRINT_CONSTANT.POS);
  const isElectron = ElectronService.isElectron();
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const printerInfo = get(configuration, 'printInfo.paperSize', PRINT_CONSTANT.POS_BLUETOOTH_80MM);
  const isBluetooth = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_BLUETOOTH);
  const isLAN = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_LAN);
  const isUSB = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_USB);
  const sizeMap = {
    [PRINT_CONSTANT.POS_BLUETOOTH_80MM]: 48,
    [PRINT_CONSTANT.POS_USB_80MM]: 48,
    [PRINT_CONSTANT.POS_LAN_80MM]: 48,
    [PRINT_CONSTANT.POS_BLUETOOTH_58MM]: 28,
    [PRINT_CONSTANT.POS_USB_58MM]: 28,
    [PRINT_CONSTANT.POS_LAN_58MM]: 28,
    [PRINT_CONSTANT.POS_BLUETOOTH_72MM]: 42,
    [PRINT_CONSTANT.POS_USB_72MM]: 42,
    [PRINT_CONSTANT.POS_LAN_72MM]: 42,
  };
  const selectedBLEPrinter = useRecoilValue(selectedBLE);
  const selectedUSBPrinter = useRecoilValue(selectedUSB);
  const selectedLANPrinter = useRecoilValue(selectedLAN);
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);

  const additionalDiscountConfig = get(configuration, 'billingSettings.additionalDiscount', false);
  const additionalChargesConfig = get(configuration, 'billingSettings.additionalCharges', false);
  const packingChargesConfig = get(configuration, 'billingSettings.packingCharges', false);
  const deliveryChargesConfig = get(configuration, 'billingSettings.deliveryCharges', false);
  const deliveryDateConfig = get(configuration, 'billingSettings.isAllowDeliveryDateChange', false);

  const [buttonLoadingName, setButtonLoadingName] = useState(null);

  const [openOfflineDialog, setOpenOfflineDialog] = useState({ status: false });

  const setIsOffline = useSetRecoilState(isOfflineState);

  const [offlineToOnlineSyncing, setOfflineToOnlineSyncing] = useRecoilState(
    offlineToOnlineSyncingState
  );

  const selectedHoldId = useRecoilValue(selectedHoldIdState);
  const setOfflineHoldOnList = useSetRecoilState(offlineHoldOnListState);

  const setOfflineOrdersListCount = useSetRecoilState(offlineOrdersListCountState);

  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [isOpenAdditionalDiscount, setIsOpenAdditionalDiscount] = useState(false);

  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [isOpenAdditionalCharges, setIsOpenAdditionalCharges] = useState(false);

  const [packingCharges, setPackingCharges] = useState(0);
  const [isOpenPackingCharges, setIsOpenPackingCharges] = useState(false);

  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [isOpenDeliveryCharges, setIsOpenDeliveryCharges] = useState(false);
  const [isOpenDeliveryDate, setIsOpenDeliveryDate] = useState(false);
  const location = useLocation();
  const [deliveryDate, setDeliveryDate] = useRecoilState(deliveryDateState);
  const getPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
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
  const getProduct = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    return check;
  };
  const handleOpenAdvance = () => {
    setOpenAdvance(true);
  };
  const handleCloseAdvance = () => {
    setOpenAdvance(false);
  };
  const handlePaymentMode = (event) => {
    setPaymentMode(get(event, 'label'));
  };
  const getActualPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
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
  const getOfferPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    if (check) {
      const { withoutGstAmount } = getTotalPriceAndGst({
        price: check?.offerPrice,
        GSTPercent: check?.GSTPercent,
        GSTInc: check?.GSTInc,
        fullData: check,
        orderType,
      });
      return withoutGstAmount;
    }
  };
  const checkOfferCart = () => {
    let a = 0;
    if (!isEmpty(orders)) {
      forEach(orders, (e) => {
        const offerPrice = getOfferPrice(e.productId);

        if (offerPrice) {
          a += (getActualPrice(e.productId) - offerPrice) * e.quantity;
        }
      });

      return a ? a : 0;
    }
  };
  const getOrderDetailsById = (curr) => {
    const data = filter(orders, (e) => e.productId === curr);
    let orderLength = data.length;
    let withAddon = [];
    let withoutAddon = [];
    let quantity = 0;
    let totalPrice = 0;
    if (orderLength > 0) {
      forEach(data, (e) => {
        quantity += e.quantity;
        if (isEmpty(e.addOn)) {
          totalPrice += getPrice(e.productId) * e.quantity;
          withoutAddon.push(e);
        } else if (!isEmpty(e.addOn)) {
          let totalAddonPrice = 0;
          forEach(e.addOn, (d) => {
            totalAddonPrice += d.price;
          });
          totalPrice += (getPrice(e.productId) + totalAddonPrice) * e.quantity;
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

  const handleClosePrintDialog = () => {
    setButtonLoadingName(null);
    handleReset();
    navigate(PATH_DASHBOARD.billing, { replace: true });
  };

  const validation = () => {
    if (isEmpty(cart)) {
      toast.error(ErrorConstants.NO_ITEMS);
      return false;
    } else if (!paymentMode) {
      toast.error(ErrorConstants.PAYMENT_MODE);
      return false;
    } else if (!orderType && isOrderTypeEnable) {
      toast.error(ErrorConstants.ORDER_TYPE);
      return false;
    } else return true;
  };

  const calculateTotalGst = () => {
    let gst = 0;
    map(orders, (e) => {
      if (e.GSTPercent > 0)
        gst +=
          getTotalPriceAndGst({
            price: e?.offerPrice || e?.price,
            GSTPercent: e?.GSTPercent,
            GSTInc: e?.GSTInc,
            fullData: e,
            orderType,
          })?.gstPercentageValue * e.quantity;
      map(get(e, 'addOns'), (d) => {
        if (d.GSTPercent > 0)
          gst +=
            getTotalPriceAndGst({
              price: d?.price,
              GSTPercent: d?.GSTPercent,
              GSTInc: d?.GSTInc,
              fullData: d,
              orderType,
            })?.gstPercentageValue *
            d.quantity *
            e.quantity;
      });
    });
    return gst ? gst : 0;
  };

  const checkStocks = async (isPrintStatus) => {
    console.log('isPrintStatus', isPrintStatus);
    try {
      const options = serializeData();
      // const response = await PRODUCTS_API.checkStock(options);
      // if (isEmpty(get(response, 'data'))) {
      handleComplete(isPrintStatus);
      resetNoStocks();
      setButtonLoadingName(null);
      // } else {
      //   map(get(response, 'data'), (e) => {
      //     const productData = getOrderDetailsById(get(e, 'productId'));
      //     const product = getProduct(get(e, 'productId'));
      //     const units = get(product, 'unitsEnabled', false)
      //       ? `${get(product, 'unit')} ${get(product, 'unitName')}`
      //       : '';
      //     toast.error(
      //       `${get(e, 'name')?.toUpperCase()} ${units}  has ${
      //         get(productData, 'quantity') + get(e, 'quantity')
      //       } stocks  `
      //     );
      //   });
      //   setNoStocks(get(response, 'data'));
      //   setIsButtonLoading(false);
      // }
    } catch (error) {
      console.log(error);
      setButtonLoadingName(null);
    }
  };

  const getPreviewOrderId = async () => {
    try {
      const response = await PRODUCTS_API.getPreviewOrderId();
      ObjectStorage.setItem(StorageConstants.PREVIEW_ID, { data: get(response, 'data.orderId') });
    } catch (e) {
      console.log(e);
    }
  };

  const formatSerializeDataForOffline = (data) => {
    const previewId = ObjectStorage.getItem(StorageConstants.PREVIEW_ID)?.data;

    const { data: localOrderList } = ObjectStorage.getItem(StorageConstants.ORDER_LIST);

    let orderId;

    const { data: orderResetTime } = ObjectStorage.getItem(StorageConstants.ORDER_RESET_TIME);

    if (localOrderList?.length) {
      if (orderResetTime <= currentTimeWithoutSec()) {
        if (orderResetTime <= localOrderList?.at?.(-1)?.time) {
          orderId = localOrderList?.at?.(-1)?.orderId + 1;
        } else {
          orderId = 1;
        }
      } else {
        orderId = localOrderList?.at?.(-1)?.orderId + 1;
      }
    } else {
      orderId = (previewId || 0) + 1;
    }

    return omitBy(
      {
        orderId: orderId,
        orderType: get(data, '0.orderType'),
        type: get(data, '0.paymentType'),
        advance: get(data, '0.advance'),
        mode: get(data, '0.paymentModeType'),
        customCode: get(data, '0.customCode'),
        additionalInfo: get(data, '0.additionalInfo'),
        additionalCharges: Number(finalAdditionalCharges),
        additionalDiscount: Number(finalAdditionalDiscount),
        packingCharges: Number(finalPackingCharges),
        deliveryCharges: Number(finalDeliveryCharges),
        roundedOff: get(data, '0.roundedOff'),
        GSTInc: get(data, '0.GSTInc'),
        ...(get(orderDate, '$d')
          ? {
              date: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[0],
              time: dayjs(get(orderDate, '$d')).format('YYYY-MM-DD hh:mm:ss')?.split(' ')?.[1],
            }
          : {
              date: currentDate(),
              time: moment(new Date()).format('HH:mm:ss'),
            }),
        orders: map(data, (_item) => {
          return {
            orderId: orderId,
            quantity: get(_item, 'quantity'),
            price: get(_item, 'price'),
            productId: get(_item, 'productId'),
            GSTPercent: get(_item, 'GSTPercent'),
            ...(get(_item, 'counterId') ? { counterId: get(_item, 'counterId') } : {}),
            addOns: get(_item, 'addOns'),
            productInfo: {
              name: get(_item, 'name'),
              category: get(_item, 'category'),
            },
            category: get(_item, 'category'),
            name: get(_item, 'name'),
            GSTInc: get(_item, 'GSTInc'),
            ...(get(_item, 'parcelCharges') ? { parcelCharges: get(_item, 'parcelCharges') } : {}),
            ...(get(_item, 'addByScanning') ? { addByScanning: get(e, 'addByScanning') } : {}),
          };
        }),
      },
      isUndefined
    );
  };

  const postCurrentOrder = async ({ isPrintStatus, isOffline }) => {
    setIsLoading(true);
    try {
      const options = serializeData();

      let response;

      if (isOffline) {
        const { data: localOrderList } = ObjectStorage.getItem(StorageConstants.ORDER_LIST);

        if (selectedHoldId) {
          const { data: localHoldOnList } = ObjectStorage.getItem(
            StorageConstants.OFFLINE_HOLD_ON_LIST
          );

          const filterOtherHoldOnList = filter(localHoldOnList, (_item) => {
            return get(_item, 'holdId') !== selectedHoldId;
          });

          ObjectStorage.setItem(StorageConstants.OFFLINE_HOLD_ON_LIST, {
            data: filterOtherHoldOnList,
          });
          setOfflineHoldOnList(filterOtherHoldOnList);

          ObjectStorage.setItem(StorageConstants.ORDER_LIST, {
            data: [...(localOrderList || []), formatSerializeDataForOffline(options)],
          });

          // setSelectedHoldId(null);

          const { data: orderListData } = ObjectStorage.getItem(StorageConstants.ORDER_LIST);
          setOfflineOrdersListCount(orderListData?.length || 0);
          response = {
            data: {
              orderId: orderListData?.at?.(-1)?.result?.orderId,
            },
          };
        } else {
          let orderListData = [];
          if (isEmpty(localOrderList)) {
            orderListData = [formatSerializeDataForOffline(options)];
          } else {
            orderListData = [...localOrderList, formatSerializeDataForOffline(options)];
          }
          ObjectStorage.setItem(StorageConstants.ORDER_LIST, { data: orderListData });
          setOfflineOrdersListCount(orderListData?.length || 0);
          response = {
            data: {
              orderId: formatSerializeDataForOffline(options)?.orderId,
            },
          };
        }
      } else {
        response = await PAYMENT_API.makeOrder(options);
        if (selectedHoldId) {
          const { data: localHoldOnList } = ObjectStorage.getItem(
            StorageConstants.OFFLINE_HOLD_ON_LIST
          );

          const filterOtherHoldOnList = filter(localHoldOnList, (_item) => {
            return get(_item, 'holdId') !== selectedHoldId;
          });

          ObjectStorage.setItem(StorageConstants.OFFLINE_HOLD_ON_LIST, {
            data: filterOtherHoldOnList,
          });
          setOfflineHoldOnList(filterOtherHoldOnList);
          // setSelectedHoldId(null);
        }
        getPreviewOrderId();
      }

      await triggerAfterSubmitOrder({
        response,
        isPrintStatus,
        successMsg: SuccessConstants.ADD_SUCCESSFUL,
      });

      if (isOffline) {
        setOfflineToOnlineSyncing(true);
      }
    } catch (e) {
      setIsLoading(false);
      setButtonLoadingName(null);
      console.log(e);
      // toast.error(e?.response?.message || e?.errorResponse?.message);
      if (
        e?.errorResponse?.code === 'ERR_SBEE_0027' ||
        e?.errorResponse?.code === 'ERR_SBEE_0028' ||
        e?.errorResponse?.code === 'ERR_SBEE_0029' ||
        e?.errorResponse?.code === 'ERR_SBEE_0055'
      ) {
        AuthService._billingLogout();
        // setIsUnLock(false);
        return;
      }
      if (e?.response?.code === 'ERR_SBEE_0994') {
        logoutBilling();
        navigate('/login', { replace: true });
        return;
      }

      const { status: offlineStatus } = ObjectStorage.getItem(StorageConstants.OFFLINE);

      if (!offlineStatus) {
        setOpenOfflineDialog({
          status: true,
          currentPrintStatus: !!isPrintStatus,
        });
      } else {
        postCurrentOrder({ isPrintStatus, isOffline: true });
      }
    }
  };

  const triggerAfterSubmitOrder = async ({ response, isPrintStatus, successMsg }) => {
    if (response) setBookingId(get(response, 'data.orderId'));
    setIsLoading(false);
    if (response) {
      toast.success(response?.data?.message ?? successMsg);
      ObjectStorage.setItem(StorageConstants.PAYMENT_MODE, { mode: paymentMode });
      if (isPrintStatus) {
        if (printType === PRINT_CONSTANT.POS) {
          setInvoiceId(get(response, 'data.orderId'));
          console.log('Reahced Print pos');
          if (get(printInfomationData, 'merchantCopy', false)) {
            handlePrint(get(response, 'data.orderId'), false, true, false);
            console.log('Reahced Print merchant ');
            setTimeout(() => {
              console.log('Reahced Print customer');
              handlePrint(get(response, 'data.orderId'), true, false, false);
              if (get(printInfomationData, 'counterwise', false)) {
                setTimeout(() => {
                  console.log('Reahced Print counter');
                  handlePrint(get(response, 'data.orderId'), false, false, true);
                }, 500);
              }
            }, 500);
          } else {
            handlePrint(get(response, 'data.orderId'), false, false, false);
            if (get(printInfomationData, 'counterwise', false)) {
              setTimeout(() => {
                handlePrint(get(response, 'data.orderId'), false, false, true);
              }, 500);
            }
          }
        }
        if (printType === PRINT_CONSTANT.PDF) {
          setTimeout(() => {
            setInvoiceId(get(response, 'data.orderId'));
            setTimeout(() => {
              setButtonLoadingName(null);
              handleReset();
            }, 200);
          }, 1000);
        }
      } else {
        setButtonLoadingName(null);
        handleReset();
        navigate(PATH_DASHBOARD.billing, { replace: true });
      }
      setTimeout(() => {
        setFinalAdditionalDiscount(0);
        setFinalAdditionalCharges(0);
        setFinalPackingCharges(0);
        setFinalDeliveryCharges(0);
        setFinalAdvance(null);
        setIsCredited(false);
      }, 500);
    }
  };

  const formatEditOrderPayload = (payload, isOldOrder) => {
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

    const conditionPayload = isOldOrder
      ? {
          orderType: get(payload, '0.orderType'),
          mode: get(payload, '0.paymentModeType'),
          customerId: get(payload, '0.customerId'),
          customCode: get(payload, '0.customCode'),
          type: get(payload, '0.type'),
          advance: get(payload, '0.advance'),
          additionalCharges: get(payload, '0.additionalCharges'),
          additionalDiscount: get(payload, '0.additionalDiscount'),
          additionalInfo: [
            {
              ...(info ? { info: info } : {}),
              ...(!isEmpty(orderComments) ? { orderComment: orderComments } : {}),
            },
          ],
          packingCharges: get(payload, '0.packingCharges'),
          deliveryCharges: get(payload, '0.deliveryCharges'),
          ...(get(payload, '0.deliveryDate')
            ? {
                deliveryDate: isDeliveryDateEdited
                  ? get(payload, '0.deliveryDate')
                  : moment(get(payload, '0.deliveryDate'))
                      .subtract(5, 'hours')
                      .subtract(30, 'minutes')
                      .utc()
                      .format(),
              }
            : {}),
        }
      : {
          ...(isCustomCodeEnabled && currentCustomCode
            ? {
                customCode: currentCustomCode,
              }
            : {}),
          ...(isCustomerCodeEnabled && customerInfo?.id
            ? {
                customerId: customerInfo?.id,
              }
            : {}),
          ...(isOrderTypeEnable ? { orderType: orderType } : {}),
          ...(finalAdvance && finalAdvance > 0 ? { advance: finalAdvance * 100 } : {}),
          type: paymentType,
          additionalCharges: Number(finalAdditionalCharges) * 100,
          additionalDiscount: Number(finalAdditionalDiscount) * 100,
          packingCharges: Number(finalPackingCharges) * 100,
          deliveryCharges: Number(finalDeliveryCharges) * 100,
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
          mode: paymentMode,
          ...(deliveryDateConfig && deliveryDate
            ? {
                deliveryDate: isDeliveryDateEdited
                  ? get(payload, '0.deliveryDate')
                  : moment(deliveryDate)
                      .subtract(5, 'hours')
                      .subtract(30, 'minutes')
                      .utc()
                      .format(),
              }
            : {}),
        };

    return omitBy(
      {
        paymentId: get(location, 'state.orders.0.paymentId'),
        orderId: get(location, 'state.orders.0.orderId'),
        orders: map(payload, (_item) => {
          return {
            quantity: get(_item, 'quantity'),
            price: get(_item, 'price'),
            productId: get(_item, 'productId'),
            GSTPercent: get(_item, 'GSTPercent'),
            GSTInc: get(_item, 'GSTInc'),
            roundedOff: get(_item, 'roundedOff'),
            ...(get(_item, 'counterId') ? { counterId: get(_item, 'counterId') } : {}),
            productInfo: get(_item, 'productInfo'),
            addOns: get(_item, 'addOns', []),
            name: get(_item, 'name'),
            ...(get(_item, 'parcelCharges') ? { parcelCharges: get(_item, 'parcelCharges') } : {}),
            ...(get(_item, 'isParcelCharges')
              ? { parcelCharges: get(_item, 'isParcelCharges') }
              : {}),
          };
        }),
        ...conditionPayload,
      },
      isUndefined
    );
  };

  const handleComplete = async (isPrintStatus) => {
    const checkValidate = validation();
    if (!checkValidate) setButtonLoadingName(null);
    if (!checkValidate) return;
    if (isEmpty(orders)) return;
    console.log('kkkk', location?.state?.orders);
    if (location?.state?.orders) {
      try {
        const prevOrders = omit(formatEditOrderPayload(location?.state?.orders, true), [
          'customerId',
          'customCode',
          'orderType',
          'additionalInfo',
          'mode',
          'deliveryDate',
        ]);
        const newOrders = omit(formatEditOrderPayload(orders), [
          'customerId',
          'customCode',
          'orderType',
          'additionalInfo',
          'mode',
          'deliveryDate',
        ]);

        console.log('sssssss', prevOrders, newOrders);

        const isEqualOrdersList = isEqual(prevOrders, newOrders);

        const options = serializeData();
        const response = await PRODUCTS_API.orderBillEdit({
          ...formatEditOrderPayload(options),
          orderEdit: !isEqualOrdersList,
        });
        await triggerAfterSubmitOrder({
          response,
          isPrintStatus,
          successMsg: SuccessConstants.EDIT_SUCCESSFUL,
        });
      } catch (e) {
        setIsLoading(false);
        setButtonLoadingName(null);
        console.log(e);
        // toast.error(e?.response?.message || e?.errorResponse?.message);
        if (
          e?.errorResponse?.code === 'ERR_SBEE_0027' ||
          e?.errorResponse?.code === 'ERR_SBEE_0028' ||
          e?.errorResponse?.code === 'ERR_SBEE_0029' ||
          e?.errorResponse?.code === 'ERR_SBEE_0055'
        ) {
          AuthService._billingLogout();
          // setIsUnLock(false);
          return;
        }
        if (e?.response?.code === 'ERR_SBEE_0994') {
          logoutBilling();
          navigate('/login', { replace: true });
          return;
        }
      }
    } else {
      postCurrentOrder({
        isPrintStatus,
        isOffline: !!ObjectStorage.getItem(StorageConstants.OFFLINE).status,
      });
    }
  };

  const serializeForPrint = () => {
    const options = [];

    if (isEmpty(orders)) return;
    map(orders, (e) => {
      let serializeAddOn = [];
      map(e.addOn, (d) => {
        serializeAddOn.push({
          quantity: d.quantity * e.quantity,
          price: d.price,
          name: d.name,
        });
      });
      options.push({
        quantity: e.quantity,
        price: getPrice(e.productId),
        addOns: serializeAddOn,
        name: e.name,
        counter: e.counter,
        unit: e.unit ? `${e.unit}${e.unitName}` : '',
      });
    });
    return options;
  };
  const handleOpenCalendar = () => {
    setIsOpenDeliveryDate(true);
  };
  const handleCloseCalendar = () => {
    setIsOpenDeliveryDate(false);
  };
  const handleClearDate = () => {
    setDeliveryDate('');
    toast.success('Date Resetted');
    handleCloseCalendar();
  };

  const handleChangeDate = (e) => {
    if (!isEmpty(get(location, 'state.orders'))) {
      setIsDeliveryDateEdited(true);
    }
    setSelectedDeliveryDate(e);
  };
  const handleSubmitDeliveryDate = () => {
    if (!isEmpty(get(location, 'state.orders'))) {
      setIsDeliveryDateEdited(true);
    }
    setDeliveryDate(selectedDeliveryDate);
    handleCloseCalendar();
    toast.success(
      selectedDeliveryDate
        ? `Delivery Date ${dayjs(get(selectedDeliveryDate, '$d')).format('DD/MM/YYYY hh:mm:ss')}`
        : 'Date Resetted'
    );
  };

  const calculateTotalParcelCharges = () => {
    let parcelCharges = 0;
    map(addOrder, (e) => {
      if (e?.isParcelCharges) {
        parcelCharges +=
          getTotalPriceAndGst({
            price: e?.offerPrice || e?.price,
            GSTPercent: e?.GSTPercent,
            GSTInc: e?.GSTInc,
            fullData: e,
            orderType,
          })?.parcelChargesWithoutGst * e.quantity;
      }
      map(get(e, 'addOns'), (d) => {
        if (e?.isParcelCharges) {
          parcelCharges += d?.parcelCharges * d.quantity * e.quantity;
        }
      });
    });
    return parcelCharges ? parcelCharges : 0;
  };

  const totalParcelCharges = calculateTotalParcelCharges();

  const handlePrint = (
    orderId,
    merchantCopy = false,
    customerCopy = false,
    isCounterWise = false
  ) => {
    try {
      const sortedData = serializeForPrint();
      const totalQuantity = calculateTotalQuantity(orders);
      const counterWise = groupBy(sortedData, 'counter');
      let printData = {
        orderId: orderId,
        orderDate: get(orderDate, '$d')
          ? dayjs(get(orderDate, '$d')).format('DD-MM-YYYY hh:mm A')
          : fDatesWithTimeStampWithDayjs(new Date(), 'dd/MM/yyyy p'),
        title: get(printInfomationData, 'shopName'),
        subTitle: get(printInfomationData, 'address'),
        GSTNo: get(printInfomationData, 'GST'),
        bankDetails: get(printInfomationData, 'bankDetails'),
        contactNumber: get(printInfomationData, 'contactNumber'),
        items: sortedData,
        header: get(printInfomationData, 'header'),
        itemCounterWise: counterWise,
        totalAmount: totalValueNoOffer,
        footerMain: get(printInfomationData, 'footer'),
        footer2: '',
        poweredBy: '',
        totalQty: totalQuantity,
        totalCartItems: orders.length,
        gstAmount: totalGST,
        totalWithGst: totalOrderValue,
        additionalCharges: Number(finalAdditionalCharges),
        additionalDiscount: Number(finalAdditionalDiscount),
        packingCharges: Number(finalPackingCharges),
        parcelCharges: totalParcelCharges,
        deliveryCharges: Number(finalDeliveryCharges),
        roundedOff: getRoundedOff(),
        printerInfo: {
          printType: printerInfo,
          ...(isBluetooth
            ? {
                macAddress: get(selectedBLEPrinter, 'macAddress', ''),
              }
            : isLAN
            ? {
                host: get(selectedLANPrinter, 'host', ''),
                port: get(selectedLANPrinter, 'port', 0),
              }
            : isUSB
            ? {
                vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                productId: get(selectedUSBPrinter, 'productId', ''),
              }
            : {}),
        },
        totalOffer: totalOffer,
        paymentStatus: 'PAID',
      };
      if (isAndroid && !isAndroidRawPrint) {
        const nativeRequest = [
          {
            name: BridgeConstants.PRINT,
            data: {
              printerName: 'BlueTooth Printer',
              base64String: printData,
              printerInfo: {
                printType: printerInfo,
                ...(isBluetooth
                  ? {
                      macAddress: get(selectedBLEPrinter, 'macAddress', ''),
                    }
                  : isLAN
                  ? {
                      host: get(selectedLANPrinter, 'host', ''),
                      port: get(selectedLANPrinter, 'port', 0),
                    }
                  : isUSB
                  ? {
                      vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                      productId: get(selectedUSBPrinter, 'productId', ''),
                    }
                  : {}),
              },
            },
          },
        ];
        NativeService.sendAndReceiveNativeData(nativeRequest)
          .then((response) => {
            console.log('Native response Print', response);
            const nativeItem = response.filter(
              (responseItem) => responseItem.name === BridgeConstants.PRINT
            );
            console.log(get(nativeItem, '0.data.message'));
          })
          .catch((e) => {
            console.log(e);
          });
      } else if (isAndroidRawPrint) {
        const formatAndroidPrint = formatPrint(
          printData,
          sizeMap[printerInfo],
          merchantCopy,
          customerCopy,
          isCounterWise
        );
        if (!isCounterWise) {
          console.log('Reahced Print  not iscounterwise');
          const nativeRequest = [
            {
              name: BridgeConstants.PRINT_RAW,
              data: {
                printerName: 'BlueTooth Printer',
                printRawData: formatAndroidPrint,
                printerInfo: {
                  printType: printerInfo,
                  ...(isBluetooth
                    ? {
                        macAddress: get(selectedBLEPrinter, 'macAddress', ''),
                      }
                    : isLAN
                    ? {
                        host: get(selectedLANPrinter, 'host', ''),
                        port: get(selectedLANPrinter, 'port', 0),
                      }
                    : isUSB
                    ? {
                        vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                        productId: get(selectedUSBPrinter, 'productId', ''),
                      }
                    : {}),
                },
              },
            },
          ];
          NativeService.sendAndReceiveNativeData(nativeRequest)
            .then((response) => {
              console.log('Native response Print', response);
              const nativeItem = response.filter(
                (responseItem) => responseItem.name === BridgeConstants.PRINT_RAW
              );
              console.log(get(nativeItem, '0.data.message'));
            })
            .catch((e) => {
              console.log(e);
            });
        }
        console.log('Reached print counterwise before', isCounterWise);
        if (isCounterWise) {
          for (let printCounterData of formatAndroidPrint) {
            console.log('Reached print inside', printCounterData);
            const nativeRequest = [
              {
                name: BridgeConstants.PRINT_RAW,
                data: {
                  printerName: 'BlueTooth Printer',
                  printRawData: printCounterData,
                  printerInfo: {
                    printType: printerInfo,
                    ...(isBluetooth
                      ? {
                          macAddress: get(selectedBLEPrinter, 'macAddress', ''),
                        }
                      : isLAN
                      ? {
                          host: get(selectedLANPrinter, 'host', ''),
                          port: get(selectedLANPrinter, 'port', 0),
                        }
                      : isUSB
                      ? {
                          vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                          productId: get(selectedUSBPrinter, 'productId', ''),
                        }
                      : {}),
                  },
                },
              },
            ];
            NativeService.sendAndReceiveNativeData(nativeRequest)
              .then((response) => {
                const nativeItem = response.filter(
                  (responseItem) => responseItem.name === BridgeConstants.PRINT_RAW
                );
                console.log(get(nativeItem, '0.data.message'));
              })
              .catch((e) => {
                console.log(e);
              });
          }
        }
      } else {
        if (isElectron) {
          setTimeout(() => {
            PrinterService.nodePrint();
          }, 1000);
        } else
          setTimeout(() => {
            window.print();
          }, 500);
      }

      setTimeout(() => {
        handleClosePrintDialog();
      }, 2000);
    } catch (e) {
      console.log(e);
    }
  };

  const totalOffer = checkOfferCart();
  const totalGST = calculateTotalGst();
  const sortedData = serializeForPrint();
  const totalQuantity = calculateTotalQuantity(orders);

  useEffect(() => {
    if (finalAdvance !== null) {
      setPaymentType(PAYMENT_TYPES.PARTIAL);
    } else if (isCredited) {
      setPaymentType(PAYMENT_TYPES.CREDIT);
    } else {
      setPaymentType(PAYMENT_TYPES.FULL_PAYMENT);
    }
  }, [finalAdvance, isCredited]);

  useEffect(() => {
    const currentPaymentMode = ObjectStorage.getItem(StorageConstants.PAYMENT_MODE);
    setPaymentMode(get(currentPaymentMode, 'mode'));
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <div
      style={{
        // position: isLaptop ? 'absolute' : 'fixed',
        bottom: '3px',
        left: '0px',
        width: '100%',
        backgroundColor: 'rgb(255, 255, 255)',
        padding: '10px',
        paddingBottom: '0px',
        flexShrink: 1,
      }}
    >
      {!isEmpty(orders) && (
        <>
          <PrintableCart
            printerPaperSize={sizeMap[printerInfo]}
            totalGST={totalGST}
            totalDiscount={totalOffer}
            sortedData={sortedData}
            totalQuantity={totalQuantity}
            totalValueNoOffer={totalValueNoOffer}
            totalOrderValue={fCurrency(Math.round(remainingAmountOrTotalAmount))}
            printerInfo={printerInfo}
            orderId={invoiceId}
            additionalCharges={fCurrency(finalAdditionalCharges)}
            additionalDiscount={fCurrency(finalAdditionalDiscount)}
            packingCharges={fCurrency(finalPackingCharges)}
            deliveryCharges={fCurrency(finalDeliveryCharges)}
            roundedOff={getRoundedOff()}
            totalOrderQuantity={totalOrderQuantity}
          />
          <Stack
            direction={'column'}
            sx={{
              justifyContent: 'flex-start',
              display: 'flex',
              backgroundColor: '#F8F8F8',
              position: 'relative',
              p: '0.4rem',
              borderRadius: 1,
              py: get(gstData, 'gstEnabled') ? 0.3 : 1.5,
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                backgroundColor: '#fff',
                width: 20,
                height: 20,
                borderRadius: 10,
                position: 'absolute',
                bottom: 38,
                left: -10,
              }}
            />
            <Box
              sx={{
                backgroundColor: '#fff',
                width: 20,
                height: 20,
                borderRadius: 10,
                position: 'absolute',
                bottom: 38,
                right: -10,
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 0,
                right: '35%',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
              onClick={() => {
                ObjectStorage.setItem(StorageConstants.IS_SHOW_BILLING_SUMMARY, {
                  data: !isShowBillingSummary,
                });
                setIsShowBillingSummary(!isShowBillingSummary);
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  '&:hover': {
                    textDecoration: 'underline',
                    fontWeight: 'bold',
                  },
                }}
              >
                Show Summary
              </Typography>

              {isShowBillingSummary ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            </div>

            {isShowBillingSummary && (
              <>
                <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Total No Of Items</Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                    {' '}
                    {!isEmpty(orders) ? orders.length : 0}
                  </Typography>
                </Stack>
                <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>
                    Total Order Quantity
                  </Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                    {totalOrderQuantity}
                  </Typography>
                </Stack>
                <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Order Summary</Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                    {fCurrency(totalValueNoOffer)}
                  </Typography>
                </Stack>
                <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Total Discount</Typography>

                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    justifyContent={'flex-start'}
                    gap={1}
                  >
                    <Typography sx={{ fontSize: '12px' }}>-</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                      {fCurrency(totalOffer)}
                    </Typography>
                  </Stack>
                </Stack>

                {!!totalParcelCharges && (
                  <Stack
                    direction={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Parcel Charges</Typography>

                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: '12px' }}>+</Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                        {fCurrency(totalParcelCharges)}
                      </Typography>
                    </Stack>
                  </Stack>
                )}

                <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>GST</Typography>

                  <Stack flexDirection="row" alignItems="center" gap={1}>
                    <Typography sx={{ fontSize: '12px' }}>+</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                      {fCurrency(totalGST)}
                    </Typography>
                  </Stack>
                </Stack>
                {additionalDiscountConfig && !tableName && (
                  <Stack
                    direction={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Stack flexDirection="row">
                      <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>
                        Additional Discount
                      </Typography>
                      <EditIcon
                        onClick={() => {
                          setIsOpenAdditionalDiscount(true);
                        }}
                        sx={{
                          fontSize: '14px',
                          mx: 1,
                          cursor: 'pointer',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </Stack>

                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: '12px' }}>-</Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                        {fCurrency(finalAdditionalDiscount)}
                      </Typography>
                    </Stack>
                  </Stack>
                )}

                {additionalChargesConfig && !tableName && (
                  <Stack
                    direction={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Stack flexDirection="row">
                      <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>
                        Additional Charges
                      </Typography>
                      <EditIcon
                        onClick={() => {
                          setIsOpenAdditionalCharges(true);
                        }}
                        sx={{
                          fontSize: '14px',
                          mx: 1,
                          cursor: 'pointer',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </Stack>

                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: '12px' }}>+</Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                        {fCurrency(finalAdditionalCharges)}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                {packingChargesConfig && !tableName && (
                  <Stack
                    direction={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Stack flexDirection="row">
                      <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>
                        Packing Charges
                      </Typography>
                      <EditIcon
                        onClick={() => {
                          setIsOpenPackingCharges(true);
                        }}
                        sx={{
                          fontSize: '14px',
                          mx: 1,
                          cursor: 'pointer',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </Stack>

                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: '12px' }}>+</Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                        {fCurrency(finalPackingCharges)}
                      </Typography>
                    </Stack>
                  </Stack>
                )}

                {deliveryChargesConfig && !tableName && (
                  <Stack
                    direction={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Stack flexDirection="row">
                      <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>
                        Delivery Charges
                      </Typography>
                      <EditIcon
                        onClick={() => {
                          setIsOpenDeliveryCharges(true);
                        }}
                        sx={{
                          fontSize: '14px',
                          mx: 1,
                          cursor: 'pointer',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </Stack>

                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: '12px' }}>+</Typography>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                        {fCurrency(finalDeliveryCharges)}
                      </Typography>
                    </Stack>
                  </Stack>
                )}

                {deliveryDateConfig && !tableName && (
                  <Stack
                    direction={'row'}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Stack flexDirection="row">
                      <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Delivery Date</Typography>
                      <EditIcon
                        onClick={handleOpenCalendar}
                        sx={{
                          fontSize: '14px',
                          mx: 1,
                          cursor: 'pointer',
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      />
                    </Stack>
                    {console.log('deliveryDate', deliveryDate)}
                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                        {deliveryDate && typeof deliveryDate === 'object'
                          ? deliveryDate?.format('DD/MM/YY hh:mm:ss')
                          : typeof deliveryDate === 'string'
                          ? deliveryDate === 'Invalid date'
                            ? fDatesWithTimeStampFromUtc(deliveryDate)
                            : '-'
                          : '-'}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
                <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Rounded Off</Typography>

                  <Stack flexDirection="row" alignItems="center" gap={1}>
                    <Typography sx={{ fontSize: '12px' }}>{getRoundedOff()?.symbol}</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
                      {`₹ ${getRoundedOff()?.value}`}
                    </Typography>
                  </Stack>
                </Stack>
              </>
            )}

            {finalAdvance !== null && (
              <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Advance</Typography>

                <Stack flexDirection="row" alignItems="center" gap={1}>
                  <Typography sx={{ fontSize: '12px' }}>-</Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>{finalAdvance}</Typography>
                </Stack>
              </Stack>
            )}

            <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={3}>
                <Typography
                  onClick={() => {
                    if (finalAdvance === null) {
                      setIsCredited(!isCredited);
                    }
                  }}
                  sx={{
                    fontSize: '0.75rem', // Equivalent to text-xs
                    color:
                      finalAdvance !== null
                        ? 'textSecondary'
                        : isCredited
                        ? 'green' // You can also use theme palette colors here
                        : 'primary',
                    fontWeight: 'bold',
                    marginLeft: '0.375rem', // Equivalent to ml-1.5
                    cursor: finalAdvance !== null ? 'not-allowed' : 'pointer',
                    textDecoration: finalAdvance === null ? 'underline' : 'none',
                  }}
                >
                  {isCredited ? 'Credit On' : 'Credit Off'}
                </Typography>
              </Stack>

              <Stack flexDirection={'row'} sx={{ gap: 1 }}>
                {finalAdvance !== null && (
                  <Typography
                    onClick={() => setFinalAdvance(null)}
                    sx={{
                      fontSize: '12px',
                      '&:hover': {
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      },
                      color: theme.palette.primary.main,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    Clear advance
                  </Typography>
                )}
                <Typography
                  onClick={() => {
                    if (!isCredited) {
                      handleOpenAdvance();
                    }
                  }}
                  sx={
                    isCredited
                      ? {
                          fontSize: '12px',
                          color: 'gray',
                          cursor: 'not-allowed',
                          fontWeight: 'bold',
                        }
                      : {
                          fontSize: '12px',
                          '&:hover': {
                            textDecoration: 'underline',
                            cursor: 'pointer',
                          },
                          color: theme.palette.primary.main,
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }
                  }
                >
                  {finalAdvance !== null ? 'Edit advance' : 'Add advance'}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction={'row'}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px dashed #BABABA',
                pt: 1.2,
                mt: 1,
                pb: 0.2,
              }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                {isCredited
                  ? 'Credit Amount'
                  : finalAdvance !== null
                  ? 'Remaining Amount'
                  : 'Total Amount'}
              </Typography>
              <Typography
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  fontSize: '18px',
                }}
              >
                {fCurrency(Math.round(remainingAmountOrTotalAmount))}
              </Typography>
            </Stack>
          </Stack>

          {!isCredited && (
            <Stack flexDirection="row" alignItems="center" gap={2} my={1}>
              <DropDown
                label="Payment mode"
                handleChange={(e) => handlePaymentMode(e)}
                items={map(PaymentModeTypeConstantsCart, (_item) => ({
                  label: _item.name,
                }))}
                value={paymentMode}
              />
            </Stack>
          )}

          {isPrint && (
            <Stack
              flexDirection="row"
              gap={1}
              alignItems="center"
              sx={{
                mt: isCustomCodeEnabled || isCustomerCodeEnabled ? 0 : '.3rem',
              }}
            >
              <LoadingButton
                loading={buttonLoadingName === BUTTON_LOADING_STATUS.SAVE}
                className={(!isEmpty(orders) ? orders.length : 0) !== 0 ? 'pay_button' : ''}
                onClick={() => {
                  setButtonLoadingName(BUTTON_LOADING_STATUS.SAVE);
                  checkStocks();
                }}
                fullWidth
                type="submit"
                sx={{
                  alignSelf: 'center',
                  fontSize: 16,
                  height: 40,

                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
                variant="outlined"
              >
                Save
              </LoadingButton>
              <LoadingButton
                loading={buttonLoadingName === BUTTON_LOADING_STATUS.SAVE_AND_PRINT}
                className={(!isEmpty(orders) ? orders.length : 0) !== 0 ? 'pay_button' : ''}
                onClick={() => {
                  setButtonLoadingName(BUTTON_LOADING_STATUS.SAVE_AND_PRINT);
                  checkStocks(isPrint);
                }}
                fullWidth
                type="submit"
                sx={{
                  alignSelf: 'center',
                  fontSize: 16,
                  height: 40,
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
                variant="contained"
              >
                Save and print
              </LoadingButton>
            </Stack>
          )}
          {!isPrint && (
            <LoadingButton
              loading={buttonLoadingName === BUTTON_LOADING_STATUS.COMPLETE}
              className={(!isEmpty(orders) ? orders.length : 0) !== 0 ? 'pay_button' : ''}
              onClick={() => {
                setButtonLoadingName(BUTTON_LOADING_STATUS.COMPLETE);
                checkStocks();
              }}
              fullWidth
              type="submit"
              sx={{
                alignSelf: 'center',
                fontSize: 20,
                height: 40,
                mb: -1.5,
                mt: isCustomCodeEnabled || isCustomerCodeEnabled ? 0 : '.3rem',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
              variant="contained"
            >
              Complete
            </LoadingButton>
          )}
          {/* <ReceiptDialog
            bookingId={bookingId}
            open={openPrintDialog}
            onClose={handleClosePrintDialog}
            parcel={orderType}
            totalGST={totalGST}
            totalValueNoOffer={totalValueNoOffer}
            totalOffer={totalOffer}
            totalOrderValue={totalOrderValue}
          /> */}
        </>
      )}
      {openAdvance && (
        <AddAdvanceDialog
          totalOrderValue={totalOrderValue}
          openAdvance={openAdvance}
          handleCloseAdvance={handleCloseAdvance}
          setFinalAdvance={setFinalAdvance}
          finalAdvance={finalAdvance}
          remainingTotalAmount={remainingTotalAmount}
        />
      )}
      <Dialog open={openOfflineDialog?.status}>
        <Card sx={{ p: 2, height: 270, width: 300 }}>
          <Stack flexDirection="row" justifyContent="flex-end">
            <IconButton
              onClick={() => {
                setOpenOfflineDialog({ status: false });
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack justifyContent="center" alignItems="center" mt={2}>
            <WifiOffIcon sx={{ width: 100, height: 100, color: theme.palette.primary.main }} />

            <Stack
              sx={{ position: 'relative', left: 12 }}
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
            >
              <Typography>Offline</Typography>
              <Switch
                checked={!!ObjectStorage.getItem(StorageConstants.OFFLINE).status}
                onChange={() => {
                  const { status: offlineStatus } = ObjectStorage.getItem(StorageConstants.OFFLINE);

                  ObjectStorage.setItem(StorageConstants.OFFLINE, { status: !offlineStatus });
                  setIsOffline(!offlineStatus);
                  setOpenOfflineDialog({ status: false });
                  if (!offlineStatus) {
                    postCurrentOrder({
                      isPrintStatus: !!openOfflineDialog?.currentPrintStatus,
                      isOffline: true,
                    });
                  }
                }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                  mx: 1.35,
                }}
              />
            </Stack>
          </Stack>
        </Card>
      </Dialog>

      <EnterValueDialog
        open={isOpenAdditionalDiscount}
        onClose={() => {
          setIsOpenAdditionalDiscount(false);
          setAdditionalDiscount(finalAdditionalDiscount || 0);
        }}
        name="Additional Discount"
        value={additionalDiscount}
        setValue={(value) => {
          setAdditionalDiscount(value);
        }}
        onCancel={() => {
          setIsOpenAdditionalDiscount(false);
          setAdditionalDiscount(finalAdditionalDiscount || 0);
        }}
        onSubmit={() => {
          if (additionalDiscount > remainingAmountOrTotalAmount) {
            toast.error(ErrorConstants.ADDITIOAL_DISCOUNT);
            return;
          }
          setIsOpenAdditionalDiscount(false);
          setFinalAdditionalDiscount(additionalDiscount || 0);
        }}
      />

      <EnterValueDialog
        open={isOpenAdditionalCharges}
        onClose={() => {
          setIsOpenAdditionalCharges(false);
          setAdditionalCharges(finalAdditionalCharges || 0);
        }}
        name="Additional Charges"
        value={additionalCharges}
        setValue={(value) => {
          setAdditionalCharges(value);
        }}
        onCancel={() => {
          setIsOpenAdditionalCharges(false);
          setAdditionalCharges(finalAdditionalCharges || 0);
        }}
        onSubmit={() => {
          setIsOpenAdditionalCharges(false);
          setFinalAdditionalCharges(additionalCharges || 0);
        }}
      />

      <EnterValueDialog
        open={isOpenPackingCharges}
        onClose={() => {
          setIsOpenPackingCharges(false);
          setPackingCharges(finalPackingCharges || 0);
        }}
        name="Packing Charges"
        value={packingCharges}
        setValue={(value) => {
          setPackingCharges(value);
        }}
        onCancel={() => {
          setIsOpenPackingCharges(false);
          setPackingCharges(finalPackingCharges || 0);
        }}
        onSubmit={() => {
          setIsOpenPackingCharges(false);
          setFinalPackingCharges(packingCharges || 0);
        }}
      />

      <EnterValueDialog
        open={isOpenDeliveryCharges}
        onClose={() => {
          setIsOpenDeliveryCharges(false);
          setDeliveryCharges(finalDeliveryCharges || 0);
        }}
        name="Delivery Charges"
        value={deliveryCharges}
        setValue={(value) => {
          setDeliveryCharges(value);
        }}
        onCancel={() => {
          setIsOpenDeliveryCharges(false);
          setDeliveryCharges(finalDeliveryCharges || 0);
        }}
        onSubmit={() => {
          setIsOpenDeliveryCharges(false);
          setFinalDeliveryCharges(deliveryCharges || 0);
        }}
      />
      {console.log('deliveryDate', selectedDeliveryDate, typeof selectedDeliveryDate)}
      {isOpenDeliveryDate && (
        <Dialog open={isOpenDeliveryDate}>
          <Card sx={{ p: 2, minHeight: 200, width: 300 }}>
            <Stack flexDirection={'column'}>
              <Typography variant="h6">Choose Delivery Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileDateTimePicker
                  minDateTime={dayjs(new Date())}
                  onAccept={handleSubmitDeliveryDate}
                  format="DD/MM/YYYY hh:mm A"
                  onChange={handleChangeDate}
                  value={selectedDeliveryDate ? selectedDeliveryDate : dayjs(new Date())}
                  defaultValue={selectedDeliveryDate ? selectedDeliveryDate : dayjs(new Date())}
                />
              </LocalizationProvider>
              <Stack flexDirection={'row'} justifyContent={'flex-end'} sx={{ mt: 2, gap: 2 }}>
                <Button variant="outlined" onClick={handleCloseCalendar}>
                  Cancel
                </Button>
                <Button variant="outlined" onClick={handleClearDate}>
                  Clear
                </Button>
                <Button variant="contained" onClick={handleSubmitDeliveryDate}>
                  Submit
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Dialog>
      )}
    </div>
  );
}
