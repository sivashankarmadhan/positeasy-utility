import { Suspense, lazy } from 'react';
// components
import LoadingScreen from '../components/loading-screen';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );

// ----------------------------------------------------------------------

export const LoginPage = Loadable(lazy(() => import('../pages/Auth/Login')));
export const Register = Loadable(lazy(() => import('../pages/Auth/Register')));
export const ForgotPage = Loadable(lazy(() => import('../pages/Auth/Forgot')));
export const ResetPassword = Loadable(lazy(() => import('../pages/Auth/ResetPassword')));
export const NewPassword = Loadable(lazy(() => import('../pages/Auth/NewPassword')));

export const ReportsAndAnalytics = Loadable(lazy(() => import('../pages/ReportsAndAnalytics')));
export const PaymentTable = Loadable(lazy(() => import('../pages/PaymentTable')));
export const OrderTable = Loadable(lazy(() => import('../pages/OrderTable')));
export const DeliveryTable = Loadable(lazy(() => import('../pages/DeliveryTable')));
export const ProductTable = Loadable(lazy(() => import('../pages/ProductTable')));
export const CategoryTable = Loadable(lazy(() => import('../pages/CategoryTable')));
export const ExpensesTable = Loadable(lazy(() => import('../pages/ExpenseReportTable')));
export const Gst = Loadable(lazy(() => import('../pages/Gst')));
export const StockReportTable = Loadable(lazy(() => import('../pages/StockReportTable')));
export const StockSummaryReportTable = Loadable(
  lazy(() => import('../pages/StockSummaryReportTable'))
);
export const WastageReportTable = Loadable(lazy(() => import('../pages/WastageReportTable')));
export const AttendanceReportTable = Loadable(lazy(() => import('../pages/AttendanceReportTable')));
export const EndShiftReportTable = Loadable(lazy(() => import('../pages/EndShiftReportTable')));
export const ProfitLossReport = Loadable(lazy(() => import('../pages/ComingSoon')));
export const PurchaseOrdersReportTable = Loadable(
  lazy(() => import('../pages/PurchaseOrdersReportTable'))
);
export const ReportCustomCode = Loadable(lazy(() => import('../pages/CustomCode')));

export const ComingSoon = Loadable(lazy(() => import('../pages/ComingSoon')));
export const Inventory = Loadable(lazy(() => import('../sections/Inventory/Inventory')));
export const InventoryDashboard = Loadable(lazy(() => import('../sections/Inventory/InventoryDashboard')));
export const Counters = Loadable(lazy(() => import('../pages/Counters')));
export const Addon = Loadable(lazy(() => import('../pages/Products/Addon')));
export const Billing = Loadable(lazy(() => import('../pages/Billing')));
export const ViewEstimates = Loadable(lazy(() => import('../sections/Estimate/ViewEstimates')));
export const ViewBilling = Loadable(lazy(() => import('../sections/Billing/ViewBilling')));
export const CreateEstimate = Loadable(lazy(() => import('../sections/Estimate/CreateEstimate')));
export const Expenses = Loadable(lazy(() => import('../pages/Expenses')));
export const PurchaseCategory = Loadable(lazy(() => import('../pages/PurchaseCategory')));
export const MembershipReports = Loadable(lazy(() => import('../pages/MembershipReports')));
export const Settlement = Loadable(lazy(() => import('../pages/Settlement')));
export const Stores = Loadable(lazy(() => import('../pages/Stores')));
export const Managers = Loadable(lazy(() => import('../pages/Managers')));
export const Customers = Loadable(lazy(() => import('../pages/Customers')));
export const Staffs = Loadable(lazy(() => import('../pages/Staffs')));
export const Settings = Loadable(lazy(() => import('../pages/Settings/Settings')));
export const Profile = Loadable(lazy(() => import('../pages/Settings/Profile')));
export const Configuration = Loadable(lazy(() => import('../pages/Settings/Configuration')));
export const TerminalConfiguration = Loadable(
  lazy(() => import('../pages/Settings/TerminalConfiguration'))
);
export const Help = Loadable(lazy(() => import('../pages/Settings/Help')));
export const SubscriptionPlan = Loadable(lazy(() => import('../pages/SubscriptionPlan')));
export const PageTwo = Loadable(lazy(() => import('../pages/PageTwo')));
export const PageThree = Loadable(lazy(() => import('../pages/PageThree')));
export const PageFour = Loadable(lazy(() => import('../pages/PageFour')));
export const PageFive = Loadable(lazy(() => import('../pages/PageFive')));
export const PageSix = Loadable(lazy(() => import('../pages/PageSix')));
export const Page404 = Loadable(lazy(() => import('../pages/Page404')));
export const Attendance = Loadable(lazy(() => import('../pages/Attendance/Attendance')));
export const Notifications = Loadable(lazy(() => import('../pages/Settings/Notifications')));
export const Printer = Loadable(lazy(() => import('../pages/Settings/Printer')));
export const CreateOrEditVendors = Loadable(
  lazy(() => import('../pages/Vendors/CreateOrEditVendor'))
);
export const ViewVendors = Loadable(lazy(() => import('../pages/Vendors/ViewVendors')));

