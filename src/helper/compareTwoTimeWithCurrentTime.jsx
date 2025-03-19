import moment from 'moment';
export const compareTwoTimeWithCurrentTime = (startTime, endTime) => {
  if (!startTime && !endTime) return true; // depend on requirement

  const currentTime = new Date().toLocaleTimeString();
  var beginingTime = moment(startTime, 'hh:mm:ss');
  var endingTime = moment(endTime, 'hh:mm:ss');
  var currentTiming = moment(currentTime, 'hh:mm:ss');
  const isValidBefore = currentTiming.isSameOrBefore(endingTime);
  const isValidAfter = currentTiming.isSameOrAfter(beginingTime);

  if (isValidBefore && isValidAfter) {
    return true;
  } else return false;
};
