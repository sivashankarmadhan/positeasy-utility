import { PATH_DASHBOARD } from 'src/routes/paths';
export const AppConstants = {
  REMOTE_URL: 'https://api.positeasy.in',
  CHART_LABELS_TIME: [
    '12AM',
    '1AM',
    '2AM',
    '3AM',
    '4AM',
    '5AM',
    '6AM',
    '7AM',
    '8AM',
    '9AM',
    '10AM',
    '11AM',
    '12PM',
    '1PM',
    '2PM',
    '3PM',
    '4PM',
    '5PM',
    '6PM',
    '7PM',
    '8PM',
    '9PM',
    '10PM',
    '11PM',
  ],
  CHART_LABELS_WEEK: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
  CHART_LABELS_MONTH: [
    'Day 1',
    'Day 2',
    'Day 3',
    'Day 4',
    'Day 5',
    'Day 6',
    'Day 7',
    'Day 8',
    'Day 9',
    'Day 10',
    'Day 11',
    'Day 12',
    'Day 13',
    'Day 14',
    'Day 15',
    'Day 16',
    'Day 17',
    'Day 18',
    'Day 19',
    'Day 20',
    'Day 21',
    'Day 22',
    'Day 23',
    'Day 24',
    'Day 25',
    'Day 26',
    'Day 27',
    'Day 28',
    'Day 29',
    'Day 30',
  ],
};
// REMOTE_URL: 'https://api.positeasy.in',
export const PaymentModeTypeConstantsCart = [
  { name: 'CARD' },
  { name: 'CASH' },
  { name: 'UPI' },
  { name: 'ZOMATO' },
  { name: 'SWIGGY' },
];
export const MembershipStatus = [{ name: 'ACTIVE' }, { name: 'INACTIVE' }];
export const PaymentModeTypeConstants = {
  CARD: 'CARD',
  CASH: 'CASH',
  UPI: 'UPI',
  SWIGGY: 'SWIGGY',
  ZOMATO: 'ZOMATO',
};
export const PaymentPersonCart = [{ name: 'MR' }, { name: 'MRS' }];

export const PaymentPerson = {
  MR: 'MR',
  MRS: 'MRS',
};


export const PaymentModeType =['cash', 'card', 'upi', 'zomato', 'swiggy']

export const BookingTypeCart = [{ name: 'website' }, { name: 'online' }];

export const BookingType = {
  WEBSITE: 'WEBSITE',
  ONLINE: 'ONLINE',
};

export const StatusTypecart = [{ name: 'confirmed' }, { name: 'cancel' }];

export const StatusType = {
  CONFIRMED: 'CONFIRMED',
  CANCEL: 'CANCEL',
};

export const EventTypecart = [{ name: 'BIRTDAY' }];

export const EventType = {
  BIRTHDAY: 'Birthday',
  MARRIAGE: 'MARRIAGE',
};

export const OrderTypeConstants = {
  DineIn: 'DINE-IN',
  Parcel: 'PARCEL',
};

export const API_URL_Constants = {
  getProducts: '/api/v1/POS/merchant/products/full-view',
  getProductsStausWise: '/api/v1/POS/merchant/products/status-wise',
  getS3Link: '/api/v1/POS/s3/product-image',
  addProduct: '/api/v1/POS/merchant/add-product',
  updateProduct: '/api/v1/POS/merchant/patch-product',
  changeProductStatus: '/api/v1/POS/merchant/change-status',
  deleteProduct: '/api/v1/POS/merchant/remove-product',
  makeMerchantBilling: '/api/v1/POS/merchant/transaction-billing',
  transactionResponse: '/api/v1/POS/payment/transaction-response',
  verifyPayment: ' /api/v1/POS/payment/verify-payment',
  transactionRequest: '/api/v1/POS/payment/transaction-request',
  lastOneWeek: '/api/v1/POS/merchant/sale/last-oneweek',
  lastOneMonth: '/api/v1/POS/merchant/sale/last-onemonth',
  getOrderType: '/api/v1/POS/merchant/order-type',
  todaySales: '/api/v1/POS/merchant/sale/today',
  saleReport: '/api/v1/POS/merchant/sale/report',
  recentTransaction: '/api/v1/POS/merchant/sale/recent-transactions',
  yesterdaySales: '/api/v1/POS/merchant/sale/yesterday',
  addExpenses: '/api/v1/POS/merchant/daily-expense',
};

export const purchaseCategoryTableColumns = [
  {
    label: '',
    id: '',
    alignRight: false,
    style: { minWidth: 50, position: 'sticky', left: 0, zIndex: 99 },
  },
  {
    label: 'Name',
    id: 'name',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Description',
    id: 'description',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Status',
    id: 'status',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Image',
    id: '',
    alignRight: false,
    style: { minWidth: 120, zIndex: 99 },
  },
  {
    label: 'Created On',
    id: 'createdAt',
    alignRight: false,
    style: { minWidth: 130 },
  },
];

export const RouteName = {
  dashboard: 'Dashboard',
  report: 'Report and Analytics',
  billing: 'Create Billing',
  expenses: 'Expenses',
  settlements: 'Settlements',
  settings: 'Settings',
  products: 'Products',
  stores: 'Stores',
  addon: 'Addon',
  staffs: 'Staffs',
  profile: 'Settings',
  help: 'Help',
  config: 'Settings',
  customers: 'Customers',
  customCode: 'Settings',
  banners: 'Settings',
  uploadLogo: 'Settings',
  payment: 'Reports',
  order: 'Reports',
  product: 'Reports',
  category: 'Reports',
  expenseCategory: 'Expenses',
  expense: 'Reports',
  gst: 'Reports',
  stocklogs: 'Reports',
  stocksummary: 'Reports',
  membership: 'Reports',
  wastage: 'reports',
  delivery: 'Reports',
  attendance: 'Attendance',
  shifts: 'Reports',
  counters: 'Reports',
  terminals: 'Reports',
  purchaseOrders: 'Reports',
  orderSummary: 'Reports',
  estimate: 'Estimate',
  viewestimate: 'Estimate Lists',
  viewbilling: 'Billing Lists',
  createestimate: 'Create Estimate',
  account: 'Account',
  eBilling: 'Settings',
  intent: 'Settings',
  scanqr: 'Settings',
  memberShip: 'Settings',
  profitandloss: 'Reports',
  integration: 'Settings',
  paymentgateway: 'Settings',
  notifications: 'Settings',
  support: 'Support',
  subscriptionPlan: 'Subscription Plan',
  terminalConfig: 'Settings',
  printer: 'Settings',
  viewVendors: 'View Vendors',
  vendorPurchaseOrders: 'View Vendors',
  createVendor: 'Create Vendor',
  editVendor: 'Edit Vendor',
  viewPurchaseOrders: 'View Purchase Orders',
  viewPurchaseOrdersReceives: 'View Purchase Order Receives',
  managerApproves: 'Purchase approval',
  viewPurchaseOrdersDetails: 'View Purchase Order',
  viewStorePurchaseOrdersDetails: 'View Purchase Order',
  createPurchaseOrder: 'Create Purchase Order',
  createStorePurchaseOrder: 'Create Store Purchase Order',
  rawMaterials: 'Raw Materials',
  table: 'Table',
  whatsappCredits: 'Whatsapp',
};
export const ReportAnalyticsSections = [
  {
    title: 'Orders',
    path: PATH_DASHBOARD.report.order,
  },
  {
    title: 'Delivery',
    path: PATH_DASHBOARD.report.delivery,
  },
  { title: 'Payments', path: PATH_DASHBOARD.report.payment },
  { title: 'GST', path: PATH_DASHBOARD.report.gst },
  { title: 'Products', path: PATH_DASHBOARD.report.product },
  { title: 'Category', path: PATH_DASHBOARD.report.category },
  { title: 'Profit & Loss', path: PATH_DASHBOARD.report.profitandloss },
  { title: 'Expenses', path: PATH_DASHBOARD.report.expense },
  { title: 'Stock logs', path: PATH_DASHBOARD.report.stocklogs },
  { title: 'Stock summary', path: PATH_DASHBOARD.report.stocksummary },
  { title: 'Wastage', path: PATH_DASHBOARD.report.wastage },
  { title: 'Shifts', path: PATH_DASHBOARD.report.shifts },
  { title: 'Counters', path: PATH_DASHBOARD.report.counters },
  { title: 'Attendance', path: PATH_DASHBOARD.report.attendance },
  { title: 'Terminals', path: PATH_DASHBOARD.report.terminals },
  { title: 'Purchase orders', path: PATH_DASHBOARD.report.purchaseOrders },
  { title: 'Custom code', path: PATH_DASHBOARD.report.customCode },
];

