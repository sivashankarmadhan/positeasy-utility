// const { filter } = require('lodash');
// const { TERMINAL_STATUS } = require('src/constants/AppConstants');

import { filter } from 'lodash';
import { TERMINAL_STATUS } from 'src/constants/AppConstants';

const getTerminalsByStoreId = ({ storeId, storesData }) => {
  if (!storeId) return [];
  const data = filter(storesData, (terminal) => terminal.storeId === storeId);
  return data;
};

export default getTerminalsByStoreId;
