import APIService from '../apiService';
import handleCallback from './Callback';
const API = import.meta.env.VITE_REMOTE_URL;

const OptionsServices = {
  toggleOnlineOptions(data) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/merchant/FD/option-toggle`,
          method: 'POST',
          data,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default OptionsServices;