export const VendorsAndPurchaseSections = [
  { name: 'Purchase Orders', path: PATH_DASHBOARD.purchases.vendorPurchaseOrders },
  { name: 'Order Details', path: PATH_DASHBOARD.purchases.viewPurchaseOrdersDetails },
];

export const SettingsSectionsLabels = {
  upload: 'Profile',
};

export const KDS_ORDER_STATUS_TYPES = {
  ORDER_PLACED: 'ORDER_PLACED',
  READY_TO_SERVE: 'READY_TO_SERVE',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
};

export const StatusConstants = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  SOLDOUT: 'SOLDOUT',
};
export const CategoryProduct = {
  CATEGORY: 'CATEGORY',
  TOTALPRICE: 'TOTAL-PRICE',
  TOTALQUANTITY: 'TOTAL-QUANTITY',
};

export const StockMonitorConstants = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
};
export const StatusArrayConstants = ['INACTIVE', 'ACTIVE', 'SOLDOUT'];
export const StockMonitorArrayConstants = ['ENABLED', 'DISABLED'];
export const SortingConstants = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
};
export const CompleteConstants = {
  save: 'save',
  print: 'print',
};

export const PaymentStatusConstants = {
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
};
export const CustomCodeTypes = {
  FREETEXT: 'Free Text',
  FIXED: 'Fixed',
};
export const Codes = {
  CUSTOMERCODES: 'CustomerCodes',
  CUSTOMERCODEMODE: 'CustomerCodeMode',
  CUSTOMERCODETYPE: 'CustomerCodeType',
  CUSTOMCODES: 'CustomCodes',
  CUSTOMCODEMODE: 'CustomCodeMode',
  CUSTOMCODETYPE: 'CustomCodeType',
};

export const Constants = {
  COMPLETECONSTANT: 'CompleteConstant',
};
export const TerminalTypes = {
  MERCHANT: 'merchant-billing',
  USER: 'user-billing',
};
export const TerminalTypeLabels = {
  'merchant-billing': 'Merchant',
  'user-billing': 'User',
};
export const AppTypes = {
  KIOSK_LINUX: 'linux-kiosk',
  KIOSK_WINDOWS: 'windows-kiosk',
  ANDROID_APK_MERCHANT: 'android-merchant',
  ANDROID_APK_USER: 'android-user',
  IPAD_OR_IOS_APPSTORE_MERCHANT: 'ios-merchant',
  IPAD_OR_IOS_APPSTORE_USER: 'ios-user',
  DESKTOP_LINUX: 'linux-merchant',
  DESKTOP_WINDOWS: 'windows-merchant',
  WEB_MERCHANT: 'web-merchant',
  WEB_USER: 'web-user',
  ANDROID_IOS: 'android/ios',
};

export const BillingKeyVerification = {
  BILLINGKEYVERIFICATION: 'Billing key verified',
};
export const ValidationConstants = {
  BILLINGKEY: 'Enter Billing Key',
  DELETED_SUCCESSFULLY: 'Deleted successfully',
};
export const LocalStorageKeys = {
  BILLINGKEYSTATUS: 'billingKeyStatus',
};

export const ROLES_DATA = {
  master: {
    id: 1,
    role: 'master',
    label: 'Master',
  },
  store_staff: {
    id: 2,
    role: 'store_staff',
    label: 'Store Staff',
  },
  store_manager: {
    id: 3,
    role: 'store_manager',
    label: 'Store Manager',
  },
  marketing: {
    id: 4,
    role: 'marketing',
    label: 'Marketing',
  },
  manager_and_staff: {
    id: 5,
    role: 'manager_and_staff',
    label: 'Manager&Staff',
  },
};

export const ROLES = ['master', 'store_staff', 'store_manager', 'marketing', 'manager_and_staff'];
export const ROLES_WITHOUT_STORE_STAFF = [
  'master',
  'store_manager',
  'marketing',
  'manager_and_staff',
];
export const AUTHORIZED_ROLES = ['master', 'store_manager', 'manager_and_staff'];
export const ROLES_DATA_ID = {
  1: {
    id: 1,
    role: 'master',
    label: 'Master',
  },
  2: {
    id: 2,
    role: 'store_staff',
    label: 'Store Staff',
  },
  3: {
    id: 3,
    role: 'store_manager',
    label: 'Store Manager',
  },
  4: {
    id: 4,
    role: 'marketing',
    label: 'Marketing',
  },
  5: {
    id: 5,
    role: 'manager_and_staff',
    label: 'Manager&Staff',
  },
};
export const RawMaterials = {
  RAW_MATERIALS: 'RAW_MATERIALS',
};
export const DEVICE_TYPES = {
  ANDROID_MOBILE: 'Android Mobile',
  ANDROID_TABLET: 'Android Tablet',
  IPAD: 'Ipad',
  MAC: 'Mac',
  MAC_DESKTOP_APP: 'Mac Desktop App',
  IPHONE: 'IPhone',
  LINUX: 'Linux',
  LINUX_DESKTOP: 'Linux Desktop',
  WINDOWS_DESKTOP: 'Windows Desktop',
  ANDROID_IOS: 'Mobile or Tablet',
  UNKNOWN: 'Unknown',
};
export const SignInTypes = {
  MASTER: 'master',
  MANAGER: 'manager',
  TERMINAL: 'terminal',
};
export const TERMINAL_STATUS = {
  TRIAL_ACOUNT: 'TRIAL-ACCOUNT',
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  FREEMIUM: 'FREEMIUM',
  MONITOR: 'MONITOR',
};
export const TERMINAL_STATUS_COLORS = {
  'TRIAL-ACCOUNT': '#ffaa00',
  EXPIRED: '#ff0000',
  PAID: '#198754',
  UNPAID: '#f06d1b',
  FREEMIUM: '#7232bd',
  MONITOR: '#1da1f2',
  DEFAULT: '#0dcaf0',
};
export const UNIT_TYPES = [
  {
    id: 0,
    label: 'Gram',
    value: 'gm',
  },
  {
    id: 1,
    label: 'Millilitre',
    value: 'ml',
  },
];

export const REQUIRED_CONSTANTS = {
  CATEGORY: 'Category is required',
  STORE_ID: 'Store Id is required',
  TERMINAL_ID: 'Terminal id is required',
  STORE_NAME: 'Store name required',
  EMAIL: 'Email is required',
  TERMINAL_NAME: 'Terminal name is required',
  CONTACT_NUMBER: 'Contact number is required',
  KEY: 'Key is required',
  TERMINAL_NUMBER: 'Terminal number is required',
  PASS_KEY: 'Passkey is required',
  PASSWORD: 'Password is required',
  PIN: 'PIN is required',
  CONFIRM_PASSWORD: 'Confirm password is required',
  CONFIRM_PIN: 'Confirm PIN is required',
  NAME: 'Name is required',
  LATITUDE: 'Latitude is Required',
  RADIUS: 'Radius is Required',
  DELIVERY: 'Delivery is Required',
  LONGITUDE: 'Longitude is Required',
  ADDRESS: 'Address is Required',
  MINIMUM_DISTANCE: 'Minimum Distance is Required',
  BUSINESS_NAME: 'Business name is required',
  OLD_PASSWORD: 'Old password is required',
  UNITS: 'Units is required',
  ITEM: 'Product name is required',
  COUNTER_NAME: 'Counter name is required',
  DESCRIPTION: 'Description required',
  HOST: 'Host required',
  PORT: 'Port required',
  PORT_SHOULD_BE_MORE_THAN_TO_0: 'Port should be more than to 0',
  LAN_TYPE_REQUIRED: 'Lan type required',
  VEG_NONVEG: 'Veg/Non-veg required',
  PRICE: 'Price required',
  MIN_IMAGE: 'Min&Max 1 image required',
  UNIT_TYPE: 'Unit Type is required',
  DATE: 'Date is required',
  AMOUNT: 'Amount is required',
  MINIMIM_UNIT: 'Minimum 1 unit required',
  LOCATION: 'Select Any one Location',
  UNITS_DATA: 'Units data is required',
  PRODUCT_IMAGE: 'Product image required',
  PAYMENT_TYPE: 'Payment type required',
  GST: 'GST Percentage Required',
  VENDOR_NAME: 'Vendor Name is Required',
  COMPANY_NAME: 'Company Name is Required',
  LOCATION_NAME: 'Location Name is Required',
  VENDOR_IS_REQUIRED: 'Vendor is Required',
  STORE_IS_REQUIRED: 'Store is Required',
  PAYMENT_TYPE_IS_REQUIRED: 'PaymentType is Required',
  STOCK_QUANTITY_IS_REQUIRED: 'Stock quantity is required',
  STOCK_QUANTITY_SHOULD_BE_MORE_THAN_TO_0: 'Stock quantity should be more than to 0',
  STOCK_QUANTITY_IS_NOT_AVAILABLE: 'Stock quantity is not available',
  VALUE: 'Value should be more than zero',
  PRODUCT_NAME: 'Product name is required',
  PRODUCT: 'Product is required',
};
export const PINCODE_REGEX = /^[1-9][0-9]{0,5}$/;
export const LATITUDE_REGEX = /^(-?([1-8]?\d(\.\d{1,6})?|90(\.0{1,6})?))$/;
export const LONGITUDE_REGEX = /^(-?(180(\.0{1,6})?|((1[0-7]\d)|([1-9]?\d))(\.\d{1,6})?))$/;
export const RADIUS_REGEX = /^(-?\d{0,2}(\.\d{0,6})?)?$/;
export const GOOGLE_MAPS_API_KEY = 'AIzaSyAdW4qL5HFjjYy-J2ncUAgNBzq5gaSLUCs';

