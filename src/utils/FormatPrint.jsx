import get from 'lodash/get';
import map from 'lodash/map';
import createLoopText from './createLoopText';
import format80mmProducts from './format80mmProducts';
import { PRINTER_COMMANDS } from 'src/constants/AppConstants';

function toFixed(num) {
  return Number(num).toFixed(2);
}

function formatPrint(data, printerSize = 48, merchantCopy, customerCopy, counterwise) {
  //80mm print-size 48 50mm print-size 28
  const line = createLoopText(printerSize, '-');
  printerSize = printerSize - 3;
  const title = get(data, 'title', '');
  const subTitle = get(data, 'subTitle', '');
  const GSTNo = get(data, 'GSTNo');
  const formattedDate = get(data, 'orderDate');
  const bankDetails = get(data, 'bankDetails', '');
  const orderId = get(data, 'orderId');
  const estimateId = get(data, 'estimateId');
  let date = `Date: ${formattedDate}`;
  let OrderNo = `Order No: <D>${orderId}<D>`;
  let EstimateNo = `Estimate No: ${estimateId}`;
  let additionalCharges = Number(get(data, 'additionalCharges', 0));
  let additionalDiscount = Number(get(data, 'additionalDiscount', 0));
  let packingCharges = Number(get(data, 'packingCharges', 0));
  let deliveryCharges = Number(get(data, 'deliveryCharges', 0));
  let roundedOff = Number(get(data, 'roundedOff.value', 0));
  const extraCharges =
    additionalCharges + packingCharges + deliveryCharges + roundedOff - additionalDiscount;
  let itemLeftSize = Math.round((printerSize * 46) / 100);
  let itemCenterSize = Math.round((printerSize * 10) / 100);
  let itemSecondCenterSize = Math.round((printerSize * 22) / 100);
  let itemRightSize = Math.round((printerSize * 22) / 100);
  let difference =
    printerSize - (itemLeftSize + itemCenterSize + itemSecondCenterSize + itemRightSize);
  itemLeftSize = difference > 0 ? itemLeftSize - difference : itemLeftSize;
  let itemLeftSizeTwoValues = Math.round((printerSize * 40) / 100);
  let itemCenterSizeTwoValues = Math.round((printerSize * 30) / 100);
  let itemRightSizeTwoValues = Math.round((printerSize * 30) / 100);
  let differenceTwo =
    printerSize - (itemLeftSizeTwoValues + itemCenterSizeTwoValues + itemRightSizeTwoValues);
  itemLeftSizeTwoValues =
    differenceTwo > 0 ? itemLeftSizeTwoValues - differenceTwo : itemLeftSizeTwoValues;
  let printData = counterwise ? [] : '';
  let printer_commands = PRINTER_COMMANDS.TEXT_FORMAT;
  let BOLD_ON = PRINTER_COMMANDS.TEXT_FORMAT.TXT_BOLD_ON;
  let BOLD_OFF = PRINTER_COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF;

  if (!counterwise) {
    if (get(data, 'reprint')) {
      printData += '<R>Duplicate<R>\n';
    }
    if (merchantCopy) {
      printData += '<R>Merchant Copy<R>\n';
    }
    if (customerCopy) {
      printData += '<R>Customer Copy<R>\n';
    }
    printData += `${get(data, 'paymentStatus')}\n`;
    printData += `<C>${BOLD_ON}${title}${BOLD_OFF}<C> \n`;
    printData += `<C>${subTitle}<C> \n`;
    if (GSTNo) {
      printData += `<C>GST No: ${GSTNo}<C> \n`;
    }
    if (bankDetails) {
      printData += `<C>${bankDetails}<C> \n`;
    }
    printData += `${line}\n`;

    printData += `${date}\n`;
    if (orderId) printData += `${OrderNo}\n`;
    if (estimateId) printData += `${EstimateNo}\n`;

    printData += `${line}\n`;
    const formattedHead = format80mmProducts(
      printerSize,
      'Item',
      itemLeftSize,
      'Qty',
      itemCenterSize,
      'Pr.',
      itemSecondCenterSize,
      'Amt(Rs.)',
      itemRightSize
    );
    printData += `${formattedHead}\n`;
    printData += `${line}\n`;
    const arr = get(data, 'items');
    let itemString = '';
    for (let e of arr) {
      let itemName = get(e, 'name');
      let quant = get(e, 'quantity');
      let actualPrice = toFixed(Number(get(e, 'price')));
      let price = toFixed(Number(get(e, 'price')) * Number(get(e, 'quantity')));
      let unit = '';
      unit += `-${get(e, 'unit')}`;
      if (get(e, 'unit') === '' || get(e, 'unit') === 'null') {
        unit = '';
      }
      const formattedLine = format80mmProducts(
        printerSize,
        itemName + unit,
        itemLeftSize,
        quant,
        itemCenterSize,
        actualPrice,
        itemSecondCenterSize,
        price,
        itemRightSize
      );
      itemString += `${formattedLine}\n`;
      const addOns = get(e, 'addOns');
      let addOnString = '';
      map(addOns, async (d, idx) => {
        const addOn = get(d, 'name');
        const addOnQty = get(d, 'quantity');
        const addonacutalPrice = toFixed(Number(get(d, 'price')));
        const addonPrice = toFixed(Number(get(d, 'price')) * Number(get(d, 'quantity')));
        const formattedLine = format80mmProducts(
          printerSize,
          addOn,
          itemLeftSize,
          addOnQty,
          itemCenterSize,
          addonacutalPrice,
          itemSecondCenterSize,
          addonPrice,
          itemRightSize
        );
        addOnString += `${formattedLine}\n`;
      });
      itemString += addOnString;
    }
    printData += itemString;
    const price = toFixed(get(data, 'totalAmount'));
    const gstAmount = get(data, 'gstAmount');
    let amount = '';
    const total = get(data, 'totalQty');
    if (gstAmount !== 0) {
      amount = 'Amount: ';
    } else {
      amount = 'Total Amount: ';
    }
    printData += `${line}\n`;
    const formattedTotal = format80mmProducts(
      printerSize,
      'Total',
      itemLeftSize,

      total,
      itemCenterSize,
      '',
      itemSecondCenterSize,
      get(data, 'totalOffer')
        ? (Number(price) - Number(get(data, 'totalOffer'))).toFixed(2)
        : price,
      itemRightSize
    );
    printData += `${formattedTotal}\n`;

    // if (get(data, 'totalOffer') !== 0) {
    //   printData += `Total DisCount: ${get(data, 'totalOffer')}\n`;
    // }
    let isShowSubTotal = gstAmount !== 0 || extraCharges > 0 || Number(get(data, 'totalOffer')) > 0;
    if (isShowSubTotal) {
      const totalFormatted = format80mmProducts(
        printerSize,
        '',
        itemLeftSizeTwoValues,
        '',
        0,
        'Sub Total',
        itemCenterSizeTwoValues,
        `${price}`,
        itemRightSizeTwoValues
      );
      printData += `${totalFormatted}\n`;

      if (gstAmount !== 0) {
        const gstPercentage = (gstAmount / get(data, 'totalWithGst')) * 100;
        const sgstFormatted = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues,
          '',
          0,
          `SGST:`,
          itemCenterSizeTwoValues,
          `+${(gstAmount / 2).toFixed(2)}`,
          itemRightSizeTwoValues
        );
        const cgstFormatted = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues,
          '',
          0,
          `CGST:`,
          itemCenterSizeTwoValues,
          `+${(gstAmount / 2).toFixed(2)}`,
          itemRightSizeTwoValues
        );
        printData += `${sgstFormatted}\n${cgstFormatted}\n`;
      }
      if (get(data, 'totalOffer') !== 0) {
        const discountFormatted = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues - 5,
          '',
          0,
          'Total Discount:',
          itemCenterSizeTwoValues + 5,
          `-${Number(get(data, 'totalOffer')).toFixed(2)}`,
          itemRightSizeTwoValues
        );
        printData += `${discountFormatted}\n`;
      }

      if (additionalCharges > 0) {
        const formattedAdditionalCharges = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues,
          '',
          0,
          `Addl.Charges:`,
          itemCenterSizeTwoValues,
          `+${additionalCharges.toFixed(2)}`,
          itemRightSizeTwoValues
        );
        printData += `${formattedAdditionalCharges}\n`;
      }
      if (additionalDiscount > 0) {
        const formattedAdditionalDiscount = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues,
          '',
          0,
          `Addl.Discount:`,
          itemCenterSizeTwoValues,
          `-${additionalDiscount.toFixed(2)}`,
          itemRightSizeTwoValues
        );
        printData += `${formattedAdditionalDiscount}\n`;
      }
      if (packingCharges > 0) {
        const formattedPackingCharges = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues,
          '',
          0,
          `Packing Charges:`,
          itemCenterSizeTwoValues,
          `+${packingCharges.toFixed(2)}`,
          itemRightSizeTwoValues
        );
        printData += `${formattedPackingCharges}\n`;
      }
      if (deliveryCharges > 0) {
        const formattedDeliveryCharges = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues,
          '',
          0,
          `Delivery Charges:`,
          itemCenterSizeTwoValues,
          `+${deliveryCharges.toFixed(2)}`,
          itemRightSizeTwoValues
        );
        printData += `${formattedDeliveryCharges}\n`;
      }
      if (roundedOff > 0) {
        const formattedRoundedOff = format80mmProducts(
          printerSize,
          '',
          itemLeftSizeTwoValues,
          '',
          0,
          `Round off:`,
          itemCenterSizeTwoValues,
          `${roundedOff.toFixed(2)}`,
          itemRightSizeTwoValues
        );
        printData += `${formattedRoundedOff}\n`;
      }

      // if (gstAmount !== 0) {
      const totalPriceWithGst = get(data, 'totalWithGst', 0) + extraCharges;

      const totalFormattedWithGST = format80mmProducts(
        printerSize,
        '',
        itemLeftSizeTwoValues,
        '',
        0,
        'Grand Total:',
        itemCenterSizeTwoValues,
        `<D>${Math.round(totalPriceWithGst)}<D>`,
        itemRightSizeTwoValues
      );
      printData += `${totalFormattedWithGST}\n`;
      // }
    }
    printData += `${line}\n`;

    printData += `<C>${get(data, 'footerMain', 'Thank you! visit us again')}<C>\n\r`;
  }
  if (counterwise) {
    const counterwiseData = get(data, 'itemCounterWise', []);

    map(counterwiseData, (counterData, counterName) => {
      let formatCounter = '';
      formatCounter += `<D>COUNTER :${counterName === 'null' ? 'COMMON' : counterName}<D>\n`;
      formatCounter += `${line}\n`;
      formatCounter += `${date}\n`;
      if (orderId) formatCounter += `${OrderNo}\n`;
      if (estimateId) formatCounter += `${EstimateNo}\n`;
      formatCounter += `${line}\n`;
      let itemString = '';
      let totalCounterQuantity = 0;
      for (let e of counterData) {
        let itemName = get(e, 'name');
        let quant = get(e, 'quantity');
        totalCounterQuantity += quant;
        let unit = '';
        unit += `-${get(e, 'unit')}`;
        if (get(e, 'unit') === '' || get(e, 'unit') === 'null') {
          unit = '';
        }
        const formattedLine = format80mmProducts(
          printerSize,
          itemName + unit,
          itemLeftSize,
          '',
          itemCenterSize,
          '',
          itemSecondCenterSize,
          quant,
          itemRightSize
        );
        itemString += `${formattedLine}\n`;
        const addOns = get(e, 'addOns');
        let addOnString = '';
        map(addOns, async (d, idx) => {
          const addOn = get(d, 'name');
          const addOnQty = get(d, 'quantity');

          const formattedLine = format80mmProducts(
            printerSize,
            addOn,
            itemLeftSize,
            '',
            itemCenterSize,
            '',
            itemSecondCenterSize,
            addOnQty,
            itemRightSize
          );
          addOnString += `${formattedLine}\n`;
        });
        itemString += addOnString;
      }
      itemString += `${line}\n`;
      const formattedCounterQuantity = format80mmProducts(
        printerSize,
        `Total Quantity`,
        itemLeftSize,
        '',
        itemCenterSize,
        '',
        itemSecondCenterSize,
        totalCounterQuantity,
        itemRightSize
      );
      itemString += `${formattedCounterQuantity}\n`;
      formatCounter += itemString;
      printData.push(formatCounter);
    });
  }
  return printData;
}
export default formatPrint;
