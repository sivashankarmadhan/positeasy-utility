let clearSetTimeOut = null;

function debounce(func, timeout = 500) {
  clearTimeout(clearSetTimeOut);
  clearSetTimeOut = setTimeout(() => {
    func();
  }, timeout);
}

export default debounce;
