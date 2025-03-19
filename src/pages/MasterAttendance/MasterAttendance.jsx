import React, { useEffect, useRef, useState } from 'react';
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
  FormLabel,
  RadioGroup,
  Radio,
  Typography,
  Chip,
  Drawer,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import CalendarStyle from 'src/pages/Attendance/CalendarStyle';
import CalendarToolbar from 'src/pages/Attendance/CalendarToolbar';
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
import filter from 'lodash/filter';
import find from 'lodash/find';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import range from 'lodash/range';
import slice from 'lodash/slice';
import some from 'lodash/some';
import includes from 'lodash/includes';
import split from 'lodash/split';
import moment from 'moment';
import {
  fDates,
  formatDate,
  currentDate,
  subOneDayFromGivenDay,
  addOneDayToGivenDay,
} from 'src/utils/formatTime';
import uuid from 'react-uuid';
import LoadingScreenDrawer from 'src/components/loading-screen-drawer/LoadingScreenDrawer';
import Attendance_API from 'src/pages/Attendance/AttendanceServices';
import isFuture from 'date-fns/isFuture';
import isToday from 'date-fns/isToday';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { DATE_TIME_FORMAT_ATTENDANCE, hideScrollbar } from 'src/constants/AppConstants';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import toast from 'react-hot-toast';
import Backdrop from '@mui/material/Backdrop';
import _, { isBoolean, isEmpty } from 'lodash';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import utc from 'dayjs/plugin/utc';

