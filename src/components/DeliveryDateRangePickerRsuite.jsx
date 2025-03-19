import { useMediaQuery, useResponsive } from '@poriyaalar/custom-hooks';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import subDays from 'date-fns/subDays';
import { useRecoilState, useRecoilValue } from 'recoil';
import DateRangePicker from 'rsuite/DateRangePicker';
import 'rsuite/dist/rsuite-no-reset.min.css';
import { StorageConstants } from 'src/constants/StorageConstants';
import { allConfiguration, currentEndDate, currentStartDate } from 'src/global/recoilState';
import ObjectStorage from 'src/modules/ObjectStorage';
import './DateRangePickerRsuiteCss.css';
import { get } from 'lodash';

function DeliveryDateRangePickerRsuite({setDeliveryStartDate, deliverystartDate, deliveryendDate, setDeliveryEndDate}) {
  const { isMobile } = useResponsive();
  // const [deliverystartDate, setStartDate] = useRecoilState(currentStartDate);
  // const [deliveryendDate, setDeliveryEndDate] = useRecoilState(currentEndDate);
  const { afterToday } = DateRangePicker;
  const configuration = useRecoilValue(allConfiguration);
  const startTime = new Date().setHours(0, 0, 0);
  const endTime = new Date().setHours(23, 59, 59);
  const isMobileView = useMediaQuery('(max-width:600px)');
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const predefinedRanges = isTimeQuery
    ? [
        {
          label: 'Today',
          value: [new Date(startTime), new Date(endTime)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Yesterday',
          value: [addDays(new Date(startTime), -1), addDays(new Date(endTime), -1)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'This week',
          value: [startOfWeek(new Date(startTime)), new Date(endTime)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last 7 days',
          value: [subDays(new Date(startTime), 6), new Date(endTime)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last 30 days',
          value: [subDays(new Date(startTime), 29), new Date(endTime)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'This month',
          value: [startOfMonth(new Date(startTime)), new Date(endTime)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last month',
          value: [
            startOfMonth(addMonths(new Date(startTime), -1)),
            endOfMonth(addMonths(new Date(endTime), -1)),
          ],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'This year',
          value: [new Date(new Date().getFullYear(startTime), 0, 1), new Date(endTime)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last year',
          value: [
            new Date(new Date().getFullYear(startTime) - 1, 0, 1),
            new Date(new Date().getFullYear(endTime), 0, 0),
          ],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'All time',
          value: [new Date(new Date(startTime).getFullYear() - 1, 0, 1), new Date(endTime)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last week',
          closeOverlay: false,
          value: (value) => {
            const [start = new Date(startTime)] = value || [];
            return [
              addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
              addDays(endOfWeek(start, { weekStartsOn: 0 }), -7),
            ];
          },
          appearance: 'default',
        },
      ]
    : [
        {
          label: 'Today',
          value: [new Date(), new Date()],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Yesterday',
          value: [addDays(new Date(), -1), addDays(new Date(), -1)],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'This week',
          value: [startOfWeek(new Date()), new Date()],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last 7 days',
          value: [subDays(new Date(), 6), new Date()],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last 30 days',
          value: [subDays(new Date(), 29), new Date()],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'This month',
          value: [startOfMonth(new Date()), new Date()],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last month',
          value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'This year',
          value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last year',
          value: [
            new Date(new Date().getFullYear() - 1, 0, 1),
            new Date(new Date().getFullYear(), 0, 0),
          ],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'All time',
          value: [new Date(new Date().getFullYear() - 1, 0, 1), new Date()],
          ...(!isMobile && { placement: 'left' }),
        },
        {
          label: 'Last week',
          closeOverlay: false,
          value: (value) => {
            const [start = new Date()] = value || [];
            return [
              addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
              addDays(endOfWeek(start, { weekStartsOn: 0 }), -7),
            ];
          },
          appearance: 'default',
        },
      ];
  const onChange = (dates) => {
    if (dates) {
      const [start, end] = dates;
      ObjectStorage.setItem(StorageConstants.SELECTED_DATES, { deliverystartDate: start, deliveryendDate: end });
      setDeliveryStartDate(start);
      setDeliveryEndDate(end);
    }
  };
  console.log(predefinedRanges);
  return (
    <DateRangePicker
      ranges={predefinedRanges}
      showOneCalendar={isMobileView}
      placement="auto"
      onChange={onChange}
      // cleanable={false}
      appearance="default"
      size="lg"
      oneTap={false}
      onClean={() => {
        setDeliveryStartDate('');
        setDeliveryEndDate('');
      }}
      showMeridian
      format={isTimeQuery ? 'yyyy-MM-dd hh:mm a' : 'yyyy-MM-dd'}

      value={[deliverystartDate, deliveryendDate]}
      onKeyDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
export default DeliveryDateRangePickerRsuite;
