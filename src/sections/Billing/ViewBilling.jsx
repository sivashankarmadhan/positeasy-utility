import { Helmet } from 'react-helmet-async';
// @mui
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  alpha,
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  Divider,
  Fab,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  Tab,
  TablePagination,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// components
import AddIcon from '@mui/icons-material/Add';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { find, forEach, get, isEmpty, isEqual, lowerCase, map, reduce, some } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import { useSettingsContext } from 'src/components/settings';
import {
  CHANGE_ORDER_STATUS_TYPES,
  CHANGE_ORDER_STATUS_TYPES_SHOW,
  hideScrollbar,
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TYPES,
  ORDER_STATUS_TYPES_LABELS,
  ORDER_STATUS_VALUES,
  ORDER_TYPE,
  PARTIAL_BILLING_TABS,
  PAYMENT_TYPE_VALUES,
  PRINT_CONSTANT,
  ROLES_DATA,
  USER_AGENTS,
} from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { estimateViewTourConfig } from 'src/constants/TourConstants';
import {
  alertDialogInformationState,
  allConfiguration,
  billingProducts,
  currentStoreId,
  currentTerminalId,
  selectedBLE,
  selectedLAN,
  selectedUSB,
  reportSummaryState,
  billingState,
  stores,
} from 'src/global/recoilState';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { convertToRupee } from 'src/helper/ConvertPrice';
import { PATH_DASHBOARD } from 'src/routes/paths';
import AuthService from 'src/services/authService';
import { fCurrency, toFixedIfNecessary } from 'src/utils/formatNumber';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { capitalCaseTransform } from 'change-case';
import moment from 'moment';
import uuid from 'react-uuid';
import StartAndEndDatePickerProps from 'src/components/DateRangePickerRsuitWithProps';
import StartAndEndDatePicker from 'src/components/DateRangePickerRsuite';
import KebabMenu from 'src/components/KebabMenu';
import PrintableCart from 'src/components/cart/PrintableCart';
import Label from 'src/components/label';
import BridgeConstants from 'src/constants/BridgeConstants';
import RouterConstants from 'src/constants/RouterConstants';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import { calculateTotalQuantity } from 'src/helper/calculateTotalQuantity';
import { filterShortCode } from 'src/helper/filterShortCode';
import SettingServices from 'src/services/API/SettingServices';
import ElectronService from 'src/services/ElectronService';
import NativeService from 'src/services/NativeService';
import PrinterService from 'src/services/PrinterService';
import PAYMENT_API from 'src/services/payment';
import PRODUCTS_API from 'src/services/products';
import formatPrint from 'src/utils/FormatPrint';
import formatAdditionalInfo from 'src/utils/formatAdditionalInfo';
import {
  fDatesWithTimeStampFromUtc,
  fDatesWithTimeStampWithDayjs,
  fDateTime,
  IndFormat,
} from 'src/utils/formatTime';
import getTotalPriceAndGst from 'src/utils/getTotalPriceAndGst';
import AddCustomerInfo from '../Customer/AddCustomerInfo';
import AddPayment from './AddPayment';
import ViewAdditionalInfo from './ViewAdditionalInfo';
import ViewAdvancePaymentInfoList from './ViewAdvancePaymentInfoList';
import ViewBillingOrderList from './ViewBillingOrderList';
import ViewCustomerDetails from './ViewCustomerDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DialogComponent from '../WhatsappCredits/Dialog';
import Iconify from 'src/components/iconify';
import ObjectStorage from 'src/modules/ObjectStorage';
import { ROLE_STORAGE } from 'src/constants/StorageConstants';
import { RotatingLines } from 'react-loader-spinner';
import AddRefundPayment from './AddRefundPayment';

// ----------------------------------------------------------------------