export default function MasterAttendance(props) {
  const {
    accessId,
    otUpdate,
    setOtUpdate,
    datesArray,
    setDatesArray,
    setPresentDays,
    presentDays,
    absentDays,
    setAbsentDays,
    setAttendanceMasterView,
  } = props;

  dayjs.extend(utc);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const theme = useTheme();
  const calendarRef = useRef(null);
  const [date, setDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [cellClassName, setCellClassName] = useState('');

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMinWidth300px = useMediaQuery('(min-width:300px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;

  const [isChecked, setIsChecked] = useState(false);
  const [isLoadingM, setIsLoadingM] = useState(false);
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth();
  var firstDay = new Date(y, m, 1);
  const currentMonth = today.getMonth();
  const calendarMonth = date.getMonth();
  const [isCurrentMon, setIsCurrentMon] = useState(false);
  const [datesClicked, setDatesClicked] = useState(false);
  const [dateSelected, setDateSelected] = useState('');
  const todayDate = formatDate(today) + 'T00:00';
  const [dateValue, setDateValue] = useState(dayjs(today));

  const [timeValue, setTimeValue] = useState(dayjs(todayDate));
  const [leaveHours, setLeaveHours] = useState(dayjs(todayDate));
  const [inTime, setInTime] = useState(dayjs(todayDate));
  const [outTime, setOutTime] = useState(dayjs(todayDate));
  const [attendanceDetails, setAttendanceDetails] = useState({});

  function hasNullAttenForDate(inputDate) {
    return some(datesArray, (item) => {
      return item.date === inputDate && item.attendance === null;
    });
  }
  const handleClickToday = async (currentDateStr, attendance) => {
    try {
      setIsLoadingM(true);
      setDate(new Date(dateSelected));
      const currentDate = new Date();
      const currentTime = currentDate.toLocaleTimeString([], { hour12: false });
      const options = {
        attendance: attendance === 'present' ? true : false,
        date: currentDateStr,
        time: currentTime,
        accessId: accessId,
      };
      if (hasNullAttenForDate(currentDateStr)) {
        const response = await Attendance_API.changeStaffAttendance(options);
        if (response) {
          setIsLoadingM(false);
        }
      } else {
        const response = await Attendance_API.markExtraHoursHours(options);
        if (response) {
          setIsLoadingM(false);
        }
      }
    } catch (e) {
      setIsLoadingM(false);
      console.error(e);
    }
  };

  const handleFullMonthView = async () => {
    try {
      setIsLoadingM(true);
      const response = await Attendance_API.getAttendance(
        formatDate(firstDay),
        formatDate(today),
        accessId
      );
      if (response) {
        setPresentDays(get(response, 'data.presentCount'));
        setAbsentDays(get(response, 'data.presentCount'));
        setIsLoadingM(false);
        setOtUpdate(false);
        setAttendanceData(get(response, 'data.attendanceRecords', []));
        map(get(response, 'data.attendanceRecords', []), (e) => {
          if (get(e, 'date') === today.toISOString().split('T')[0] && get(e, 'attendance'))
            setIsChecked(true);
        });
      }
    } catch (e) {
      console.error(e);
      setIsLoadingM(false);
    } finally {
      setIsLoadingM(false);
    }
  };

  const handleMonthChange = async (startStr, endStr) => {
    try {
      const response = await Attendance_API.getAttendance(
        formatDate(startStr),
        formatDate(endStr),
        accessId
      );
      if (response) {
        setIsLoadingM(false);
        setAttendanceDetails(get(response, 'data'));
        setPresentDays(get(response, 'data.presentCount'));
        setAbsentDays(get(response, 'data.absentCount'));
        const arrayAdd = map(
          range(
            new Date(startStr),
            new Date(today === endStr ? endStr : addOneDayToGivenDay(endStr)),
            24 * 60 * 60 * 1000
          ),
          (date) => {
            const dateString = formatDate(date); // Format date as "yyyy-mm-dd"
            const attendanceData = find(response.data.attendanceRecords, { date: dateString });

            if (attendanceData) {
              const { attendance, date, extraHours, permission } = attendanceData;
              return { attendance, date, extraHours, permission };
            } else {
              return { attendance: null, date: dateString, extraHours: null, permission: null };
            }
          }
        );
        setDatesArray(arrayAdd);
      }
    } catch (e) {
      console.error(e);
      setIsLoadingM(false);
    } finally {
      setIsLoadingM(false);
    }
  };

  const handleEventOptionChange = (event, dateC) => {
    const selectedStatus = event.target.checked ? 'present' : 'absent';
    setEventTitle(selectedStatus);
    setCellClassName(selectedStatus.toLowerCase());
    handleClickToday(
      formatDate(dateC),
      selectedStatus.toLowerCase() === 'present' ? 'present' : 'absent'
    );
    datesArray.forEach((item) => {
      if (item.date === formatDate(dateC)) {
        // Update the attendance value for the specific date
        item.attendance = selectedStatus.toLowerCase() === 'present' ? true : false;
      }
    });
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

  const updateAtten = async () => {
    const dateSel = new Date(dateSelected);
    const getStartAndEndOfMonth = (date) => ({
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
    });
    const stenObj = getStartAndEndOfMonth(dateSel);

    setDatesArray([]);
    await handleMonthChange(stenObj.start, stenObj.end);
  };
  // useEffect(() => {
  //   console.log('useEffect called');
  //   if (otUpdate) {
  //     console.log('handlefullmonthview called inside useEffect');
  //     handleFullMonthView();
  //   }
  // }, [accessId]);

  const onMonthChange = (startStr, endStr) => {
    if (endStr < today) {
      handleMonthChange(startStr, endStr);
    } else {
      handleMonthChange(startStr, today);
    }
  };
  const handleDateClick = (info) => {
    setDateValue(formatDate(info.dateStr));
    if (
      get(
        attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
        'extraHours'
      ) ||
      get(
        attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
        'inTime'
      ) ||
      get(
        attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
        'outTime'
      ) ||
      get(
        attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
        'permission'
      )
    ) {
      const otHrs = dayjs(
        formatDate(info.dateStr) +
          `T${get(
            attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
            'extraHours'
          )}`
      );
      setTimeValue(otHrs);
      let inHrs = get(
        attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
        'inTime'
      );
      setInTime(dayjs.utc(inHrs));

      const perHrs = dayjs(
        formatDate(info.dateStr) +
          `T${get(
            attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
            'permission'
          )}`
      );
      setLeaveHours(perHrs);
      let outHrs = get(
        attendanceDetails.attendanceRecords.find((it) => it.date === formatDate(info.dateStr)),
        'outTime'
      );
      isEmpty(outHrs)
        ? setOutTime(dayjs(formatDate(info.dateStr) + `T00:00`))
        : setOutTime(dayjs.utc(outHrs));
    } else {
      const inHrs = dayjs(formatDate(info.dateStr) + `T00:00`);
      const otHrs = dayjs(formatDate(info.dateStr) + `T00:00`);
      const outHrs = dayjs(formatDate(info.dateStr) + `T00:00`);
      const perHrs = dayjs(formatDate(info.dateStr) + `T00:00`);

      setInTime(inHrs);
      setTimeValue(otHrs);
      setOutTime(outHrs);
      setLeaveHours(perHrs);
    }
  };

  const clearChange = (info) => {
    const otHrs = dayjs(formatDate('2024-02-06') + `T00:00`);
    const outHrs = dayjs(formatDate('2024-02-06') + `T00:00`);
    const perHrs = dayjs(formatDate('2024-02-06') + `T00:00`);
    const inHrs = dayjs(formatDate('2024-02-06') + `T00:00`);

    setTimeValue(otHrs);
    setOutTime(outHrs);
    setLeaveHours(perHrs);
    setInTime(inHrs);
  };

  const handleTimeChange = async () => {
    const presentDays = datesArray.filter((it) => it.attendance === true).map((item) => item.date);

    try {
      let inHrs = isNaN(inTime.$H) || isNaN(inTime.$m) ? '0' : inTime.$H;
      let InMins = isNaN(inTime.$H) || isNaN(inTime.$m) ? '0' : inTime.$m;
      let outHrs = isNaN(outTime.$H) || isNaN(outTime.$m) ? '0' : outTime.$H;
      let outMins = isNaN(outTime.$H) || isNaN(outTime.$m) ? '0' : outTime.$m;
      inHrs = String(inHrs).length === 1 ? '0' + inHrs : inHrs;
      InMins = String(InMins).length === 1 ? '0' + InMins : InMins;
      outHrs = String(outHrs).length === 1 ? '0' + outHrs : outHrs;
      outMins = String(outMins).length === 1 ? '0' + outMins : outMins;
      const overHrs = isNaN(timeValue.$H) || isNaN(timeValue.$m) ? '0' : timeValue.$H;
      const overMins = isNaN(timeValue.$H) || isNaN(timeValue.$m) ? '0' : timeValue.$m;
      const leaveHrs = isNaN(leaveHours.$H) || isNaN(leaveHours.$m) ? '0' : leaveHours.$H;
      const leaveMins = isNaN(leaveHours.$H) || isNaN(leaveHours.$m) ? '0' : leaveHours.$m;
      let inTimeData = `${dateValue}T${inHrs}:${InMins}:00Z`;
      inTimeData = inTimeData.split('T')[1] === '00:00:00Z' ? 'null' : inTimeData;
      let outTimeData = `${dateValue}T${outHrs}:${outMins}:00Z`;
      outTimeData = outTimeData.split('T')[1] === '00:00:00Z' ? 'null' : outTimeData;

      const overTimeData = overHrs + ':' + overMins + ':00';
      const leaveTimeData = leaveHrs + ':' + leaveMins + ':00';
      if (
        `${inHrs}:${InMins}` === '00:00' &&
        `${outHrs}:${outMins}` === '00:00' &&
        overTimeData === '0:0:00' &&
        leaveTimeData === '0:0:00'
      ) {
        toast.error('value cannot be 0');
      } else {
        setIsLoadingM(true);
        const options = {
          date: formatDate(dateValue),
          inTime: moment(inTimeData),
          outTime: moment(outTimeData),
          leaveHours: leaveTimeData,
          extraHours: overTimeData,
          accessId: accessId,
        };
        const response = await Attendance_API.markExtraHoursHours(options);
        if (response) {
          setIsLoadingM(false);
          setOtUpdate(true);
        }
      }
    } catch (e) {
      setIsLoadingM(false);
      console.error(e);
    }
  };

  const renderDayCellContent = (props) => {
    const { dayNumberText, date, isFuture } = props;
    const today = new Date().getDate();
    const todayMonth = date.getMonth() + 1;
    const isToday = dayNumberText === today.toString();
    const isCurrentMonth = todayMonth === new Date().getMonth() + 1;
    if (
      !isUndefined(
        get(
          datesArray.find((it) => it.date === formatDate(date)),
          'attendance'
        )
      ) ||
      isFuture
    ) {
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
                  <>
                    <Box
                      sx={{
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'left',
                        flexDirection: 'column',
                      }}
                    >
                      {get(
                        datesArray.find((it) => it.date === formatDate(date)),
                        'extraHours'
                      ) && (
                        <Tooltip title={'Overtime hours'}>
                          <Typography
                            variant="h6"
                            sx={{
                              position: 'absolute',
                              marginTop: '0px',
                              marginLeft: '-80px',
                              display: 'inline',
                            }}
                          >
                            {get(
                              datesArray.find((it) => it.date === formatDate(date)),
                              'extraHours'
                            ) === '00:00:00' ? (
                              ''
                            ) : (
                              <Chip
                                label={`OT - ${get(
                                  datesArray.find((it) => it.date === formatDate(date)),
                                  'extraHours'
                                ).slice(0, 5)}`}
                                size="small"
                                style={{
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  display: 'inline',
                                  backgroundColor: 'green',
                                  color: '#fff',
                                }}
                              />
                            )}
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'left',
                        flexDirection: 'column',
                      }}
                    >
                      {get(
                        datesArray.find((it) => it.date === formatDate(date)),
                        'permission'
                      ) && (
                        <Tooltip title={'Leave hours'}>
                          <Typography
                            variant="h6"
                            sx={{
                              position: 'absolute',
                              marginTop: '20px',
                              marginLeft: '-80px',
                              display: 'inline',
                            }}
                          >
                            {get(
                              datesArray.find((it) => it.date === formatDate(date)),
                              'permission'
                            ) === '00:00:00' ? (
                              ''
                            ) : (
                              <Chip
                                label={`LH - ${get(
                                  datesArray.find((it) => it.date === formatDate(date)),
                                  'permission'
                                ).slice(0, 5)}`}
                                size="small"
                                style={{
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  display: 'inline',
                                  backgroundColor: 'red',
                                  color: '#fff',
                                }}
                              />
                            )}
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ position: 'absolute', right: 42, top: '1%' }}>
                      <Stack sx={{ position: 'absolute', marginRight: '1px' }}>
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
                              {get(
                                datesArray.find((it) => it.date === formatDate(date)),
                                'extraHours'
                              ) === '00:00:00' ? (
                                ''
                              ) : (
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
                                    backgroundColor: 'green',
                                    color: '#fff',
                                  }}
                                />
                              )}
                            </Typography>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>

                    <Box sx={{ position: 'absolute', right: 22, top: '1%' }}>
                      <Stack sx={{ position: 'absolute', marginRight: '1px' }}>
                        {get(
                          datesArray.find((it) => it.date === formatDate(date)),
                          'permission'
                        ) && (
                          <Tooltip title={'Leave hours'}>
                            <Typography
                              variant="h6"
                              sx={{
                                position: 'absolute',
                                marginTop: '40px',
                                marginLeft: '-25px',
                                display: 'inline',
                              }}
                            >
                              {get(
                                datesArray.find((it) => it.date === formatDate(date)),
                                'permission'
                              ) === '00:00:00' ? (
                                ''
                              ) : (
                                <Chip
                                  label={`LH - ${get(
                                    datesArray.find((it) => it.date === formatDate(date)),
                                    'permission'
                                  ).slice(0, 5)}`}
                                  size="small"
                                  color="primary"
                                  style={{
                                    fontSize: '8px',
                                    display: 'inline-block',
                                    transform: 'rotate(-45deg)',
                                    height: 'fit-content',
                                    width: '90%',
                                    backgroundColor: 'red',
                                    color: '#fff',
                                  }}
                                />
                              )}
                            </Typography>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                  </>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      );
    }
  };
  const totalOTHours =
    get(attendanceDetails, 'totalOTHours') !== '00:00'
      ? get(attendanceDetails, 'totalOTHours')?.slice(0, -3)
      : '00:00';

  const totalLeavehours =
    get(attendanceDetails, 'totalLeavehours') !== '00:00'
      ? get(attendanceDetails, 'totalLeavehours')?.slice(0, -3)
      : '00:00';

  return (
    <>
      <Helmet>
        <title>Attendance | POSITEASY</title>
      </Helmet>

      <Card
        sx={{
          pt: 3,
          position: 'relative',
          height: '100%',
        }}
      >
        <Button
          onClick={() => setAttendanceMasterView(false)}
          sx={{ position: 'relative', top: -15 }}
        >
          <ArrowBackIcon fontSize="small" />
          Back
        </Button>
        {isLoadingM ? (
          <LoadingScreenDrawer isNormal={true} />
        ) : (
          <>
            <Chip
              sx={{
                position: 'absolute',
                top: 10,
                marginLeft: !isMobile ? 3 : 1,
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
                top: 10,
                marginLeft: !isMobile ? 16 : 8,
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

            <Chip
              sx={{
                position: 'absolute',
                top: 10,
                marginLeft: !isMobile ? 28.5 : 16,
                border: '1px solid #5A0B45',
                color: '#5A0B45',
                backgroundColor: '#fff',
              }}
              label={
                <>
                  {isMobile ? (
                    <>
                      OT: <Typography variant="subtitle4">{totalOTHours}</Typography>
                    </>
                  ) : (
                    <>
                      OT: <strong>{totalOTHours}</strong>
                    </>
                  )}
                </>
              }
            />

            <Chip
              sx={{
                position: 'absolute',
                top: 10,
                marginLeft: !isMobile ? 41 : 28.5,
                border: '1px solid #5A0B45',
                color: '#5A0B45',
                backgroundColor: '#fff',
              }}
              label={
                <>
                  {isMobile ? (
                    <>
                      LH: <Typography variant="subtitle4">{totalLeavehours}</Typography>
                    </>
                  ) : (
                    <>
                      LH: <strong>{totalLeavehours}</strong>
                    </>
                  )}
                </>
              }
            />

            {/* <Chip
                sx={{
                  position: 'absolute',
                  top: 10,
                  marginLeft: !isMobile ? 34 : 16,
                  backgroundColor: '#FFEFF0',
                }}
                label={
                  <>
                    {!isMobile ? (
                      <>
                        Total Ot: <strong>12:00 hrs</strong>
                      </>
                    ) : (
                      <>
                        Tot.Ot: <strong>12:00 hrs</strong>
                      </>
                    )}
                  </>
                }
              /> */}
            <CalendarStyle sx={{ backgroundColor: '#FFFFFF' }}>
              <FullCalendar
                ref={calendarRef}
                rerenderDelay={10}
                initialDate={date}
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
                dayCellClassNames={cellClassName}
                datesSet={(event) => {
                  onMonthChange(event.start, subOneDayFromGivenDay(event.end));
                }}
                dayCellContent={renderDayCellContent}
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
                  let findData = attendanceDetails.attendanceRecords.find(
                    (it) => it.date === info.dateStr
                  );
                  info.jsEvent.stopPropagation();
                  setDateSelected(info.dateStr);
                  if (!isFuture(new Date(info.dateStr))) {
                    setDatesClicked(true);
                    setDateSelected(info.dateStr);
                    setInTime(get(findData, 'inTime'));
                    setOutTime(get(findData, 'outTime'));
                    setLeaveHours(get(findData, 'permission'));
                    setTimeValue(get(findData, 'extraHours'));
                  }
                  handleDateClick(info);
                }}
              />
            </CalendarStyle>
          </>
        )}
        <div
          style={{
            marginTop: isMobile ? 14 : 14,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Container sx={{ mt: 2 }}>
            <Drawer
              anchor={'right'}
              open={datesClicked}
              PaperProps={{
                sx: { width: isMobile ? '75%' : isTab ? '50%' : '26%', ...hideScrollbar },
              }}
            >
              {isLoadingM ? (
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
                      <IconButton
                        sx={{ color: '#7C7C7C' }}
                        onClick={() => {
                          setDatesClicked(false);
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Stack direction={'column'} sx={{ p: 0.5 }}>
                    <Typography
                      variant="h5"
                      sx={{ color: theme.palette.primary.main, pl: 2, alignItems: 'center' }}
                    >
                      Attendance status
                    </Typography>

                    {!isFuture(dateSelected) && (
                      <Stack direction={'column'} gap={2} p={2}>
                        <Stack direction={'row'} gap={2} p={2}>
                          <Button
                            variant="outlined"
                            sx={{ color: '#6FC888', maxWidth: '48%' }}
                            onClick={(e) => {
                              e.stopPropagation();

                              handleClickDrawerAtten(formatDate(dateSelected), 'present');
                            }}
                          >
                            Present
                            {get(
                              datesArray.find((it) => it.date === dateSelected),
                              'attendance'
                            ) === true ? (
                              <DoneIcon sx={{ color: 'green' }} />
                            ) : (
                              <></>
                            )}
                          </Button>
                          <Button
                            variant="outlined"
                            sx={{ color: '#E93323', maxWidth: '48%' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClickDrawerAtten(formatDate(dateSelected), 'absent');
                            }}
                          >
                            Absent
                            {get(
                              datesArray.find((it) => it.date === dateSelected),
                              'attendance'
                            ) === false ? (
                              <DoneIcon sx={{ color: 'green' }} />
                            ) : (
                              <></>
                            )}
                          </Button>
                        </Stack>

                        {isBoolean(
                          get(
                            datesArray.find((it) => it.date === dateSelected),
                            'attendance'
                          )
                        ) && (
                          <>
                            <Card sx={{ p: 2 }}>
                              {get(
                                datesArray.find((it) => it.date === dateSelected),
                                'attendance'
                              ) === true && (
                                <>
                                  <Stack direction={'row'} gap={1.5}>
                                    <Stack direction={'column'} gap={1.5}>
                                      <Typography
                                        variant={isMobile || isTab ? 'subtitle1' : 'h7'}
                                        sx={{
                                          color: theme.palette.primary.main,
                                          alignItems: 'center',
                                        }}
                                      >
                                        In Time
                                      </Typography>

                                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimeField
                                          label={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                          value={inTime}
                                          onChange={(newValue) => {
                                            setInTime(newValue);
                                          }}
                                          sx={{ maxWidth: `${isMobile || isTab ? '79%' : '92%'}` }}
                                          format={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                          size="small"
                                        />
                                      </LocalizationProvider>
                                    </Stack>
                                    <Stack direction={'column'} gap={1.5}>
                                      <Typography
                                        variant={isMobile || isTab ? 'subtitle1' : 'h7'}
                                        sx={{
                                          color: theme.palette.primary.main,
                                          alignItems: 'center',
                                        }}
                                      >
                                        Out Time
                                      </Typography>
                                      {outTime && (
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                          <TimeField
                                            label={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                            value={outTime}
                                            onChange={(newValue) => {
                                              setOutTime(newValue);
                                            }}
                                            sx={{
                                              maxWidth: `${isMobile || isTab ? '79%' : '92%'}`,
                                            }}
                                            format={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                            size="small"
                                          />
                                        </LocalizationProvider>
                                      )}
                                    </Stack>
                                  </Stack>
                                </>
                              )}

                              <Stack direction={'row'} gap={1.5}>
                                <Stack direction={'column'} gap={1.5}>
                                  <Typography
                                    variant={isMobile || isTab ? 'subtitle1' : 'h7'}
                                    sx={{ color: theme.palette.primary.main }}
                                  >
                                    Overtime
                                  </Typography>
                                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimeField
                                      label={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                      value={timeValue}
                                      onChange={(newValue) => {
                                        setTimeValue(newValue);
                                      }}
                                      sx={{ maxWidth: `${isMobile || isTab ? '79%' : '92%'}` }}
                                      format={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                      size="small"
                                    />
                                  </LocalizationProvider>
                                </Stack>
                                <Stack direction={'column'} gap={1.5}>
                                  {get(
                                    datesArray.find((it) => it.date === dateSelected),
                                    'attendance'
                                  ) === true && (
                                    <>
                                      <Typography
                                        variant={isMobile || isTab ? 'subtitle1' : 'h7'}
                                        sx={{
                                          color: theme.palette.primary.main,
                                          alignItems: 'center',
                                        }}
                                      >
                                        Leavehours
                                      </Typography>
                                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <TimeField
                                          label={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                          value={leaveHours}
                                          onChange={(newValue) => {
                                            setLeaveHours(newValue);
                                          }}
                                          sx={{ maxWidth: `${isMobile || isTab ? '79%' : '92%'}` }}
                                          format={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
                                          size="small"
                                        />
                                      </LocalizationProvider>
                                    </>
                                  )}
                                </Stack>
                              </Stack>
                            </Card>

                            <Card sx={{ py: 1, display: 'flex', gap: 3, justifyContent: 'center' }}>
                              <Button
                                variant="outlined"
                                size="medium"
                                onClick={() => {
                                  clearChange();
                                }}
                              >
                                clear
                              </Button>

                              <Button
                                variant="contained"
                                size="medium"
                                onClick={() => {
                                  handleTimeChange();
                                }}
                              >
                                update
                              </Button>
                            </Card>
                          </>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </>
              )}
            </Drawer>
          </Container>
        </div>
      </Card>
    </>
  );
}
