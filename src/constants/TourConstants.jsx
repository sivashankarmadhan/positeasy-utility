import AuthService from 'src/services/authService';

const billingKeyStatus = AuthService.getBillingKeyStatus();

export const finishedStatuses = ['close', 'stop', 'skip', 'reset'];

export const TourPlacements = {
  TOP: 'top',
  TOP_START: 'top-start',
  TOP_END: 'top-end',
  BOTTOM: 'bottom',
  BOTTOM_START: 'bottom-start',
  BOTTOM_END: 'bottom-end',
  LEFT: 'left',
  LEFT_START: 'left-start',
  LEFT_END: 'left-end',
  RIGHT: 'right',
  RIGHT_START: 'right-start',
  RIGHT_END: 'right-end',
  AUTO: 'auto',
  CENTER: 'center',
};

export const dashboardTourConfig = [
  {
    target: '.dashboardStep1',
    content:
      'Welcome to the Dashboard! Gain insights into your business performance with reports for today, yesterday, last week, and last month, covering key metrics like sales, orders, revenue.',
    placement: TourPlacements.CENTER,
  },
  {
    target: '.dashboardStep2',
    content:
      'Todays Sales Report: Monitor hourly sales data and compare with last weeks same date. Analyze revenue, transactions, and trends for valuable insights.',
    placement: TourPlacements.RIGHT,
  },
  {
    target: '.dashboardStep3',
    content:
      'Payment Status Overview: Track transaction outcomes with real-time updates. Monitor completed, cancelled, pending, and failed payments for comprehensive record-keeping.',
    placement: TourPlacements.LEFT,
  },
  {
    target: '.dashboardStep4',
    content:
      'Yesterdays Sales Report: Analyze daily sales on an hourly basis and compare with the same date from last week. Evaluate revenue, transactions, and trends for actionable insights.',
    placement: TourPlacements.RIGHT,
  },
  {
    target: '.dashboardStep5',
    content:
      'Last Weeks Sales Report: Review weekly sales data, comparing with the previous week. Analyze revenue trends, transaction volumes, and payment statuses for informed decision-making.',
    placement: TourPlacements.LEFT,
  },
  {
    target: '.dashboardStep6',
    content:
      'Last Months Sales Report: Examine monthly sales data, comparing with the prior month. Gain insights into revenue patterns, transaction quantities, and payment outcomes for strategic planning.',
    placement: TourPlacements.LEFT,
  },
  {
    target: '.dashboardStep7',
    content: 'Explore the Last 10 Days Transactions:',
  },
];
export const billingTourConfigIsLock = [
  {
    target: '.billingStep1',
    content: 'Enter the billing key here to unlock and access the billing page.',
    disableBeacon: true,
  },
  {
    target: '.billingStep2',
    content: 'Unlock your billing experience by obtaining the billing key right here.',
    disableBeacon: true,
  },
];
export const billingTourConfigIsUnlock = [
  {
    target: '.billingStep3',
    content:
      'Effortlessly manage transactions and invoicing with this user-friendly Billing Page. Create and process bills, manage payments, and stay organized with ease.',
    disableBeacon: true,
  },
];

export const estimateTourConfig = [
  {
    target: '.EstimateStep1',
    content: 'Select Products to Generate an Estimation.',
    disableBeacon: true,
  },
];
export const estimateProductTourConfig = [
  {
    target: '.EstimateStep2',
    content:
      'Get a quick and accurate assessment of costs, timelines, or quantities for your purchases.',
    disableBeacon: true,
  },
  {
    target: '.EstimateStep3',
    content: 'Clear Estimation: Remove or reset the previously calculated estimates.',
    disableBeacon: true,
  },
  {
    target: '.EstimateStep4',
    content:
      'Here you can add a new customer or select an existing customer to create an estimation.',
    disableBeacon: true,
  },
  {
    target: '.EstimateStep5',
    content:
      'Click the Estimate button to retrieve the estimation for the respective customer, accessible on the View Estimation page.',
    disableBeacon: true,
  },
];