export const VALIDATE_CONSTANTS = {
  INFO_MAX_30_CHAR: 'Info should not exceed 200 characters',
  CONTACT_NUMBER: 'Enter a valid contact number',
  NAME_30CHAR: 'Name should not exceed 30 characters',
  STORE_NAME_30CHAR: 'Store name should not exceed 30 characters',
  BUSINESS_NAME_30CHAR: 'Business name should not exceed 30 characters',
  USERNAME: 'Enter valid username',
  PASSWORD_SHOULD_SAME: 'Confirm password and password must be same',
  PIN_SHOULD_SAME: 'PIN and confirm PIN must be same',
  EMAIL: 'Enter valid email',
  ABOVE_ZERO_UNITS: 'Units should be greater than 0',
  ABOVE_ZERO_PRICE: 'Price should be greater than 0',
  UNITS_ALREADY: 'Units already used!',
  PRICE_ALREADY: 'Price already Used!',
  MAXIMUM_8_CHAR: 'Maximum 8 characters only',
  MAXIMUM_12_CHAR: 'Maximum 12 characters only',
  PRICE_NOT_ZERO: 'Price must be greater than 0',
  PERCENTAGE_NOT_BELOW: 'Percentage cannot below 0',
  PERCENTAGE_NOT_ABOVE: 'Percentage cannot above 100',
  ADDRESS_CANNOT_EMPTY: 'Address cannot be empty',
  STOCK_CANNOT_EMPTY: 'Stock cannot be empty',
  NEW_STOCK_EMPTY: 'New stock cannot be empty or zero',
  REDUCE_STOCK_EMPTY: 'Reduce stock cannot be empty or zero',
  STOCK_IS_NOT_AVAILABLE: 'Stock is not available',
  QUANTITY_NOT_ZERO: 'Quantity must be greater than 0',
  RATE_NOT_ZERO: 'Rate must be greater than 0',
  PRODUCT_NAME: 'Product name is required',
  PRODUCT: 'Product is required',
};
export const ESTIMATE_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FULL_PAYMENT: 'FULL-PAYMENT',
  REFUND_INITIATED: 'Refund_initiated',
  CANCEL: 'Cancelled',
  SUCCESS: 'SUCCESS',
};

export const PURCHASE_ORDER_PAYMENT_TYPE = {
  FULL_PAYMENT: 'FULL-PAYMENT',
  PARTIAL: 'PARTIALLY PAID',
  CREDIT: 'CREDIT',
};

export const ORDER_TYPE = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  CANCEL: 'CANCELLED',
  FAILED: 'FAILED',
};
export const ORDER_STATUS_TYPES = {
  COMPLETED: 'COMPLETED',
  ORDER_PLACED: 'ORDER-PLACED',
  READY_TO_SERVE: 'READY-TO-SERVE',
  DELIVERED: 'DELIVERED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  'BILL DELETED': "'BILL DELETED'",
};
export const CHANGE_ORDER_STATUS_TYPES = {
  COMPLETED: 'COMPLETED',
  ORDER_PLACED: 'ORDER-PLACED',
  READY_TO_SERVE: 'READY-TO-SERVE',
  DELIVERED: 'DELIVERED',
};
export const CHANGE_ORDER_STATUS_TYPES_SHOW = [
  'COMPLETED',
  'ORDER-PLACED',
  'READY-TO-SERVE',
  'DELIVERED',
];
export const ORDER_STATUS_VALUES = [
  'COMPLETED',
  'ORDER-PLACED',
  'READY-TO-SERVE',
  'DELIVERED',
  'PENDING',
  'CANCELLED',
  'FAILED',
  'BILL DELETED',
];

export const STORE_PURCHASE_CONSTANTS = {
ADD_PRODUCT : "Please add product or raw material",
ON_EDIT: "ON_EDIT",
OPEN : "OPEN",
PENDING: "PENDING",
APPROVED: "APPROVED",
STORE: "store",
REJECTED: "REJECTED",
}

export const ORDER_STATUS_COLORS = {
  COMPLETED: '#47C61B',
  'ORDER-PLACED': '#00B8D9',
  'READY-TO-SERVE': '#FFAB00',
  DELIVERED: '#5A0A45',
  PENDING: '#919EAB',
  CANCELLED: '#FF0000',
  'BILL DELETED': '#ff3717',
  FAILED: '#7A4100',
  Refund_initiated: '#FF0000',
};
export const ORDER_STATUS_TYPES_LABELS = {
  COMPLETED: 'Completed',
  'ORDER-PLACED': 'Order Placed',
  'READY-TO-SERVE': 'Ready to serve',
  DELIVERED: 'Delivered',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  'BILL DELETED': 'Bill deleted',
};
export const ORDER_STATUS = {
  FULL_PAYMENT: 'FULL-PAYMENT',
  PARTIAL: 'PARTIAL',
  CREDIT: 'CREDIT',
};
export const MEMBERSHIP_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const REFUND_STATUS = {
  FULL_REFUND: 'FULL-REFUND',
  PARTIAL: 'PARTIAL',
};

export const PAYMENT_TYPE_VALUES = ['FULL-PAYMENT', 'PARTIAL', 'CREDIT'];
export const ORDER_STATUS_LABELS = {
  'FULL-PAYMENT': 'Full payment',
  PARTIAL: 'Partial',
  CREDIT: 'Credit',
};
export const EstimateStatusSections = [
  {
    name: ESTIMATE_STATUS.PENDING,
    status: ESTIMATE_STATUS.PENDING,
    icon: 'material-symbols:pending',
  },
  {
    name: ESTIMATE_STATUS.COMPLETED,
    status: ESTIMATE_STATUS.COMPLETED,
    icon: 'fluent-mdl2:completed-solid',
  },
];

export const OrderStatusSections = [
  {
    name: ORDER_STATUS.ALL,
    status: ORDER_STATUS.ALL,
    icon: 'material-symbols:pending',
    color: 'primary',
  },
  {
    name: ORDER_STATUS.FULL_PAYMENT,
    status: ORDER_STATUS.FULL_PAYMENT,
    icon: 'material-symbols:pending',
    color: 'success',
  },
  {
    name: ORDER_STATUS.PARTIAL,
    status: ORDER_STATUS.PARTIAL,
    icon: 'fluent-mdl2:completed-solid',
    color: 'warning',
  },
];

export const ADDRESS = 'Address';
export const BANKING_DETAILS = 'bankingDetails';

export const vendorDetailsSections = [
  {
    name: 'Address',
    status: ADDRESS,
  },
  {
    name: 'Banking Details',
    status: BANKING_DETAILS,
  },
];

