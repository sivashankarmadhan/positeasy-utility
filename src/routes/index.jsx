import { Navigate, useRoutes } from 'react-router-dom';
// auth
import AuthGuard from 'src/guards/AuthGuard';
import GuestGuard from 'src/guards/GuestGuard';
// layouts
import DashboardLayout from '../layouts/dashboard';
// config
import { PATH_AFTER_LOGIN } from '../config-global';
//
import SettingsUploadImage from 'src/components/upload/SettingsUploadImage';
import UploadLogo from 'src/components/upload/UploadLogo';
import {
  ROLES_WITHOUT_STORE_STAFF,
  ROLES_DATA,
  AUTHORIZED_ROLES,
} from 'src/constants/AppConstants';
import CustomCode from 'src/pages/Settings/CustomCode';
import RoleBasedGuard from './RoleBasedGuard';
import {
  Addon,
  Billing,
  ComingSoon,
  Configuration,
  CreateEstimate,
  Customers,
  Expenses,
  ExpensesTable,
  Gst,
  Help,
  Inventory,
  InventoryDashboard,
  LoginPage,
  OrderTable,
  DeliveryTable,
  PaymentTable,
  ProductTable,
  CategoryTable,
  MembershipReports,
  Profile,
  Register,
  ReportsAndAnalytics,
  Settings,
  Settlement,
  Staffs,
  StockReportTable,
  AttendanceReportTable,
  EndShiftReportTable,
  Stores,
  Managers,
  ViewEstimates,
  ProfitLossReport,
  Notifications,
  ViewBilling,
  ResetPassword,
  NewPassword,
  Printer,
  CreateOrEditVendors,
  ViewVendors,
  ViewPurchaseOrders,
  CreateAndEditPurchaseOrder,
  CreateAndEditStorePurchaseOrder,
  ViewPurchaseOrdersDetails,
  ViewStorePurchaseOrdersDetails,
  VendorPurchaseOrders,
  StockSummaryReportTable,
  WastageReportTable,
  TableList,
  RawMaterials,
  PurchaseOrdersReportTable,
  Counters,
  ViewPurchaseBills,
  // ReservationTable,
  WhatsappCredits,
  SubscriptionPlan,
  TerminalConfiguration,
  ViewPurchaseOrdersReceives,
  ViewPurchaseManagerApprove,
  PurchaseCategory,
  ReportCustomCode,
} from './elements';
import Attendance from 'src/pages/Attendance/Attendance';
import ProfitAndLossTable from 'src/pages/ProfitAndLossTable';
import Dashboard from 'src/pages/Dashboard';
import CountersTable from 'src/pages/CountersTable';
import TerminalsTable from 'src/pages/TerminalsTable';
import { allConfiguration, whatsappDetailsState } from 'src/global/recoilState';
import { useRecoilState, useRecoilValue } from 'recoil';
import { get } from 'lodash';
import Integration from 'src/pages/Settings/Integration';
import EBilling from 'src/pages/Settings/EBillings';
import PaymentGateway from 'src/pages/Settings/PaymentGateway';
import ScanQR from 'src/pages/Settings/ScanQR';
import Intent from 'src/pages/Settings/Intent';
import MembershipSettings from 'src/pages/Settings/MembershipSettings';
// ----------------------------------------------------------------------

