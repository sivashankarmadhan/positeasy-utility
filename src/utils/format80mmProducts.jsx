import { PRINTER_COMMANDS } from 'src/constants/AppConstants';

const format80mmProducts = (
  totalSize,
  productName,
  productNameSize,
  quantity,
  QuantitySize,
  price,
  priceSize,
  additionalColumn,
  additionalColumnSize
) => {
  let product = productName;
  let BOLD_ON = PRINTER_COMMANDS.TEXT_FORMAT.TXT_BOLD_ON;
  let BOLD_OFF = PRINTER_COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF;
  let space = '\x20';
  function generatespace(size = 1) {
    if (size > 0) return Array(size).fill(space).join('');
    else return '';
  }

  quantity = String(quantity);
  price = String(price);
  additionalColumn = String(additionalColumn);
  quantity = generatespace(QuantitySize - quantity.length) + quantity;
  price = generatespace(priceSize - price.length) + price;
  additionalColumn =
    generatespace(additionalColumnSize - additionalColumn.length) + additionalColumn;
  let formattedString = ``;
  if (productName.length > productNameSize) {
    let availableSize = totalSize > productName.length ? totalSize - productName.length : 0;
    productName =
      product === 'Item' || product === 'Total'
        ? `${productName}${generatespace(availableSize)}\n`
        : `${BOLD_ON}${productName}${BOLD_OFF}${generatespace(availableSize)}\n`;
    formattedString = `${
      productName + generatespace(productNameSize)
    }${quantity} ${price} ${additionalColumn}`;
  } else {
    productName = productName + generatespace(productNameSize - productName.length);
    formattedString =
      product === 'Item' || product === 'Total'
        ? `${productName}${quantity} ${price} ${additionalColumn}`
        : `${BOLD_ON}${productName}${BOLD_OFF}${quantity} ${price} ${additionalColumn}`;
  }

  return formattedString;
};
export default format80mmProducts;