export const SettingsSections = [
  {
    title: 'Logo',
    path: '/settings/uploadLogo',
    icon: 'icon-park-twotone:pic-one',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Kiosk banner',
    path: '/settings/banners',
    icon: 'solar:gallery-bold',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Store',
    path: '/settings/config',
    icon: 'gala:settings',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Store QR Code',
    path: '/settings/scanqr',
    icon: 'ant-design:code-outlined',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Intent',
    path: '/settings/intent',
    icon: 'ant-design:code-outlined',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Membership',
    path: '/settings/memberShip',
    icon: 'ant-design:code-outlined',
    roleAllowed: [...ROLES],
  },
  {
    title: 'E-bill',
    path: '/settings/eBilling',
    icon: 'ant-design:code-outlined',
    roleAllowed: [...ROLES],
  },

  {
    title: 'Terminal',
    path: '/settings/terminalConfig',
    icon: 'gala:settings',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Printers',
    path: '/settings/printer',
    icon: 'mdi:printer-pos-cog',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Custom Code',
    path: '/settings/customCode',
    icon: 'ant-design:code-outlined',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Integrations',
    path: '/settings/integration',
    icon: 'pajamas:template',
    roleAllowed: [...ROLES],
  },
  {
    title: 'Notifications',
    path: '/settings/notifications',
    icon: 'mdi:notification-settings',
    roleAllowed: [...AUTHORIZED_ROLES],
  },

  // {
  //   title: 'Payment Gateway',
  //   path: '/settings/paymentgateway',
  //   icon: 'pajamas:template',
  //   roleAllowed: [...ROLES],
  // },
];

export const OrderTableHeaders = [
  'Order ID',
  'Date',
  'Order type',
  'Amount(₹)',
  'GST(₹)',
  'Total(₹)',
  'Status',
  '',
];

export const PaymentTableHeaders = [
  'Payment id',
  'Datetime',
  'Order Amount(₹)',
  'Paid Amount(₹)',
  'Reason',
  'Payment status',
  'Payment type',
  '',
];

export const ProductTableHeaders = [
  'Name',
  'Category',
  'Units',
  'Quantity',
  'Unit price(₹)',
  'Product total(₹)',
];

export const CountersTableHeaders = ['Counter Name', 'Description', 'Collected Amount(₹)'];
export const ShiftTableHeaders = [
  'Date',
  'Cashier Name',
  'Shift Start Time',
  'Shift End Time',
  'Total Orders',
  'Cashier Total Amount(₹)',
  'Today Total Sale(₹)',
  'Difference(₹)',
];
export const TerminalsTableHeaders = ['Terminal Name', 'Total Orders', 'Collected Amount(₹)'];

export const ExpenseTableHeaders = [
  'Date',
  'Expense',
  'Category',
  'Payment type',
  'Amount(₹)',
  'Additional Info',
  '',
];

export const GSTTableHeaders = [
  'Payment ID',
  'Date',
  'Amount(₹)',
  'GST amount(₹)',
  'Total amount(₹)',
  'Payment status',
  'Payment type',
  'Name',
  'Contact number',
];
export const StockTableHeaders = [
  'Date',
  'Store ID',
  'Product ID',
  'Name',
  'Stock added',
  'Additional info',
];
export const StockSummaryReportHeaders = ['Product ID', 'Name', 'In', 'Out', 'Wastage'];
export const WastageSummaryReportHeaders = ['Date', 'Product ID', 'Name', 'Wastage'];
export const AttendanceTableHeaders = [
  'Date',
  'StaffName',
  'Attendance',
  'InTime',
  'OutTime',
  'OverTime',
  'Leavehours',
];

export const ProfitTableHeaders = [
  'Product Id',
  'Name',
  'Price',
  'Base Price',
  'Total Price',
  'Total Base Price',
  'Quantity',
  'Profit',
  '',
];

export const OrderTableColumns = [
  {
    title: '',
    field: 'checkbox',
  },
  {
    title: 'Order ID',
    field: 'orderId',
  },
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Order type',
    field: 'orderType',
  },
  {
    title: 'Total Amount(₹)',
    field: 'orderAmount',
  },
  {
    title: 'GST Amount(₹)',
    field: 'GSTPrice',
  },
  {
    title: 'Table Name',
    field: 'tableName',
  },
  {
    title: 'Captain Name',
    field: 'captainName',
  },
  {
    title: 'Packing Charges(Item level) ',
    field: 'totalParcelCharges',
  },
  {
    title: 'Additional Discount(₹)',
    field: 'additionalDiscount',
  },
  {
    title: 'Additional Charges(₹)',
    field: 'additionalCharges',
  },
  {
    title: 'Over All Packing Charges(₹)',
    field: 'packingCharges',
  },
  {
    title: 'Delivery Charges(₹)',
    field: 'deliveryCharges',
  },
  {
    title: 'Rounded Off(₹)',
    field: 'roundOff',
  },
  {
    title: 'Delivery Date',
    field: 'deliveryDate',
  },
  {
    title: 'Payment type',
    field: 'paymentType',
  },
  {
    title: 'Status',
    field: 'status',
  },
];

export const OrderSortTable = [
  'name',
  'category',
  'status',
  'roundOff',
  'orderId',
  'orderAmount',
  'orderType',
  'paymentType',
  'GSTPrice',
  'additionalDiscount',
  'additionalCharges',
  'packingCharges',
  'deliveryCharges',
];

export const ProfitAndLossTableColumns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Profit(₹)',
    field: 'profit',
  },
  {
    title: 'Quantity',
    field: 'quantity',
  },
  {
    title: 'Total Price(₹)',
    field: 'totalPrice',
  },
  {
    title: 'Price(₹)',
    field: 'price',
  },
  {
    title: 'Base Price(₹)',
    field: 'basePrice',
  },
  {
    title: 'Product Id',
    field: 'productId',
  },
];

export const ProfitAndLossSortTable = [
  'productId',
  'quantity',
  'price',
  'basePrice',
  'totalPrice',
  'totalBasePrice',
  'profit',
];

export const PaymentTableColumns = [
  {
    title: 'Payment ID',
    field: 'paymentId',
  },
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Order ID',
    field: 'orderId',
  },
  {
    title: 'Order amount(₹)',
    field: 'orderAmount',
  },
  {
    title: 'Rounded Off(₹)',
    field: 'roundOff',
  },
  {
    title: 'Paid amount(₹)',
    field: 'paidAmount',
  },
  {
    title: 'Mode',
    field: 'paymentMode',
  },
  {
    title: 'Reason',
    field: 'reason',
  },
  {
    title: 'Payment status',
    field: 'paymentStatus',
  },
  {
    title: 'Payment type',
    field: 'type',
  },
];

export const PaymentSortTable = [
  'paymentId',
  'type',
  'paymentStatus',
  'reason',
  'time',
  'additionalDiscount',
  'additionalCharges',
  'packingCharges',
  'deliveryCharges',
  'orderAmount',
  'paidAmount',
  'roundOff',
  'paymentMode',
];

export const CategoryTableColumns = [
  {
    title: 'Category',
    field: 'name',
  },
  {
    title: 'Sold quantity',
    field: 'sold_quantity',
  },
  {
    title: 'Total product sale(₹)',
    field: 'Total_product_sale',
  },
  {
    title: 'GST',
    field: 'Gst',
  },

  {
    title: 'Parcel charges',
    field: 'parcelCharges',
  },
];

export const MemberTableColumns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Contact Number',
    field: 'contactNumber',
  },
  {
    title: 'Amount(₹)',
    field: 'amount',
  },
  {
    title: 'Status',
    field: 'status',
  },
  {
    title: 'Date of Subscription',
    field: 'dateOfSubscription',
  },

  {
    title: 'Next renewal',
    field: 'nextRenewal',
  },
];

export const CustomCodeTableColumns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Category',
    field: 'category',
  },
  {
    title: 'Custom name',
    field: 'codeName',
  },
  {
    title: 'Counter',
    field: 'counterName',
  },
  {
    title: 'Sold quantity ',
    field: 'totalQuantity',
  },
  {
    title: 'Total price(₹)',
    field: 'Total_price',
  },
  {
    title: 'Parcel charges(₹)',
    field: 'totalParcelCharges',
  },
];
export const ProductTableColumns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Sold quantity ',
    field: 'sold_quantity',
  },
  {
    title: 'Total price(₹)',
    field: 'Total_price',
  },
  {
    title: 'Category',
    field: 'category',
  },
  {
    title: 'Counter',
    field: 'counter_name',
  },

  {
    title: 'Parcel charges(₹)',
    field: 'parcelCharges',
  },
  {
    title: 'ProductID',
    field: 'productId',
  },
];

