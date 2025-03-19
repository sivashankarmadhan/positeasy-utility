const delayTime = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export default delayTime;
