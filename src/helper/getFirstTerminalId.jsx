import { get } from 'lodash';
import { ALL_CONSTANT } from 'src/constants/AppConstants';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
import AuthService from 'src/services/authService';
import getTerminalsByStoreId from './getTerminalsByStoreId';

const getFirstTerminalIdInAll = () => {
  const storesFullDetails = ObjectStorage.getItem(StorageConstants.STORES_FULL_DETAILS);

  const selectedStoreId = AuthService.getSelectedStoreId();
  const selectedTerminalId = AuthService.getSelectedTerminal();

  const terminalIdsDetails = getTerminalsByStoreId({
    storeId: selectedStoreId,
    storesData: storesFullDetails,
  });

  return selectedTerminalId !== ALL_CONSTANT.ALL
    ? selectedTerminalId
    : get(terminalIdsDetails, '0.terminalId');
};

export default getFirstTerminalIdInAll;
