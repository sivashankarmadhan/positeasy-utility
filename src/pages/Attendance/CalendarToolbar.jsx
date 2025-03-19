import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Stack, Button, Tooltip, Typography, IconButton, ToggleButton } from '@mui/material';

// utils
import { fDate } from 'src/utils/formatTime';
// hooks
import useResponsive from 'src/hooks/useResponsive';
// components
import Iconify from 'src/components/iconify'; // ----------------------------------------------------------------------
const VIEW_OPTIONS = [
  { value: 'dayGridMonth', label: 'Month', icon: 'ic:round-view-module' },
  { value: 'timeGridWeek', label: 'Week', icon: 'ic:round-view-week' },
  { value: 'timeGridDay', label: 'Day', icon: 'ic:round-view-day' },
  { value: 'listWeek', label: 'Agenda', icon: 'ic:round-view-agenda' },
];
const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  padding: theme.spacing(2.5),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})); // ----------------------------------------------------------------------
CalendarToolbar.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  onToday: PropTypes.func,
  onNextDate: PropTypes.func,
  onPrevDate: PropTypes.func,
  onChangeView: PropTypes.func,
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
};
export default function CalendarToolbar({
  date,
  onToday,
  onNextDate,
  onPrevDate,
  calendarVisible,
  setCalendarVisible,
}) {
  const isDesktop = useResponsive('up', 'sm');
  return (
    <RootStyle>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5">{fDate(date)}</Typography>
        </Stack>
      </Stack>
    </RootStyle>
  );
}
