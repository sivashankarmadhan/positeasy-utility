import { forEach, isEmpty } from 'lodash';

export const filterShortCode = (allProduct) => {
  if (isEmpty(allProduct)) return [];
  const formatted = [];
  let shortCodes = [];
  forEach(allProduct, (product) => {
    if (product.unitsEnabled) {
      if (!shortCodes.includes(product.shortCode)) {
        formatted.push(product);
        shortCodes.push(product.shortCode);
      }
    } else {
      formatted.push(product);
    }
  });
  return formatted;
};
