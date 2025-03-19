import { addDays, format, formatDistanceToNow, getTime, subDays } from 'date-fns';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import moment from 'moment';
import momentInd from 'moment-timezone';
import { StorageConstants } from 'src/constants/StorageConstants';
import ObjectStorage from 'src/modules/ObjectStorage';
// ----------------------------------------------------------------------

export function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD');
}
export function fDates(date) {
  return dayjs(date).format('DD-MMM-YYYY');
}

export function currentDate() {
  return dayjs().format('YYYY-MM-DD');
}

export function currentTime() {
  return dayjs().format('HH:mm:ss');
}

export function currentTimeWithoutSec() {
  return dayjs().format('HH:mm');
}

export function formatTime(date) {
  return dayjs(date).format('HH:mm:ss');
}

export function formatTimeWithoutSec(date) {
  return dayjs(date).format('HH:mm');
}

export function formatTimeAMandPM(date) {
  return dayjs(date).format('hh:mm A');
}

export function today(date) {
  return momentInd(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
}

export function dateFormat(date) {
  return dayjs(date).format('DD-MM-YYYY');
}

export function dateWithTimeFormat(date) {
  return dayjs(date).format('YY-MM-DD HH:mm');
}
export function dateWithTimeFormatAMPM(date) {
  return dayjs(date).format('DD/MM/YYYY hh:mm A');
}

export function dateWithTimeAndSecFormatAMPM(date) {
  return moment(date).format('DD-MMM-YYYY hh:mm:ss A');
}

export function fDatesWithTimeStamp(date) {
  return moment(date).format('DD-MMM-YYYY hh:mm A');
}

export function fDatesWithTimeStampWithDayjs(date) {
  return dayjs(date).format('DD-MMM-YYYY hh:mm A');
}

export function fDatesWithTimeStampFromUtc(date) {
  return moment.utc(date).format('DD-MMM-YYYY hh:mm A');
}

export function fDateDifferenceUtc(date1, date2) {
  if (isEmpty(date1)) {
    return 0;
  }
  if (isEmpty(date2)) {
    return 0;
  }
  const utc1 = moment.utc(date1);
  const utc2 = moment.utc(date2);
  return Math.abs(utc1.diff(utc2, 'hours'));
}

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function formatIndDateWithOutUtc(date) {
  return moment.utc(date).format('YYYY-MM-DD hh:mm:ss A');
}

export function formatIndDateWithOutUtcStartingWithDate(date) {
  return moment.utc(date).format('DD-MM-YYYY hh:mm:ss A');
}

export function timeFormat(date) {
  if (!date) return;
  const splitTime = date.split(':');
  const withoutSecond = `${splitTime[0]}:${splitTime[1]}`;

  const twelveHourTime = dayjs('1/1/1 ' + withoutSecond).format('hh:mm A');
  return twelveHourTime;
}

export function subOneDayFromGivenDay(date) {
  const prevDay = subDays(date, 1);
  return prevDay;
}

export function addOneDayToGivenDay(date) {
  const nextDay = addDays(date, 1);
  return nextDay;
}
export function convertTimeTo12HourFormat(timeString) {
  const [hours, minutes, seconds] = timeString.split(':');
  let returnHours = hours;
  let period = 'AM';

  if (returnHours >= 12) {
    period = 'PM';
    if (returnHours > 12) {
      returnHours = returnHours - 12;
    }
  }

  return `${returnHours}:${minutes} ${period}`;
}

export function formatDay(day) {
  return dayjs().format(day);
}

export function getLast7DaysWithDay() {
  const datesWithDay = [];
  for (let i = 0; i < 7; i++) {
    const date = dayjs().subtract(i, 'day');
    datesWithDay.push({
      date: formatDate(date),
      day: date.format('ddd'), // 'ddd' format gives the abbreviated day name
    });
  }
  return datesWithDay;
}
export function getLastNDaysWithDay() {
  const today = dayjs();
  const lastDayOfCurrentMonth = today.endOf('month').date();
  const n = Math.min(30, lastDayOfCurrentMonth);
  const datesWithDay = [];
  for (let i = 0; i < n; i++) {
    const date = dayjs().subtract(i, 'day');
    datesWithDay.push({
      date: formatDate(date),
      day: date.format('ddd'), // 'ddd' format gives the abbreviated day name
    });
  }
  return datesWithDay;
}

export function getCustomDateDaysWithDay({ startDate, endDate }) {
  const today = dayjs(startDate);
  const lastDayOfCurrentMonth = dayjs(endDate);
  const diff = lastDayOfCurrentMonth.diff(today, 'day') + 1;
  const datesWithDay = [];
  for (let i = 0; i < diff; i++) {
    const date = dayjs(today).add(i, 'day');
    datesWithDay.push({
      date: formatDate(date),
      day: date.format('ddd'), // 'ddd' format gives the abbreviated day name
    });
  }
  return datesWithDay;
}

export function addTimeInCurrentDate(time) {
  return dayjs(`${currentDate()}T${time || '00:00'}`);
}

const changedToUTC = function (dates) {
  const { startDate, endDate } = dates || {};
  const { data: orderResetTime } = ObjectStorage.getItem(StorageConstants.ORDER_RESET_TIME);

  let formatStartDate = startDate;
  let formatEndDate = endDate;

  if (orderResetTime !== '00:00') {
    if (orderResetTime <= currentTimeWithoutSec() && endDate) {
      formatEndDate = moment(endDate).add(1, 'd').format('YYYY-MM-DD');
    } else if (orderResetTime > currentTimeWithoutSec() && startDate) {
      formatStartDate = moment(startDate).subtract(1, 'd').format('YYYY-MM-DD');
    }
  }

  if (orderResetTime === '00:00' && startDate) {
    return `${formatStartDate}T00:00:00Z`;
  } else if (orderResetTime === '00:00' && endDate) {
    return `${formatEndDate}T23:59:59Z`;
  } else if (formatStartDate) {
    return `${formatStartDate}T${orderResetTime}:00Z`;
  } else if (formatEndDate) {
    let reduceOneHour = `${Number(orderResetTime?.split(':')[0]) - 1}`;
    if (reduceOneHour?.length === 1) {
      reduceOneHour = `0${reduceOneHour}`;
    }
    return `${formatEndDate}T${reduceOneHour}:59:59Z`;
  }
};
const changedToUTCWithTime = function (dates) {
  const { startDate, endDate } = dates || {};
  const { data: orderResetTime } = ObjectStorage.getItem(StorageConstants.ORDER_RESET_TIME);
  let formatStartDate = startDate;
  let formatEndDate = endDate;

  if (formatStartDate) {
    return `${formatStartDate.replace(' ', 'T')?.trim()?.replaceAll(' ', '')}:00Z`;
  } else if (formatEndDate) {
    return `${formatEndDate.replace(' ', 'T')?.trim()?.replaceAll(' ', '')}:59Z`;
  }
};
export const IndFormat = (dates, isTime = false) => {
  console.log('changedToUTCWithTime', dates);
  const formatDates = {
    startDate: dates?.startDate
      ? momentInd(dates?.startDate)
          .tz('Asia/Kolkata')
          .format(isTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD')
      : null,
    endDate: dates?.endDate
      ? momentInd(dates?.endDate)
          .tz('Asia/Kolkata')
          .format(isTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD')
      : null,
  };
  console.log('changedToUTCWithTime', changedToUTCWithTime(formatDates));
  return isTime ? changedToUTCWithTime(formatDates) : changedToUTC(formatDates);
};

export function fDateTimes(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}
export function DateTimes(date) {
  return dayjs(date).format('YYYY-MM-DD');
}
