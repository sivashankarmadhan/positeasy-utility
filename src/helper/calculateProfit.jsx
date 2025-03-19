export const calculateProfit = (lastSale, currentSale) => {
    let percentageChange;
    if (lastSale === 0 && currentSale === 0) {
      percentageChange = 0;
    } else if (lastSale === 0 && currentSale !== 0) {
      percentageChange = 1.0;
    } else if (lastSale !== 0 && currentSale === 0) {
      percentageChange = -1.0;
    } else {
      const difference = (currentSale - lastSale) / 100;
      percentageChange = (difference / lastSale) * 100;
    }
    return percentageChange
  }