export const estimateViewTourConfig = [
  {
    target: '.EstimateViewStep1',
    content:
      'Customer-Specific Estimation Search: Quickly find estimations associated with a specific customer.',
    disableBeacon: true,
  },
  {
    target: '.EstimateViewStep2',
    content:
      ' View detailed estimates, including total amounts with GST, customer information, and product details .',
    disableBeacon: true,
  },
  {
    target: '.EstimateViewStep3',
    content:
      'Permanently remove an estimation from your records. Please exercise caution, as this action cannot be undone.',
    disableBeacon: true,
  },
  {
    target: '.EstimateViewStep4',
    content: 'This option allows you to either update the estimation or convert it into bills.',
    disableBeacon: true,
  },
  {
    target: '.EstimateViewStep5',
    content: 'Use this icon to print the estimation',
    disableBeacon: true,
  },
  {
    target: '.EstimateViewStep6',
    content: 'Here, you can see the total amount, total number of items, and total GST amount.',
    disableBeacon: true,
  },
];

export const inventoryTourConfig = [
  {
    target: '.inventoryStep1',
    content:
      'Discover the Inventory Page, your hub for managing stock. Monitor product levels, update quantities, and track items to ensure smooth operations.',
    disableBeacon: true,
  },
  {
    target: '.inventoryStep2',
    content: 'Quickly assess product availability with Active, Inactive, and Sold Out indicators. ',
    disableBeacon: true,
  },
  {
    target: '.inventoryStep3',
    content:
      'Search Products: Find what you need quickly. Our search feature helps you locate products efficiently',
    disableBeacon: true,
  },

  {
    target: '.inventoryStep6',
    content:
      'Introduce New Items: Add fresh items to your inventory for enhanced variety. Here you can upload PDF and Excel reports based on your data.',
    disableBeacon: true,
  },
  {
    target: '.inventoryStep7',
    content:
      'Check this box to perform actions like editing the status whether the product is active,inactive or soldout and also to delete the product.',
    disableBeacon: true,
  },
];

export const createExpensesTourConfig = [
  {
    target: '.createExpenseStep1',
    content:
      'Update your expense details easily by clicking on Create new expenses. This option allows you to modify existing expenses, change categories, update dates, and more',
    disableBeacon: true,
  },
];

export const expensesTourConfig = [
  {
    target: '.expenseStep1',
    content:
      'Visit the Expenses Page to track your financial outlays. Organize and evaluate expenses to make informed decisions and optimize your budget.',
    disableBeacon: true,
  },

  {
    target: '.expenseStep2',
    content: 'Updating Expenses: Keep your records up-to-date by Adding expense here.',
    disableBeacon: true,
  },
  {
    target: '.expenseStep3',
    content:
      'Stay Updated with Recent Transactions: Get a quick look at your latest financial activities.',
    disableBeacon: true,
  },

  {
    target: '.expenseStep4',
    content: 'Manage Expenses: Edit or delete expense details as needed.',
    disableBeacon: true,
  },
];

export const paymentsReportTourConfig = [
  {
    target: '.step1',
    content:
      'Make use of custom name, customer, or date range filters to precisely view payment details.',
    disableBeacon: true,
  },
  {
    target: '.step2',
    content: 'Payment Success Report: Review confirmed transaction outcomes.',
    disableBeacon: true,
  },
  {
    target: '.step3',
    content: 'Payment Total View: See the sum of your payment activities at a glance.',
    disableBeacon: true,
  },
  {
    target: '.step4',
    content: 'View payment types and their distribution percentages.',
    disableBeacon: true,
  },
  {
    target: '.step5',
    content:
      'Payment Details: Get complete transaction information. See all payment data for a clear understanding of your finances.',
    disableBeacon: true,
  },
];

