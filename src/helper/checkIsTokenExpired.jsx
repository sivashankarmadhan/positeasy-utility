import { get } from 'lodash';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from '../modules/ObjectStorage';
import Auth_API from '../services/auth';
import AuthService from '../services/authService';
import { logoutBilling } from './logout';
let fetchingData = false;
const REFRESH_TOKEN_TIMEOUT = 60 * 1000;
export const getAccessToken = async (token) => {
  if (fetchingData) return;
  try {
    fetchingData = true;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Token refresh timeout')), REFRESH_TOKEN_TIMEOUT)
    );
    const refreshPromise = Auth_API.refresh(token);
    const response = await Promise.race([refreshPromise, timeoutPromise]);
    if (response) {
      ObjectStorage.setItem(StorageConstants.ACCESS_TOKEN, {
        token: get(response, 'data.accessToken'),
      });
      ObjectStorage.setItem(StorageConstants.MERCHANT_DETAILS, {
        data: { ...get(response, 'data.respPayload') },
      });
      fetchingData = false;
    }
  } catch (e) {
    console.log(e);
    fetchingData = false;
    // Check if error is due to timeout
    if (e.message === 'Token refresh timeout') {
      toast.error('Token refresh operation timed out. Please try again.');
      logoutBilling();
    } else if (e?.error_code === 'ERR_SBEE_0039') {
      toast.error(e?.detail || ErrorConstants.SOMETHING_WRONG);
      logoutBilling();
    }
  }
};
