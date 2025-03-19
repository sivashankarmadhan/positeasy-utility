const ElectronService = {
  isElectron() {
    var userAgent = navigator.userAgent.toLowerCase();
    return userAgent.indexOf(' electron/') > -1;
  },

  getMacAddress() {
    if (this.isElectron()) {
      return new Promise((res, rej) => {
        window.mainAPI.receive('getMacResponse', res);
        window.mainAPI.send('getMac');
      });
    }
    return Promise.resolve('0.0.0.0.0');
  },
};

export default ElectronService;
