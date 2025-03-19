import get from 'lodash/get';
import ElectronService from './ElectronService';
import GlobalStorageService from './GlobalStorageService';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';

const ConfigService = {
  boot(cb) {
    if (ElectronService.isElectron()) {
      window.mainAPI.receive('configResponse', (config) => {
       
        GlobalStorageService.setItem('config', config);
        cb && cb(null, 'Booted Config Service');
      });

      window.mainAPI.receive('nodePrinterListResponse', (printers) => {
        const data=get(JSON.parse(printers),'data.printers');
        console.log('nodePrinterListResponse',printers  );
        GlobalStorageService.setItem(StorageConstants.USB_PRINTER_LIST, data);
        cb && cb(null, 'Booted node printer Service');
      });
      window.mainAPI.send('getConfig');
      return;
    }
    cb && cb(null);
  },
};

export default ConfigService;
