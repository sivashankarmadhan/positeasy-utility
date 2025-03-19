import { isEqual, isObject } from 'lodash';

const filterChangedValueInObj = ({ oldObject, newObject }) => {
  var newObj = {};
  Object.keys(newObject).forEach((key) => {
    if (isObject(newObject[key])) {
      if (!isEqual(oldObject[key], newObject[key])) {
        newObj[key] = newObject[key];
      }
    } else if (oldObject[key] !== newObject[key]) {
      newObj[key] = newObject[key];
    }
  });

  return newObj;
};

export default filterChangedValueInObj;