export const ProductTableColumnsOpenOrders = [
  {
    title: 'Order ID',
    field: 'orderId',
  },
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Category',
    field: 'category',
  },
  {
    title: 'Quantity',
    field: 'quantity',
  },
  {
    title: 'Type',
    field: 'type',
  },
  {
    title: 'Order amount(₹)',
    field: 'orderAmount',
  },
  {
    title: 'Payment status',
    field: 'paymentStatus',
  },
];

export const ProductTableColumnsForDayWise = [
  {
    title: 'Date',
    field: 'date',
  },

  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Sold quantity ',
    field: 'sold_quantity',
  },

  {
    title: 'Per unit price(₹)',
    field: 'price',
  },
  {
    title: 'Category',
    field: 'category',
  },

  {
    title: 'ProductID',
    field: 'productId',
  },
];
export const ProductTableColumnsForStockDayWise = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Opening stock',
    field: 'StockIn',
  },
  {
    title: 'Stock added',
    field: 'todayInStock',
  },
  {
    title: 'Sold quantity',
    field: 'todayOutStock',
  },
  {
    title: 'Wastage',
    field: 'todayWastageStock',
  },
  {
    title: 'Closing stock',
    field: 'StockOut',
  },
  // {
  //   title: 'Product ID',
  //   field: 'productId',
  // },
  // {
  //   title: 'Sold quantity ',
  //   field: 'sold',
  // },
];

export const ProductSortTable = ['productId', 'total', 'unit', 'Total_price', 'sold_quantity'];

export const CountersTableColumns = [
  {
    title: 'Name',
    field: 'counter_name',
  },

  {
    title: 'Sale Amount(₹)',
    field: 'total_price',
  },
  {
    title: 'Expense(₹) ',
    field: 'expense',
  },
  {
    title: 'Purchase(₹)',
    field: 'purchase_amount',
  },
  {
    title: 'Income(₹) ',
    field: 'counter_income',
  },
];

export const ShiftsTableColumns = [
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Cashier Name',
    field: 'staffName',
  },
  {
    title: 'Shift Start Time',
    field: 'logInTime',
  },
  {
    title: 'Shift End Time',
    field: 'time',
  },
  {
    title: 'Total Orders',
    field: 'totalOrders',
  },
  {
    title: 'Cashier Total Amount(₹)',
    field: 'totalAmount',
  },
  {
    title: 'Today Total Sale(₹)',
    field: 'saleToday',
  },
  {
    title: 'Difference(₹)',
    field: 'difference',
  },
];
export const TerminalsTableColumns = [
  {
    title: 'Terminal Name',
    field: 'terminalName',
  },
  {
    title: 'Total Orders',
    field: 'totalOrders',
  },
  {
    title: 'Collected Amount(₹)',
    field: 'total',
  },
];

export const ExpenseCategoryColumns = [
  {
    title: 'Category',
    field: 'category',
  },
  {
    title: 'Total order',
    field: 'totalOrder',
  },
  {
    title: 'Amount(₹)',
    field: 'collectedAmount',
  },
];

export const ExpenseTableColumns = [
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Expense',
    field: 'name',
  },
  {
    title: 'Amount(₹)',
    field: 'amountSpent',
  },
  {
    title: 'Payment type',
    field: 'paymentType',
  },
  {
    title: 'Category',
    field: 'category',
  },

  {
    title: 'Additional info',
    field: 'additionalInfo',
  },
];

export const PAYMENT_BY_CONSTANT = [
  { label: "Radio Button", value: "radio" },
  { label: "Select Box", value: "select" },
];

export const GstTableColumns = [
  {
    title: 'Payment ID',
    field: 'paymentId',
  },
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Amount WO GST (₹)',
    field: 'amount',
  },

  {
    title: 'GST Amount(₹)',
    field: 'GSTPrice',
  },
  {
    title: 'Order Amount(₹)',
    field: 'orderAmount',
  },
  {
    title: 'Payment status',
    field: 'paymentStatus',
  },
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Contact number',
    field: 'contactNumber',
  },
];

export const GstSortTable = [
  'paymentId',
  'type',
  'amount',
  'GSTPrice',
  'paymentStatus',
  'name',
  'contactNumber',
  'paymentMode',
  'orderAmount',
];

export const StockTableColumns = [
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Product ID',
    field: 'productId',
  },
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Order ID',
    field: 'orderId',
  },
  {
    title: 'Type',
    field: 'type',
  },
  {
    title: 'Status',
    field: 'stockAdded',
  },

  {
    title: 'Additional info',
    field: 'additionalInfo',
  },
  {
    title: 'Current stock',
    field: 'newStockQuantity',
  },
];
export const StockSummaryReportTableColumns = [
  {
    title: 'Name',
    field: 'name',
  },

  {
    title: 'In',
    field: 'inStock',
  },
  {
    title: 'Out',
    field: 'outStock',
  },

  {
    title: 'Wastage',
    field: 'wastageStock',
  },
  {
    title: 'Product ID',
    field: 'productId',
  },
];
export const WastageReportTableColumns = [
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Product ID',
    field: 'productId',
  },
  {
    title: 'Name',
    field: 'name',
  },

  {
    title: 'Wastage',
    field: 'stockAdded',
  },
  {
    title: 'wastageValue',
    field: 'wastageValue',
  },
  {
    title: 'Type',
    field: 'type',
  },
];
export const AttendanceReportTableColumns = [
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Staff Name',
    field: 'name',
  },
  {
    title: 'Attendance',
    field: 'attendance',
  },
  {
    title: 'In Time',
    field: 'inTime',
  },
  {
    title: 'Out Time',
    field: 'outTime',
  },
  {
    title: 'Work hours',
    field: 'workHours',
  },
  {
    title: 'Overtime',
    field: 'overTime',
  },
  {
    title: 'Leave hours',
    field: 'leaveHours',
  },
];

export const StockSortTable = [
  'storeId',
  'type',
  'productId',
  'orderId',
  'stockAdded',
  'newStockQuantity',
  'additionalInfo',
];
export const StockSummarySortTable = [
  'storeId',
  'type',
  'productId',
  'orderId',
  'stockAdded',
  'newStockQuantity',
  'additionalInfo',
];
export const AttendanceSortTable = [
  'date',
  'staffName',
  'attendance',
  'inTime',
  'outTime',
  'overTime',
  'leaveHours',
];

export const EndShiftTableColumns = [
  {
    title: 'Shift Closing Time',
    field: 'date',
  },
  {
    title: 'Cashier Name',
    field: 'staffName',
  },
  {
    title: 'Total Orders',
    field: 'totalOrders',
  },
  {
    title: 'Cashier Total Amount(₹)',
    field: 'totalAmount',
  },
  {
    title: 'Total Shift Payment(₹)',
    field: 'totalShiftPayment',
  },
  {
    title: 'Difference(₹)',
    field: 'difference',
  },
];
export const EndShiftSortTable = [
  'orderId',
  'totalAmount',
  'cash',
  'card',
  'upi',
  'terminalNumber',
  'saleToday',
  'shiftExpense',
  'difference',
];

