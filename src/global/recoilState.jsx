import { atom } from 'recoil';
import { PRINT_CONSTANT, SignInTypes } from 'src/constants/AppConstants';
import AuthService from 'src/services/authService';

const products = atom({
  key: 'products',
  default: [],
});
const allMaterialProducts = atom({
  key: 'allMaterialProducts',
  default: [],
});
const allProducts = atom({
  key: 'allProducts',
  default: [],
});
const allAddons = atom({
  key: 'allAddons',
  default: [],
});
const allCategories = atom({
  key: 'allCategories',
  default: [],
});
const allMaterialCategories = atom({
  key: 'allMaterialCategories',
  default: [],
});
const billingProducts = atom({
  key: 'billingProducts',
  default: [],
});
const addons = atom({
  key: 'addons',
  default: [],
});
const categories = atom({
  key: 'categories',
  default: [],
});
const currentProduct = atom({
  key: 'currentProduct',
  default: {},
});
const currentRawProduct = atom({
  key: 'currentRawProduct',
  default: {},
});
const totalRawProductState = atom({
  key: 'totalRawProductState',
  default: [],
});
const currentAddon = atom({
  key: 'currentAddon',
  default: {},
});
const cart = atom({
  key: 'cart',
  default: [],
});
const estimateCart = atom({
  key: 'estimateCart',
  default: [],
});
const responsive = atom({
  key: 'responsive',
  default: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
});
const noStockProducts = atom({
  key: 'noStockProdcuts',
  default: [],
});
const customerId = atom({
  key: 'customerId',
  default: '',
});
const customerCode = atom({
  key: 'customerCode',
  default: '',
});
const customCode = atom({
  key: 'customCode',
  default: '',
});

const subscribedAccount = atom({
  key: 'subscribedAccount',
  default: false,
});
const trialAccount = atom({
  key: 'trialAccount',
  default: false,
});
const signInAs = atom({
  key: 'signInAs',
  default: SignInTypes.MASTER,
});
const stores = atom({
  key: 'stores',
  default: [],
});
const storeIdState = atom({
  key: 'storeIdState',
  default: '', // Default value or an initial value
});
const currentStoreId = atom({
  key: 'currentStoreId',
  default: '',
});

const amountCommentsState = atom({
  key: 'amountCommentsState',
  default: [],
});

const percentageCommentsState = atom({
  key: 'percentageCommentsState',
  default: [],
});

const billingState = atom({
  key: 'billingState',
  default: false,
});
const currentTerminalId = atom({
  key: 'currentTerminalId',
  default: '',
});
const monitorView = atom({
  key: 'monitorView',
  default: false,
});
const storeLogo = atom({
  key: 'storeLogo',
  default: '',
});
const freemium = atom({
  key: 'freemium',
  default: false,
});
const printMode = atom({
  key: 'printMode',
  default: false,
});
const isTourOpenState = atom({
  key: 'isTourOpenState',
  default: false,
});
const accountDetailsState = atom({
  key: 'accountDetails',
  default: [],
});
const tourState = atom({
  key: 'tourState',
  default: [],
});
const customCodeList = atom({
  key: 'customCodeList',
  default: [],
});
const customerList = atom({
  key: 'customerList',
  default: [],
});
const categorizeList = atom({
  key: 'categorizeList',
  default: [],
});
const estimateMode = atom({
  key: 'estimateMode',
  default: false,
});
const qrCheck = atom({
  key: 'qrCheck',
  default: false,
});
const infoMode = atom({
  key: 'infoMode',
  default: false,
});
const profitLossMode = atom({
  key: 'profitLossMode',
  default: false,
});
const allConfiguration = atom({
  key: 'allConfiguration',
  default: {},
});

const allEbillConfiguration = atom({
  key: 'allEbillConfiguration',
  default: {},
});
const terminalConfigurationState = atom({
  key: 'terminalConfigurationState',
  default: {},
});
const orderTypeConfiguration = atom({
  key: 'orderTypeConfiguration',
  default: {},
});
const printDefaultConfiguration = atom({
  key: 'printDefaultConfiguration',
  default: PRINT_CONSTANT.POS,
});
const isOrderTypeEnableState = atom({
  key: 'isOrderTypeEnableState',
  default: false,
});

const alertDialogInformationState = atom({
  key: 'alertDialogInformationState',
  default: {},
});

const isEstimateWithNoItemsEnableState = atom({
  key: 'isEstimateWithNoItemsEnableState',
  default: false,
});

const breadcrumbData = atom({
  key: 'breadcrumbPath',
  default: '',
});

const offlineToOnlineSyncingState = atom({
  key: 'offlineToOnlineSyncingState',
  default: false,
});

