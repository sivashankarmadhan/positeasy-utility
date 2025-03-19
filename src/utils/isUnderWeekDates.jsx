import moment from 'moment';
import { IndFormat } from './formatTime';

function isUnderWeekDates(startDate, endDate, isCsv, isNot1Year) {
  if (!isNot1Year) {
    const monthsBetween = moment(IndFormat({ endDate })).diff(
      moment(IndFormat({ startDate })),
      'months'
    );
    return monthsBetween <= 11;
  }

  if (isCsv) {
    const daysBetween = moment(IndFormat({ endDate })).diff(
      moment(IndFormat({ startDate })),
      'days'
    );
    return daysBetween <= 31;
  }

  const daysBetween = moment(IndFormat({ endDate })).diff(moment(IndFormat({ startDate })), 'days');
  return daysBetween <= 6;
}

export default isUnderWeekDates;
