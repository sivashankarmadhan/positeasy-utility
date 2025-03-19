import { PaymentStatusConstants, PURCHASE_ORDER_STATUS, STORE_PURCHASE_ORDER_STATUS } from 'src/constants/AppConstants';

const statusColor = (status) => {
  if (status === PaymentStatusConstants.COMPLETED) {
    return 'success';
  } else if (status === PaymentStatusConstants.FAILED) {
    return 'error';
  } else if (status === PaymentStatusConstants.PENDING) {
    return 'warning';
  } else {
    return 'cancel';
  }
};

export default statusColor;

export const purchaseOrderStatusColor = (status) => {
  console.log('status', status);
  if ([PURCHASE_ORDER_STATUS.OPEN, PURCHASE_ORDER_STATUS.TRANSIT].includes(status)) {
    return { bgColor: '#f5c28770', color: '#ec8713' };
  } 
  else if (
    [
      PURCHASE_ORDER_STATUS.RECEIVED,
      PURCHASE_ORDER_STATUS.BILLED,
      PURCHASE_ORDER_STATUS.PARTIALLY_PAID,
    ].includes(status)
  ) {
    return { bgColor: '#78cc8070', color: '#28692e' };
  }
   else if ([PURCHASE_ORDER_STATUS.CANCELLED, PURCHASE_ORDER_STATUS.RETURN,  PURCHASE_ORDER_STATUS.CLOSE,].includes(status)) {
    return { bgColor: '#ff7d7d70', color: '#FF0000' };
  }
};
export const storePurchaseOrderStatusColor = (status) => {
  if ([STORE_PURCHASE_ORDER_STATUS.OPEN, STORE_PURCHASE_ORDER_STATUS.TRANSIT].includes(status)) {
    return { bgColor: '#f5c28770', color: '#ec8713' };
  } 
  else if (
    [
      STORE_PURCHASE_ORDER_STATUS.RECEIVED,
      STORE_PURCHASE_ORDER_STATUS.BILLED,
      STORE_PURCHASE_ORDER_STATUS.PARTIALLY_PAID,
      STORE_PURCHASE_ORDER_STATUS.ACKNOWLEDGE,
    ].includes(status)
  ) {
    return { bgColor: '#78cc8070', color: '#28692e' };
  }
   else if ([STORE_PURCHASE_ORDER_STATUS.CANCELLED, STORE_PURCHASE_ORDER_STATUS.RETURN,  STORE_PURCHASE_ORDER_STATUS.CLOSE,].includes(status)) {
    return { bgColor: '#ff7d7d70', color: '#FF0000' };
  }
};