export const InventoryTableColumns = [
  {
    label: 'Name',
    id: 'name',
    alignRight: false,
    style: { minWidth: 200, position: 'sticky', left: 80, zIndex: 99 },
  },
  {
    label: 'Stock quantity',
    id: 'stockQuantity',
    alignRight: false,
    style: { minWidth: 130 },
  },

  {
    label: 'Price(₹)',
    id: 'price',
    alignRight: false,
    style: { minWidth: 100 },
  },
  {
    label: 'Base price(₹)',
    id: 'basePrice',
    alignRight: false,
    style: { minWidth: 150 },
  },

  {
    label: 'GST(%)',
    id: 'GSTPercent',
    alignRight: false,
    style: { minWidth: 100 },
  },
  {
    label: 'MRP(₹)',
    id: 'mrp',
    alignRight: false,
    style: { minWidth: 100 },
  },

  {
    label: 'Discount(%)',
    id: 'discount',
    alignRight: false,
    style: { minWidth: 100 },
  },
  {
    label: 'Offer price',
    id: 'offerPrice',
    alignRight: false,
    style: { minWidth: 110 },
  },
  {
    label: 'Parcel charges(₹)',
    id: 'parcelCharges',
    alignRight: false,
    style: { minWidth: 150 },
  },
  {
    label: 'Category',
    id: 'category',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Member Price',
    id: 'memberPrice',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Counter',
    id: 'counterId',
    alignRight: false,
    style: { minWidth: 100 },
  },
  {
    label: 'Low Stock Quantity',
    id: 'lowStock',
    alignRight: false,
    style: { minWidth: 210 },
  },
  {
    label: 'Description',
    id: 'description',
    alignRight: false,
    style: { minWidth: 80 },
  },
  {
    label: 'Session',
    id: 'sessionInfo',
    alignRight: false,
    style: { minWidth: 80 },
  },
  {
    label: 'Ingredient',
    id: 'ingredient',
    alignRight: false,
    style: { minWidth: 80 },
  },

  {
    label: 'Product ID',
    id: 'productId',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Image',
    id: '',
    alignRight: false,
    style: { minWidth: 80 },
  },
];
export const MembershipTableColumns = [
  {
    label: 'Name',
    id: 'name',
    alignRight: false,
    style: { minWidth: 150 },
  },
  {
    label: 'Contact Number',
    id: 'contactNumber',
    alignRight: false,
    style: { minWidth: 150 },
  },

  {
    label: 'Date of subscription',
    id: 'dateOfSubscription',
    alignRight: false,
    style: { minWidth: 200 },
  },
  {
    label: 'Next Renewal',
    id: 'nextRenewal',
    alignRight: false,
    style: { minWidth: 150 },
  },
];

export const MaterialTableColumns = [
  {
    label: 'Name',
    id: 'name',
    alignRight: false,
    style: { minWidth: 200, position: 'sticky', left: 80, zIndex: 99 },
  },
  {
    label: 'Stock quantity',
    id: 'stockQuantity',
    alignRight: false,
    style: { minWidth: 130 },
  },

  {
    label: 'Category',
    id: 'category',
    alignRight: false,
    style: { minWidth: 130 },
  },

  {
    label: 'Unit name',
    id: 'unitName',
    alignRight: false,
    style: { minWidth: 120 },
  },
  {
    label: 'Linked product',
    id: 'linkedproduct',
    alignRight: false,
    style: { minWidth: 150 },
  },
  {
    label: 'Product ID',
    id: 'productId',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Batch ID',
    id: 'batchId',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Low Stock Quantity',
    id: 'lowStockQuantity',
    alignRight: false,
    style: { minWidth: 180 },
  },
  {
    label: `Total Average Value (₹)`,
    id: 'rawValue',
    alignRight: false,
    style: { minWidth: 180 },
  },
  {
    label: `Unit Average Value (₹)`,
    id: 'unitAverageValue',
    alignRight: false,
    style: { minWidth: 180 },
  },
  {
    label: 'Manufacture date',
    id: 'manufactureDate',
    alignRight: false,
    style: { minWidth: 160 },
  },
  {
    label: 'Expiry date',
    id: 'expiryDate',
    alignRight: false,
    style: { minWidth: 150 },
  },
  {
    label: 'Image',
    id: '',
    alignRight: false,
    style: { minWidth: 50, position: 'sticky', right: 0, zIndex: 99 },
  },
];
export const MaterialUnitsTableColumns = [
  {
    label: 'Name',
    id: 'name',
    alignRight: false,
    style: { minWidth: 200, position: 'sticky', left: 0, zIndex: 99 },
  },
  {
    label: 'Product ID',
    id: 'productId',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Variant',
    id: 'variant',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Batch ID',
    id: 'batchId',
    alignRight: false,
    style: { minWidth: 130 },
  },
  {
    label: 'Category',
    id: 'category',
    alignRight: false,
    style: { minWidth: 130 },
  },

  {
    label: 'Stock quantity',
    id: 'stockQuantity',
    alignRight: false,
    style: { minWidth: 130 },
  },

  {
    label: 'Unit name',
    id: 'unitName',
    alignRight: false,
    style: { minWidth: 120 },
  },

  {
    label: 'Manufacture date',
    id: 'manufactureDate',
    alignRight: false,
    style: { minWidth: 160 },
  },
  {
    label: 'Expiry date',
    id: 'expiryDate',
    alignRight: false,
    style: { minWidth: 150 },
  },

  {
    label: '',
    id: '',
    alignRight: false,
    style: { minWidth: 50, position: 'sticky', right: 0, zIndex: 99 },
  },
];
export const AddonsTableColumns = [
  {
    label: '',
    id: '',
    alignRight: false,
    style: { minWidth: 60 },
  },
  {
    label: 'Name',
    id: 'name',
    alignRight: false,
    style: { minWidth: 150, position: 'sticky', left: 48, zIndex: 99 },
  },
  {
    label: 'Description',
    id: 'description',
    alignRight: false,
    style: { minWidth: 200 },
  },
  {
    label: 'Price(₹)',
    id: 'price',
    alignRight: false,
    style: { minWidth: 100 },
  },
  {
    label: 'GST(%)',
    id: 'gst',
    alignRight: false,
    style: { minWidth: 100 },
  },
  {
    label: 'Attributes',
    id: 'attributes',
    alignRight: false,
    style: { minWidth: 100 },
  },
  {
    label: '',
    id: '',
    alignRight: false,
    style: { minWidth: 50, position: 'sticky', right: 0, zIndex: 99 },
  },
];

export const hideScrollbar = {
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
  overflowY: 'scroll',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
};

export const SYNC_UP_CONSTANTS = {
  READY: 'READY_TO_PULL',
  UPDATED: 'UPDATED',
};
export const SYNC_UP_CONTENT = {
  INVENTORY: 'INVENTORY',
};
export const USER_AGENTS = {
  REACT_NATIVE: 'REACT_NATIVE_AGENT',
  PRINT_RAW: 'PRINTRAW=TRUE',
};
export const FLOATING_MENU = {
  IMPORT_EXPORT: 'Import&Export',
  ADDONS: 'Addons',
  ADD_PRODUCT: 'Add new product',
};
export const PRINT_CONSTANT = {
  POS: 'POS',
  PDF: 'PDF',
  POS_BLUETOOTH: 'POS_BLUETOOTH',
  POS_USB: 'POS_USB',
  POS_LAN: 'POS_LAN',
  POS_BLUETOOTH_58MM: 'POS_BLUETOOTH_58MM',
  POS_BLUETOOTH_80MM: 'POS_BLUETOOTH_80MM',
  POS_BLUETOOTH_72MM: 'POS_BLUETOOTH_72MM',
  POS_USB_58MM: 'POS_USB_58MM',
  POS_USB_80MM: 'POS_USB_80MM',
  POS_USB_72MM: 'POS_USB_72MM',
  POS_LAN_58MM: 'POS_LAN_58MM',
  POS_LAN_80MM: 'POS_LAN_80MM',
  POS_LAN_72MM: 'POS_LAN_72MM',
};
export const ALL_CONSTANT = { ALL: 'all' };
export const SCAN_QR_CONSTANT = { SCAN_QR: 'scanQR' };

export const NAVIGATION_STATE_KEY = { ADD_PRODUCT: 'addProduct', ADD_MATERIAL: 'addMaterial' };
export const DATE_TIME_FORMAT_ATTENDANCE = {
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
};
export const NOTIFICATION_CONFIGURATIONS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};
export const PAYMENT_TYPES = {
  PARTIAL: 'PARTIAL',
  FULL_PAYMENT: 'FULL-PAYMENT',
  CREDIT: 'CREDIT',
};
export const PAYMENT_TYPES_CART = [
  { name: 'ADVANCE', value: 'PARTIAL' },
  { name: 'FULLPAYMENT', value: 'FULL-PAYMENT' },
];

export const TREND_STATUS = {
  up: {
    dark: '#21c55e',
    light: '#dcf6e5',
    symbol: '+',
  },
  down: {
    dark: '#ff0000',
    light: '#f1d6d6',
    symbol: '-',
  },
};

export const PARTIAL_BILLING_TABS = {
  ORDERS: 'ORDERS',
  PAYMENT_INFO: 'PAYMENT_INFO',
  CUSTOMER_INFO: 'CUSTOMER_INFO',
};

