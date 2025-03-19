import { isEmpty } from 'lodash';
import moment from 'moment';

const DateHelper = {
  findDelta(date_now, date_future) {
    if (isEmpty(date_now) || isEmpty(date_future)) return '-';
    // get total seconds between the times
    var delta = Math.abs(new Date(date_future) - new Date(date_now)) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = delta % 60;

    var dDisplay = days >= 0 ? days + 'd' : '';
    var hDisplay = hours >= 0 ? hours + 'h' : '';
    var mDisplay = minutes >= 0 ? minutes + 'm' : '';
    var sDisplay = seconds >= 0 ? seconds + 's' : '';
    return `${dDisplay} ${hDisplay} ${mDisplay} ${sDisplay}`;
  },
  format(date) {
    if (!date) return '-';
    return moment(date).format('lll');
  },
  findMinutes(date_now, date_future) {
    if (isEmpty(date_now) || isEmpty(date_future)) return '';
    var delta = Math.abs(new Date(date_now) - new Date(date_future)) / 1000;
    var minutes = Math.round(delta / 60);
    return minutes;
  },
  findSeconds(milliseconds) {
    return Math.floor((milliseconds / 1000) << 0);
  },
};

export default DateHelper;
