import { useTheme } from '@mui/material';
import { useMediaQuery, useResponsive } from '@poriyaalar/custom-hooks';
import { get } from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DatePicker as RsuiteDatePicker } from 'rsuite'; // Renamed import to avoid conflict
import 'rsuite/dist/rsuite-no-reset.min.css';
//import 'rsuite/dist/rsuite.css';
import { StorageConstants } from 'src/constants/StorageConstants';
import { allConfiguration, currentDate } from 'src/global/recoilState';
import ObjectStorage from 'src/modules/ObjectStorage';
import './DateRangePickerRsuiteCss.css';

function DatePicker({featureDate}) {
  // Renamed component to avoid conflict
  const { isMobile } = useResponsive();
  const [selectedDate, setSelectedDate] = useRecoilState(currentDate); // State for single date
  const configuration = useRecoilValue(allConfiguration);

  const isMobileView = useMediaQuery('(max-width:600px)');
  const isTimeQuery = get(configuration, 'featureSettings.isTimeQuery', false);
  const theme = useTheme();

  const onChange = (date) => {
    if (date) {
      ObjectStorage.setItem(StorageConstants.SELECT_DATE, date);
      setSelectedDate(date);
    }
  };
  const PRIMARY_MAIN = theme.palette.primary.main;
  return (
    <RsuiteDatePicker
      fill={PRIMARY_MAIN}
      showOneCalendar={isMobileView}
      placement="auto"
      onChange={onChange}
      cleanable={false}
      appearance="default"
      size="lg"
      format={isTimeQuery ? 'yyyy-MM-dd' : 'MM/dd/yyyy'}
      disabledDate={featureDate? true :(date) => date > new Date()} // Disable future dates if needed
      value={selectedDate} // Set the selected date
      onKeyDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}

export default DatePicker;
