import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { formatDate } from 'src/utils/formatTime';
import { DateField } from '@mui/x-date-pickers/DateField';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Card, Stack, Typography } from '@mui/material';
import LoadingScreen from 'src/components/loading-screen/LoadingScreen';
import Attendance_API from 'src/pages/Attendance/AttendanceServices';
import { DATE_TIME_FORMAT_ATTENDANCE } from 'src/constants/AppConstants';
import toast from 'react-hot-toast';
import includes from 'lodash/includes';

function DateTimeDialog(props) {
  const { open, handleClose, accessId, setOtUpdate, datesArray } = props;
  const [isLoading, setIsLoading] = useState(false);
  var today = new Date();
  const todayDate = formatDate(today) + 'T00:00';
  const [dateValue, setDateValue] = useState(dayjs(today));
  const [timeValue, setTimeValue] = useState(dayjs(todayDate));
  const handleCancel = () => {
    setTimeValue(dayjs(todayDate));
    setDateValue(dayjs(today));
    handleClose(false);
  };
  const presentDays = datesArray.filter((it) => it.attendance === true).map((item) => item.date);
  const handleOk = async () => {
    try {
      const hrs = isNaN(timeValue.$H) || isNaN(timeValue.$m) ? '0' : timeValue.$H;
      const mins = isNaN(timeValue.$H) || isNaN(timeValue.$m) ? '0' : timeValue.$m;
      const extraHours = hrs + ':' + mins + ':00';
      if (includes(presentDays, formatDate(dateValue)) !== true) {
        toast.error('Enter Date in which staff was present to mark OT');
      } else if (extraHours === '0:0:00') {
        toast.error('OT hours cannot be 0');
      } else {
        setIsLoading(true);
        const options = {
          date: formatDate(dateValue),
          extraHours: extraHours,
          accessId: accessId,
        };
        const response = await Attendance_API.markExtraHoursHours(options);
        if (response) {
          setOtUpdate(true);
          setIsLoading(false);
          handleCancel();
        }
      }
    } catch (e) {
      handleCancel();
      console.error(e);
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: 300 }}>
        <Typography variant="h6" sx={{ display: 'inline' }} color="primary">
          Enter date and OT hours
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={'column'} sx={{ pt: 2 }} gap={2}>
            <DateField
              label={DATE_TIME_FORMAT_ATTENDANCE.DATE_FORMAT}
              value={dayjs(dateValue)}
              onChange={(newValue) => {
                setDateValue(newValue.$d);
              }}
              format={DATE_TIME_FORMAT_ATTENDANCE.DATE_FORMAT}
              size="small"
              disableFuture
            />
            <TimeField
              label={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
              value={timeValue}
              onChange={(newValue) => {
                setTimeValue(newValue);
              }}
              format={DATE_TIME_FORMAT_ATTENDANCE.TIME_FORMAT}
              size="small"
            />
          </Stack>
        </LocalizationProvider>
        <Stack sx={{ pt: 1 }} flexDirection={'row'} justifyContent="flex-end">
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleOk} color="primary">
            Add OT hours
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}

export default DateTimeDialog;
