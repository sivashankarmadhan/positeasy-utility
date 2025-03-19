import { isArray, isObject, map } from 'lodash';
import { defaultOrderTypes } from 'src/constants/AppConstants';

export function formatOrderTypeDataStrucutre(list) {
  return isArray(list)
    ? list
    : isObject(list)
    ? map(list, (value, key) => value)
    : defaultOrderTypes;
}