export const WHATSAPP_TABS = {
  BALANCE: 'BALANCE',
  MESSAGES_HISTORY: 'MESSAGES_HISTORY',
  RECHARGE_HISTORY: 'RECHARGE_HISTORY',
};

export const CONTACT_INFO = {
  EMAIL_ID: 'admin@positeasy.in',
  CONTACT_NUMBER: '90439 41910',
};
export const IDS = {
  ORDER_ID: 'orderId',
  ESTIMATE_ID: 'estimateId',
};

export const BUTTON_LOADING_STATUS = {
  COMPLETE: 'complete',
  SAVE: 'Save',
  SAVE_AND_PRINT: 'SaveAndPrint',
};
export var PRINTER_COMMANDS = {
  LF: '\x0a',
  ESC: '\x1b',
  FS: '\x1c',
  GS: '\x1d',
  US: '\x1f',
  FF: '\x0c',
  DLE: '\x10',
  DC1: '\x11',
  DC4: '\x14',
  EOT: '\x04',
  NUL: '\x00',
  EOL: '\n',
  HORIZONTAL_LINE: {
    HR_58MM: '==================================',
    HR2_58MM: '**********************************',
    HR3_58MM: '----------------------------------',
    HR_80MM: '================================================',
    HR2_80MM: '************************************************',
    HR3_80MM: '------------------------------------------------',
  },
  FEED_CONTROL_SEQUENCES: {
    /**
     * Print and line feed
     */
    CTL_LF: '\x0a',
    /**
     * Form feed
     */
    CTL_FF: '\x0c',
    /**
     * Carriage return
     */
    CTL_CR: '\x0d',
    /**
     * Horizontal tab
     */
    CTL_HT: '\x09',
    /**
     * Vertical tab
     */
    CTL_VT: '\x0b',
  },
  LINE_SPACING: {
    LS_DEFAULT: '\x1b\x32',
    LS_SET: '\x1b\x33',
    LS_SET1: '\x1b\x31',
  },
  HARDWARE: {
    /**
     * Clear data in buffer and reset modes
     */
    HW_INIT: '\x1b\x40',
    /**
     * Printer select
     */
    HW_SELECT: '\x1b\x3d\x01',
    /**
     * Reset printer hardware
     */
    HW_RESET: '\x1b\x3f\x0a\x00',
  },
  CASH_DRAWER: {
    /**
     * Sends a pulse to pin 2 []
     */
    CD_KICK_2: '\x1b\x70\x00',
    /**
     * ends a pulse to pin 5 []
     */
    CD_KICK_5: '\x1b\x70\x01',
  },
  MARGINS: {
    /**
     * Fix bottom size
     */
    BOTTOM: '\x1b\x4f',
    /**
     * Fix left size
     */
    LEFT: '\x1b\x6c',
    /**
     * Fix right size
     */
    RIGHT: '\x1b\x51',
  },
  PAPER: {
    /**
     * Full cut paper
     */
    PAPER_FULL_CUT: '\x1d\x56\x00',
    /**
     * Partial cut paper
     */
    PAPER_PART_CUT: '\x1d\x56\x01',
    /**
     * Partial cut paper
     */
    PAPER_CUT_A: '\x1d\x56\x41',
    /**
     * Partial cut paper
     */
    PAPER_CUT_B: '\x1d\x56\x42',
  },
  TEXT_FORMAT: {
    /**
     * Normal text
     */
    TXT_NORMAL: '\x1b\x21\x00',
    /**
     * Double height text
     */
    TXT_2HEIGHT: '\x1b\x21\x10',
    /**
     * Double width text
     */
    TXT_2WIDTH: '\x1b\x21\x20',
    /**
     * Double width & height text
     */
    TXT_4SQUARE: '\x1b\x21\x30',
    /**
     * other sizes
     */
    TXT_CUSTOM_SIZE: function (width, height) {
      var widthDec = (width - 1) * 16;
      var heightDec = height - 1;
      var sizeDec = widthDec + heightDec;
      return '\x1d\x21' + String.fromCharCode(sizeDec);
    },
    TXT_HEIGHT: {
      1: '\x00',
      2: '\x01',
      3: '\x02',
      4: '\x03',
      5: '\x04',
      6: '\x05',
      7: '\x06',
      8: '\x07',
    },
    TXT_WIDTH: {
      1: '\x00',
      2: '\x10',
      3: '\x20',
      4: '\x30',
      5: '\x40',
      6: '\x50',
      7: '\x60',
      8: '\x70',
    },
    /**
     * Underline font OFF
     */
    TXT_UNDERL_OFF: '\x1b\x2d\x00',
    /**
     * Underline font 1-dot ON
     */
    TXT_UNDERL_ON: '\x1b\x2d\x01',
    /**
     * Underline font 2-dot ON
     */
    TXT_UNDERL2_ON: '\x1b\x2d\x02',
    /**
     * Bold font OFF
     */
    TXT_BOLD_OFF: '\x1b\x45\x00',
    /**
     * Bold font ON
     */
    TXT_BOLD_ON: '\x1b\x45\x01',
    /**
     * Italic font ON
     */
    TXT_ITALIC_OFF: '\x1b\x35',
    /**
     * Italic font ON
     */
    TXT_ITALIC_ON: '\x1b\x34',
    /**
     * Font type A
     */
    TXT_FONT_A: '\x1b\x4d\x00',
    /**
     * Font type B
     */
    TXT_FONT_B: '\x1b\x4d\x01',
    /**
     * Font type C
     */
    TXT_FONT_C: '\x1b\x4d\x02',
    /**
     * Left justification
     */
    TXT_ALIGN_LT: '\x1b\x61\x00',
    /**
     * Centering
     */
    TXT_ALIGN_CT: '\x1b\x61\x01',
    /**
     *  Right justification
     */
    TXT_ALIGN_RT: '\x1b\x61\x02',
  },
};

export const UNSAVED_HOLD_CHANGES_WILL_BE_LOST_CONTINUE =
  'Unsaved Hold changes will be lost. Continue?';

export const LIVE_TRANSACTION_UPDATE_TIMER = 15000;

export const WEEKDAYS = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};
export const MINUTES_SECONDS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  51, 52, 53, 54, 55, 56, 57, 58, 59,
];
export const HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const defaultTimeValue = [
  {
    day: 0,
    startTime: '00:00:00',
    endTime: '23:59:59',
    enabled: true,
    label: 'SUNDAY',
  },
  {
    day: 1,
    startTime: '00:00:00',
    endTime: '23:59:59',
    enabled: true,
    label: 'MONDAY',
  },
  {
    day: 2,
    startTime: '00:00:00',
    endTime: '23:59:59',
    enabled: true,
    label: 'TUESDAY',
  },
  {
    day: 3,
    startTime: '00:00:00',
    endTime: '23:59:59',
    enabled: true,
    label: 'WEDNESDAY',
  },
  {
    day: 4,
    startTime: '00:00:00',
    endTime: '23:59:59',
    enabled: true,
    label: 'THURSDAY',
  },
  {
    day: 5,
    startTime: '00:00:00',
    endTime: '23:59:59',
    enabled: true,
    label: 'FRIDAY',
  },
  {
    day: 6,
    startTime: '00:00:00',
    endTime: '23:59:59',
    enabled: true,
    label: 'SATURDAY',
  },
];
export const IMPORT_EXPORT_TOOLBAR = {
  PARTNER_INVENTORY: 'partner_inventory',
  QR: 'qr',
  STOCK: 'stock',
  IMPORT_INVENTORY: 'import_inventory',
  REPORT: 'report',
  EXPORT_MENU: 'export_menu',
};

export const ROWS_PER_PAGE = 25;

export const PURCHASE_ORDERS_TABS = {
  ORDERS: 'ORDERS',
  BILLS: 'BILLS',
};

export const DEFAULT_GOOGLE_MAP_LOCATION = {
  lat: 13.033051,
  lng: 80.252522,
};

export const ORDERS_STATUS_CONSTANTS = {
  OPEN: 'OPEN',
  TRANSIT: 'TRANSIT',
  CANCELLED: 'CANCELLED',
  BILLED: 'BILLED',
  RECEIVED: 'RECEIVED',
  PARTIAL: 'PARTIALLY PAID',
  CLOSE: 'CLOSE',
};
export const STORE_ORDERS_STATUS_CONSTANTS = {
  OPEN: 'OPEN',
  ACKNOWLEDGE: 'ACKNOWLEDGE',
  TRANSIT: 'TRANSIT',
  CANCELLED: 'CANCELLED',
  BILLED: 'BILLED',
  RECEIVED: 'RECEIVED',
  PARTIAL: 'PARTIALLY PAID',
  CLOSE: 'CLOSE',
};

