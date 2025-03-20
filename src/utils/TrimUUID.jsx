const TrimUUID = (UUID) => {
  if (typeof UUID !== 'string') return '';
  const sliceFirstFourChar = UUID.slice(0, 4);
  const sliceLastFourChar = UUID.slice(-4);
  return `${sliceFirstFourChar}...${sliceLastFourChar}`;
};

export default TrimUUID;
