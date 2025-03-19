function isArrayofObjects(arr) {
  return Array.isArray(arr) && arr.every((item) => typeof item === 'object');
}

export default isArrayofObjects;
