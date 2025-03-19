const handleCallback = (resolve, reject) => {
  return (error, data) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(data);
  };
};
export default handleCallback;
