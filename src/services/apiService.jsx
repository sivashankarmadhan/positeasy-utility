import { is } from 'date-fns/locale';
import { debounce, isEmpty, map } from 'lodash';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import progressToast, { toast } from 'react-hot-toast';
import { ALL_CONSTANT, TerminalTypes } from 'src/constants/AppConstants';
import { StorageConstants } from 'src/constants/StorageConstants';
import { getAccessToken } from 'src/helper/checkIsTokenExpired';
import { getAppType } from 'src/helper/getAppType';
import { getDeviceType } from 'src/helper/getDeviceType';
import { isTokenExpired } from 'src/helper/isTokenExpired';
import { logoutBilling } from 'src/helper/logout';
import ObjectStorage from 'src/modules/ObjectStorage';
import isArrayofObjects from 'src/utils/isArrayofObjects';
import isJson from 'src/utils/isJson';
import AuthService from './authService';

const DEFAULT_TIMEOUT = 40000;
const TYPE_JSON = 'application/json';

const fnGetFileNameFromContentDispostionHeader = (header) => {
  let fileName = 'downloaded.csv';
  if (isEmpty(header)) {
    return fileName;
  }

  const contentDisposition = header.split(';');
  const fileNameToken = `filename*=UTF-8''`;

  // eslint-disable-next-line no-restricted-syntax
  for (const thisValue of contentDisposition) {
    if (thisValue.trim().indexOf(fileNameToken) === 0) {
      fileName = decodeURIComponent(thisValue.trim().replace(fileNameToken, ''));
      break;
    }
  }

  return fileName;
};

function isValidFileType(url) {
  // Extract the file extension from the URL
  const fileExtension = url.split('.').pop().toLowerCase();

  // List of valid extensions
  const validExtensions = ['pdf', 'csv', 'xlsx'];

  // Return true if the extension is valid, otherwise false
  return validExtensions.includes(fileExtension);
}

