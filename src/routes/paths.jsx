// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
  forgot: '/forgot',
  register: '/register',
  resetPassword: '/resetPassword',
};

export const PATH_DASHBOARD = {
  dashboard: '/dashboard',
  report: {
    payment: '/report/payment',
    order: '/report/order',
    delivery: '/report/delivery',
    product: '/report/product',
    category: '/report/category',
    expense: '/report/expense',
    gst: '/report/gst',
    stocklogs: '/report/stocklogs',
    stocksummary: '/report/stocksummary',
    wastage: '/report/wastage',
    shifts: '/report/shifts',
    counters: '/report/counters',
    settlement: '/report/settlement',
    profitandloss: '/report/profitandloss',
    membership: '/report/membership',
    attendance: '/report/attendance',
    terminals: '/report/terminals',
    purchaseOrders: '/report/purchaseOrders',
    orderSummary: '/report/orderSummary',
    customCode: '/report/customCode',
  },

  sale: {
    billing: '/sale/billing',
    viewbilling: '/sale/viewbilling',
    customers: '/sale/customers',
  },

  purchases: {
    createVendor: '/purchases/createVendor',
    editVendor: '/purchases/editVendor',
    viewVendors: '/purchases/viewVendors',
    managerApproves: '/purchases/managerApproves',
    category: '/purchases/expenseCategory',
    vendorPurchaseOrders: '/purchases/vendorPurchaseOrders',
    createPurchaseOrder: '/purchases/createPurchaseOrder',
    createStorePurchaseOrder: '/purchases/createStorePurchaseOrder',
    editPurchaseOrder: '/purchases/editPurchaseOrder',
    viewPurchaseOrders: '/purchases/viewPurchaseOrders',
    viewPurchaseOrdersReceives: '/purchases/viewPurchaseOrdersReceives',
    viewPurchaseBills: '/purchases/viewPurchaseBills',
    viewPurchaseOrdersDetails: '/purchases/viewPurchaseOrdersDetails',
    viewStorePurchaseOrdersDetails: '/purchases/PurchaseStoreOrders/viewStorePurchaseOrdersDetails',
    viewStorePurchaseOrdersDetails: '/purchases/viewStorePurchaseOrdersDetails',
    expenses: '/purchases/expenses',
  },

  inventory: {
    dashboard: '/inventory/dashboard',
    products: '/inventory/products',
    rawMaterials: '/inventory/rawMaterials',
    counters: '/inventory/counters',
    addon: '/inventory/addon',
    batches: '/inventory/products/batches',
  },

  createestimate: '/createestimate',
  viewestimate: '/viewestimate',
  settlements: '/settlements',

  stores: {
    terminals: '/stores/terminals',
    managers: '/stores/managers',
    staffs: '/stores/staffs',
  },
  table: '/table',
  reservation: '/reservation',
  whatsappCredits: '/whatsappCredits',
  settings: '/settings/uploadLogo',
  account: '/account',
  two: '/two',
  three: '/three',
  attendance: '/attendance',
  support: '/support',
  subscriptionPlan: '/subscriptionPlan',
};