export const orderReportTourConfig = [
  {
    target: '.step1',
    content:
      'Make use of custom name, customer, or date range filters to precisely view ordered details.',
    disableBeacon: true,
  },
  {
    target: '.step2',
    content: 'Orders Success Report: Review confirmed transaction outcomes.',
    disableBeacon: true,
  },
  {
    target: '.step3',
    content: 'Payment Success Report for Orders: Review confirmed transaction outcomes.',
    disableBeacon: true,
  },
  {
    target: '.step4',
    content:
      'Order Type Insights: Explore report data categorized by dine-in and takeaway. Analyze trends based on order preferences for informed decision-making.',
    disableBeacon: true,
  },
  {
    target: '.step5',
    content:
      'Comprehensive Order Report: Dive into detailed order information. Gain insights into product preferences, customer trends, and revenue sources for strategic planning.',
    disableBeacon: true,
  },
];

export const productReportTourConfig = [
  {
    target: '.step1',
    content:
      'Make use of custom name, customer, or date range filters to precisely view product details.',
    disableBeacon: true,
  },
  {
    target: '.step2',
    content:
      'Top Sellers Overview: Explore details of best-selling products. Gain insights into sales, popularity, and revenue for effective product management.',
    disableBeacon: true,
  },
  {
    target: '.step3',
    content:
      'Best Sellers Revenue: Discover collected amounts from top-selling products. Get insights into earnings, popularity, and sales for effective revenue tracking.',
    disableBeacon: true,
  },
  {
    target: '.step4',
    content:
      'Top 3 Sellers Chart: Visualize leading product sales with a chart view. Easily track performance and popularity for strategic decision-making.',
    disableBeacon: true,
  },
  {
    target: '.step5',
    content:
      'Product Insights Overview: Explore comprehensive product details. Review pricing, sales performance, and more for informed decision-making.',
    disableBeacon: true,
  },
];

export const expenseReportTourConfig = [
  {
    target: '.step1',
    content:
      'Make use of custom name, customer, or date range filters to precisely view expense details.',
    disableBeacon: true,
  },
  {
    target: '.step2',
    content:
      'Detailed high expense data which helps to explore the expenditures and identify areas for potential optimization',
    disableBeacon: true,
  },
  {
    target: '.step3',
    content:
      'Access a comprehensive view of all expenditures. Analyze total expenses for better financial management.',
    disableBeacon: true,
  },
  {
    target: '.step4',
    content:
      'Top 3 High Expenses Chart: Visualize major expenditure categories. Monitor top expenses for effective cost management.',
    disableBeacon: true,
  },
  {
    target: '.step5',
    content: 'Here you can delve into comprehensive expense information for financial insights.',
    disableBeacon: true,
  },
];

export const reportGSTTourConfig = [
  {
    target: '.step1',
    content:
      'Make use of custom name, customer, or date range filters to precisely view GST details.',
    disableBeacon: true,
  },
  {
    target: '.step2',
    content:
      'Review confirmed Goods and Services Tax (GST) payments. Gain insights into successful tax transactions for accurate financial records.',
    disableBeacon: true,
  },
  {
    target: '.step3',
    content:
      'Access the sum of Goods and Services Tax (GST) payments. Analyze or view overall tax contributions.',
    disableBeacon: true,
  },
  {
    target: '.step4',
    content:
      'Total & GST Amount Chart: Visualize combined total and Goods and Services Tax (GST) payments.',
    disableBeacon: true,
  },
  {
    target: '.step5',
    content: 'Explore comprehensive breakdown of Goods and Services Tax (GST) data.',
    disableBeacon: true,
  },
];

export const StocksReportTourConfig = [
  {
    target: '.step1',
    content: 'Make use of date range filters to precisely view stock details.',
    disableBeacon: true,
  },
  {
    target: '.step2',
    content:
      'Track available quantities, monitor trends, and optimize your stock management with our comprehensive stock report based on store ID and product ID.',
    disableBeacon: true,
  },
];