export default function Router() {
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const featureSettings = get(configuration, 'featureSettings', {});
  const isTable = get(featureSettings, 'isTable', false);

  const counterSettings = get(configuration, 'counterSettings', {});
  const isCountersEnabled = get(counterSettings, 'isCountersEnabled', false);

  const whatsappDetails = useRecoilValue(whatsappDetailsState);

  return useRoutes([
    {
      path: '/',
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN()} replace />, index: true },
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
        {
          path: 'resetPassword',
          element: (
            <GuestGuard>
              <ResetPassword />
            </GuestGuard>
          ),
        },
        {
          path: 'new-password/:token',
          element: (
            <GuestGuard>
              <NewPassword />
            </GuestGuard>
          ),
        },
      ],
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN()} replace />, index: true },
        {
          path: 'dashboard',
          element: (
            <RoleBasedGuard roles={[...ROLES_WITHOUT_STORE_STAFF]}>
              <Dashboard />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'report',
          element: (
            <RoleBasedGuard roles={[...ROLES_WITHOUT_STORE_STAFF]}>
              <ReportsAndAnalytics />
            </RoleBasedGuard>
          ),
          children: [
            { path: 'payment', element: <PaymentTable /> },
            { path: 'order', element: <OrderTable /> },
            { path: 'delivery', element: <DeliveryTable /> },
            { path: 'product', element: <ProductTable /> },
            { path: 'category', element: <CategoryTable /> },
            { path: 'expense', element: <ExpensesTable /> },
            { path: 'gst', element: <Gst /> },
            { path: 'stocklogs', element: <StockReportTable /> },
            { path: 'stocksummary', element: <StockSummaryReportTable /> },
            { path: 'wastage', element: <WastageReportTable /> },
            { path: 'shifts', element: <EndShiftReportTable /> },
            { path: 'counters', element: <CountersTable /> },
            { path: 'settlement', element: <ComingSoon /> },
            { path: 'profitandloss', element: <ProfitAndLossTable /> },
            { path: 'membership', element: <MembershipReports /> },
            { path: 'attendance', element: <AttendanceReportTable /> },
            { path: 'terminals', element: <TerminalsTable /> },
            { path: 'purchaseOrders', element: <PurchaseOrdersReportTable /> },
            { path: 'customCode', element: <ReportCustomCode /> },
          ],
        },
        {
          path: 'inventory/dashboard',
          element: <InventoryDashboard />,
        },
        {
          path: 'inventory/products',
          element: <Inventory />,
        },
        {
          path: 'inventory/counters',
          element: (
            <RoleBasedGuard
              roles={[
                ROLES_DATA.master.role,
                ROLES_DATA.store_manager.role,
                ROLES_DATA.manager_and_staff.role,
              ]}
              isNotAuth={!isCountersEnabled}
            >
              <Counters />
            </RoleBasedGuard>
          ),
        },
        {
          path: 'inventory/rawMaterials',
          element: <RawMaterials />,
        },
        { path: 'inventory/addon', element: <Addon /> },
        { path: 'sale/billing', element: <Billing /> },

        // { path: 'createestimate', element: <CreateEstimate /> },
        // { path: 'viewestimate', element: <ViewEstimates /> },
        { path: 'sale/viewbilling', element: <ViewBilling /> },

        { path: 'purchases/expenses', element: <Expenses /> },
        { path: 'purchases/expenseCategory', element: <PurchaseCategory /> },
        { path: 'settlements', element: <Settlement /> },
        {
          path: 'stores/terminals',
          element: <Stores />,
        },
        {
          path: 'stores/managers',
          element: <Managers />,
        },
        {
          path: 'stores/staffs',
          element: (
            <RoleBasedGuard
              roles={[
                ROLES_DATA.master.role,
                ROLES_DATA.store_manager.role,
                ROLES_DATA.manager_and_staff.role,
              ]}
            >
              <Staffs />
            </RoleBasedGuard>
          ),
        },
        { path: 'attendance', element: <Attendance /> },
        { path: 'account', element: <Profile /> },
        {
          path: 'settings',
          element: <Settings />,
          children: [
            { path: 'config', element: <Configuration /> },
            { path: 'integration', element: <Integration /> },
            { path: 'terminalConfig', element: <TerminalConfiguration /> },
            { path: 'printer', element: <Printer /> },
            {
              path: 'eBilling',
              element: <EBilling />,
            },
            {
              path: 'intent',
              element: <Intent />,
            },
            {
              path: 'scanqr',
              element: <ScanQR />,
            },
            {
              path: 'memberShip',
              element: <MembershipSettings />,
            },
            {
              path: 'notifications',
              element: (
                <RoleBasedGuard roles={[...AUTHORIZED_ROLES]}>
                  <Notifications />
                </RoleBasedGuard>
              ),
            },
            { path: 'customCode', element: <CustomCode /> },
            { path: 'help', element: <Help /> },
            {
              path: 'banners',
              element: <SettingsUploadImage />,
            },
            {
              path: 'uploadLogo',
              element: <UploadLogo />,
            },
          ],
        },
        {
          path: 'sale/customers',
          element: <Customers />,
        },
        {
          path: 'support',
          element: <Help />,
        },
        {
          path: 'subscriptionPlan',
          element: <SubscriptionPlan />,
        },

        { path: 'purchases/createVendor', element: <CreateOrEditVendors /> },
        { path: 'purchases/editVendor/:vendorId', element: <CreateOrEditVendors /> },
        { path: 'purchases/viewVendors', element: <ViewVendors /> },
        { path: 'purchases/vendorPurchaseOrders/:vendorId', element: <VendorPurchaseOrders /> },

        { path: 'purchases/viewPurchaseOrders', element: <ViewPurchaseOrders /> },
        { path: 'purchases/viewPurchaseOrdersReceives', element: <ViewPurchaseOrdersReceives /> },
        { path: 'purchases/viewPurchaseBills', element: <ViewPurchaseBills /> },
        { path: 'purchases/managerApproves', element: <ViewPurchaseManagerApprove /> },

        {
          path: 'purchases/viewPurchaseOrdersDetails/:referenceId',
          element: <ViewPurchaseOrdersDetails />,
        },
        {
          path: 'purchases/viewStorePurchaseOrdersDetails/:referenceId',
          element: <ViewStorePurchaseOrdersDetails />,
        },

        { path: 'purchases/createPurchaseOrder', element: <CreateAndEditPurchaseOrder /> },
        { path: 'purchases/createStorePurchaseOrder', element: <CreateAndEditStorePurchaseOrder /> },
        {              
          path: 'purchases/editPurchaseOrder/:referenceId',
          element: <CreateAndEditPurchaseOrder />,
        },
        {
          path: 'purchases/editStorePurchaseOrder/:referenceId',
          element: <CreateAndEditStorePurchaseOrder />,
        },
        {
          path: 'table',
          element: (
            <RoleBasedGuard
              roles={[
                ROLES_DATA.master.role,
                ROLES_DATA.store_manager.role,
                ROLES_DATA.manager_and_staff.role,
              ]}
              isNotAuth={!isTable}
            >
              <TableList />
            </RoleBasedGuard>
          ),
        },

        {
          path: 'whatsappCredits',
          element: (
            <RoleBasedGuard
              roles={[
                ROLES_DATA.master.role,
                ROLES_DATA.store_manager.role,
                ROLES_DATA.manager_and_staff.role,
              ]}
            >
              <WhatsappCredits />
            </RoleBasedGuard>
          ),
        },
        // { path: 'two', element: <PageTwo /> },
        // { path: 'three', element: <PageThree /> },
      ],
    },
    // {
    //   element: <CompactLayout />,
    //   children: [{ path: '404', element: <Page404 /> }],
    // },
    // { path: '*', element: <Navigate to="/404" replace /> },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ]);
}
