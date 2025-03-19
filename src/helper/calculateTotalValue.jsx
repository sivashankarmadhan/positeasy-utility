import { isEmpty, reduce } from 'lodash';

export function calculateTotalValue(addOrder) {
  if (!isEmpty(addOrder)) {
    const value = reduce(addOrder, (ac, va) =>
      typeof ac === 'object' ? ac.price + va.price : ac + va.price
    );
    return typeof value === 'object' ? value.price : value;
  } else return 0;
}
