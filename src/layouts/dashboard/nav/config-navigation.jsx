// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SpeedIcon from '@mui/icons-material/Speed';
import StoreIcon from '@mui/icons-material/Store';
import HelpIcon from '@mui/icons-material/Help';
import { filter, get, map } from 'lodash';
import {
  ROLES_DATA,
  SettingsSections,
  ReportAnalyticsSections,
  SettingsSectionsLabels,
} from '../../../constants/AppConstants';
import SvgColor from '../../../components/svg-color';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { IconButton, Stack, Typography } from '@mui/material';
import History from '../../../components/NavigateSetter/History';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// ----------------------------------------------------------------------
const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const settingsSubTabs = map(SettingsSections, (e) => {
  return e.path;
});

const ICONS = {
  user: icon('ic_user'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  cart: icon('ic_cart'),
  billing: icon('ic_invoice'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    items: [
      {
        title: 'dashboard',
        path: PATH_DASHBOARD.dashboard,
        icon: <SpeedIcon />,
        roleAccess: [
          ...filter(
            ROLES_DATA,
            (_item) => get(_item, 'role') !== get(ROLES_DATA, 'store_staff.role')
          ),
        ],
      },
      {
        title: 'Sale',
        path: PATH_DASHBOARD.sale.viewbilling,
        icon: <PointOfSaleIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
        activePaths: [
          PATH_DASHBOARD.sale.billing,
          PATH_DASHBOARD.sale.viewbilling,
          PATH_DASHBOARD.sale.customers,
        ],
        children: [
          {
            title: 'Orders',
            path: PATH_DASHBOARD.sale.viewbilling,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            info: (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  console.log('ddss', PATH_DASHBOARD.sale.billing);
                  History.navigate(PATH_DASHBOARD.sale.billing);
                }}
                sx={{ color: 'inherit', width: 30, height: 30 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            ),
          },
          {
            title: 'Customers',
            path: PATH_DASHBOARD.sale.customers,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
          },
        ],
      },

      {
        title: 'Purchases',
        path: PATH_DASHBOARD.purchases.createPurchaseOrder,
        icon: <ShoppingBasketIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
        activePaths: [
          PATH_DASHBOARD.purchases.createPurchaseOrder,
          PATH_DASHBOARD.purchases.viewPurchaseOrders,
          PATH_DASHBOARD.purchases.viewPurchaseOrdersReceives,
          PATH_DASHBOARD.purchases.viewPurchaseOrdersDetails,
          PATH_DASHBOARD.purchases.viewStorePurchaseOrdersDetails,
          PATH_DASHBOARD.purchases.managerApproves,
          PATH_DASHBOARD.purchases.viewPurchaseBills,
          PATH_DASHBOARD.purchases.createVendor,
          PATH_DASHBOARD.purchases.viewVendors,
          PATH_DASHBOARD.purchases.vendorPurchaseOrders,
          PATH_DASHBOARD.purchases.expenses,
          PATH_DASHBOARD.purchases.category,
        ],

        children: [
          {
            title: 'Orders',
            path: PATH_DASHBOARD.purchases.viewPurchaseOrders,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            info: (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  History.navigate(PATH_DASHBOARD.purchases.createPurchaseOrder);
                }}
                sx={{ color: 'inherit', width: 30, height: 30 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            ),
          },
          {
            title: 'Receives',
            path: PATH_DASHBOARD.purchases.viewPurchaseOrdersReceives,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
          },
          {
            title: 'Request',
            path: PATH_DASHBOARD.purchases.managerApproves,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
          },
          {
            title: 'Bills',
            path: PATH_DASHBOARD.purchases.viewPurchaseBills,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
          },
          {
            title: 'Vendors',
            path: PATH_DASHBOARD.purchases.viewVendors,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            info: (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  History.navigate(PATH_DASHBOARD.purchases.createVendor);
                }}
                sx={{ color: 'inherit', width: 30, height: 30 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            ),
          },
          {
            title: 'Expenses',
            path: PATH_DASHBOARD.purchases.expenses,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            info: (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  History.navigate(PATH_DASHBOARD.purchases.expenses, {
                    state: { isDrawerOpen: true },
                  });
                }}
                sx={{ color: 'inherit', width: 30, height: 30 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            ),
          },
          {
            title: 'Expense Category',
            path: PATH_DASHBOARD.purchases.category,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
          },
        ],
      },
      // {
      //   title: 'Estimate',
      //   path: PATH_DASHBOARD.viewestimate,
      //   icon: <AssignmentIcon />,
      //   roleAccess: [...map(ROLES_DATA, (e) => e)],
      //   info: (
      //     <IconButton
      //       onClick={(event) => {
      //         event.preventDefault();
      //         History.navigate(PATH_DASHBOARD.createestimate);
      //       }}
      //       sx={{ color: 'inherit' }}
      //     >
      //       <AddCircleOutlineIcon style={{ marginRight: -11 }} />
      //     </IconButton>
      //   ),
      //   activePaths: [PATH_DASHBOARD.createestimate],
      // },
      {
        title: 'Inventory',
        path: PATH_DASHBOARD.inventory.products,
        icon: <ShoppingCartIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
        activePaths: [
          // PATH_DASHBOARD.inventory.dashboard,
          PATH_DASHBOARD.inventory.products,
          PATH_DASHBOARD.inventory.rawMaterials,
          PATH_DASHBOARD.inventory.counters,
          // PATH_DASHBOARD.inventory.addon,
          PATH_DASHBOARD.inventory.batches,
        ],
        children: [
          // {
          //   title: 'Dashboard',
          //   path: PATH_DASHBOARD.inventory.dashboard,
          //   roleAccess: [...map(ROLES_DATA, (e) => e)],
          //   // info: (
          //   //   <IconButton
          //   //     onClick={(event) => {
          //   //       event.preventDefault();
          //   //       History.navigate(PATH_DASHBOARD.inventory, {
          //   //         state: { isDrawerOpen: true },
          //   //       });
          //   //     }}
          //   //     sx={{ color: 'inherit', width: 30, height: 30 }}
          //   //   >
          //   //     <AddCircleOutlineIcon />
          //   //   </IconButton>
          //   // ),
          // },
          {
            title: 'Products',
            path: PATH_DASHBOARD.inventory.products,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            info: (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  History.navigate(PATH_DASHBOARD.inventory.products, {
                    state: { isDrawerOpen: true },
                  });
                }}
                sx={{ color: 'inherit', width: 30, height: 30 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            ),
          },
          {
            title: 'Raw Materials',
            path: PATH_DASHBOARD.inventory.rawMaterials,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            info: (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  History.navigate(PATH_DASHBOARD.inventory.rawMaterials, {
                    state: { isDrawerOpen: true },
                  });
                }}
                sx={{ color: 'inherit', width: 30, height: 30 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            ),
          },
          {
            title: 'Counter',
            path: PATH_DASHBOARD.inventory.counters,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            info: (
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  History.navigate(PATH_DASHBOARD.inventory.counters, {
                    state: { isDrawerOpen: true },
                  });
                }}
                sx={{ color: 'inherit', width: 30, height: 30 }}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            ),
          },
          // {
          //   title: 'Addons',
          //   path: PATH_DASHBOARD.inventory.addon,
          //   roleAccess: [...map(ROLES_DATA, (e) => e)],
          //   info: (
          //     <IconButton
          //       onClick={(event) => {
          //         event.preventDefault();
          //         History.navigate(PATH_DASHBOARD.inventory.addon, {
          //           state: { isDrawerOpen: true },
          //         });
          //       }}
          //       sx={{ color: 'inherit', width: 30, height: 30 }}
          //     >
          //       <AddCircleOutlineIcon />
          //     </IconButton>
          //   ),
          // },
        ],
      },
      {
        title: 'reports',
        path: PATH_DASHBOARD.report.order,
        icon: <AnalyticsIcon />,
        roleAccess: [
          ...filter(
            ROLES_DATA,
            (_item) => get(_item, 'role') !== get(ROLES_DATA, 'store_staff.role')
          ),
        ],
        activePaths: [
          PATH_DASHBOARD.report.order,
          PATH_DASHBOARD.report.delivery,
          PATH_DASHBOARD.report.payment,
          PATH_DASHBOARD.report.product,
          PATH_DASHBOARD.report.category,
          PATH_DASHBOARD.report.expense,
          PATH_DASHBOARD.report.gst,
          PATH_DASHBOARD.report.stocks,
          PATH_DASHBOARD.report.settlement,
          PATH_DASHBOARD.report.profitandloss,
          PATH_DASHBOARD.report.shifts,
          PATH_DASHBOARD.report.stocklogs,
          PATH_DASHBOARD.report.stocksummary,
          PATH_DASHBOARD.report.membership,
          PATH_DASHBOARD.report.wastage,
          PATH_DASHBOARD.report.counters,
          PATH_DASHBOARD.report.attendance,
          PATH_DASHBOARD.report.terminals,
          PATH_DASHBOARD.report.purchaseOrders,
          PATH_DASHBOARD.report.orderSummary,
          PATH_DASHBOARD.report.customCode,
        ],
        nestedList: ReportAnalyticsSections,
      },
      {
        title: 'Stores',
        path: PATH_DASHBOARD.stores.terminals,
        icon: <StoreIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
        activePaths: [
          PATH_DASHBOARD.stores.terminals,
          PATH_DASHBOARD.stores.managers,
          PATH_DASHBOARD.stores.staffs,
        ],
        children: [
          {
            title: 'Terminals',
            path: PATH_DASHBOARD.stores.terminals,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
          },
          {
            title: 'Managers',
            path: PATH_DASHBOARD.stores.managers,
            roleAccess: [ROLES_DATA.master],
          },
          {
            title: 'Staffs',
            path: PATH_DASHBOARD.stores.staffs,
            roleAccess: [...map(ROLES_DATA, (e) => e)],
            // roleAccess: [ROLES_DATA.master, ROLES_DATA.store_manager, ROLES_DATA.manager_and_staff],
          },
        ],
      },
      {
        title: 'Attendance',
        path: PATH_DASHBOARD.attendance,
        icon: <CalendarTodayIcon />,
        roleAccess: [ROLES_DATA.store_staff],
      },

      {
        title: 'Table',
        path: PATH_DASHBOARD.table,
        // info: (
        //   <IconButton
        //     onClick={(event) => {
        //       event.preventDefault();
        //       History.navigate(PATH_DASHBOARD.table);
        //     }}
        //     sx={{ color: 'inherit' }}
        //   >
        //     <AddCircleOutlineIcon style={{ marginRight: -11 }} />
        //   </IconButton>
        // ),
        activePaths: [PATH_DASHBOARD.table],
        icon: <TableRestaurantIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
      },
      // {
      //   title: 'Reservation',
      //   path: PATH_DASHBOARD.reservation,
      //   info: (
      //     <IconButton
      //       onClick={(event) => {
      //         event.preventDefault();
      //         History.navigate(PATH_DASHBOARD.reservation);
      //       }}
      //       sx={{ color: 'inherit' }}
      //     >
      //       <AddCircleOutlineIcon style={{ marginRight: -11 }} />
      //     </IconButton>
      //   ),
      //   activePaths: [PATH_DASHBOARD.reservation],
      //   icon: <EventSeatIcon />,
      //   roleAccess: [...map(ROLES_DATA, (e) => e)],
      // },
      {
        title: 'Whatsapp',
        path: PATH_DASHBOARD.whatsappCredits,
        info: (
          <Stack sx={{ position: 'relative' }}>
            <Typography
              sx={{
                backgroundColor: 'red',
                color: '#fff',
                fontWeight: 'bold',
                width: 50,
                px: 0.3,
                borderRadius: 10,
                textAlign: 'center',
                fontSize: '7px',
                position: 'absolute',
                top: 8,
                right: 105,
              }}
            >
              Low Balance
            </Typography>
          </Stack>
        ),
        isDisabledInfoHover: true,
        activePaths: [PATH_DASHBOARD.whatsappCredits],
        icon: <WhatsAppIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
      },
    ],
  },

  {
    subheader: 'Others',
    items: [
      {
        title: 'Account',
        path: PATH_DASHBOARD.account,
        icon: <AccountCircleIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
      },
      {
        title: 'Settings',
        path: PATH_DASHBOARD.settings,
        icon: <SettingsIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
        activePaths: settingsSubTabs,
        nestedList: SettingsSections,
      },
      {
        title: 'Subscription Plan',
        path: PATH_DASHBOARD.subscriptionPlan,
        icon: <PaymentsIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
      },
      {
        title: 'Support',
        path: PATH_DASHBOARD.support,
        icon: <HelpIcon />,
        roleAccess: [...map(ROLES_DATA, (e) => e)],
      },
    ],
  },
];

export default navConfig;
