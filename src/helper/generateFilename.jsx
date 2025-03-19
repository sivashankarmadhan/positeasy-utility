export const generateFilename = (text) => {
  const timeStamp = new Date().getTime();
  const fileName = `${text}_${timeStamp}`;
  return fileName;
};