const ErrorToast = debounce((message) => {
  progressToast.error(message);
}, 1000);
let requestQueue = [];
let isRefreshing = false;
const APIService = {
  _getJsonData(data) {
    return isString(data) ? data : JSON.stringify(data);
  },
  _processQueue() {
    // Process all requests in the queue
    requestQueue.forEach((req) => {
      this._sendRequest(req.options, req.cb);
    });
    // Clear the queue
    requestQueue = [];
  },
  async request(options, cb = noop, timeout) {
    /**
     * Validating Token
     */

    const tokenExp = isTokenExpired();
    const refreshToken = AuthService._getRefreshToken();
    if (tokenExp && refreshToken) {
      if (isRefreshing) {
        console.log('Token is already being refreshed, queue the request');
        requestQueue.push({ options, cb });
        return;
      }

      isRefreshing = true;
      try {
        await getAccessToken(refreshToken);
        isRefreshing = false;
        this._processQueue();
      } catch (e) {
        console.log(e);
        isRefreshing = false;
        requestQueue = [];
        logoutBilling();
        return;
      }
    } else if (tokenExp && !refreshToken) {
      await logoutBilling();
      return;
    }

    this._sendRequest(options, cb, timeout);
  },

  _sendRequest(options, cb, timeout) {
    const {
      url,
      method = 'GET',
      data,
      customHeaders,
      isNonServiceCall,
      fileName,
      isFileData = false,
    } = options;

    const storeId = AuthService.getSelectedStoreId();
    const terminalId = AuthService.getSelectedTerminal();

    let dataWithStoreAndTerminal = data;
    let urlWithStoreAndTerminal = url;

    if (method === 'POST' || method === 'PUT') {
      if (isJson(data) ? isArrayofObjects(JSON.parse(data)) : isArrayofObjects(data)) {
        dataWithStoreAndTerminal = map(isJson(data) ? JSON.parse(data) : data, (_item) => {
          return {
            ..._item,
            ...(storeId ? { storeId } : {}),
            ...(terminalId && terminalId !== ALL_CONSTANT.ALL ? { terminalId } : {}),
          };
        });
      } else {
        dataWithStoreAndTerminal = {
          ...(storeId ? { storeId } : {}),
          ...(terminalId && terminalId !== ALL_CONSTANT.ALL ? { terminalId } : {}),
          ...((isJson(data) ? JSON.parse(data) : data) || {}),
        };
      }
    } else {
      const formatURL = new URL(url);
      if (storeId && !formatURL.searchParams.get('storeId')) {
        formatURL.searchParams.set('storeId', storeId);
      }
      if (
        terminalId &&
        terminalId !== ALL_CONSTANT.ALL &&
        !formatURL.searchParams.get('terminalId')
      ) {
        formatURL.searchParams.set('terminalId', terminalId);
      }
      urlWithStoreAndTerminal = formatURL.toString();
    }

    let headers = {
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    if (!isFileData) {
      headers['Content-Type'] = TYPE_JSON;
    }
    /**
     * Attaching Bearer token
     */
    const deviceType = getDeviceType();
    headers = {
      ...headers,
      ...{
        authorization: `Bearer ${AuthService._getAccessToken()}`,
        deviceid: AuthService.getDeviceId(),
        deviceinfo: deviceType,
        terminaltype: TerminalTypes.MERCHANT,
        appType: getAppType(deviceType),
      },
    };
    if (customHeaders) {
      headers = { ...headers, ...customHeaders };
    }

    let fetchOptions = {
      method,
      headers,
      body:
        headers['Content-Type'] === TYPE_JSON && !isFileData
          ? this._getJsonData(dataWithStoreAndTerminal)
          : dataWithStoreAndTerminal,
      params: { format_type: 'json' },
      mode: isNonServiceCall ? 'cors' : 'no-cors',
    };

    if (fileName) {
      fetchOptions.fileName = fileName;
    }

    if (!isNonServiceCall) {
      fetchOptions = { ...fetchOptions, mode: 'cors' };
    }

    this._fetch(urlWithStoreAndTerminal, fetchOptions, cb, timeout);
  },
  _fetchWithTimeout(url, options, cb, timeout = DEFAULT_TIMEOUT) {
    console.groupCollapsed('Request');
    console.log('%cpayload', 'color:#2E8B57;', options);
    console.groupEnd();

    return Promise.race([
      fetch(url, options, cb),
      new Promise((resolve, reject) =>
        setTimeout(
          () =>
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({
              code: 900,
              detail: 'Connection Timeout, Please check your Internet',
            }),
          timeout
        )
      ),
    ]);
  },
  _fetch(url, options, cb, timeout) {
    let response;

    const downloadSupportContentTypes = [
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    this._fetchWithTimeout(url, options, cb, timeout)
      .then((serverResponse) => {
        response = serverResponse;
        console.groupCollapsed('Response');
        console.log('serverResponse', serverResponse);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          if (response.status === 204) {
            return '{}';
          }
          return serverResponse.json();
        }
        console.log('contentType', contentType);
        if (contentType && downloadSupportContentTypes.includes(contentType?.split?.(' ')?.[0])) {
          return response.blob();
        }
        return serverResponse.text();
      })
      .then(async (parsedResponse) => {
        console.log('parsed Response', parsedResponse);
        console.log('Status Code ', response.status);
        console.groupEnd();

        const urlParams = new URLSearchParams(url);

        const filename = urlParams.get('filename');

        console.log('urlParams', urlParams, url, filename);

        const contentType = response.headers.get('content-type');

        console.log('contentType', contentType, filename);

        if (contentType && downloadSupportContentTypes.includes(contentType?.split?.(' ')?.[0])) {
          const fileURL = window.URL.createObjectURL(parsedResponse);
          const a = document.createElement('a');
          a.href = fileURL;
          a.download = filename;
          document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click();
          a.remove(); // afterwards we remove the element again
        }

        const singleDateCondition =
          parsedResponse?.data &&
          includes(parsedResponse?.data, 'https://') &&
          includes(parsedResponse?.data, 's3.') &&
          isValidFileType(parsedResponse?.data);

        const multiDateCondition =
          parsedResponse?.data?.status === 'UPDATED' &&
          includes(parsedResponse?.data?.s3Link, 'https://') &&
          includes(parsedResponse?.data?.s3Link, 's3.') &&
          isValidFileType(parsedResponse?.data?.s3Link);

        const handleDownload = async (s3Link) => {
          return fetch(s3Link)
            .then((response) => response.blob())
            .then((blob) => {
              // Create a new object URL for the file
              const link = document.createElement('a');
              const objectURL = URL.createObjectURL(blob);

              link.href = objectURL;
              link.setAttribute('download', filename); // Optional: Set the desired file name
              document.body.appendChild(link);
              link.click();

              // Clean up by revoking the object URL and removing the link element
              URL.revokeObjectURL(objectURL);
              document.body.removeChild(link);
            })
            .catch((error) => {
              toast.error('Download error');
            });
        };

        if (singleDateCondition) {
          await handleDownload(parsedResponse?.data);
        } else if (multiDateCondition) {
          await handleDownload(parsedResponse?.data?.s3Link);
        }

        const { status } = response;
        // If it is not success then respond with error on the response status
        if (includes([200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210], response.status)) {
          return cb(null, parsedResponse);
        }
        if (
          !includes(
            [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 400, 404],
            response.status
          )
        ) {
          console.log(parsedResponse.message || 'Error Occurred');
        }
        if (status === 400) {
          console.log(parsedResponse);

          if (!isEmpty(parsedResponse)) {
            if (get(parsedResponse, 'code') === 'ERR_SBEE_0039') {
              logoutBilling();
              ErrorToast(get(parsedResponse, 'message'));
            }
          }
          if (response?.message === 'Oops! ID not found') {
            console.log('ID Not found');
          } else {
            console.log('Bad Request', parsedResponse);
          }
        }
        if (status === 404) {
          if (response?.statusText === 'Not found') {
            console.log('Not Found');
            AuthService.goto404();
          } else {
            console.log('Not Found', response);
          }
        }
        if (status === 403) {
          console.log('You do not have permission to do this operation');
        }
        if (status === 401) {
          console.log('This is an authenticated URL show login screen');
          logoutBilling();
          return cb({ detail: 'Contact Administrator', response: { ...parsedResponse } });
        }
        return cb(
          {
            status: response.status,
            statusText: response.statusText,
            message: get(parsedResponse, 'message'),

            error_code: get(parsedResponse, 'error_code'),
            errorResponse: parsedResponse,
          },
          parsedResponse
        );
      })
      .catch((err) => {
        console.groupCollapsed('Error');
        console.log('API Request Error', err);
        console.groupEnd();
        cb(err);
      });
  },
  /**
   * General purpose fetch
   * @param {*} url
   * @param {*} params
   * @param {*} cb
   */
  fetch(url, params, cb) {
    let response;
    this._fetchWithTimeout(url, params, cb)
      .then((serverResponse) => {
        response = serverResponse;
        console.log('serverResponse', serverResponse);
        if (includes(url, 's3.')) {
          return { message: 's3 uploaded' };
        }
        return serverResponse.json();
      })
      .then((parsedResponse) => {
        console.log('fetch -> parsedResponse', parsedResponse);
        if (includes([200, 201], response.status)) {
          return cb(null, parsedResponse);
        }
        if (!includes([200, 201], response.status)) {
          console.log(parsedResponse.message || 'Error Occurred');
        }

        return cb(
          {
            status: response.status,
            statusText: response.statusText,
            detail: parsedResponse.message,
            error_code: parsedResponse.code,
          },
          parsedResponse
        );
      })
      .catch((err) => {
        console.log('API Request Error', err);
        cb(err);
      });
  },
  fetchJSON(path) {
    return fetch(path)
      .then((data) => data.text())
      .then((res) => {
        return JSON.parse(res);
      });
  },
  /**
   * Used to download file from other URLS
   * @param {*} url
   */
  fetchBlobURL(blobURL, fileName = 'file', extension = 'csv') {
    fetch(blobURL, {
      method: 'GET',
      headers: { 'Content-Security-Policy': 'upgrade-insecure-requests' },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${extension}`;
        document.body.appendChild(a); // to Support Firefox
        a.click();
        a.remove(); // afterwards we remove the element again
      });
  },
  fetchImage(url, params, cb) {
    let response;
    this._fetchWithTimeout(url, params, cb)
      .then((serverResponse) => {
        response = serverResponse;
        console.log('serverResponse', serverResponse);
        return serverResponse.blob();
      })
      .then((parsedResponse) => {
        console.log('fetch -> parsedResponse', parsedResponse);
        if (includes([200, 201], response.status)) {
          return cb(null, parsedResponse);
        }
        if (!includes([200, 201], response.status)) {
          console.log(parsedResponse.message || 'Error Occurred');
        }
        return cb(
          {
            status: response.status,
            statusText: response.statusText,
            detail: parsedResponse.message,
            error_code: parsedResponse.code,
          },
          parsedResponse
        );
      })
      .catch((err) => {
        console.log('API Request Error', err);
        cb(err);
      });
  },
};
export default APIService;
