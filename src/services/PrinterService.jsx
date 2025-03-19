import ElectronService from './ElectronService';
const PrinterService = {
  print: () => {
    if (ElectronService.isElectron()) {
      console.log('Printer Service - normalPrint');
      window.mainAPI.send('print');
    }
  },

  nodePrint: (data) => {
    if (ElectronService.isElectron()) {
      console.log('Printer Service - nodePrint',data);
      const nodeString = document.getElementById('print') && document.getElementById('print').innerHTML;
      console.log(nodeString);
      window.mainAPI.send('nodePrint', { html: nodeString });      
    }
  },
  nodePrinterList: (data) => {
    if (ElectronService.isElectron()) {
      console.log('Printer Service - nodePrinterList',data);
      window.mainAPI.send('nodePrinterList', data);
    }
  },
};
export default PrinterService;
