import { isEmpty, reduce } from 'lodash';

export function calculateTotalQuantity(addOrder) {
  if (!isEmpty(addOrder)) {
    const value = reduce(addOrder, (ac, va) =>
      typeof ac === 'object' ? ac.quantity + va.quantity : ac + va.quantity
    );
    return typeof value === 'object' ? value.quantity : value;
  } else return 0;
}