const reportSummaryState = atom({
  key: 'reportSummaryState',
  default: true,
});

const isOfflineState = atom({
  key: 'isOfflineState',
  default: false,
});
const isMembershipState = atom({
  key: 'isMembershipState',
  default: false,
});

const offlineOrdersListCountState = atom({
  key: 'offlineOrdersListCountState',
  default: 0,
});

const selectedUSB = atom({
  key: 'selectedUSB',
  default: AuthService.getSelectedUSBPrinter(),
});
const selectedLAN = atom({
  key: 'selectedLAN',
  default: AuthService.getSelectedLANPrinter(),
});
const selectedBLE = atom({
  key: 'selectedBLE',
  default: AuthService.getSelectedBLEPrinter(),
});
const offlineHoldOnListState = atom({
  key: 'offlineHoldOnListState',
  default: [],
});

const selectedHoldIdState = atom({
  key: 'selectedHoldIdState',
  default: null,
});
const currentStartDate = atom({
  key: 'currentStartDate',
  default: new Date(),
});
const currentEndDate = atom({
  key: 'currentEndDate',
  default: new Date(),
});
const currentDate = atom({
  key: 'currentDate', // unique ID (with respect to other atoms/selectors)
  default: new Date(), // default value (aka initial value)
});
const isEditHoldOnState = atom({
  key: 'isEditHoldOnState',
  default: false,
});

const prevTerminalIdState = atom({
  key: 'prevTerminalIdState',
  default: null,
});

const orderDateState = atom({
  key: 'orderDateState',
  default: '',
});

const deliveryDateState = atom({
  key: 'deliveryDateState',
  default: '',
});
const selectedKOTBLE = atom({
  key: 'selectedKotBle',
  default: AuthService.getSelectedKOTBLEPrinter(),
});
const selectedKOTUSB = atom({
  key: 'selectedKotUsb',
  default: AuthService.getSelectedKOTUSBPrinter(),
});
const selectedKOTLAN = atom({
  key: 'selectedKotLan',
  default: AuthService.getSelectedKOTLANPrinter(),
});

const whatsappDetailsState = atom({
  key: 'whatsappDetailsState',
  default: {},
});

const gstSummaryDetailsState = atom({
  key: 'gstSummaryDetailsState',
  default: {},
});

const PhonepeDetailsState = atom({
  key: 'PhonepeDetailsState',
  default: {},
});

const whatsappBalanceDetailsState = atom({
  key: 'whatsappBalanceDetailsState',
  default: null,
});

const isShowBillingSummaryState = atom({
  key: 'isShowBillingSummaryState',
  default: false,
});

const paymentModeListState = atom({
  key: 'paymentModeListState',
  default: [],
});

const couponDetailsState = atom({
  key: 'couponDetailsState',
  default: null, 
});
export {
  addons,
  alertDialogInformationState,
  allAddons,
  allCategories,
  allConfiguration,
  allEbillConfiguration,
  allMaterialCategories,
  allMaterialProducts,
  allProducts,
  billingProducts,
  billingState,
  breadcrumbData,
  cart,
  categories,
  categorizeList,
  currentAddon,
  currentEndDate,
  currentProduct,
  currentRawProduct,
  currentStartDate,
  currentStoreId,
  currentTerminalId,
  customCode,
  customCodeList,
  customerCode,
  customerId,
  customerList,
  deliveryDateState,
  estimateCart,
  estimateMode,
  freemium,
  infoMode,
  isEditHoldOnState,
  isEstimateWithNoItemsEnableState,
  isOfflineState,
  isMembershipState,
  isOrderTypeEnableState,
  isTourOpenState,
  monitorView,
  noStockProducts,
  offlineHoldOnListState,
  offlineOrdersListCountState,
  offlineToOnlineSyncingState,
  orderDateState,
  orderTypeConfiguration,
  PhonepeDetailsState,
  prevTerminalIdState,
  printDefaultConfiguration,
  printMode,
  products,
  profitLossMode,
  reportSummaryState,
  responsive,
  selectedBLE,
  selectedHoldIdState,
  selectedKOTBLE,
  selectedKOTLAN,
  selectedKOTUSB,
  selectedLAN,
  selectedUSB,
  signInAs,
  storeIdState,
  storeLogo,
  stores,
  subscribedAccount,
  terminalConfigurationState,
  totalRawProductState,
  tourState,
  trialAccount,
  whatsappBalanceDetailsState,
  whatsappDetailsState,
  currentDate,
  qrCheck,
  gstSummaryDetailsState,
  isShowBillingSummaryState,
  paymentModeListState,
  amountCommentsState,
  percentageCommentsState,
  accountDetailsState,
  couponDetailsState
};
