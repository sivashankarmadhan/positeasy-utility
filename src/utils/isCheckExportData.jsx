import { get } from 'lodash';
import moment from 'moment';
import toast from 'react-hot-toast';
import PRODUCTS_API from 'src/services/products';
import delayTime from './delayTime';

async function isCheckExportData({ attachmentId, filename }) {
  try {
    const orderDetailsRes = await PRODUCTS_API.exportS3Link(
      {
        attachmentId,
        filename,
      },
      100000
    );

    if (get(orderDetailsRes, 'data.status') === 'UPDATED') {
      return;
    } else {
      await delayTime(5000);
      await isCheckExportData({ attachmentId, filename });
    }
  } catch (error) {
    throw new Error('export error');
  }
}

export default isCheckExportData;
