import GlobalStorageService from '../../services/GlobalStorageService';

const _serialize = (value) => {
  return JSON.stringify(value);
};

const _deSerialize = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Error in Parsing information in Object Store');
    return {};
  }
};
// eslint-disable-next-line no-undef
const _localStorage = sessionStorage || GlobalStorageService;
const SessionStorage = {
  setItem(key, value) {
    if (typeof value !== 'object') {
      return new Error('Error in storing Object: Value should be of JSON');
    }
    return _localStorage.setItem(key, _serialize(value));
  },

  getItem(key) {
    return _deSerialize(_localStorage.getItem(key) || '{}');
  },
};
export default SessionStorage;