export const CreateAndEditPurchaseOrder = Loadable(
  lazy(() => import('../pages/PurchaseOrders/CreateAndEditPurchaseOrder'))
);
export const CreateAndEditStorePurchaseOrder = Loadable(
  lazy(() => import('../pages/PurchaseOrders/PurchaseStoreOrders/CreateAndEditStorePurchaseOrder'))
);
export const ViewPurchaseOrders = Loadable(
  lazy(() => import('../pages/PurchaseOrders/ViewPurchaseOrders'))
);
export const ViewPurchaseOrdersReceives = Loadable(
  lazy(() => import('../pages/PurchaseOrders/ViewPurchaseOrdersReceives'))
);
export const ViewPurchaseManagerApprove = Loadable(
  lazy(() => import('../pages/PurchaseOrders/ViewPurchaseManagerApprove'))
);
export const ViewPurchaseBills = Loadable(
  lazy(() => import('../pages/PurchaseOrders/ViewPurchaseBills'))
);
export const ViewPurchaseOrdersDetails = Loadable(
  lazy(() => import('../pages/PurchaseOrders/ViewPurchaseOrderDetails'))
);
export const ViewStorePurchaseOrdersDetails = Loadable(
  lazy(() => import('../pages/PurchaseOrders/PurchaseStoreOrders/ViewStorePurchaseOrderDetails'))
);
export const VendorPurchaseOrders = Loadable(
  lazy(() => import('../pages/Vendors/VendorPurchaseOrders'))
);

export const TableList = Loadable(lazy(() => import('../pages/TableList')));

// export const ReservationTable = Loadable(lazy(() => import('../pages/ReservationTable')));
export const WhatsappCredits = Loadable(lazy(() => import('../pages/WhatsappCredits')));

export const RawMaterials = Loadable(lazy(() => import('../sections/RawMaterials/RawMaterial')));

export const OnlineCategory = Loadable(lazy(() => import('../pages/OnlineCategory')));
export const OptionsGroup = Loadable(lazy(() => import('../pages/OptionsGroup')));
export const Options = Loadable(lazy(() => import('../pages/Options')));
export const OnlineStores = Loadable(lazy(() => import('../pages/OnlineStores')));
export const AddAndEditOnlineInventory = Loadable(
  lazy(() => import('../pages/Products/AddAndEditOnlineInventory'))
);
export const RequestFDLogs = Loadable(lazy(() => import('../pages/RequestFDLogs')));
export const FDOrders = Loadable(lazy(() => import('../pages/FDOrders')));
export const OnlineTaxesAndCharges = Loadable(lazy(() => import('../pages/OnlineTaxesAndCharges')));
