import { find, isEmpty } from 'lodash';

const getTerminalByStoreId = ({ storeId, storesData }) => {
  if (!storeId) return [];
  const data = find(storesData, (terminal) => terminal.storeId === storeId);
  return typeof data === 'object' && !isEmpty(data) ? data.terminalId : data;
};

export default getTerminalByStoreId;