export const BILLS_STATUS_CONSTANTS = {
  BILLED: 'BILLED',
  PARTIAL: 'PARTIALLY PAID',
  CLOSE: 'CLOSE',
};

export const PURCHASE_ORDER_STATUS_FOR_BTN_GRP = [
  {
    name: 'OPEN',
  },
  {
    name: 'TRANSIT',
  },
  {
    name: 'RECEIVED',
  },
  {
    name: 'BILLED',
  },
  {
    name: 'PARTIALLY PAID',
  },
  {
    name: 'CLOSE',
  },
];

export const STORE_PURCHASE_ORDER_STATUS_FOR_BTN_GRP = [
  {
    name: 'OPEN',
  },
  {
    name: 'ACKNOWLEDGE',
  },
  {
    name: 'TRANSIT',
  },
  {
    name: 'RECEIVED',
  },
  {
    name: 'BILLED',
  },
  {
    name: 'PARTIALLY PAID',
  },
  {
    name: 'CLOSE',
  },
];
export const STORE_PURCHASE_STATUS = [
  {
    name: 'OPEN',
  },
  {
    name: 'TRANSIT',
  },
];

export const PURCHASE_ORDER_STATUS = {
  OPEN: 'OPEN',
  TRANSIT: 'TRANSIT',
  RECEIVED: 'RECEIVED',
  BILLED: 'BILLED',
  PARTIALLY_PAID: 'PARTIALLY PAID',
  CLOSE: 'CLOSE',
  CANCELLED: 'CANCELLED',
  RETURN: 'RETURN',
};
export const STORE_PURCHASE_ORDER_STATUS = {
  OPEN: 'OPEN',
  ACKNOWLEDGE: "ACKNOWLEDGE",
  TRANSIT: 'TRANSIT',
  RECEIVED: 'RECEIVED',
  BILLED: 'BILLED',
  PARTIALLY_PAID: 'PARTIALLY PAID',
  CLOSE: 'CLOSE',
  CANCELLED: 'CANCELLED',
  RETURN: 'RETURN',
};

export const PURCHASE_TO_SHOP = {
  PRODUCT: 'PRODUCTS',
  RAW_MATERIAL: 'RAW_MATERIALS',
};

export const PURCHASE_PAYMENT_MODE = {
  CASH: 'CASH',
  CARD: 'CARD',
  UPI: 'UPI',
  CHEQUE: 'CHEQUE',
  OTHERS: 'OTHERS',
};

export const PURCHASE_STOCK_ADD_OR_MATCH = {
  ADD: 'ADD',
  MATCH: 'MATCH',
};
export const CSV_OR_EXCEL_COLUMNS = [
  {
    label: 'Store ID',
    name: 'StoreId',
  },
  {
    label: 'Terminal ID',
    name: 'TerminalId',
  },
  {
    label: 'Order ID',
    name: 'OrderId',
  },
  {
    label: 'Date',
    name: 'Date',
  },
  {
    label: 'Time',
    name: 'Time',
  },
  {
    label: 'Payment Mode',
    name: 'Mode',
  },
  {
    label: 'Product ID',
    name: 'ProductId',
  },
  {
    label: 'Product Name',
    name: 'Name',
  },
  {
    label: 'Item Price',
    name: 'Item_price',
  },
  {
    label: 'Quantity',
    name: 'Quantity',
  },
  {
    label: 'Item Basic',
    name: 'Item_basic',
  },
  {
    label: 'Item GST',
    name: 'Item_GST',
  },
  {
    label: 'HSN/SAC',
    name: 'HSN/SAC_code',
  },
  {
    label: 'Item Total',
    name: 'item_total',
  },
  {
    label: 'AddOns',
    name: 'AddOns',
  },
  {
    label: 'Category',
    name: 'Category',
  },
  {
    label: 'Unit',
    name: 'Unit',
  },
  {
    label: 'Delivery Charges',
    name: 'DeliveryCharges',
  },
  {
    label: 'Packing Charges',
    name: 'PackingCharges',
  },
  {
    label: 'Additional Charges',
    name: 'AdditionalCharges',
  },
  {
    label: 'Additional Discount',
    name: 'AdditionalDiscount',
  },
  {
    label: 'RoundOff',
    name: 'RoundOff',
  },
  {
    label: 'Total Amount',
    name: 'TotalAmount',
  },
  {
    label: 'Total Gst',
    name: 'TotalGst',
  },
  {
    label: 'Order Status',
    name: 'OrderStatus',
  },
  {
    label: 'Customer Name',
    name: 'CustName',
  },
  {
    label: 'Address',
    name: 'Address',
  },
  {
    label: 'Contact Number',
    name: 'ContactNumber',
  },
  {
    label: 'Table Name',
    name: 'Table',
  },
  {
    label: 'Captain Name',
    name: 'Captain',
  },
];
export const StatusLabel = [
  {
    label: 'OPEN',
    id: 'OPEN',
  },
  {
    label: 'ORDER PLACED',
    id: 'ORDER_PLACED',
  },
  {
    label: 'READY TO SERVE',
    id: 'READY_TO_SERVE',
  },
  {
    label: 'DELIVERED',
    id: 'DELIVERED',
  },
  {
    label: 'COMPLETED',
    id: 'COMPLETED',
  },
  {
    label: 'CANCELLED',
    id: 'CANCELLED',
  },
];
export const PRINT_CONSTANT_LAN_CONSTANT = ['POS_LAN_58MM', 'POS_LAN_80MM', 'POS_LAN_72MM'];

export const GST_TYPE_CONSTANT = ['Inclusive', 'Exclusive'];

export const PurchaseOrderTableColumns = [
  {
    title: 'Purchase ID',
    field: 'purchaseId',
  },
  {
    title: 'Date',
    field: 'date',
  },
  {
    title: 'Vendor',
    field: 'vendor',
  },
  {
    title: 'Order Amount(₹)',
    field: 'amount',
  },
  {
    title: 'GST Amount(₹)',
    field: 'GST',
  },
  {
    title: 'Discount(₹)',
    field: 'discount',
  },
  {
    title: 'Delivery Charges(₹)',
    field: 'deliveryCharges',
  },
  {
    title: 'Status',
    field: 'status',
  },
  {
    title: 'Reference ID',
    field: 'referenceId',
  },
];
export const SUMMARY_DEFAULT_PIN = '32140';
export const BILLING_STAFF_DEFAULT_PIN = '12345';
export const CSV = 'CSV';
export const EXCEL = 'EXCEL';

export const SCAN_QR_ORDER_STATUS_TYPES = {
  ORDER_PLACED: 'ORDER_PLACED',
  // ACKNOWLEDGED: 'ACKNOWLEDGED',
  // CANCELLED: 'CANCELLED',
  READY_TO_SERVE: 'READY_TO_SERVE',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  // DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
};


export const SCAN_QR_PAYMENT_MODE = {
  CASH: 'CASH',
  CARD: 'CARD',
  UPI: 'UPI',
};
export const PaymentModeTypes = [
  {
    label: 'Cash',
    value: 'CASH',
  },
  {
    label: 'Card',
    value: 'CARD',
  },
  {
    label: 'UPI',
    value: 'UPI',
  },
  {
    label: 'Zomato',
    value: 'ZOMATO',
  },
  {
    label: 'Swiggy',
    value: 'SWIGGY',
  },
];
export const DEFAULT_BLUETOOTH_PRINT_CONNECTION = {
  DEFAULT: 'DEFAULT',
  COUNTER_MODE: 'COUNTER_MODE',
  STICKY_MODE: 'STICKY_MODE',
};
export const QR_LINK = {
  STAGE_POSITEASY: 'https://stage.api.positeasy.in',
  POSITEASY_PUBLIC_WEB: 'https://positeasy-public.web.app',
  PUBLIC_POSITEASY: 'https://public.positeasy.in',
};
export const defaultOrderTypes = [OrderTypeConstants.DineIn, OrderTypeConstants.Parcel];
export const BILLING_SCAN_KEYS = {
  PRODUCT_ID: 'productId',
  BARCODE: 'barcode',
};
