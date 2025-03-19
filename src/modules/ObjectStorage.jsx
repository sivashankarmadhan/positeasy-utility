import { encode, decode } from 'base-64';

const serialize = (value) => {
  return JSON.stringify(value);
};
const deSerialize = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Error in Parsing information in Object Store', e);
    return {};
  }
};
export default {
  setItem(key, value) {
    const encodedKey = encode(key);
    const encodedValue = encode(serialize(value));
    return localStorage.setItem(encodedKey, encodedValue);
  },
  getItem(key) {
    const encodedKey = encode(key);
    const encodedValue = localStorage.getItem(encodedKey);
    if (!encodedValue) return {};
    return deSerialize(decode(encodedValue));
  },
  removeItem(key) {
    const encodedKey = encode(key);
    return localStorage.removeItem(encodedKey);
  },
  getItemArray(key) {
    const encodedKey = encode(key);
    const encodedValue = localStorage.getItem(encodedKey);
    if (!encodedValue) return [];
    return deSerialize(decode(encodedValue));
  },
};