export const StoresTourConfig = [
  {
    target: '.storesStep1',
    content:
      'Manage Stores: Create new store terminals and obtain billing keys. Control your business operations efficiently.',
    disableBeacon: true,
  },
  {
    target: '.storesStep2',
    content: 'Use this icon to create new stores and can provide credentials as well.',
    disableBeacon: true,
  },
  {
    target: '.storesStep3',
    content:
      'This icon is used to create manager level access. Enter the respective email id to receive the billing key for access the billing page.',

    disableBeacon: true,
  },
  {
    target: '.storesStep4',
    content: 'This icon is to create new terminal',
    disableBeacon: true,
  },
  {
    target: '.storesStep5',
    content:
      'Account Status & Billing Key: Here you can view your account status and can get the billing key.',
    disableBeacon: true,
  },
];

export const StaffTourConfig = [
  {
    target: '.staffStep1',
    content: 'Staff Management: Add new staffs seamlessly using the icon.',
    disableBeacon: true,
  },
  {
    target: '.staffStep2',
    content: 'Search for staff members by entering their name.',
    disableBeacon: true,
  },
  {
    target: '.staffStep3',
    content:
      'Use this icon to link new stores or remove a staff member by clicking on the remove staff icon.',
    disableBeacon: true,
  },
  {
    target: '.staffStep4',
    content:
      'By clicking on this link, you can easily associate new stores and terminals with existing staff members, enabling them to manage various locations and responsibilities effectively.',
    disableBeacon: true,
  },
];

export const CustomerTourConfig = [
  {
    target: '.customerStep1',
    content:
      'Add and view customer accounts effortlessly by clicking the enable button. Maintain customer profiles and access privileges efficiently.',
    disableBeacon: true,
  },
];

export const CustomerInfoTourConfig = [
  {
    target: '.customerStep1',
    content:
      'Using this add customer icon, add a new customer to your records and manage their information easily.',
    disableBeacon: true,
  },
  {
    target: '.customerinfoStep2',
    content: 'Use this icon to edit or delete customer details as needed.',
    disableBeacon: true,
  },
];

export const SettingsTourProfile = [
  {
    target: '.settingProfileStep1',
    content: 'View Account Details: Access comprehensive information about your account.',
    disableBeacon: true,
  },
  {
    target: '.settingProfileStep2',
    content: 'Click this icon to securely log out from the billing page.',
    disableBeacon: true,
  },
  {
    target: '.settingProfileStep3',
    content: 'Utilize the update password option to change your password.',
    disableBeacon: true,
  },
];
export const SettingsTourPrintModeConfiguration = [
  {
    target: '.settingConfigStep1',
    content: 'Customised configuration setting to enable Print mode.',
    disableBeacon: true,
  },
  {
    target: '.settingConfigStep2',
    content: 'Customised configuration setting to enable Custom code.',
    disableBeacon: true,
  },
  {
    target: '.settingConfigStep3',
    content: 'Customised configuration setting to enable Customer.',
    disableBeacon: true,
  },
  {
    target: '.settingConfigStep4',
    content: 'Customised configuration setting to enable Addons.',
    disableBeacon: true,
  },
  {
    target: '.settingConfigStep5',
    content: 'Customised configuration setting to enable Estimation.',
    disableBeacon: true,
  },
  {
    target: '.settingConfigStep6',
    content: 'Customised configuration setting to enable info.',
    disableBeacon: true,
  },
  {
    target: '.settingConfigStep7',
    content: 'Customized configuration settings enable Profit & Loss calculations.',
    disableBeacon: true,
  },
  {
    target: '.settingConfigStep8',
    content: 'Customised configuration setting to enable Order type.',
    disableBeacon: true,
  },
];

export const SettingTourCustom = [
  {
    target: '.settingCustomStep1',
    content: 'Add and view custom code by clicking the enable button.',
    disableBeacon: true,
  },
];
export const SettingTourBanner = [
  {
    target: '.settingBannerStep1',
    content: 'You can add your customized banners by simply clicking this add photo icon',
    disableBeacon: true,
  },
];
export const SettingTourLogo = [
  {
    target: '.SettingLogoStep1',
    content: 'Click update photo icon to upload your customized logo',
    disableBeacon: true,
  },
];
export const SettingTourHelp = [
  {
    target: '.SettingLogoStep1',
    content: 'Email us for any queries or assistance. Our support team is here to help.',
    disableBeacon: true,
  },
];
