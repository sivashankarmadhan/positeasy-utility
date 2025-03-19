import React, { useRef, useState } from 'react';
import {
  Box,
  Card,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip,
  Typography,
  Chip,
  Drawer,
  IconButton,
  Button,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import CalendarStyle from './CalendarStyle';
import CalendarToolbar from './CalendarToolbar';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
import find from 'lodash/find';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';

import {
  formatDate,
  fDates,
  subOneDayFromGivenDay,
  addOneDayToGivenDay,
} from 'src/utils/formatTime';
import { useRecoilValue } from 'recoil';
import { currentStoreId } from 'src/global/recoilState';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import Attendance_API from './AttendanceServices';
import range from 'lodash/range';
import some from 'lodash/some';
import CloseIcon from '@mui/icons-material/Close';
import isFuture from 'date-fns/isFuture';
import isToday from 'date-fns/isToday';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LoadingScreenDrawer from 'src/components/loading-screen-drawer';

export default function Attendance() {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const theme = useTheme();
  const calendarRef = useRef(null);
  const [date, setDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [cellClassName, setCellClassName] = useState('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [datesArray, setDatesArray] = useState([]);
  const [presentDays, setPresentDays] = useState('');
  const [absentDays, setAbsentDays] = useState('');
  const [datesClicked, setDatesClicked] = useState(false);
  const [dateSelected, setDateSelected] = useState('');
  const [punchInChecked, setPunchInChecked] = useState(false);
  const [punchOutChecked, setPunchOutChecked] = useState(false);
  const [dt, setDt] = useState(new Date().toLocaleString());

  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth();
  var firstDay = new Date(y, m, 1);
  const currentMonth = today.getMonth();
  const calendarMonth = date.getMonth();
  const [isCurrentMon, setIsCurrentMon] = useState(false);

  const handleClickToday = async (date, atten) => {
    try {
      setIsLoading(true);
      const options = {
        attendance: atten === 'present' ? true : false,
      };
      const response = await Attendance_API.markAttendance(options);
      if (response) {
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleFullMonthView = async () => {
    try {
      setIsLoading(true);
      const response = await Attendance_API.getAttendance(formatDate(firstDay), formatDate(today));
      if (response) {
        setIsLoading(false);
        setAttendanceData(get(response, 'data.attendanceRecords', []));
        map(get(response, 'data.attendanceRecords', []), (e) => {
          if (get(e, 'date') === today.toISOString().split('T')[0] && get(e, 'attendance'))
            setIsChecked(true);
        });
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = async (startStr, endStr) => {
    try {
      console.log('running1');
      const response = await Attendance_API.getAttendance(formatDate(startStr), formatDate(endStr));
      if (response) {
        setPresentDays(get(response, 'data.presentCount'));
        setAbsentDays(get(response, 'data.absentCount'));
        setIsLoading(false);
        const arrayAdd = map(
          range(
            new Date(startStr),
            new Date(endStr === today ? endStr : addOneDayToGivenDay(endStr)),
            24 * 60 * 60 * 1000
          ),
          (date) => {
            const dateString = formatDate(date); // Format date as "yyyy-mm-dd"
            const attendanceData = find(response.data.attendanceRecords, { date: dateString });

            if (attendanceData) {
              const { attendance, date, extraHours } = attendanceData;
              return { attendance, date, extraHours };
            } else {
              return { attendance: null, date: dateString, extraHours: null };
            }
          }
        );
        setDatesArray(arrayAdd);
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventOptionChange = (event) => {
    const selectedStatus = event.target.checked ? 'present' : 'absent';
    setEventTitle(selectedStatus);
    setCellClassName(selectedStatus.toLowerCase());
    const currentDateStr = formatDate(date);
    handleClickToday(
      currentDateStr,
      selectedStatus.toLowerCase() === 'present' ? 'present' : 'absent'
    );
    setIsChecked(true);
  };

  const handleClickDrawerAtten = (date, atten) => {
    const currentDateStr = formatDate(date);
    handleClickToday(currentDateStr, atten);
  };

  const eventBackgroundColor =
    eventTitle === 'present' ? '#D1FFBC' : eventTitle === 'absent' ? '#FFCCCB' : null;
  const selectAllow = (selectInfo) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectInfo.start.getTime() === today.getTime();
  };

  const onMonthChange = (startStr, endStr) => {
    if (endStr < today) {
      handleMonthChange(startStr, endStr);
    } else {
      handleMonthChange(startStr, today);
    }
  };
  function hasNullAttenForDate(inputDate) {
    return some(datesArray, (item) => {
      return item.date === inputDate && item.attendance === null;
    });
  }
  const handlePunchInClick = () => {
    setPunchInChecked(true);
  };

  const renderDayCellContent = (props) => {
    const { dayNumberText, date, isFuture, isToday } = props;
    const todayMonth = date.getMonth() + 1;
    const isCurrentMonth = todayMonth === new Date().getMonth() + 1;

    const dateChecked = hasNullAttenForDate(formatDate(date));
    if (
      !isUndefined(
        get(
          datesArray.find((it) => it.date === formatDate(date)),
          'attendance'
        )
      ) ||
      isFuture
    )
      return (
        <Grid container justifyContent={'space-between'}>
          <Grid item>
            <Stack>{dayNumberText}</Stack>
          </Grid>
          <Grid item>
            {isToday && isCurrentMonth}
            <br />
            {!isFuture && (
              <Grid>
                {!isMobile ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      display: 'flex',
                      justifyContent: 'left',
                      flexDirection: 'column',
                    }}
                  >
                    {!isChecked && isToday && dateChecked && (
                      <Tooltip title="Mark your atten. status for today">
                        <NotificationsIcon
                          sx={{
                            position: 'absolute',
                            bottom: '1px',
                            right: '15px',
                          }}
                          color="primary"
                          fontSize="small"
                        />
                      </Tooltip>
                    )}
                    {get(
                      datesArray.find((it) => it.date === formatDate(date)),
                      'extraHours'
                    ) && (
                        <Tooltip title={'Overtime hours'}>
                          <Typography
                            variant="h6"
                            sx={{
                              position: 'absolute',
                              marginTop: '10px',
                              marginLeft: '-80px',
                              display: 'inline',
                            }}
                          >
                            <Chip
                              label={`OT - ${get(
                                datesArray.find((it) => it.date === formatDate(date)),
                                'extraHours'
                              )
                                  ? get(
                                    datesArray.find((it) => it.date === formatDate(date)),
                                    'extraHours'
                                  ).slice(0, 5)
                                  : 'N/A'
                                }`}
                              size="small"
                              color="primary"
                              style={{ fontSize: '10px', display: 'inline', borderRadius: '4px' }}
                            />
                          </Typography>
                        </Tooltip>
                      )}
                  </Box>
                ) : (
                  <Box sx={{ position: 'absolute', right: 22, top: '1%' }}>
                    <Stack sx={{ position: 'absolute', marginRight: '1px' }}>
                      {!isChecked && isToday && dateChecked && (
                        <Tooltip title="Mark your atten. status for today">
                          <NotificationsIcon
                            sx={{
                              position: 'absolute',
                              bottom: '-29px',
                              right: '-1px',
                            }}
                            color="primary"
                            fontSize="small"
                          />
                        </Tooltip>
                      )}
                      {get(
                        datesArray.find((it) => it.date === formatDate(date)),
                        'extraHours'
                      ) && (
                          <Tooltip title={'Overtime hours'}>
                            <Typography
                              variant="h6"
                              sx={{
                                position: 'absolute',
                                marginTop: '40px',
                                marginLeft: '-25px',
                                display: 'inline',
                              }}
                            >
                              <Chip
                                label={`OT - ${get(
                                  datesArray.find((it) => it.date === formatDate(date)),
                                  'extraHours'
                                ).slice(0, 5)}`}
                                size="small"
                                color="primary"
                                style={{
                                  fontSize: '8px',
                                  display: 'inline-block',
                                  transform: 'rotate(-45deg)',
                                  height: 'fit-content',
                                  width: '90%',
                                  borderRadius: '4px',
                                }}
                              />
                            </Typography>
                          </Tooltip>
                        )}
                    </Stack>
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      );
  };

  return (
    <>
      <Helmet>
        <title>Attendance | POSITEASY</title>
      </Helmet>

      <Container sx={{ mt: 2 }}>
        <Card>
          {isLoading ? (
            <LoadingScreenDrawer isNormal={true} />
          ) : (
            <>
              <Chip
                sx={{
                  position: 'absolute',
                  top: 11,
                  marginLeft: !isMobile ? 22 : 5,
                  backgroundColor: '#F1FFEB',
                }}
                label={
                  <>
                    {!isMobile ? (
                      <>
                        Present: <strong>{presentDays}</strong>
                      </>
                    ) : (
                      <>
                        P: <strong>{presentDays}</strong>
                      </>
                    )}
                  </>
                }
              />
              <Chip
                sx={{
                  position: 'absolute',
                  top: 11,
                  marginLeft: !isMobile ? 34 : 13,
                  backgroundColor: '#FFEFF0',
                }}
                label={
                  <>
                    {!isMobile ? (
                      <>
                        Absent: <strong>{absentDays}</strong>
                      </>
                    ) : (
                      <>
                        A: <strong>{absentDays}</strong>
                      </>
                    )}
                  </>
                }
              />

              <CalendarStyle sx={{ backgroundColor: '#FFFFFF' }}>
                <FullCalendar
                  ref={calendarRef}
                  rerenderDelay={10}
                  initialDate={date}
                  datesSet={(event) => {
                    setDatesArray([]);
                    onMonthChange(event.start, subOneDayFromGivenDay(event.end));
                  }}
                  initialView="dayGridMonth"
                  dayMaxEventRows={3}
                  eventDisplay="block"
                  tool
                  headerToolbar={{
                    start: '',
                    center: '',
                    end: 'prev title next',
                  }}
                  select={selectAllow}
                  allDayMaintainDuration
                  eventBackgroundColor={eventBackgroundColor}
                  events={map(datesArray, (item) => ({
                    start: item.date,
                    backgroundColor:
                      item.attendance === true
                        ? '#D1FFBC'
                        : item.attendance === false
                          ? '#FFCCCB'
                          : '#ADD8E6',
                    display: 'background',
                  }))}
                  dayCellContent={renderDayCellContent}
                  dayCellClassNames={cellClassName}
                  eventResizableFromStart
                  selectable={true}
                  plugins={[
                    listPlugin,
                    dayGridPlugin,
                    timelinePlugin,
                    timeGridPlugin,
                    interactionPlugin,
                  ]}
                  showNonCurrentDates={false}
                  handleWindowResize={true}
                  height={isMobile ? 600 : 'auto'}
                  titleFormat={{ year: 'numeric', month: 'short' }}
                  dateClick={(info) => {
                    info.jsEvent.stopPropagation();
                    setDateSelected(info.dateStr);
                    if (!isFuture(new Date(info.dateStr))) {
                      setDatesClicked(true);
                      setDateSelected(info.dateStr);
                    }
                  }}
                />
              </CalendarStyle>
            </>
          )}
          <Drawer
            anchor={'right'}
            open={datesClicked}
            PaperProps={{
              sx: {
                width: isMobile ? '60%' : '22%',
                // ...hideScrollbar,
              },
            }}
          >
            {isLoading ? (
              <LoadingScreenDrawer isDrawer={true} />
            ) : (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 1 }}
                >
                  <Chip
                    sx={{
                      backgroundColor: theme.palette.primary.lighter,
                    }}
                    label={
                      <>
                        Date: <strong>{fDates(dateSelected)}</strong>
                      </>
                    }
                  />
                  <Tooltip title="Close">
                    <IconButton sx={{ color: '#7C7C7C' }} onClick={() => setDatesClicked(false)}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack direction={'column'} sx={{ p: 0.5 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: theme.palette.primary.main, p: 2, alignItems: 'center' }}
                  >
                    Attendance status
                  </Typography>
                  {get(
                    datesArray.find((it) => it.date === dateSelected),
                    'attendance'
                  ) !== null &&
                    !isFuture(dateSelected) && (
                      <Chip
                        sx={{
                          backgroundColor:
                            get(
                              datesArray.find((it) => it.date === dateSelected),
                              'attendance'
                            ) === true
                              ? '#F1FFEB'
                              : '#FFEFF0',
                          width: '30%',
                        }}
                        label={
                          <strong>
                            {get(
                              datesArray.find((it) => it.date === dateSelected),
                              'attendance'
                            ) === true
                              ? 'Present'
                              : 'Absent'}
                          </strong>
                        }
                      />
                    )}

                  {formatDate(today) === formatDate(dateSelected) &&
                    get(
                      datesArray.find((it) => it.date === dateSelected),
                      'attendance'
                    ) === null && (
                      <>
                        <Stack direction={'row'} gap={2} p={2}>
                          <Button
                            variant="outlined"
                            sx={{ color: '#6FC888', maxWidth: '20%' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClickDrawerAtten(formatDate(dateSelected), 'present');
                            }}
                          >
                            Present
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{ color: '#E93323', maxWidth: '20%' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClickDrawerAtten(formatDate(dateSelected), 'absent');
                            }}
                          >
                            Absent
                          </Button>
                        </Stack>
                      </>
                    )}
                  {/* {formatDate(today) === formatDate(dateSelected) &&
                    get(
                      datesArray.find((it) => it.date === dateSelected),
                      'attendance'
                    ) !== false && (
                      <Stack direction={'row'} gap={2}>
                        <Tooltip
                          title={
                            get(
                              datesArray.find((it) => it.date === dateSelected),
                              'attendance'
                            ) === null
                              ? 'Mark attendance as present to Punch-in'
                              : ''
                          }
                        >
                          <FormGroup row>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  onChange={() => {
                                    handlePunchInClick();
                                  }}
                                  checked={punchInChecked}
                                  disabled={
                                    get(
                                      datesArray.find((it) => it.date === dateSelected),
                                      'attendance'
                                    ) === null || punchInChecked
                                  }
                                  size="small"
                                  sx={{
                                    '&[class*="-MuiButtonBase-root-MuiCheckbox-root"][aria-disabled="true"]':
                                      {
                                        color: 'green', // Change the color to green for checked, disabled checkboxes
                                      },
                                  }}
                                />
                              }
                              label={'Punch-In'}
                              sx={{ marginInlineStart: '10px' }}
                            />
                            <Tooltip
                              title={
                                get(
                                  datesArray.find((it) => it.date === dateSelected),
                                  'attendance'
                                ) === null
                                  ? ''
                                  : punchOutChecked
                                  ? ''
                                  : 'Check punch-in before punch-out'
                              }
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onChange={() => {
                                      setPunchOutChecked(true);
                                    }}
                                    disabled={!punchInChecked || punchOutChecked}
                                    checked={punchOutChecked}
                                    size="small"
                                    sx={{
                                      '&[class*="-MuiButtonBase-root-MuiCheckbox-root"][aria-disabled="true"]':
                                        {
                                          color: 'green', // Change the color to green for checked, disabled checkboxes
                                        },
                                    }}
                                  />
                                }
                                label={'Punch-Out'}
                                sx={{ marginInlineStart: '10px' }}
                              />
                            </Tooltip>
                          </FormGroup>
                        </Tooltip>
                      </Stack>
                    )} */}
                  {get(
                    datesArray.find((it) => it.date === formatDate(dateSelected)),
                    'extraHours'
                  ) && (
                      <>
                        <Typography
                          variant="h6"
                          sx={{ color: theme.palette.primary.main, alignItems: 'center', p: 2 }}
                        >
                          Overtime
                        </Typography>

                        <Tooltip title={'Overtime hours'}>
                          <Typography variant="h6" sx={{ pl: 2 }}>
                            <Chip
                              label={`OT - ${get(
                                datesArray.find((it) => it.date === formatDate(dateSelected)),
                                'extraHours'
                              )
                                  ? get(
                                    datesArray.find((it) => it.date === formatDate(dateSelected)),
                                    'extraHours'
                                  ).slice(0, 5)
                                  : 'N/A'
                                }`}
                              size="small"
                              color="primary"
                              style={{
                                fontSize: '14px',
                                height: 'fit-content',
                                width: '30%',
                              }}
                            />
                          </Typography>
                        </Tooltip>
                      </>
                    )}
                </Stack>
              </>
            )}
          </Drawer>
        </Card>
      </Container>
    </>
  );
}
