import { get } from 'lodash';
import moment from 'moment';
import { useRecoilState, useRecoilValue } from 'recoil';
import { StorageConstants } from 'src/constants/StorageConstants';
import { isPublishFDState, storeReferenceState } from 'src/global/recoilState';
import ObjectStorage from 'src/modules/ObjectStorage';
import ONLINE_STORES from 'src/services/onlineStoresServices';

const useFDPublish = () => {
  const [isPublishFD, setIsPublishFD] = useRecoilState(isPublishFDState);
  const storeReference = useRecoilValue(storeReferenceState);

  async function updatePublish() {
    if (isPublishFD) return;
    try {
      const lastPublishDetails = await ONLINE_STORES.getLastPublish({
        storeReference: storeReference,
      });
      const lastPublishTime = get(lastPublishDetails, 'data.createdAt')
        ? moment(get(lastPublishDetails, 'data.createdAt')).unix() * 1000 <= moment().unix() * 1000
        : false;
      setIsPublishFD(lastPublishTime);
      ObjectStorage.setItem(StorageConstants.IS_PUBLISH_FD, { data: lastPublishTime });
    } catch (error) {
      throw error;
    }
  }

  return {
    updatePublish,
  };
};

export default useFDPublish;
