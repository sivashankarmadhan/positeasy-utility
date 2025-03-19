import { AppConstants } from 'src/constants/AppConstants';

function HealthService() {
  const API = import.meta.env.VITE_REMOTE_URL;
  const requestOptions = {
    method: 'GET',
  };
  return new Promise((resolve, reject) => {
    fetch(`${API}`, requestOptions)
      .then(() => {
        return resolve();
      })
      .catch(() => {
        return reject();
      });
  });
}
export default HealthService;
