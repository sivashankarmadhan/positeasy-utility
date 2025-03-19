import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { filter, find, forEach, get, groupBy, isEmpty, map } from 'lodash';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import DropDown from 'src/components/cart/DropDown';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import {
  ESTIMATE_STATUS,
  PRINT_CONSTANT,
  PaymentModeTypeConstantsCart,
  USER_AGENTS,
  IDS,
} from 'src/constants/AppConstants';
import BridgeConstants from 'src/constants/BridgeConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { StorageConstants } from 'src/constants/StorageConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import {
  allConfiguration,
  cart,
  customCode,
  customCodeList,
  customerCode,
  customerList,
  estimateCart,
  isEstimateWithNoItemsEnableState,
  noStockProducts,
  selectedBLE,
  selectedUSB,
} from 'src/global/recoilState';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import ObjectStorage from 'src/modules/ObjectStorage';
import { PATH_DASHBOARD } from 'src/routes/paths';
import SettingServices from 'src/services/API/SettingServices';
import NativeService from 'src/services/NativeService';
import PrinterService from 'src/services/PrinterService';
import AuthService from 'src/services/authService';
import PAYMENT_API from 'src/services/payment';
import PRODUCTS_API from 'src/services/products';
import STORES_API from 'src/services/stores';
import { fCurrency } from 'src/utils/formatNumber';
import { logoutBilling } from 'src/helper/logout';
import PrintableCart from 'src/components/cart/PrintableCart';
import ElectronService from 'src/services/ElectronService';
import formatPrint from 'src/utils/FormatPrint';
import { fDateTime } from 'src/utils/formatTime';

