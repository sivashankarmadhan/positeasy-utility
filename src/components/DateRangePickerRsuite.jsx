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
import { DatePicker } from 'rsuite';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { column } from 'stylis';
import { Box, TextField, Stack } from '@mui/material';

function StartAndEndDatePicker() {
  const { isMobile } = useResponsive();
  const [startDate, setStartDate] = useRecoilState(currentStartDate);
  const [endDate, setEndDate] = useRecoilState(currentEndDate);
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
          label: 'Last 3 months',
          value: [startOfMonth(addMonths(new Date(), -3)), endOfMonth(addMonths(new Date(), -1))],
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
      ObjectStorage.setItem(StorageConstants.SELECTED_DATES, { startDate: start, endDate: end });
      setStartDate(start);
      setEndDate(end);
    }
  };
  console.log(predefinedRanges);
  return !isMobileView ? (
    <DateRangePicker
      ranges={predefinedRanges}
      // showOneCalendar={isMobileView}
      placement="auto"
      onChange={onChange}
      cleanable={false}
      appearance="default"
      size="lg"
      showMeridian
      format={isTimeQuery ? 'yyyy-MM-dd hh:mm a' : 'yyyy-MM-dd'}
      disabledDate={afterToday()}
      value={[startDate, endDate]}
      onKeyDown={(e) => {
        e.preventDefault();
      }}
    />
  ) : isTimeQuery ? (
    <Stack direction={'column'} spacing={1}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          sx={{ minWidth: '19rem' }}
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => <TextField {...params} className="rounded-md" size="small" />}
          shouldDisableDate={(date) => date > new Date()}
          inputFormat="dd/MM/yyyy hh:mm a"
          ampm
        />
      </LocalizationProvider>

      <Stack alignItems="center" fontSize={20} sx={{ margin: '0' }}>
        <div>to</div>
      </Stack>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          sx={{ minWidth: '19rem' }}
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          renderInput={(params) => (
            <TextField {...params} className="rounded-md" size="small" style={{ width: '100%' }} />
          )}
          shouldDisableDate={(date) => date > new Date()}
          inputFormat="dd/MM/yyyy hh:mm a"
          ampm
        />
      </LocalizationProvider>
    </Stack>
  ) : (
    <Stack flexDirection="row" alignItems="center">
      <Stack>
        <DatePicker
          value={startDate}
          setting
          editable={false}
          disabledDate={(date) => date > new Date()}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => <TextField {...params} className="rounded-md" size="small" />}
        />
      </Stack>
      <Stack sx={{ mx: 2 }}>to</Stack>
      <Stack>
        <DatePicker
          value={endDate}
          placement="bottomEnd"
          setting
          editable={false}
          disabledDate={(date) => date > new Date()}
          onChange={(newValue) => setEndDate(newValue)}
          renderInput={(params) => <TextField {...params} className="rounded-md" size="small" />}
        />
      </Stack>
    </Stack>
  );
}
export default StartAndEndDatePicker;
