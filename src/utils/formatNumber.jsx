import numeral from 'numeral';

// ----------------------------------------------------------------------

const formatter = new Intl.NumberFormat('en-IN', {
  // style: 'currency',
  // currency: 'INR',
  // maximumFractionDigits: 2,
});
export function fCurrency(number) {
  const toFixedIfNecessary = +parseFloat(number).toFixed(2);
  return `₹ ${formatter.format(toFixedIfNecessary)}`;
}

export function fPercent(number) {
  return numeral(number / 100).format('0.0%');
}

export function fNumber(number) {
  return numeral(number).format();
}

export function fShortenNumber(number) {
  return numeral(number).format('0.00a').replace('.00', '');
}

export function fData(number) {
  return numeral(number).format('0.0 b');
}

export function isNumeric(num) {
  return !Number.isNaN(num);
}

export function toFixedIfNecessary(value, dp) {
  return +parseFloat(value).toFixed(dp);
}
export function formatSizeUnits(bytes) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + ' GB';
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes > 1) {
    bytes = bytes + ' bytes';
  } else if (bytes === 1) {
    bytes = bytes + ' byte';
  } else {
    bytes = '0 bytes';
  }
  return bytes;
}

export function formatAmountToIndianCurrency(num) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2}).format(num);
}
