import { AppConstants } from 'src/constants/AppConstants';
import handleCallback from 'src/services/API/Callback';
import APIService from '../apiService';

const API = import.meta.env.VITE_REMOTE_URL;
const S3Services = {
  getS3Link({ format }) {
    return new Promise((resolve, reject) => {
      APIService.request(
        {
          url: `${API}/api/v1/POS/s3/banner-image?format=${format}`,
          method: 'GET',
        },
        handleCallback(resolve, reject)
      );
    });
  },
  sendImagesToS3(options) {
    return new Promise((resolve, reject) => {
      APIService.fetch(
        options.S3URL,
        {
          method: 'PUT',
          headers: {
            'Content-Type': options.type ? options.type : 'image/png',
            'Cache-Control': 'max-age=300', //max age add in seconds
          },
          body: options.file,
        },
        handleCallback(resolve, reject)
      );
    });
  },
};

export default S3Services;