export default function EstimateSummary({
  paymentMode,
  setPaymentMode,
  bookingId,
  setBookingId,
  handleReset,
  totalOrderValue,
  gstAmount,
  gstData,
  calculateTotalPrice,
  totalValueNoOffer,
  getAllProducts,
  isLaptop,
  info,
  customerInfo,
  isOldEstimate,
  setIsError,
  isPrint,
  isCustomCodeEnabled,
  isCustomerCodeEnabled,
  orderType,
  sortedOrders,
  estimateId,
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const orders = useRecoilValue(estimateCart);
  const currentCustomerId = useRecoilValue(customerCode);
  const currentCustomCode = useRecoilValue(customCode);
  console.log(currentCustomCode);
  const shopName = AuthService.getShopName();
  const address = AuthService.getAddress();
  const theme = useTheme();
  const resetNoStocks = useResetRecoilState(noStockProducts);
  const setNoStocks = useSetRecoilState(noStockProducts);
  const totalOrderQuantity = calculateTotalQuantity(orders);
  const isMinWidth900px = useMediaQuery('(min-width:900px)');
  const isMaxWidth1250px = useMediaQuery('(max-width:1250px)');

  const [invoiceId, setInvoiceId] = useState('');
  const printInvoiceRef = useRef();
  const configuration = useRecoilValue(allConfiguration);
  const isOrderTypeEnable = get(configuration, 'isOrderType.isActive', false);
  const printType = get(configuration, 'printType', PRINT_CONSTANT.POS);
  const isMinLaptop = isMinWidth900px && isMaxWidth1250px;
  const isAddInfoMode = get(configuration, 'billingSettingsData.isBookingInfo', false);
  const formattedInfo = info ? info.split('\n') : [];
  const customCodes = useRecoilValue(customCodeList);
  const customerCodes = useRecoilValue(customerList);

  const [orderOrEstimateId, setOrderOrEstimateId] = useState({});

  const isElectron = ElectronService.isElectron();

  const isEstimateWithNoItemsEnable = useRecoilValue(isEstimateWithNoItemsEnableState);

  const printInfomationData = get(configuration, 'printInfo.printInformation');
  const printerInfo = get(configuration, 'printInfo.paperSize', PRINT_CONSTANT.POS_BLUETOOTH_80MM);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const isBluetooth = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_BLUETOOTH);
  const isLAN = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_LAN);
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
  const getPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    if (check) return check.offerPrice ? check.offerPrice : check.price;
  };
  const getProduct = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    return check;
  };
  const handlePaymentMode = (event) => {
    setPaymentMode(get(event, 'label'));
  };

  const getActualPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    if (check) return check.price;
  };
  const getOfferPrice = (curr) => {
    if (!curr) return;
    const check = find(orders, (e) => e.productId === curr);
    if (check) return check.offerPrice;
  };
  const checkOfferCart = () => {
    let a = 0;
    if (isEmpty(orders)) return 0;
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
    setOpenPrintDialog(false);
    handleReset();
  };

  const validation = () => {
    if (isEmpty(cart)) {
      toast.error(ErrorConstants.NO_ITEMS);
      return false;
    } else if (!paymentMode) {
      toast.error(ErrorConstants.PAYMENT_MODE);
      return false;
    }
    if (isEmpty(customerInfo)) {
      toast.error(ErrorConstants.CUSTOMER);
      setIsError(true);
      return false;
    } else return true;
  };
  const validationEstimate = () => {
    if (isEmpty(cart) && !isEstimateWithNoItemsEnable) {
      toast.error(ErrorConstants.NO_ITEMS);
      return false;
    }
    if (isEmpty(customerInfo)) {
      toast.error(ErrorConstants.CUSTOMER);
      setIsError(true);
      return false;
    }
    if (isEmpty(info) && isEstimateWithNoItemsEnable && isAddInfoMode) {
      toast.error(ErrorConstants.ADD_INFO);
      setIsError(true);
      return false;
    } else return true;
  };
  const serializeData = (estimate = false) => {
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
      options.push({
        quantity: e.quantity,
        price: getPrice(e.productId) * 100,
        productId: e.productId,
        ...(isOrderTypeEnable ? { type: orderType } : {}),
        GSTPercent: e.GSTPercent,
        addOns: serializeAddOn,
        name: e.name,
        ...(estimate ? {} : { paymentType: paymentMode }),
        ...(info && !isEmpty(formattedInfo)
          ? {
              additionalInfo: [
                ...map(formattedInfo, (e) => {
                  return {
                    info: e,
                  };
                }),
              ],
            }
          : {}),
        ...(!isEmpty(customerInfo) ? { customerInfo: [{ ...customerInfo }] } : {}),
        ...(get(e, 'estimateId')
          ? { estimateId: get(e, 'estimateId') }
          : estimateId
          ? { estimateId: estimateId }
          : {}),
        ...(isCustomCodeEnabled && currentCustomCode
          ? {
              customCode: currentCustomCode,
            }
          : {}),
        ...(isCustomerCodeEnabled && currentCustomerId
          ? {
              customerId: currentCustomerId,
            }
          : {}),
      });
    });
    return options;
  };

  const calculateTotalGst = () => {
    let gst = 0;
    map(orders, (e) => {
      if (e.GSTPercent > 0) gst += ((getPrice(e.productId) * e.GSTPercent) / 100) * e.quantity;
      map(get(e, 'addOns'), (d) => {
        if (d.GSTPercent > 0) gst += ((d.price * d.GSTPercent) / 100) * d.quantity * e.quantity;
      });
    });
    return gst ? gst : 0;
  };

  const checkStocks = async (e) => {
    try {
      const options = serializeData();
      const response = await PRODUCTS_API.checkStock(options);
      if (isEmpty(get(response, 'data'))) {
        handleComplete();
        resetNoStocks();
      } else {
        map(get(response, 'data'), (e) => {
          const productData = getOrderDetailsById(get(e, 'productId'));
          const product = getProduct(get(e, 'productId'));
          const units = get(product, 'unitsEnabled')
            ? `${get(product, 'unit')} ${get(product, 'unitName')}`
            : '';
          toast.error(
            `${get(e, 'name')?.toUpperCase()} ${units}  has ${
              get(productData, 'quantity') + get(e, 'quantity')
            } stocks  `
          );
        });
        setNoStocks(get(response, 'data'));
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(isCustomCodeEnabled);
  const handleEstimateWithoutItem = async () => {
    const checkValidate = validationEstimate();
    if (!checkValidate) return;
    setIsLoading(true);
    try {
      let response;
      if (isOldEstimate) {
        let options = {
          estimateId: estimateId,
          totalAmount: 0,
          GSTPrice: 0,
          orderDetails: [],
          ...(info && !isEmpty(formattedInfo)
            ? {
                additionalInfo: [
                  ...map(formattedInfo, (e) => {
                    return {
                      info: e,
                    };
                  }),
                ],
              }
            : {}),
          customerInfo: [customerInfo],

          ...(isCustomCodeEnabled && currentCustomCode
            ? {
                customCode: currentCustomCode,
              }
            : {}),
        };

        response = await STORES_API.updateEstimate(options);
      } else {
        let options = [
          {
            noItem: true,
            ...(info && !isEmpty(formattedInfo)
              ? {
                  additionalInfo: [
                    ...map(formattedInfo, (e) => {
                      return {
                        info: e,
                      };
                    }),
                  ],
                }
              : {}),
            customerInfo: [customerInfo],

            ...(isCustomCodeEnabled && currentCustomCode
              ? {
                  customCode: currentCustomCode,
                }
              : {}),
          },
        ];
        response = await STORES_API.sendEstimate(options);
      }

      setIsLoading(false);
      if (response) {
        toast.success(SuccessConstants.ADD_SUCCESSFUL);
        if (isPrint) {
          if (printType === PRINT_CONSTANT.POS) {
            handlePrint({ estimateId: get(response, 'data.estimateId') }, false, false, false);
          }
          handleReset();
          navigate(PATH_DASHBOARD.viewestimate, { replace: true, state: {} });
        } else {
          handleReset();
          navigate(PATH_DASHBOARD.viewestimate, { replace: true, state: {} });
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      toast.error(e?.response?.message || e?.errorResponse?.message);
      if (
        e?.errorResponse?.code === 'ERR_SBEE_0027' ||
        e?.errorResponse?.code === 'ERR_SBEE_0028' ||
        e?.errorResponse?.code === 'ERR_SBEE_0029' ||
        e?.errorResponse?.code === 'ERR_SBEE_0055'
      ) {
        AuthService._billingLogout();
      }
      if (e?.response?.code === 'ERR_SBEE_0994') {
        logoutBilling();
        navigate('/login', { replace: true });
      }
    }
  };
  const handleEstimate = async () => {
    const checkValidate = validationEstimate();
    if (!checkValidate) return;
    if (isEmpty(orders)) return;
    setIsLoading(true);
    try {
      let response;
      const data = serializeData(true);
      let options = {
        orderDetails: map(data, (e) => {
          const {
            quantity,
            price,
            productId,
            GSTPercent,
            addOns,
            estimateId,
            type,
            additionalInfo,
            customCode,
            customerId,
            name,
          } = e;
          return {
            quantity,
            price,
            productId,
            GSTPercent,
            addOns,
            estimateId,
            type,
            additionalInfo,
            customCode,
            customerId,
            name,
          };
        }),
        ...(isOrderTypeEnable ? { type: orderType } : {}),
        totalAmount: totalOrderValue * 100,
        estimateId: get(data, '0.estimateId', null),
        additionalInfo: get(data, '0.additionalInfo', []),
        customerInfo: get(data, '0.customerInfo', []),
        customCode: get(data, '0.customCode', ''),
      };

      if (get(data, '0.estimateId')) {
        response = await STORES_API.updateEstimate(options);
      } else {
        response = await STORES_API.sendEstimate(data);
      }
      if (response) setBookingId(get(response, 'data.orderId'));
      setIsLoading(false);
      if (response) {
        toast.success(SuccessConstants.ADD_SUCCESSFUL);
        if (isPrint) {
          if (printType === PRINT_CONSTANT.POS) {
            handlePrint({ estimateId: get(response, 'data.estimateId') }, false, false, false);
          }

          handleReset();
          navigate(PATH_DASHBOARD.viewestimate, { replace: true, state: {} });
        } else {
          handleReset();
          navigate(PATH_DASHBOARD.viewestimate, { replace: true, state: {} });
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      toast.error(e?.response?.message || e?.errorResponse?.message);
      if (
        e?.errorResponse?.code === 'ERR_SBEE_0027' ||
        e?.errorResponse?.code === 'ERR_SBEE_0028' ||
        e?.errorResponse?.code === 'ERR_SBEE_0029' ||
        e?.errorResponse?.code === 'ERR_SBEE_0055'
      ) {
        AuthService._billingLogout();
      }
      if (e?.response?.code === 'ERR_SBEE_0994') {
        logoutBilling();
        navigate('/login', { replace: true });
      }
    }
  };
  const handleComplete = async () => {
    const checkValidate = validation();
    if (!checkValidate) return;
    if (isEmpty(orders)) return;
    setIsLoading(true);
    try {
      let options;
      options = serializeData();

      if (!get(options, '0.customerInfo.0.id')) {
        const newCustomerOptions = {
          name: get(options, '0.customerInfo.0.name'),
          contactNumber: get(options, '0.customerInfo.0.contactNumber'),
          address: get(options, '0.customerInfo.0.address'),
          customField: get(options, '0.customerInfo.0.customField'),
          ...(get(options, '0.customerInfo.0.GST')
            ? { gstInfo: { GSTNumber: get(options, '0.customerInfo.0.GST') } }
            : {}),
        };
        const customer = await SettingServices.postCustomerData(newCustomerOptions);
        options = map(options, (e) => {
          return {
            ...e,
            customerId: get(customer, 'data.customerId'),
          };
        });
      }
      const response = await PAYMENT_API.makeOrder(options);

      if (response) setBookingId(get(response, 'data.orderId'));
      const invoiceOptions = map(options, (e) => {
        return {
          ...e,
          totalGST: totalGST,
          totalOffer: totalOffer,
          grandTotal: totalOrderValue,
          subTotal: totalValueNoOffer,
          invoiceId: get(response, 'data.orderId'),
        };
      });
      const invoicePayload = {
        orderDetails: invoiceOptions,
        ...(isOrderTypeEnable ? { type: orderType } : {}),
        totalAmount: totalOrderValue * 100,
        estimateId: get(invoiceOptions, '0.estimateId', null),
        additionalInfo: get(invoiceOptions, '0.additionalInfo', []),
        customerInfo: get(invoiceOptions, '0.customerInfo', []),
        status: ESTIMATE_STATUS.COMPLETED,
      };
      await STORES_API.updateEstimate(invoicePayload);
      setIsLoading(false);
      if (response) {
        toast.success(SuccessConstants.ADD_SUCCESSFUL);
        ObjectStorage.setItem(StorageConstants.PAYMENT_MODE, { mode: paymentMode });
        if (isPrint) {
          if (printType === PRINT_CONSTANT.POS) {
            if (get(printInfomationData, 'merchantCopy', true)) {
              handlePrint({ orderId: get(response, 'data.orderId') }, false, true);
              setTimeout(() => {
                handlePrint({ orderId: get(response, 'data.orderId') }, true, false);
                if (get(printInfomationData, 'counterwise', false)) {
                  setTimeout(() => {
                    handlePrint({ orderId: get(response, 'data.orderId') }, false, false, true);
                  }, 500);
                }
              }, 500);
            } else {
              handlePrint({ orderId: get(response, 'data.orderId') });
              if (get(printInfomationData, 'counterwise', false)) {
                setTimeout(() => {
                  handlePrint({ orderId: get(response, 'data.orderId') }, false, false, true);
                }, 500);
              }
            }
          }
          if (printType === PRINT_CONSTANT.PDF) {
            setInvoiceId(get(response, 'data.orderId'));
            setTimeout(() => {
              handleReset();
            }, 1000);
          }
        } else {
          handleReset();
          navigate(PATH_DASHBOARD.viewestimate, { replace: true, state: {} });
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      toast.error(e?.response?.message || e?.errorResponse?.message);
      if (
        e?.errorResponse?.code === 'ERR_SBEE_0027' ||
        e?.errorResponse?.code === 'ERR_SBEE_0028' ||
        e?.errorResponse?.code === 'ERR_SBEE_0029' ||
        e?.errorResponse?.code === 'ERR_SBEE_0055'
      ) {
        AuthService._billingLogout();
     
      }
      if (e?.response?.code === 'ERR_SBEE_0994') {
        logoutBilling();
        navigate('/login', { replace: true });
      }
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

  const handlePrint = async (
    { orderId, estimateId },
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
        estimateId: estimateId,
        orderDate: fDateTime(new Date(), 'dd/MM/yyyy p'),
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
        printerInfo: {
          printType: printerInfo,
          ...(isBluetooth
            ? {
                macAddress: get(selectedBLEPrinter, 'macAddress', ''),
              }
            : {
                vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                productId: get(selectedUSBPrinter, 'productId', ''),
              }),
        },
        totalOffer: totalOffer,
        paymentStatus: orderId ? 'PAID' : estimateId ? 'ESTIMATE' : '',
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
                  : {
                      vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                      productId: get(selectedUSBPrinter, 'productId', ''),
                    }),
              },
            },
          },
        ];
        NativeService.sendAndReceiveNativeData(nativeRequest)
          .then((response) => {
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
                    : {
                        vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                        productId: get(selectedUSBPrinter, 'productId', ''),
                      }),
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
        if (isCounterWise) {
          for (let printCounterData of formatAndroidPrint) {
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
                      : {
                          vendorId: get(selectedUSBPrinter, 'vendorId', ''),
                          productId: get(selectedUSBPrinter, 'productId', ''),
                        }),
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
        // PrinterService.nodePrint(JSON.stringify(printData));
        if (isElectron) PrinterService.nodePrint();
        else {
          if (orderId) {
            setOrderOrEstimateId({
              name: IDS.ORDER_ID,
              value: orderId,
            });
          } else if (estimateId) {
            setOrderOrEstimateId({
              name: IDS.ESTIMATE_ID,
              value: estimateId,
            });
          }
          setTimeout(() => {
            window.print();
          }, 500);
        }
      }
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          handleClosePrintDialog();
          navigate(PATH_DASHBOARD.viewestimate, { replace: true, state: {} });
          // handleReset();
          resolve();
        }, 2000);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const totalOffer = checkOfferCart();
  const totalGST = calculateTotalGst();
  const sortedData = serializeForPrint();
  const totalQuantity = calculateTotalQuantity(orders);

  useEffect(() => {
    const currentPaymentMode = ObjectStorage.getItem(StorageConstants.PAYMENT_MODE);
    setPaymentMode(get(currentPaymentMode, 'mode'));
  }, []);

  console.log('estimateId', estimateId);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: '#FFFFFF',
        }}
      >
        <PrintableCart
          totalGST={totalGST}
          totalDiscount={totalOffer}
          sortedData={sortedData}
          totalQuantity={totalQuantity}
          totalValueNoOffer={totalValueNoOffer}
          totalOrderValue={totalOrderValue}
          printerInfo={printerInfo}
          orderId={
            get(orderOrEstimateId, 'name') === IDS.ORDER_ID ? get(orderOrEstimateId, 'value') : null
          }
          estimateId={
            get(orderOrEstimateId, 'name') === IDS.ESTIMATE_ID
              ? get(orderOrEstimateId, 'value')
              : null
          }
        />
      </div>
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
        }}
        id="noprint"
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

        <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Total No Of Items</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
            {' '}
            {!isEmpty(orders) ? orders.length : 0}
          </Typography>
        </Stack>
        <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Total Order Quantity</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>{totalOrderQuantity}</Typography>
        </Stack>
        <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Order Summary</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
            {fCurrency(totalValueNoOffer)}
          </Typography>
        </Stack>
        <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>Total Discount</Typography>

          <Stack flexDirection="row" alignItems="center" justifyContent={'flex-start'} gap={1}>
            <Typography sx={{ fontSize: '12px' }}>-</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
              {fCurrency(totalOffer)}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction={'row'} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography sx={{ fontSize: '12px', opacity: 0.6 }}>GST</Typography>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            <Typography sx={{ fontSize: '12px' }}>+</Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
              {fCurrency(totalGST)}
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
            pt: get(gstData, 'gstEnabled') ? 2 : 1.2,
            mt: 1,
            pb: get(gstData, 'gstEnabled') ? 0.5 : 0,
          }}
        >
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>Total Amount</Typography>

          <Typography
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            {fCurrency(totalOrderValue)}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        sx={{ visibility: isOldEstimate ? 'visible' : 'hidden' }}
        flexDirection="row"
        alignItems="center"
        gap={2}
        my={1}
        id="noprint"
      >
        <DropDown
          label="Payment type"
          handleChange={(e) => handlePaymentMode(e)}
          items={map(PaymentModeTypeConstantsCart, (_item) => ({
            label: _item.name,
          }))}
          value={paymentMode}
        />
      </Stack>

      <Stack className="EstimateStep5" flexDirection={'row'} sx={{ gap: 1, mt: 1 }} id="noprint">
        <Button
          disabled={isEmpty(customerInfo) || (isEmpty(orders) && !isEstimateWithNoItemsEnable)}
          className={'pay_button'}
          onClick={() => {
            isEstimateWithNoItemsEnable ? handleEstimateWithoutItem() : handleEstimate();
          }}
          fullWidth
          type="submit"
          sx={{
            alignSelf: 'center',
            fontSize: 16,
            height: 40,
            mt: isCustomCodeEnabled || isCustomerCodeEnabled ? 0 : '.3rem',
            '&:hover': {
              boxShadow: 'none',
            },
            whiteSpace: 'nowrap',
          }}
          variant="contained"
        >
          {isOldEstimate ? 'Update Estimate' : 'Estimate'}
        </Button>

        {isOldEstimate && (
          <Button
            disabled={isEmpty(orders)}
            className={(!isEmpty(orders) ? orders.length : 0) !== 0 ? 'pay_button' : ''}
            onClick={() => {
              checkStocks();
            }}
            fullWidth
            type="submit"
            sx={{
              alignSelf: 'center',
              fontSize: 16,
              height: 40,
              mt: isCustomCodeEnabled || isCustomerCodeEnabled ? 0 : '.3rem',
              '&:hover': {
                boxShadow: 'none',
              },
              whiteSpace: 'nowrap',
            }}
            variant="contained"
          >
            Convert to Bill
          </Button>
        )}
      </Stack>
    </>
  );
}
