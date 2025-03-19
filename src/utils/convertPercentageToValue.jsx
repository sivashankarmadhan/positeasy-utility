const convertPercentageToValue = (percentage, totalValue) => {
  if (percentage && totalValue) {
    return (percentage / 100) * totalValue;
  }
  return 0;
};

export default convertPercentageToValue;
