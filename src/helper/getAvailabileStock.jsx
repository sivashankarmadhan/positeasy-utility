import { filter, find, forEach, isEmpty, get } from 'lodash';
import React from 'react';

const getPrice = (productId, allProducts) => {
  if (!productId) return;
  const check = find(allProducts, (e) => e.productId === productId);
  if (check) return check.offerPrice ? check.offerPrice : check.price;
};

const getOrderDetailsById = (productId, allProducts) => {
  const data = filter(allProducts, (e) => e.productId === productId);
  let orderLength = data.length;
  let withAddon = [];
  let withoutAddon = [];
  let quantity = 0;
  let totalPrice = 0;
  if (orderLength > 0) {
    forEach(data, (e) => {
      quantity += e.quantity;
      if (isEmpty(e.addOn)) {
        totalPrice += getPrice(e.productId, allProducts) * e.quantity;
        withoutAddon.push(e);
      } else if (!isEmpty(e.addOn)) {
        let totalAddonPrice = 0;
        forEach(e.addOn, (d) => {
          totalAddonPrice += d.price;
        });
        totalPrice += (getPrice(e.productId, allProducts) + totalAddonPrice) * e.quantity;
        withAddon.push(e);
      }
    });
  }
  return {
    orderLength,
    withoutAddon,
    withAddon,
    data,
    quantity,
    totalPrice,
    productId: productId,
  };
};

const getAvailabileStock = ({ productId, isBulkQuantity, quantity, allProducts }) => {
  let availability = true;
  const orderData = getOrderDetailsById(productId, allProducts);
  const productData = find(allProducts, (e) => e.productId === productId);

  if (get(productData, 'stockMonitor')) {
    let condition = get(productData, 'stockQuantity') >= get(orderData, 'quantity') + 1;
    if (isBulkQuantity) {
      condition = get(productData, 'stockQuantity') >= Number(quantity);
    }
    if (condition) {
      availability = true;
    } else {
      availability = false;
    }
  } else availability = true;
  return availability;
};

export default getAvailabileStock;
