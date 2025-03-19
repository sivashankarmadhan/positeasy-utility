// const { format } = require('date-fns');

import { format } from 'date-fns';

export default function getTodayDate() {
  return format(new Date(), 'dd-MMM-yyyy');
}
