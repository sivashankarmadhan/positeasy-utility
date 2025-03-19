import { useMediaQuery, useResponsive } from '@poriyaalar/custom-hooks';
import { endOfYear, format } from 'date-fns';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import subDays from 'date-fns/subDays';
import DateRangePicker from 'rsuite/DateRangePicker';
import 'rsuite/dist/rsuite-no-reset.min.css';
import getTodayDate from 'src/helper/getTodayDate';
import './DateRangePickerRsuiteCss.css';
import { currentEndDate, currentStartDate } from 'src/global/recoilState';
import { useRecoilState } from 'recoil';
import ObjectStorage from 'src/modules/ObjectStorage';
import { StorageConstants } from 'src/constants/StorageConstants';

function StartAndEndDatePickerProps({ startDate, endDate, setEndDate, setStartDate, label = '' }) {
  const { isMobile } = useResponsive();
  const { afterToday } = DateRangePicker;

  const isMobileView = useMediaQuery('(max-width:600px)');

  const predefinedRanges = [
    {
      label: 'Today',
      value: [new Date(), new Date()],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'Tomorrow',
      value: [addDays(new Date(), +1), addDays(new Date(), +1)],
      ...(!isMobile && { placement: 'left' }),
    },

    {
      label: 'Next 7 days',
      value: [addDays(new Date(), +0), addDays(new Date(), +6)],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'Next 30 days',
      value: [addDays(new Date(), +0), addDays(new Date(), +29)],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'This month',
      value: [addDays(new Date(), +0), endOfMonth(new Date(), -1)],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'Next month',
      value: [startOfMonth(addMonths(new Date(), 1)), endOfMonth(addMonths(new Date(), +1))],
      ...(!isMobile && { placement: 'left' }),
    },
    {
      label: 'Upto this year',
      value: [startOfMonth(addMonths(new Date(), 1)), endOfYear(addMonths(new Date(), +1))],
      ...(!isMobile && { placement: 'left' }),
    },
  ];
  const onChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
    }
  };
  const onClean = () => {
    setStartDate();
    setEndDate();
  };
  return (
    <DateRangePicker
      onClean={onClean}
      ranges={predefinedRanges}
      showOneCalendar={isMobileView}
      placement="auto"
      onChange={onChange}
      cleanable={true}
      appearance="default"
      size="lg"
      format="yyyy-MM-dd"
      value={[startDate, endDate]}
      label={label}
    />
  );
}
export default StartAndEndDatePickerProps;
