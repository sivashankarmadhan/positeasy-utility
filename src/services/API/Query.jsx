export const Query = (options) => {
  const {
    startDateD,
    endDateD,
    todayDate,
    customCode,
    customerId,
    category,
    productId,
    orderId,
    type,
    storeId,
  } = options;
  var query = '';

  if (startDateD && endDateD) {
    query = `startDate=${startDateD}&endDate=${endDateD}`;
  } else if (!startDateD && !endDateD && todayDate) {
    query = `date=${todayDate}`;
  } else if (startDateD && !endDateD && todayDate) {
    query = `startDate=${startDateD}&endDate=${todayDate}`;
  } else if (todayDate) {
    query = `date=${todayDate}`;
  }
  if (category) {
    query = `${query}&category=${category}`;
  }
  if (productId) {
    query = `${query}&productId=${productId}`;
  }
  if (orderId) {
    query = `${query}&orderId=${orderId}`;
  }
  if (type) {
    query = `${query}&type=${type}`;
  }
  if (customerId) {
    query = `${query}&customerId=${customerId}`;
  }
  if (customCode) {
    query = `${query}&customCode=${customCode}`;
  }
  if (storeId) {
    query = `${query}&storeId=${storeId}`;
  }

  return query;
};