export default function ViewBilling() {
  const [customerCodes, setCustomerCodes] = useState([]);
  const [searchContacts, setSearchContacts] = useState('');

  const handleContactClear = () => {
    setSearchContacts('');
  };

  const isError = searchContacts.length > 0 && searchContacts.length !== 10;

  const [orderList, setOrderList] = useState([]);
  // const [filterOrderList, setFilterOrderList] = useState([]);
  // const [currentStatus, setCurrentStatus] = useState(ORDER_STATUS.FULL_PAYMENT); //CHANGE AFTER BACKEND FOR ALL
  const [currentStatus, setCurrentStatus] = useState([]);
  const startDate = useRecoilValue(currentStartDate);
  const endDate = useRecoilValue(currentEndDate);
  const [isBillingState, setIsBillingState] = useRecoilState(billingState);
  const currentStore = useRecoilValue(currentStoreId);
  const [startDeliveryDate, setStartDeliveryDate] = useState();
  const [endDeliveryDate, setEndDeliveryDate] = useState();
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isElectron = ElectronService.isElectron();
  const [customers, setCustomers] = useState([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  // const [paymentDetails, setPaymentDetails] = useState([]);
  const [selectedList, setSelectedList] = useState({});
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenRefundModal, setIsOpenRefundModal] = useState(false);
  const isAndroid = window.navigator.userAgent === USER_AGENTS.REACT_NATIVE;
  const isAndroidRawPrint = window.navigator.userAgent.includes(USER_AGENTS.PRINT_RAW);
  const [reportSummary, setReportSummary] = useRecoilState(reportSummaryState);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [customerDetails, setCustomerDetails] = useState({});
  const [currentTerminal, setCurrentTerminal] = useRecoilState(currentTerminalId);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  const isInitialRender = useRef(true);

  const theme = useTheme();
  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();
  const [searchOrderId, setSearchOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEbillDialogue, setIsEbillDialogue] = useState(false);

  const [isOpenKeyEnter, setIsOpenKeyEnter] = useState(false);

  const isMinWidth900px = useMediaQuery('(min-width:900px)');
  const isMobile = useMediaQuery('(max-width:600px)');
  const isTab = useMediaQuery('(max-width:980px)');
  const configuration = useRecoilValue(allConfiguration);
  const featureSettings = get(configuration, 'featureSettings', {});
  const isShowBillng = get(featureSettings, 'isShowBillng', false);
  const printMode = get(configuration, 'savePrint', false);
  const [lastElement, setLastElement] = useState(null);
  const [currentTab, setCurrentTab] = useState(PARTIAL_BILLING_TABS.ORDERS);
  const printInfomationData = get(configuration, 'printInfo.printInformation');
  const staffPermissions = get(configuration, 'staffPermissions', {});

  const additionalDiscountConfig = get(configuration, 'billingSettings.additionalDiscount', false);
  const additionalChargesConfig = get(configuration, 'billingSettings.additionalCharges', false);
  const packingChargesConfig = get(configuration, 'billingSettings.packingCharges', false);
  const deliveryChargesConfig = get(configuration, 'billingSettings.deliveryCharges', false);
  const deliveryDateConfig = get(configuration, 'billingSettings.isAllowDeliveryDateChange', false);
  const totalProducts = useRecoilValue(billingProducts);
  const isCustomerCodeEnabled = get(configuration, 'customerManagement', false);
  const formattedProducts = filterShortCode(totalProducts);

  const { role } = ObjectStorage.getItem(ROLE_STORAGE.ROLE) || {};
  const isManager = role === ROLES_DATA.store_manager.role;

  const [isDesc, setIsDesc] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);

  const printerInfo = get(configuration, 'printInfo.paperSize', PRINT_CONSTANT.POS_BLUETOOTH_80MM);
  const isBluetooth = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_BLUETOOTH);
  const isLAN = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_LAN);
  const isUSB = printerInfo && printerInfo.includes(PRINT_CONSTANT.POS_USB);
  const selectedBLEPrinter = useRecoilValue(selectedBLE);
  const selectedUSBPrinter = useRecoilValue(selectedUSB);
  const selectedLANPrinter = useRecoilValue(selectedLAN);
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
  const handleChanges = () => {
    setIsDesc((prev) => !prev);
  };

  const printInvoiceRef = useRef();
  const [invoiceId, setInvoiceId] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState([ORDER_STATUS_TYPES.COMPLETED]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openAdditionalInfoDrawer, setOpenAdditionalInfoDrawer] = useState(false);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [hide, setHide] = useState(false);
  const isAllowEdit =
    get(staffPermissions, 'isAllowEditAndDelete') ||
    currentRole === ROLES_DATA.master.role ||
    currentRole === ROLES_DATA.store_manager.role;
  const [isOpenAddCustomerModal, setIsOpenAddCustomerModal] = useState(false);

  const isDynamicQR = isEmpty(get(orderDetails, 'paymentsInfo'))
    ? false
    : get(orderDetails, 'paymentsInfo')?.[0]?.gatewaySource !== 'MANUAL';

  const isPaymentRefundDone = selectedList?.paymentStatus === 'REFUND_INITIATED';

  const openModal = () => {
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
  };

  const openRefundModal = () => {
    setIsOpenRefundModal(true);
  };

  const closeRefundModal = () => {
    setIsOpenRefundModal(false);
  };

  const openCustomerModal = () => {
    setIsOpenAddCustomerModal(true);
  };
  console.log('isBillingState', isBillingState);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEbilling = async () => {
    try {
      const res = await SettingServices.getEbillSetting();
      setIsBillingState(res?.data?.ebillSettings?.isEbill);
    } catch (err) {
      console.log(err);
    }
  };

  const totalOrderQuantity = reduce(
    orderDetails.ordersInfo,
    (acc, value) => acc + value.quantity,
    0
  );

  const storesList = useRecoilValue(stores);
  const getStoreName = (storeId) => {
    const terminals = find(storesList, (e) => e.storeId === storeId);
    if (isEmpty(terminals)) return '';
    return get(terminals, 'storeName');
  };
  const storeName = getStoreName(currentStore);

  const handleSendEbill = async () => {
    try {
      const options = {
        contactNumber: customerDetails?.contactNumber,
        paymentId: get(selectedList, 'paymentId'),
        storeName: storeName,
        storeId: currentStore,
      };
      await SettingServices.sendEbilling(options);
      setIsEbillDialogue(false);
      toast.success(SuccessConstants.SENT_SUCCESSFUL);
    } catch (err) {
      console.log(err, 'err');
      toast.error(err?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const responseCustomerCodes = await SettingServices.getCustomerData();
      const customerCodes = responseCustomerCodes?.data?.reverse() || [];
      setCustomerCodes(customerCodes);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  useEffect(() => {
    getEbilling();
    fetchCustomerData();
  }, []);

  const updateCustomerDetails = async (options) => {
    try {
      const response = await PRODUCTS_API.addEditCustomerOnBill(options);
      if (response) {
        getOrderList({ newTotalPage: null, newPage: page, size });
        toast.success('Customer information updated!');
        setCustomerDetails(options);
      }
    } catch (error) {
      toast.error(error?.message || ErrorConstants.FAILED_TO_GET_ORDER_DETAILS);
    }
  };
  const closeCustomerModal = (options, noChange = false) => {
    setIsOpenAddCustomerModal(false);
    if (!isEmpty(options) && !noChange)
      updateCustomerDetails({
        customerId: get(options, 'id'),
        ...options,
        paymentId: get(selectedList, 'paymentId'),
      });
  };
  const checkCurrentStatus = (status) => {
    const isSelected = some(currentStatus, (e) => e === status);
    return isSelected;
  };
  const checkCurrentOrderStatus = (status) => {
    const isSelected = some(selectedOrderStatus, (e) => e === status);
    return isSelected;
  };
  const handleChangeOrderId = (e) => {
    setSearchOrderId(e.target.value);
  };
  const handleChangeStatus = (list, value) => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure you want to change the status from ${get(
        selectedList,
        'status'
      )} to ${value} ?`,
      actions: {
        primary: {
          text: 'Change',
          onClick: async (onClose) => {
            updateOrderStatus(list, value);
            setShowOrderDetails(false);
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
  const updateOrderStatus = async (data, status) => {
    try {
      const options = {
        paymentId: get(data, 'paymentId'),
        orderId: get(data, 'orderId'),
        status: status,
        storeId: currentStore,
      };
      const response = await PRODUCTS_API.updateOrderStatus(options);
      getOrderList({ newTotalPage: null, newPage: page, size });
      setSelectedList({});
      if (response) toast.success('Status Changed');
    } catch (e) {
      console.log(e);
    }
  };
  const [openMenu, setOpenMenuActions] = useState(null);
  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const observer = useRef(
    new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        setPage((no) => no + 1);
      }
    })
  );

  const getPriceWithGST = (e) => {
    const {
      withGstAmount,
      withoutGstAmount,
      parcelCharges,
      parcelChargesWithGst,
      parcelChargesWithoutGst,
      gstPercentageValue,
    } = getTotalPriceAndGst({
      price: e?.offerPrice || e?.price,
      GSTPercent: e?.GSTPercent,
      GSTInc: e?.GSTInc,
      fullData: e,
    });

    let price = (withoutGstAmount + parcelChargesWithoutGst + gstPercentageValue) / 100;

    let addOnPrice = 0;
    map(get(e, 'addOns.addons'), (d) => {
      const { gstPercentageValue, withoutGstAmount } = getTotalPriceAndGst({
        price: d?.price,
        GSTPercent: d?.GSTPercent,
        GSTInc: d?.GSTInc,
        fullData: d,
      });

      if (get(d, 'GSTPercent') > 0) {
        const gst = (gstPercentageValue / 100) * Number(get(d, 'quantity'));
        const amt = (withoutGstAmount / 100) * Number(get(d, 'quantity'));
        addOnPrice += amt + gst;
      } else {
        addOnPrice += (withoutGstAmount / 100) * Number(get(d, 'quantity'));
      }
    });

    return price + addOnPrice;
  };
  const getTotalPriceWithGST = (data) => {
    let total = 0;
    map(data, (e, index) => {
      total += getPriceWithGST(e);
    });
    return total || 0;
  };
  const calculateTotalGst = (data) => {
    let gst = 0;
    map(data, (e) => {
      const { gstPercentageValue } = getTotalPriceAndGst({
        price: e?.offerPrice || e?.price,
        GSTPercent: e?.GSTPercent,
        GSTInc: e?.GSTInc,
        fullData: e,
      });

      if (e.GSTPercent > 0) gst += (gstPercentageValue / 100) * e.quantity;
      map(get(e, 'addOns.addons'), (d) => {
        if (d.GSTPercent > 0) gst += (gstPercentageValue / 100) * d.quantity * e.quantity;
      });
    });
    return gst ? gst : 0;
  };

  const getActualPrice = (curr, orderDetails) => {
    if (!curr) return;
    const check = find(orderDetails, (e) => e.productId === curr);
    if (check) {
      const { withoutGstAmount } = getTotalPriceAndGst({
        price: check?.price,
        GSTPercent: check?.GSTPercent,
        GSTInc: check?.GSTInc,
        fullData: check,
      });
      return withoutGstAmount;
    }
  };

  const calculateActualTotalPrice = (orderDetails) => {
    if (isEmpty(orderDetails)) return 0;
    let totalPrice = 0;
    map(orderDetails.ordersInfo, (e) => {
      if (isEmpty(e?.addOn)) {
        totalPrice += getActualPrice(e.productId, orderDetails.ordersInfo) * e.quantity;
      } else if (!isEmpty(e?.addOn)) {
        let totalAddonPrice = 0;
        map(e?.addOn, (d) => {
          totalAddonPrice += d.price * d.quantity;
        });
        totalPrice += getActualPrice(e.productId, orderDetails) + totalAddonPrice * e.quantity;
      }
    });
    return totalPrice;
  };

  const calculateTotalParcelCharges = (data) => {
    let parcelCharges = 0;
    map(data, (e) => {
      if (e?.parcelCharges) {
        const parcelChargesGstValue = e?.parcelCharges * (e?.GSTPercent / 100) || 0;
        if (e?.GSTInc) {
          parcelCharges += (e?.parcelCharges - parcelChargesGstValue) * e.quantity;
        } else {
          parcelCharges += e?.parcelCharges * e.quantity;
        }
      }
      map(get(e, 'addOns.addons'), (d) => {
        if (e?.parcelCharges) {
          parcelCharges += d?.parcelCharges * d.quantity * e.quantity;
        }
      });
    });
    return parcelCharges ? parcelCharges : 0;
  };

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;
    // if (currentElement) {
    //   currentObserver.observe(currentElement);
    // }
    // return () => {
    //   if (currentElement) {
    //     currentObserver.unobserve(currentElement);
    //   }
    // };
  }, [lastElement]);

  const handleChange = (newValue) => {
    setCurrentStatus(newValue);
  };
  const handleChangeOrderStatus = (newValue) => {
    setSelectedOrderStatus(newValue);
  };
  const serializeForPrint = (data) => {
    const options = [];
    if (isEmpty(data)) return;
    map(data, (e) => {
      let serializeAddOn = [];
      map(get(e, 'addOns.addons'), (d) => {
        serializeAddOn.push({
          quantity: get(d, 'quantity') * get(e, 'quantity'),
          price: convertToRupee(get(d, 'price')),
          name: get(d, 'name'),
        });
      });
      options.push({
        quantity: get(e, 'quantity'),
        price: convertToRupee(get(e, 'price')),
        addOns: serializeAddOn,
        name: get(e, 'productInfo.name') || get(e, 'name'),
        unit: get(e, 'unit') ? `${get(e, 'unit')}${get(e, 'unitName')}` : '',
      });
    });
    return options;
  };

  const handleReprint = () => {
    try {
      const formatData = serializeForPrint(get(orderDetails, 'ordersInfo.orders'));
      console.log('orderDetails', orderDetails);
      let printData = {
        orderDate: fDateTime(get(orderDetails, 'ordersInfo.createdAt'), 'dd/MM/yyyy p'),
        orderId: get(orderDetails, 'ordersInfo.orderId'),
        title: get(printInfomationData, 'shopName'),
        subTitle: get(printInfomationData, 'address'),
        items: formatData,
        header: get(printInfomationData, 'header'),
        itemCounterWise: [],
        totalAmount:
          getTotalPriceWithGST(get(orderDetails, 'ordersInfo.orders')) -
          calculateTotalGst(get(orderDetails, 'ordersInfo.orders')),
        footerMain: get(printInfomationData, 'footer'),
        footer2: '',
        poweredBy: '',
        totalQty: calculateTotalQuantity(get(orderDetails, 'ordersInfo.orders')),
        totalCartItems: get(orderDetails, 'ordersInfo.orders').length,
        gstAmount: calculateTotalGst(get(orderDetails, 'ordersInfo.orders')),
        totalWithGst: getTotalPriceWithGST(get(orderDetails, 'ordersInfo.orders')),
        totalOffer: 0,
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
        paymentStatus: 'PAID',
        reprint: true,
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
        const nativeRequest = [
          {
            name: BridgeConstants.PRINT_RAW,
            data: {
              printerName: 'BlueTooth Printer',
              printRawData: formatPrint(printData, sizeMap[printerInfo], false, false),
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
      } else {
        // PrinterService.nodePrint(JSON.stringify(printData));
        if (isElectron) PrinterService.nodePrint();
        else
          setTimeout(() => {
            window.print();
          }, 500);
      }

      // setTimeout(() => {
      //   handleClosePrintDialog();
      // }, 1000);
    } catch (e) {
      console.log(e);
    }
  };

  const getOrderList = async ({ newTotalPage, newPage, size }) => {
    const totalPages = Math.ceil(newTotalPage / size);

    if (newPage < 0 || newPage > totalPages) {
      return;
    }

    try {
      setIsListLoading(true);
      let res = await PRODUCTS_API.getOrdersList(
        {
          startDate: IndFormat({ startDate }),
          endDate: IndFormat({ endDate }),
          ...(startDeliveryDate && endDeliveryDate
            ? {
                delStart: IndFormat({ startDate: startDeliveryDate }),
                delEnd: IndFormat({ endDate: endDeliveryDate }),
              }
            : {}),
          size,
          page: newPage + 1,
          ...(searchOrderId ? { orderId: searchOrderId } : {}),
          ...(startDeliveryDate ? { deliverySort: isDesc ? 'latest' : 'oldest' } : {}),
          ...(searchContacts && {
            contactNumber: `91${searchContacts}`,
          }),
        },
        { paymentTypes: currentStatus, orderStatus: selectedOrderStatus }
      );

      // if (newPage === 1) {
      //   setOrderList(get(res, 'data.data'));
      //   setTotalPages(get(res, 'data.totalPages'));
      // } else {
      //   setOrderList((prev) => [...prev, ...get(res, 'data.data')]);
      // }
      setOrderList(get(res, 'data.data'));
      setTotalPages(get(res, 'data.totalItems'));
    } catch (error) {
      console.log('error', error);
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_GET_ORDERS_LIST);
    } finally {
      setIsListLoading(false);
    }
  };

  const getOrderDetails = async () => {
    try {
      setOrderDetailsLoading(true);
      let res;
      const orderDetailsRes = await PRODUCTS_API.getOrderDetails({
        paymentId: get(selectedList, 'paymentId'),
      });

      let paymentDetailsRes = {};

      try {
        paymentDetailsRes = await PRODUCTS_API.getPaymentDetails({
          paymentId: get(selectedList, 'paymentId'),
        });
      } catch (e) {
        setOrderDetailsLoading(false);
        console.log('e', e);
      }

      res = {
        data: {
          ordersInfo: get(orderDetailsRes, 'data'),
          paymentsInfo: get(paymentDetailsRes, 'data'),
        },
      };

      setOrderDetails(get(res, 'data'));
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_GET_ORDER_DETAILS);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (searchContacts.length === 10 || searchContacts.length === 0) {
      getOrderList({ newTotalPage: totalPages, newPage: page, size, searchContacts });
    }
  }, [page, size]);

  useEffect(() => {
    if (searchContacts.length === 10 || searchContacts.length === 0 || searchContacts === '') {
      if (!isInitialRender.current) {
        if (page === 0) {
          setSelectedList({});
          setTotalPages(0);
          setCurrentTab(PARTIAL_BILLING_TABS.ORDERS);
          setOrderList([]);
          getOrderList({ newTotalPage: null, newPage: page, size });
        } else {
          setPage(0);
          setSelectedList({});
          setTotalPages(0);
          setOrderList([]);
          setCurrentTab(PARTIAL_BILLING_TABS.ORDERS);
        }
      } else {
        isInitialRender.current = false;
      }
      setShowOrderDetails(false);
    }
  }, [
    startDate,
    isDesc,
    endDate,
    currentStatus,
    currentStore,
    searchOrderId,
    currentTerminal,
    selectedOrderStatus,
    startDeliveryDate,
    endDeliveryDate,
    searchContacts,
    // page,
  ]);

  useEffect(() => {
    return () => {
      isInitialRender.current = true;
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(selectedList)) {
      getOrderDetails();
    } else {
      setOrderDetails([]);
    }
  }, [selectedList]);

  // useEffect(() => {
  //   if (currentTab == PARTIAL_BILLING_TABS.PAYMENT_INFO) {
  //     getPaymentDetails();
  //   } else {
  //     setPaymentDetails([]);
  //   }
  // }, [currentTab, selectedList]);

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = observer.current;
    // if (currentElement) {
    //   currentObserver.observe(currentElement);
    // }
    // return () => {
    //   if (currentElement) {
    //     currentObserver.unobserve(currentElement);
    //   }
    // };
  }, [lastElement]);

  const handleChangeTab = (e, value) => {
    setCurrentTab(value);
  };
  const isCredit = get(selectedList, 'type') === ORDER_STATUS.CREDIT;

  const postPayment = async (data, reset, fullPayment = false) => {
    try {
      await PRODUCTS_API.postPayment({
        [isCredit ? 'paymentId' : 'oldPaymentId']: get(selectedList, 'paymentId'),
        paymentType: get(data, 'type', ORDER_STATUS.PARTIAL),
        mode: get(data, 'mode', 'CASH'),
        amount: Number(get(data, 'amount')) * 100,
      });
      reset({ amount: '', mode: '' });
      closeModal();
      setPage(0);
      setSelectedList({});
      getOrderList({ newPage: 0, newTotalPage: totalPages, size });
      setShowOrderDetails(false);
      toast.success(SuccessConstants.PAYMENT_IS_SUCCESSFUL);
    } catch (error) {
      console.log('error', error);
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_PAYMENT);
    }
  };

  const postRefundPayment = async (data, reset) => {
    try {
      await PRODUCTS_API.postRefundPayment({
        paymentId: get(selectedList, 'paymentId'),
        type: get(data, 'type'),
        refundAmount: Number(get(data, 'amount')) * 100,
      });
      reset({ amount: '' });
      closeRefundModal();
      setPage(0);
      setSelectedList({});
      getOrderList({ newPage: 0, newTotalPage: totalPages, size });
      setShowOrderDetails(false);
      setOrderDetails({});
      toast.success(SuccessConstants.REFUND_PAYMENT_IS_SUCCESSFUL);
    } catch (error) {
      console.log('error', error);
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_PAYMENT);
    }
  };

  const creditPayment = async (data, reset, fullPayment = false) => {
    try {
      await PRODUCTS_API.creditPayment({
        paymentId: get(selectedList, 'paymentId'),
        paymentType: get(data, 'type', ORDER_STATUS.PARTIAL),
        mode: get(data, 'mode', 'CASH'),
        amount: Number(get(data, 'amount')) * 100,
      });
      reset({ amount: '', mode: '' });
      closeModal();
      setPage(0);
      setSelectedList({});
      getOrderList({ newPage: 0, newTotalPage: totalPages, size });
      setShowOrderDetails(false);
      toast.success(SuccessConstants.PAYMENT_IS_SUCCESSFUL);
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_PAYMENT);
    }
  };
  const getCustomerDetails = async () => {
    const customerId = get(selectedList, 'customerId');
    if (!customerId) {
      setCustomerDetails({});
      return;
    }
    try {
      const res = await PRODUCTS_API.getCustomerDetails({
        customerId,
      });
      setCustomerDetails(get(res, 'data', {}));
    } catch (error) {
      console.log('error', error);
    }
  };
  const getCustomers = async () => {
    try {
      const responseCustomerCodes = await SettingServices.getCustomerData();
      setCustomers(get(responseCustomerCodes, 'data', [])?.reverse());
    } catch (error) {
      console.log('error', error);
    }
  };
  const handleCheckStatus = async () => {
    setIsLoading(true);
    try {
      const transactionId = get(orderDetails, 'paymentsInfo.0.paymentId');
      const options = {
        transactionId,
      };
      const response = await PAYMENT_API.verifyPayment(options);
      const isSameTransaction = get(response, 'data.paymentId') === transactionId;
      const isSuccess = get(response, 'data.paymentStatus') === 'COMPLETED' && isSameTransaction;

      if (isSuccess) {
        toast.success(`Transaction is ${lowerCase(get(response, 'data.paymentStatus'))}`);
      } else {
        toast.error(`Transaction is ${lowerCase(get(response, 'data.paymentStatus'))}`);
      }
    } catch (error) {
      toast.error(error?.message ?? ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };
  console.log('customerDetails', customerDetails);
  const deleteOrder = async (onClose) => {
    try {
      const options = {
        orderId: get(selectedList, 'orderId'),
        paymentId: get(selectedList, 'paymentId'),
      };
      const response = await PAYMENT_API.deleteOrder(options);
      if (response) {
        onClose();
        setPage(0);
        setSelectedList({});
        getOrderList({ newPage: 0, newTotalPage: totalPages, size });
        setShowOrderDetails(false);
        toast.success(SuccessConstants.DELETED_SUCCESSFUL);
      }
    } catch (error) {
      toast.error(
        error?.message ?? error?.errorResponse?.message ?? ErrorConstants.SOMETHING_WRONG
      );
    }
  };

  const handleDeleteOrder = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to clear orderId #${get(selectedList, 'orderId')} ?`,
      actions: {
        primary: {
          text: 'Clear',
          onClick: async (onClose) => {
            deleteOrder(onClose);
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

  const handleEditOrder = () => {
    const formatOrders = [];

    const meta = selectedList;
    const payments = get(orderDetails, 'paymentsInfo');

    console.log('orderDetails', orderDetails);

    forEach(get(orderDetails, 'ordersInfo'), (_order) => {
      const findProduct = find(formattedProducts, (_product) => {
        return get(_product, 'productId') === get(_order, 'productId');
      });
      const currentTimestamp = new Date().getTime();
      const cartId = `${uuid()}:${currentTimestamp}`;

      console.log('meta', meta, findProduct, _order, selectedList);

      const selectedProducts = {
        cartId,
        ...(findProduct || {}),
        ...(meta || {}),
        ...(_order || {}),
        parcelCharges: get(findProduct, 'parcelCharges') || '',
        isParcelCharges: get(_order, 'parcelCharges') ? true : false,
        GSTPrice: get(meta, 'GSTPrice') / 100,
        additionalCharges: get(meta, 'additionalCharges') / 100,
        additionalDiscount: get(meta, 'additionalDiscount') / 100,
        deliveryCharges: get(meta, 'deliveryCharges') / 100,
        packingCharges: get(meta, 'packingCharges') / 100,
        orderAmount: get(meta, 'orderAmount') / 100,
        roundOff: get(meta, 'roundOff') / 100,
        ...(get(meta, 'type') === 'PARTIAL'
          ? {
              advance:
                reduce(
                  get(orderDetails, 'paymentsInfo'),
                  function (previousValue, current) {
                    return previousValue + get(current, 'paidAmount');
                  },
                  0
                ) / 100,
            }
          : {}),
        price: get(_order, 'price') / 100,
        tableName: get(meta, 'additionalInfo.tableName'),
        overAllAdditionalInfo: meta?.additionalInfo?.['0']?.info,
      };

      formatOrders.push(selectedProducts);
    });
    if (get(formatOrders, '0.terminalId')) {
      setCurrentTerminal(get(formatOrders, '0.terminalId'));
    }
    navigate(`${RouterConstants.DASHBOARD_BILLING}`, {
      state: { orders: formatOrders },
    });
  };

  // useEffect(() => {
  //   getCustomerDetails();
  // }, [orderDetails]);

  useEffect(() => {
    getCustomerDetails({ newTotalPage: totalPages, newPage: page });
  }, [orderDetails]);

  useEffect(() => {
    if (isCustomerCodeEnabled) getCustomers();
  }, [isCustomerCodeEnabled]);

  const EditAndDelete = () => {
    return (
      <Stack flexDirection={'col'} gap={1} sx={{ ml: 0.5 }}>
        {!isEmpty(orderDetails) && isAllowEdit && !isDynamicQR && (
          <Typography
            onClick={handleEditOrder}
            sx={{
              fontSize: '12px',
              cursor: 'pointer',
              '&:hover': { color: theme.palette.primary.main, fontWeight: 'bold' },
            }}
          >
            Edit Billing
          </Typography>
        )}

        {(get(selectedList, 'type') === ORDER_STATUS.PARTIAL ||
          get(selectedList, 'type') === ORDER_STATUS.CREDIT) &&
          !isEmpty(orderDetails) && (
            <Typography
              onClick={openModal}
              sx={{
                fontSize: '12px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                '&:hover': { color: theme.palette.primary.main, fontWeight: 'bold' },
              }}
            >
              Change Payment Status
            </Typography>
          )}

        {isDynamicQR && !isPaymentRefundDone && !isEmpty(orderDetails) && (
          <Typography
            onClick={openRefundModal}
            sx={{
              fontSize: '12px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              '&:hover': { color: theme.palette.primary.main, fontWeight: 'bold' },
            }}
          >
            Refund payment
          </Typography>
        )}

        {!isEmpty(orderDetails) && (
          <Typography
            onClick={handleDeleteOrder}
            sx={{
              fontSize: '12px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              '&:hover': { color: theme.palette.primary.main, fontWeight: 'bold' },
            }}
          >
            Clear Order Bill
          </Typography>
        )}

        {!isEmpty(orderDetails) && !isEmpty(customerDetails) && (
          <Typography
            onClick={openCustomerModal}
            sx={{
              fontSize: '12px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              '&:hover': { color: theme.palette.primary.main, fontWeight: 'bold' },
            }}
          >
            Edit Customer Details
          </Typography>
        )}
      </Stack>
    );
  };

  const orderListContent = (isMobileFlow) => {
    let height = 'calc(100vh - 18rem)';
    const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
    let heightAdj = 0;
    console.log('TEI', isTimeQuery);
    if (isMobile) {
      if (!reportSummary) heightAdj = heightAdj - 12;

      if (isTimeQuery && reportSummary) heightAdj = heightAdj + 6;
      if (deliveryDateConfig) {
        height = `calc(100dvh - ${25 + heightAdj}rem)`;
      } else {
        height = `calc(100dvh - ${22 + heightAdj}rem)`;
      }
      console.log('height', height);
    }

    return (
      <Grid
        sx={{
          pt: 2,
          gap: 1,
          overflow: 'auto',
          ...(isElectron ? {} : hideScrollbar),
          height,
        }}
        spacing={2}
      >
        {map(orderList, (_order, _index) => {
          const isSelected = () => {
            if (get(selectedList, 'holdId') && get(selectedList, 'holdId') === _order.holdId) {
              return true;
            } else if (
              get(selectedList, 'paymentId') &&
              get(selectedList, 'paymentId') === _order.paymentId
            ) {
              return true;
            } else if (
              get(selectedList, 'orderId') &&
              !get(selectedList, 'paymentId') &&
              get(selectedList, 'orderId') === _order.orderId
            ) {
              return true;
            } else {
              return false;
            }
          };
          console.log('selectedList', selectedList);

          const isDynamicQR = _order?.payments?.[0]?.gatewaySource !== 'MANUAL';

          return (
            <Grid
              md={12}
              xs={12}
              sm={12}
              item
              onClick={() => {
                if (!isEqual(_order, selectedList)) {
                  setOrderDetails([]);
                }
                setSelectedList(_order);
                if (isMobileFlow) {
                  setOpenDrawer(false);
                }
                setShowOrderDetails(true);
              }}
              key={_index}
              sx={{ p: 0.2, pb: orderList.length === _index + 1 ? 2 : 1 }}
              ref={setLastElement}
            >
              <Tooltip title={`Click to select `}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                    p: 0.5,
                    pl: 2,
                    borderRadius: 3,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': isSelected()
                      ? {}
                      : {
                          backgroundColor: '#E9E9EB',
                          color: '#000',
                        },
                    ...(isSelected()
                      ? {
                          backgroundColor: theme.palette.primary.light,
                        }
                      : {}),
                    height: '100px',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.common.white,
                      backgroundColor: ORDER_STATUS_COLORS[get(_order, 'status', '')] || '#47C61B',
                      position: 'absolute',
                      top: 0,
                      left: 20,
                      fontWeight: 'bold',
                      px: 1,
                      borderBottomRightRadius: 5,
                      borderBottomLeftRadius: 5,
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                      fontSize: '10px',
                    }}
                  >
                    {capitalCaseTransform(get(_order, 'status', ''))}
                  </Typography>
                  <Chip
                    sx={{
                      color: isSelected() ? '#5A0A45' : '#FFFFFF',
                      backgroundColor: isSelected() ? '#FFFFFF' : theme.palette.primary.main,
                      fontSize: '10px',
                      height: '17px',
                      visibility: get(_order, 'name', '') ? 'visible' : 'hidden',
                      position: 'absolute',
                      top: 7,
                      right: 18,
                      whiteSpace: 'nowrap',
                      fontWeight: 700,
                    }}
                    label={get(_order, 'name', '')}
                  />
                  <Stack
                    flexDirection={'row'}
                    sx={{
                      textAlign: 'left',
                      width: '100%',
                      mt: 2,
                      mx: 1,
                      mr: 2,
                      justifyContent: 'space-between',
                      ...(isSelected()
                        ? {
                            color: theme.palette.common.white,
                          }
                        : {}),
                    }}
                  >
                    <Stack
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontSize: '12px' }}>
                        Order Id
                      </Typography>
                      <Typography sx={{ fontSize: '22px', fontWeight: 'bold' }}>
                        #{get(_order, 'orderId')}
                      </Typography>
                      <Stack flexDirection={'row'} gap={1}>
                        <Typography
                          variant="caption"
                          color="warning"
                          sx={{
                            fontSize: '9px',
                            whiteSpace: 'nowrap',
                            fontWeight: 700,
                            borderRadius: '4px',
                            px: 0.5,

                            color:
                              get(_order, 'type') === ORDER_STATUS.PARTIAL ? '#FFC700' : '#47C61B',

                            ...(isSelected()
                              ? {
                                  backgroundColor: theme.palette.common.white,
                                }
                              : {
                                  border: '1px solid',
                                  color:
                                    get(_order, 'type') === ORDER_STATUS.PARTIAL
                                      ? '#FFC700'
                                      : '#47C61B',
                                }),
                          }}
                        >
                          {ORDER_STATUS_LABELS[get(_order, 'type')]}
                        </Typography>
                        {get(_order, 'type') !== ORDER_STATUS.CREDIT &&
                          !isEmpty(get(_order, 'payments') || []) && (
                            <Stack
                              sx={{
                                borderRadius: 10,
                                width: '60px',
                                height: '15.9px',
                                borderRadius: '4px',
                                px: 0.5,
                                position: 'relative',
                                border: '1px solid',
                                whiteSpace: 'nowrap',
                                color: isSelected() ? '#5A0A45' : 'red',
                                fontWeight: 700,
                                backgroundColor: theme.palette.common.white,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Typography sx={{ fontSize: '8px', fontWeight: 'bold' }}>
                                {get(_order, 'payments', [])?.length === 1
                                  ? isDynamicQR
                                    ? 'DYNAMIC QR'
                                    : get(_order, 'payments[0].mode')
                                  : 'Split Payment'}
                              </Typography>
                            </Stack>
                          )}
                      </Stack>
                    </Stack>
                    <Stack flexDirection={'column'}>
                      <Typography
                        sx={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'right', mt: 1 }}
                      >
                        {fCurrency(convertToRupee(get(_order, 'orderAmount', 0)))}
                      </Typography>
                      {get(_order, 'date') && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: isSelected() ? theme.palette.common.white : '#A6A6A6',
                            fontWeight: 'bold',
                          }}
                        >
                          {` ${moment(get(_order, 'date')).format('DD/MM/YYYY')}  ${get(
                            _order,
                            'time'
                          )}`}
                        </Typography>
                      )}
                      {/* <Chip
                        sx={{
                          fontSize: '10px',
                          height: '17px',
                          borderRadius: '4px',
                          px: 0.5,
                          position: 'absolute',
                          bottom: 7,
                          right: 25,
                          // whiteSpace: 'nowrap',
                          fontWeight: 700,

                          // color:
                          //   get(_order, 'type') === PARTIAL_BILLING_TABS ? '#FFC700' : '#47C61B',

                          // ...(isSelected()
                          //   ? {
                          //       backgroundColor: theme.palette.common.white,
                          //     }
                          //   : {
                          //       border: '1px solid',
                          //       color:
                          //         get(orderList, 'mode') === PARTIAL_BILLING_TABS
                          //           ? '#FFC700'
                          //           : '#47C61B',
                          //     }),
                        }}
                      >
                        {get(_order, 'payments[0].mode')}
                        {console.log('mode', get(_order, 'payments[0].mode'))}
                      </Chip> */}
                    </Stack>
                  </Stack>
                </Card>
              </Tooltip>
            </Grid>
          );
        })}

        {totalPages === 0 && !isListLoading && (
          <Stack justifyContent={'center'} alignItems={'center'} sx={{ width: '100%' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              No more items
            </Typography>
          </Stack>
        )}

        {isListLoading && (
          <Stack
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RotatingLines
              strokeColor={theme.palette.primary.main}
              strokeWidth="5"
              animationDuration="0.75"
              width={35}
            />
          </Stack>
        )}
      </Grid>
    );
  };

  const pagination = () => {
    return (
      <Stack
        sx={{
          width: '100%',
          flexDirection: 'row',
          position: isMobile ? 'fixed' : 'absolute',
          bottom: 0,
          right: 0,
          background: '#ffffff',
        }}
      >
        <TablePagination
          component="div"
          variant="outlined"
          count={totalPages}
          page={page}
          onChange={(e, val) => {
            console.log('Va', val);
            setPage(val);
          }}
          onPageChange={handleChangePage}
          rowsPerPage={size}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage=""
          sx={{ width: '100%' }}
        />
      </Stack>
    );
  };

  // const totalGST = (get(orderDetails, 'ordersInfo.GSTPrice') || 0) / 100;

  const totalGST = !isEmpty(get(orderDetails, 'ordersInfo.orders'))
    ? calculateTotalGst(get(orderDetails, 'ordersInfo.orders'))
    : calculateTotalGst(get(orderDetails, 'ordersInfo'));

  const totalParcelCharges =
    calculateTotalParcelCharges(get(orderDetails, 'ordersInfo.orders')) / 100;

  const sortedData = serializeForPrint(get(orderDetails, 'ordersInfo.orders'));

  const totalOffer = null;

  const additionalInfo = formatAdditionalInfo(get(orderDetails, 'ordersInfo.additionalInfo'));

  const orders = get(orderDetails, 'ordersInfo.orders');

  const serializeData = () => {
    const ordersInfo = get(orderDetails, 'ordersInfo');
    const options = [];
    map(get(ordersInfo, 'orders'), (e) => {
      let serializeAddOn = [];
      map(get(e, 'addOns.addons'), (d) => {
        serializeAddOn.push({
          addOnId: d?.addOnId,
          quantity: d?.quantity * e?.quantity,
          price: d?.price,
          name: d?.name,
          GSTPercent: d?.GSTPercent,
        });
      });
      options.push({
        quantity: e?.quantity,
        additionalDiscount: ordersInfo?.additionalDiscount * 100,
        additionalCharges: ordersInfo?.additionalCharges * 100,
        packingCharges: ordersInfo?.packingCharges * 100,
        deliveryCharges: ordersInfo?.deliveryCharges * 100,
        price: e?.price,
        productId: e?.productId,
        orderType: ordersInfo?.orderType,
        paymentModeType: ordersInfo?.payments?.[0]?.mode,
        paymentType: ordersInfo?.type,
        // advance: '',
        GSTPercent: e.GSTPercent,
        addOns: serializeAddOn,
        name: e?.productInfo?.name || e?.name,
        additionalInfo: [{ info: ordersInfo?.additionalInfo }],
        customCode: ordersInfo?.customCode,
        customerId: ordersInfo?.customerId,
      });
    });
    return options;
  };

  const lastEditedDate = selectedList?.comment?.billEdited?.at(-1)?.editedDate;

  const renderOrderBreakup = () => {
    const actualParcelCharges =
      (Number(get(selectedList, 'packingCharges')) || 0) / 100 + (Number(totalParcelCharges) || 0);

    return (
      <Box
        sx={{
          mt: 1.5,
          border: '0.5px solid rgba(145, 158, 171, 0.48)',
          p: 1,
          px: -1,
          borderRadius: 1.5,
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#FFFFFF',
        }}
      >
        {hide && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
            onClick={() => setHide(!hide)}
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
            <KeyboardArrowUpIcon />
          </div>
        )}
        {!hide && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 5,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
            }}
            onClick={() => setHide(!hide)}
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
              Hide Summary
            </Typography>
            <KeyboardArrowDownIcon />
          </div>
        )}
        {!hide && (
          <Stack>
            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mt: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                Total Items
              </Typography>

              <Typography variant="subtitle1" sx={{ pl: 1 }}>
                {!isEmpty(get(orderDetails, 'ordersInfo'))
                  ? get(orderDetails, 'ordersInfo')?.length
                  : 0}
              </Typography>
            </Stack>

            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                Total Order Quantity
              </Typography>

              <Typography variant="subtitle1" sx={{ pl: 1 }}>
                {totalOrderQuantity}
              </Typography>
            </Stack>

            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                Order Summary
              </Typography>

              <Stack flexDirection="row" alignItems="center" justifyContent={'flex-start'} gap={1}>
                <Typography variant="subtitle1">
                  ₹ {toFixedIfNecessary(calculateActualTotalPrice(orderDetails) / 100, 2)}
                  {/* {get(selectedList, 'orderAmount') / 100} */}
                </Typography>
              </Stack>
            </Stack>

            {!!actualParcelCharges && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                  Parcel charges
                </Typography>

                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent={'flex-start'}
                  gap={1}
                >
                  <Typography variant="subtitle1">+</Typography>
                  <Typography variant="subtitle1">{fCurrency(actualParcelCharges)}</Typography>
                </Stack>
              </Stack>
            )}

            {totalGST > 0 && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                  {(!isEmpty(get(orderDetails, 'ordersInfo.orders')) &&
                    get(orderDetails, 'ordersInfo.orders.0.isIGST')) ||
                  get(orderDetails, 'ordersInfo.0.isIGST')
                    ? 'GST  (IGST)'
                    : 'GST  (CGST+SGST)'}
                </Typography>

                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent={'flex-start'}
                  gap={1}
                >
                  <Typography variant="subtitle1">+</Typography>
                  <Typography variant="subtitle1">{fCurrency(totalGST)}</Typography>
                </Stack>
              </Stack>
            )}

            {additionalDiscountConfig && get(selectedList, 'additionalDiscount') > 0 && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                  Additional Discount
                </Typography>

                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent={'flex-start'}
                  gap={1}
                >
                  <Typography variant="subtitle1">-</Typography>
                  <Typography variant="subtitle1">
                    {fCurrency((get(selectedList, 'additionalDiscount') || 0) / 100)}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {additionalChargesConfig && get(selectedList, 'additionalCharges') > 0 && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                  Additional Charges
                </Typography>

                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent={'flex-start'}
                  gap={1}
                >
                  <Typography variant="subtitle1">+</Typography>
                  <Typography variant="subtitle1">
                    {fCurrency((get(selectedList, 'additionalCharges') || 0) / 100)}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {deliveryChargesConfig && get(selectedList, 'deliveryCharges') > 0 && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                  Delivery Charges
                </Typography>

                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent={'flex-start'}
                  gap={1}
                >
                  <Typography variant="subtitle1">+</Typography>
                  <Typography variant="subtitle1">
                    {fCurrency((get(selectedList, 'deliveryCharges') || 0) / 100)}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {additionalInfo && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                  Additional Info
                </Typography>

                <IconButton
                  onClick={() => {
                    setOpenAdditionalInfoDrawer(true);
                  }}
                  sx={{ color: theme.palette.primary.main, pl: 1 }}
                  disabled={!additionalInfo}
                >
                  <DescriptionOutlinedIcon />
                </IconButton>
              </Stack>
            )}

            {get(selectedList, 'roundOff') > 0 && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.6, minWidth: 150 }}>
                  Rounded Off
                </Typography>

                <Stack
                  flexDirection="row"
                  alignItems="center"
                  justifyContent={'flex-start'}
                  gap={1}
                >
                  <Typography variant="subtitle1">
                    {`₹ ${(get(selectedList, 'roundOff') || 0) / 100}`}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
        {!isEmpty(orderDetails) && (
          <Stack
            flexDirection={'column'}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ mt: hide ? 1 : 0 }}
          >
            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '20px' }}>
                Total
              </Typography>

              <Typography
                sx={{ color: '#01A389', fontWeight: 'bold', fontSize: '22px' }}
                variant="subtitle1"
              >
                {fCurrency(toFixedIfNecessary(get(selectedList, 'orderAmount') / 100), 2)}
              </Typography>
            </Stack>
            {get(selectedList, 'type') === ORDER_STATUS.PARTIAL && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: '#FF0000', fontWeight: 'bold', fontSize: '20px' }}
                >
                  Balance
                </Typography>

                <Typography
                  sx={{ color: '#FF0000', fontWeight: 'bold', fontSize: '22px' }}
                  variant="subtitle1"
                >
                  {fCurrency(
                    (get(selectedList, 'orderAmount') -
                      reduce(
                        get(orderDetails, 'paymentsInfo'),
                        (acc, value) => acc + value?.paidAmount,
                        0
                      )) /
                      100
                  ) || '-'}
                </Typography>
              </Stack>
            )}
            {get(selectedList, 'type') === ORDER_STATUS.CREDIT && (
              <Stack
                flexDirection={'row'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: '#FF0000', fontWeight: 'bold', fontSize: '20px' }}
                >
                  Balance
                </Typography>

                <Typography
                  sx={{ color: '#FF0000', fontWeight: 'bold', fontSize: '22px' }}
                  variant="subtitle1"
                >
                  {fCurrency(
                    (get(selectedList, 'orderAmount') -
                      reduce(
                        get(orderDetails, 'paymentsInfo'),
                        (acc, value) => acc + value?.paidAmount,
                        0
                      )) /
                      100
                  ) || '-'}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </Box>
    );
  };

  const renderBackIcon = () => {
    return (
      <Box
        sx={{
          width: 35,
          height: 30,
          borderRadius: '50%',
          backgroundColor: 'lightgray',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={() => {
          setShowOrderDetails(false);
        }}
      >
        <ArrowBackIcon color="primary" fontSize="small" />
      </Box>
    );
  };

  const renderOrderDetails = () => (
    <Stack
      className="OrdersViewStep2"
      borderRadius={'20px'}
      sx={{
        border: 0.1,
        borderColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
        width: { xs: '100%', md: '68%', sm: '55%', lg: '70%' },
        height: isMobile && showOrderDetails ? 'calc(100vh - 8rem)' : 'calc(100vh - 12rem)',
        overflow: 'hidden',
        position: 'relative',
        mt: { sm: isMobile ? 2 : 0, md: 0, lg: 0 },
      }}
    >
      {isEmpty(orderDetails) && !orderDetailsLoading && (
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: '20px',
            m: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
          }}
        >
          Please select an order to view details.
        </Typography>
      )}

      {orderDetailsLoading && (
        <Stack
          sx={{
            color: 'text.secondary',
            fontSize: '20px',
            m: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap',
          }}
        >
          <RotatingLines
            strokeColor={theme.palette.primary.main}
            strokeWidth="5"
            animationDuration="0.75"
            width={35}
          />
        </Stack>
      )}

      <Box p={isMobile ? 0.5 : 2}>
        {!isEmpty(orderDetails) && !orderDetailsLoading && (
          <>
            <Stack
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                mb: 2,
                flexDirection: 'column',
              }}
            >
              <Stack flexDirection={'column'} sx={{ width: '100%' }}>
                {!isEmpty(orderDetails) && (
                  <Stack
                    direction="row"
                    gap={isMobile ? 2 : 0}
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack
                      direction="row"
                      width={isMobile ? '70%' : '100%'}
                      spacing={2}
                      alignItems="center"
                    >
                      {isMobile && renderBackIcon()}
                      <Tabs
                        variant="scrollable"
                        scrollButtons={false}
                        value={currentTab}
                        onChange={handleChangeTab}
                        allowScrollButtonsMobile
                      >
                        <Tab value={PARTIAL_BILLING_TABS.ORDERS} label={'Orders'} />
                        <Tab
                          value={PARTIAL_BILLING_TABS.PAYMENT_INFO}
                          label={'Payment Information'}
                        />
                        <Tab
                          value={PARTIAL_BILLING_TABS.CUSTOMER_INFO}
                          label={'Customer Details'}
                        />
                      </Tabs>
                    </Stack>
                    <Stack flexDirection="row" alignItems="center" gap={2}>
                      {(get(orderDetails, 'ordersInfo.status') === ORDER_TYPE.PENDING ||
                        get(orderDetails, 'ordersInfo.status') === ORDER_TYPE.FAILED) &&
                        !isEmpty(orderDetails) && (
                          <Button onClick={handleCheckStatus} variant="contained" size="small">
                            <Typography fontWeight="bold">Check Status</Typography>
                          </Button>
                        )}

                      <Iconify
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setIsEbillDialogue(true)}
                        icon={'logos:whatsapp-icon'}
                        width={25}
                      />

                      <Dialog
                        open={isEbillDialogue}
                        onClose={() => setIsEbillDialogue(false)}
                        title="Confirmation"
                      >
                        <Stack sx={{ width: '100%', p: 3 }}>
                          <Typography fontWeight="bold">
                            Are you sure you want to send e-bill ?
                          </Typography>
                          <Stack
                            flexDirection={'row'}
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              width: '100%',
                              mt: 3,
                              gap: 2,
                            }}
                          >
                            <Button
                              sx={{ color: '#000' }}
                              onClick={() => setIsEbillDialogue(false)}
                              variant="text"
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSendEbill} color="primary" variant="contained">
                              Send
                            </Button>
                          </Stack>
                        </Stack>
                      </Dialog>
                      <KebabMenu
                        icon="mi:options-horizontal"
                        open={openMenu}
                        onOpen={handleOpenMenu}
                        onClose={handleCloseMenu}
                        actions={EditAndDelete()}
                        height={25}
                        width={25}
                        customWidth={
                          get(orderDetails, 'ordersInfo.type') === ORDER_STATUS.PARTIAL
                            ? 200
                            : undefined
                        }
                      />
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Stack>
          </>
        )}

        {!isEmpty(orderDetails) && (
          <>
            {currentTab === PARTIAL_BILLING_TABS.ORDERS && (
              <Stack
                justifyContent="space-between"
                sx={{
                  height:
                    isMobile && showOrderDetails ? 'calc(100vh - 13rem)' : 'calc(100vh - 18rem)',
                  overflowY: 'auto',
                  ...hideScrollbar,
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  {!isEmpty(orderDetails) && (
                    <Stack
                      sx={{
                        position: 'sticky',
                        top: 0,
                        right: 20,
                        gap: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {!!lastEditedDate && (
                        <Stack flexDirection="row" alignItems="center" gap={1}>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: '60%',
                              fontSize: '10px',
                            }}
                          >
                            Last edited :
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: '10px', opacity: '60%', fontWeight: 500 }}
                          >
                            {fDatesWithTimeStampFromUtc(lastEditedDate)}
                          </Typography>
                        </Stack>
                      )}
                      <Typography
                        sx={{
                          color: theme.palette.common.white,
                          backgroundColor:
                            ORDER_STATUS_COLORS[
                              get(orderDetails, 'ordersInfo.0.orderStatus', '')
                            ] || '#47C61B',
                          fontWeight: 'bold',
                          px: 1,
                          pt: 0.1,
                          borderBottomRightRadius: 5,
                          borderBottomLeftRadius: 5,
                          textTransform: 'capitalize',
                          whiteSpace: 'nowrap',
                          fontSize: '10px',
                        }}
                      >
                        {capitalCaseTransform(get(selectedList, 'status', ''))}
                      </Typography>
                    </Stack>
                  )}
                  {!isEmpty(orderDetails) && (
                    <Stack
                      flexDirection={'column'}
                      sx={{ position: 'sticky', top: 16, backgroundColor: '#FFFFFF' }}
                    >
                      <Stack
                        flexDirection={isMobile ? 'column' : 'row'}
                        sx={{
                          justifyContent: 'space-between',
                          ...(isMobile || isTab ? { mt: 2 } : { mb: 2 }),
                        }}
                      >
                        <Box>
                          <Stack flexDirection={'row'} sx={{ alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '26px', fontWeight: 'bold' }}>
                              Order
                            </Typography>
                            <Stack flexDirection={'row'} sx={{ gap: 1 }} alignItems={'center'}>
                              <Typography
                                sx={{
                                  fontSize: '30px',
                                  fontWeight: 'bold',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                #{get(selectedList, 'orderId')}
                              </Typography>

                              {get(selectedList, 'deliveryDate') &&
                                deliveryDateConfig &&
                                !isMobile && (
                                  <Label
                                    capitalize={false}
                                    variant="soft"
                                    color={'warning'}
                                    sx={{ fontSize: '12px' }}
                                  >
                                    {`Delivery Date : ${fDatesWithTimeStampFromUtc(
                                      get(selectedList, 'deliveryDate')
                                    )}`}
                                  </Label>
                                )}
                            </Stack>
                          </Stack>
                          {get(selectedList, 'deliveryDate') && deliveryDateConfig && isMobile && (
                            <Label
                              capitalize={false}
                              variant="soft"
                              color={'warning'}
                              sx={{ fontSize: '12px', mb: 2 }}
                            >
                              {`Delivery Date : ${fDatesWithTimeStampFromUtc(
                                get(selectedList, 'deliveryDate')
                              )}`}
                            </Label>
                          )}
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',

                            ...(isMobile
                              ? { mb: 4 }
                              : {
                                  mt: 2,
                                  gap: 1,
                                }),
                          }}
                        >
                          {CHANGE_ORDER_STATUS_TYPES_SHOW.includes(get(selectedList, 'status')) && (
                            <TextField
                              SelectProps={{
                                MenuProps: {
                                  PaperProps: {
                                    sx: { '& .MuiMenuItem-root': { fontSize: '12px' } },
                                  },
                                },
                              }}
                              InputLabelProps={{ style: { fontSize: '12px' } }}
                              InputProps={{ style: { fontSize: '12px', height: 50 } }}
                              size="small"
                              label="Change Order status"
                              sx={{ width: isMobile ? '100%' : 180, height: 10 }}
                              select
                              value={get(selectedList, 'status')}
                              onChange={(e) => {
                                handleChangeStatus(selectedList, e.target.value);
                                // navigate(PATH_DASHBOARD.sale.billing);
                              }}
                            >
                              {map(CHANGE_ORDER_STATUS_TYPES, (value) => {
                                return (
                                  <MenuItem value={value}>
                                    {ORDER_STATUS_TYPES_LABELS[value] || value}
                                  </MenuItem>
                                );
                              })}
                            </TextField>
                          )}
                        </Box>
                      </Stack>

                      <Stack flexDirection={'row'} sx={{ justifyContent: 'space-between' }}>
                        <Stack flexDirection={'column'} justifyContent={'space-between'}>
                          <Typography sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}>
                            Date & Time
                          </Typography>
                          <Typography sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}>
                            {`${get(selectedList, 'date')} ${get(selectedList, 'time')}`}
                          </Typography>
                        </Stack>
                        {get(selectedList, 'type') && (
                          <Stack
                            flexDirection={'column'}
                            justifyContent={'space-between'}
                            sx={{ mt: 1 }}
                          >
                            <Typography
                              sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                            >
                              Payment Type
                            </Typography>
                            <Typography
                              sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            >
                              {get(selectedList, 'type')}
                            </Typography>
                          </Stack>
                        )}
                        {get(selectedList, 'orderType') && (
                          <Stack
                            flexDirection={'column'}
                            justifyContent={'space-between'}
                            sx={{ mt: 1 }}
                          >
                            <Typography
                              sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                            >
                              Order Type
                            </Typography>
                            <Typography
                              sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            >
                              {get(selectedList, 'orderType')}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      <Stack flexDirection={'row'} sx={{ justifyContent: 'space-between' }} mt={2}>
                        {get(selectedList, 'additionalInfo.captainName') && (
                          <Stack flexDirection={'column'} justifyContent={'space-between'}>
                            <Typography
                              sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                            >
                              Captain Name
                            </Typography>
                            <Typography
                              sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                            >
                              {get(selectedList, 'additionalInfo.captainName')}
                            </Typography>
                          </Stack>
                        )}

                        {get(selectedList, 'additionalInfo.tableName') && (
                          <Stack
                            flexDirection={'column'}
                            justifyContent={'space-between'}
                            sx={{ mt: 1 }}
                          >
                            <Typography
                              sx={{ color: '#A6A6A6', fontWeight: 700, fontSize: '12px' }}
                            >
                              Table Name
                            </Typography>
                            <Stack flexDirection={'row'} alignItems={'center'}>
                              <Typography
                                sx={{ color: '#212B36', fontWeight: 700, fontSize: '14px' }}
                              >
                                {get(selectedList, 'additionalInfo.tableName')}
                              </Typography>
                              {get(
                                selectedList,
                                'additionalInfo.tableData.tableInfo.priceVariant'
                              ) && (
                                <Typography
                                  sx={{
                                    color: '#FFFFFF',
                                    fontWeight: 700,
                                    fontSize: '10px',
                                    ml: 2,
                                    bgcolor: 'red',
                                    px: 1,
                                    py: 0.2,
                                    borderRadius: 5,
                                    backgroundColor: '#5A0B45',
                                  }}
                                >
                                  {get(
                                    selectedList,
                                    'additionalInfo.tableData.tableInfo.priceVariant'
                                  )}
                                  ₹
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        )}
                      </Stack>

                      <Divider sx={{ border: '0.5px solid #F0F0F0', mt: 1 }} />
                      <Stack
                        sx={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Typography sx={{ color: '#A6A6A6', fontSize: '14px', fontWeight: 700 }}>
                          Items
                        </Typography>
                        <Typography sx={{ color: '#A6A6A6', fontSize: '14px', fontWeight: 700 }}>
                          Price
                        </Typography>
                      </Stack>
                    </Stack>
                  )}

                  <ViewBillingOrderList
                    orderDetails={get(orderDetails, 'ordersInfo')}
                    getPriceWithGST={getPriceWithGST}
                    customerDetails={customerDetails}
                    selectedList={selectedList}
                  />
                </Box>
                {!isEmpty(orderDetails) && <>{renderOrderBreakup()}</>}
              </Stack>
            )}
            {currentTab === PARTIAL_BILLING_TABS.PAYMENT_INFO && (
              <ViewAdvancePaymentInfoList
                paymentsInfo={get(orderDetails, 'paymentsInfo')}
                getPriceWithGST={getPriceWithGST}
                isPaymentRefundDone={isPaymentRefundDone}
              />
            )}
            {currentTab === PARTIAL_BILLING_TABS.CUSTOMER_INFO && (
              <ViewCustomerDetails
                customerDetails={customerDetails}
                openCustomerModal={openCustomerModal}
              />
            )}
          </>
        )}
      </Box>
    </Stack>
  );

  function renderMobileViewContent() {
    return (
      <>
        {!showOrderDetails && (
          <>
            {orderListContent()}
            {pagination()}
          </>
        )}

        {showOrderDetails && renderOrderDetails()}
      </>
    );
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title> View Billing | POSITEASY</title>
      </Helmet>
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
          totalQuantity={orders?.length}
          totalValueNoOffer={getTotalPriceWithGST(orders) - calculateTotalGst(orders)}
          totalOrderValue={get(orderDetails, 'ordersInfo.orderAmount') / 100}
          printerInfo={printerInfo}
          orderId={get(orders, '0.orderId')}
          content="DUPLICATE"
          additionalDiscount={fCurrency(
            (get(orderDetails, 'ordersInfo.additionalDiscount') || 0) / 100
          )}
          additionalCharges={fCurrency(
            (get(orderDetails, 'ordersInfo.additionalCharges') || 0) / 100
          )}
          packingCharges={fCurrency((get(orderDetails, 'ordersInfo.packingCharges') || 0) / 100)}
          deliveryCharges={fCurrency((get(orderDetails, 'ordersInfo.deliveryCharges') || 0) / 100)}
          isHidePaymentStatus={currentStatus === ORDER_STATUS.PARTIAL}
          balance={
            currentStatus === ORDER_STATUS.PARTIAL
              ? fCurrency(
                  (get(orderDetails, 'ordersInfo.orderAmount') -
                    reduce(
                      get(orderDetails, 'paymentsInfo'),
                      (acc, value) => acc + value?.paidAmount,
                      0
                    )) /
                    100
                )
              : null
          }
        />
      </div>
      {/* <Box xs display='flex' justifyContent={'end'}>
        {isMobile && (
          <Fab
            onClick={() => {
              navigate(PATH_DASHBOARD.sale.billing);
            }}
            color="primary"
            aria-label="add"
            size="small"
          >
            <AddIcon />
          </Fab>
        )}
      </Box> */}

      <Stack
        flexDirection="row"
        id="noprint"
        justifyContent={isMobile ? 'flex-end' : 'space-between'}
        mt={isMobile ? 0 : 2}
      >
        <Stack
          width="100%"
          gap={2}
          sx={{
            ml: 1,
            mr: isMobile ? 1 : 0,
            flexDirection: isTab ? 'column' : 'row',
          }}
        >
          {(!showOrderDetails || !isMobile) && (
            <Stack>
              <Stack flexDirection={'row'} justifyContent={'end'} alignItems={'center'} gap={10}>
                {isMobile ? (
                  <Box xs mt={1}>
                    {reportSummary ? (
                      <Box
                        xs
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent={'flex-start'}
                        fontWeight="bold"
                        color="#5A0B45"
                        onClick={() => {
                          setReportSummary((prev) => !prev);
                        }}
                      >
                        <u>Hide Filters</u>
                        <ExpandLessIcon size={18} />
                      </Box>
                    ) : (
                      <Box
                        xs
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        fontWeight="bold"
                        color="#5A0B45"
                        onClick={() => {
                          setReportSummary((prev) => !prev);
                        }}
                      >
                        <u>Show Filters</u>
                        <ExpandMoreIcon size={18} />
                      </Box>
                    )}
                  </Box>
                ) : (
                  ''
                )}

                {isTab && !isMobile && !isManager && isShowBillng && (
                  <Button
                    onClick={() => {
                      navigate(PATH_DASHBOARD.sale.billing);
                    }}
                    sx={{ width: 100, ml: 2, ...(isTab ? { mr: 1 } : {}) }}
                    variant="contained"
                  >
                    <AddIcon sx={{ width: 20, height: 20 }} />
                    <Typography fontWeight="bold">Create</Typography>
                  </Button>
                )}
                {isMobile && !isManager && isShowBillng && (
                  <Stack xs display="flex" justifyContent={'end'} alignItems={'center'}>
                    <Fab
                      onClick={() => {
                        navigate(PATH_DASHBOARD.sale.billing);
                      }}
                      sx={{ marginRight: 2 }}
                      color="primary"
                      aria-label="add"
                      size="small"
                    >
                      <AddIcon />
                    </Fab>
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}

          {(!showOrderDetails || !isMobile) && reportSummary && (
            <Stack
              flexDirection={isMobile || isTab ? 'col' : 'row'}
              justifyContent="flex-start"
              sx={{
                width: '100%',
                gap: 1,
                display: 'flex',
                flexWrap: 'wrap',
                ...(isMobile || isTab ? { pl: 1, pr: 2 } : { alignItems: 'center' }),
              }}
            >
              <StartAndEndDatePicker />
              {!isMobile && deliveryDateConfig && (
                <div
                  style={{
                    minWidth: 200,
                    ...(!isMobile && !isTab ? { maxWidth: 330 } : {}),
                  }}
                >
                  <StartAndEndDatePickerProps
                    startDate={startDeliveryDate}
                    setStartDate={setStartDeliveryDate}
                    endDate={endDeliveryDate}
                    setEndDate={setEndDeliveryDate}
                    label="Delivery"
                  />
                </div>
              )}
              <Stack flexDirection={'row'}>
                {isMobile && !showOrderDetails && deliveryDateConfig && reportSummary && (
                  <div style={{ pl: 2 }}>
                    <StartAndEndDatePickerProps
                      startDate={startDeliveryDate}
                      setStartDate={setStartDeliveryDate}
                      endDate={endDeliveryDate}
                      setEndDate={setEndDeliveryDate}
                      label="Delivery"
                    />
                  </div>
                )}
                {startDeliveryDate ? (
                  <Tooltip title={isDesc ? 'Descending' : 'Ascending'}>
                    <IconButton onClick={handleChanges}>
                      {isDesc ? (
                        <ArrowDownwardIcon sx={{ color: theme.palette.primary.main }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ color: theme.palette.primary.main }} />
                      )}
                    </IconButton>
                  </Tooltip>
                ) : (
                  ''
                )}
              </Stack>
              <Box
                xs
                display="flex"
                flexDirection="row"
                sx={{ gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}
              >
                <TextField
                  sx={{
                    minWidth: { xs: '40%', sm: 85 },
                    mr: isMobile ? 0 : 1,
                    ...(!isMobile && !isTab ? { maxWidth: 100 } : {}),
                  }}
                  variant="outlined"
                  size="small"
                  label="Order ID"
                  onChange={handleChangeOrderId}
                />
                <Autocomplete
                  multiple
                  size="small"
                  filterSelectedOptions
                  options={PAYMENT_TYPE_VALUES}
                  value={currentStatus}
                  getOptionDisabled={(option) => checkCurrentStatus(option)}
                  onChange={(event, newValue) => handleChange(newValue)}
                  sx={{
                    minWidth: { xs: '50%', sm: 180 },
                    // mr: isMobile ? 0 : 1,
                    ...(!isMobile && !isTab ? { maxWidth: 200 } : {}),
                  }}
                  renderInput={(params) => (
                    <TextField variant="outlined" {...params} label={'Payment Type'} />
                  )}
                />
              </Box>
              <Box
                xs
                display="flex"
                flexDirection="row"
                sx={{ gap: 0, justifyContent: { xs: 'flex-start', sm: 'flex-start' } }}
              >
                <Autocomplete
                  multiple
                  size="small"
                  filterSelectedOptions
                  options={ORDER_STATUS_VALUES}
                  // renderOption={(props, option) => (
                  //   <li {...props}>{ORDER_STATUS_TYPES_LABELS[option]}</li>
                  // )}
                  // filterOptions={(options, { inputValue }) => {
                  //   const searchTerm = inputValue?.toLowerCase();
                  //   return options.filter((option) =>
                  //     ORDER_STATUS_TYPES_LABELS[option]?.toLowerCase()?.startsWith?.(searchTerm)
                  //   );
                  // }}
                  value={selectedOrderStatus}
                  getOptionDisabled={(option) => checkCurrentOrderStatus(option)}
                  onChange={(event, newValue) => handleChangeOrderStatus(newValue)}
                  sx={{ minWidth: 230, ...(!isMobile && !isTab ? { maxWidth: 230 } : {}) }}
                  renderInput={(params) => (
                    <TextField variant="outlined" {...params} label={'Order Status'} />
                  )}
                />
              </Box>

              <Stack
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginTop: 1,
                  gap: 2,
                  alignItems: 'center',
                  height: '50px',
                  width: {
                    xs: '90%',
                    sm: '40%',
                    md: '30%',
                    lg: '30%',
                    xl: '20%',
                  },
                  alignItems: 'start',
                }}
              >
                <TextField
                  variant="outlined"
                  type="number"
                  value={searchContacts}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setSearchContacts(e.target.value)}
                  error={isError}
                  helperText={isError ? 'Contact must be 10 digits.' : ''}
                  fullWidth
                  size="small"
                  sx={{
                    '& input': {
                      height: 'auto',
                    },
                  }}
                  placeholder="Contact Search..."
                />

                <Button
                  onClick={handleContactClear}
                  sx={{
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  variant="outlined"
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Container
        id="noprint"
        className="storesStep1"
        maxWidth={themeStretch ? false : 'xxl'}
        sx={{
          mt: isMobile ? 0 : 1,
          '&.MuiContainer-root': {
            p: 1,
          },
        }}
      >
        {!isMobile && (
          <Stack flexDirection={'row'} gap={2} justifyContent="space-between">
            <Stack
              gap={2}
              p={2}
              borderRadius={'20px'}
              sx={{
                border: 0.2,
                borderColor: alpha(
                  theme.palette.primary.main,
                  theme.palette.action.selectedOpacity
                ),
                width: { xs: '100%', md: '40%', sm: '45%', lg: '30%' },
                overflow: 'auto',
                position: 'relative',
              }}
            >
              {orderListContent()}
              {pagination()}
            </Stack>
            {renderOrderDetails()}
          </Stack>
        )}
        {isMobile && renderMobileViewContent()}
      </Container>
      <AddPayment
        isOpenModal={isOpenModal}
        closeModal={closeModal}
        postPayment={postPayment}
        orderDetails={orderDetails}
        selectedList={selectedList}
        creditPayment={creditPayment}
      />

      <AddRefundPayment
        isOpenModal={isOpenRefundModal}
        closeModal={closeRefundModal}
        postPayment={postRefundPayment}
        orderDetails={orderDetails}
        selectedList={selectedList}
      />

      <ViewAdditionalInfo
        data={additionalInfo}
        open={openAdditionalInfoDrawer}
        setOpen={setOpenAdditionalInfoDrawer}
      />
      <TakeATourWithJoy config={estimateViewTourConfig} />
      <AddCustomerInfo
        customerCodes={customerCodes}
        isOpenAddCustomerModal={isOpenAddCustomerModal}
        closeCustomerModal={closeCustomerModal}
        customerInfo={customerDetails}
        isCustomerCodeEnabled={isCustomerCodeEnabled}
      />
    </>
  );
}
