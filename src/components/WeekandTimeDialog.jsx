import { Card, Checkbox, Stack, Typography, Dialog, Button, Grid } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { filter, get, map, sortBy } from 'lodash';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { WEEKDAYS, defaultTimeValue } from 'src/constants/AppConstants';
import { currentStoreId } from 'src/global/recoilState';
import PRODUCTS_API from 'src/services/products';
import { formatTime } from 'src/utils/formatTime';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
export default function WeekandTimeDialog(props) {
  const {
    isBulkAction = false,
    selected = [],
    open,
    handleClose,
    previousData,
    intialFetch,
    setSubmittedSessionData,
  } = props;
  const [sessionData, setSessionData] = useState(previousData ? previousData : defaultTimeValue);
  const currentStore = useRecoilValue(currentStoreId);
  const handleChangeCheckBox = (selected) => {
    setSessionData((prev) => {
      const filtered = filter(prev, (e) => get(e, 'day') !== get(selected, 'day'));
      return sortBy([...filtered, { ...selected, enabled: !get(selected, 'enabled') }], (f) =>
        get(f, 'day')
      );
    });
  };
  const handleChangeStartTime = (selectedTime, selected) => {
    setSessionData((prev) => {
      const filtered = filter(prev, (e) => get(e, 'day') !== get(selected, 'day'));
      return sortBy([...filtered, { ...selected, startTime: selectedTime }], (f) => get(f, 'day'));
    });
  };
  const handleChangeEndTime = (selectedTime, selected) => {
    setSessionData((prev) => {
      const filtered = filter(prev, (e) => get(e, 'day') !== get(selected, 'day'));
      return sortBy([...filtered, { ...selected, endTime: selectedTime }], (f) => get(f, 'day'));
    });
  };
  const handleCloseDialog = () => {
    handleClose(true);
  };
  const handleSubmit = () => {
    if (isBulkAction) {
      handleSubmitBulkAction();
    } else {
      setSubmittedSessionData({ sessionInfo: { isSessionEnabled: true, timeSlots: sessionData } });
      handleClose();
    }
  };
  const handleSubmitBulkAction = async () => {
    try {
      let options = [];
      map(selected, (e) => {
        options.push({
          sessionInfo: { isSessionEnabled: true, timeSlots: sessionData },
          productId: e,
          storeId: currentStore,
        });
      });

      const response = await PRODUCTS_API.putBulkSession(options);
      if (response) toast.success(SuccessConstants.SESSION_SUCCESSFUL);
      handleClose();
      intialFetch();
      setSessionData(defaultTimeValue);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDisableSession = async () => {
    try {
      let options = [];
      map(selected, (e) => {
        options.push({
          sessionInfo: { isSessionEnabled: false, timeSlots: defaultTimeValue },
          productId: e,
        });
      });
      //
      console.log('Disable', options);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Dialog fullWidth open={open}>
      <Card sx={{ minHeight: 300, width: '100%', p: 2, overflowY: 'scroll' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select the session that the time product show in menu
        </Typography>
        <Grid container gap={1} sx={{ mb: 1, width: '100%' }}>
          {map(sessionData, (e) => (
            <Grid
              item
              xs={12}
              md={5.8}
              lg={5.8}
              sm={5.8}
              key={get(e, 'day')}
              flexDirection={'column'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                opacity: get(e, 'enabled') ? 1 : 0.5,
                border: 1,
                borderRadius: 2,
                p: 2,
              }}
            >
              <Stack
                flexDirection={'row'}
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
              >
                <Checkbox onChange={() => handleChangeCheckBox(e)} checked={get(e, 'enabled')} />{' '}
                <Typography> {get(e, 'label')}</Typography>
              </Stack>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  onAccept={(event) => {
                    handleChangeStartTime(
                      get(event, '$d').toLocaleTimeString('en-US', { hour12: false }),
                      e
                    );
                  }}
                  onChange={(event) => {
                    handleChangeStartTime(
                      get(event, '$d').toLocaleTimeString('en-US', { hour12: false }),
                      e
                    );
                  }}
                  sx={{ mb: 1 }}
                  defaultValue={dayjs(get(e, 'startTime'), 'HH:mm:ss')}
                  label="Start Time"
                />
                <TimePicker
                  onAccept={(event) => {
                    handleChangeEndTime(
                      get(event, '$d').toLocaleTimeString('en-US', { hour12: false }),
                      e
                    );
                  }}
                  onChange={(event) => {
                    handleChangeEndTime(
                      get(event, '$d').toLocaleTimeString('en-US', { hour12: false }),
                      e
                    );
                  }}
                  defaultValue={dayjs(get(e, 'endTime'), 'HH:mm:ss')}
                  label="End Time"
                />
              </LocalizationProvider>
            </Grid>
          ))}
        </Grid>{' '}
        <Stack flexDirection={'row'} gap={1} sx={{ justifyContent: 'flex-end' }}>
          <Button
            color="error"
            onClick={() => handleCloseDialog()}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Close
          </Button>
          {isBulkAction && (
            <Button onClick={handleDisableSession} variant="contained" sx={{ mt: 2 }}>
              Disable Session
            </Button>
          )}
          <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
}
