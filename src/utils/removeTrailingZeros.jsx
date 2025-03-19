function removeTrailingZeros(arr) {
  let i = arr.length - 1;
  while (i >= 0 && arr[i] === 0) {
    arr.pop();
    i--;
  }
  return arr;
}

export default removeTrailingZeros;
