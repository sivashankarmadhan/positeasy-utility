import moment from 'moment';
import { IndFormat } from './formatTime';

function isSingleDate(startDate, endDate) {
  const daysBetween = moment(IndFormat({ endDate })).diff(moment(IndFormat({ startDate })), 'days');

  return daysBetween <= 0;
}

export default isSingleDate;
