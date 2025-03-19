import { get } from 'lodash';
import { toFixedIfNecessary } from './formatNumber';
import { OrderTypeConstants } from 'src/constants/AppConstants';

const getTotalPriceAndGst = ({ price, GSTPercent, GSTInc, fullData, orderType }) => {
  let newPrice =
    orderType !== OrderTypeConstants.DineIn && orderType !== OrderTypeConstants.Parcel
      ? Number(get(fullData, `priceVariants.${orderType}`)) || Number(price)
      : Number(price);

  let parcelCharges = 0;

  const isAvailableParcelCharges = fullData?.hasOwnProperty?.('isParcelCharges')
    ? get(fullData, 'isParcelCharges')
    : get(fullData, 'parcelCharges');

  if (isAvailableParcelCharges && newPrice) {
    parcelCharges = Number(get(fullData, 'parcelCharges'));
  }

  if (GSTInc) {
    const parcelChargesGstValue = parcelCharges - parcelCharges / (1 + GSTPercent / 100);
    const parcelChargesBaseValue = parcelCharges / (1 + GSTPercent / 100);
    const basePrice = newPrice / (1 + GSTPercent / 100);
    const gstValue = newPrice - newPrice / (1 + GSTPercent / 100);

    return {
      withoutGstAmount: basePrice, // price without gst ex. 9.5
      withGstAmount: basePrice + gstValue, // price + gst 9.5 + 0.5
      gstPercentageValue: gstValue + parcelChargesGstValue, // gst value
      parcelCharges, // parcelCharge
      parcelChargesWithGst: parcelChargesBaseValue + parcelChargesGstValue, // parcel charges ex. 9.5 + 0.5
      parcelChargesWithoutGst: parcelChargesBaseValue, // parcel ex. 9.5
    };
  }
  return {
    withoutGstAmount: newPrice, // price without gst 10
    withGstAmount: newPrice + newPrice * (GSTPercent / 100) || 0, // price + gst  ex.10 + 0.5
    gstPercentageValue: (newPrice + parcelCharges) * (GSTPercent / 100) || 0, // gst value ex. 0.5
    parcelCharges,
    parcelChargesWithGst: parcelCharges + parcelCharges * (GSTPercent / 100) || 0, // price without gst ex.10.5
    parcelChargesWithoutGst: parcelCharges,
  };
};

export default getTotalPriceAndGst;
