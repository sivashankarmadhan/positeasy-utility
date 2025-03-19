import { isObject } from "lodash";

const getClone = (data) => {
  if (isObject(data)) {
    return JSON.parse(JSON.stringify(data));
  }
  return null;
};

export default getClone;
