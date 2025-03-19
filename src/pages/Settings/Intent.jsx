import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import INTENT_API from 'src/services/IntentService';
import SelectStoreDialog from './SelectStoreDialog';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useRecoilState } from 'recoil';
import { get, isEmpty, map } from 'lodash';
import WhatsappNumberDialog from './WhatsappNumberDialog';

const Intent = () => {
  const theme = useTheme();
  const [isIntentAutoRequest, setIsIntentAutoRequest] = useState(false);
  const [isIntentViewEnabled, setIsIntentViewEnabled] = useState(false);
  const [isDirectRequestEnabled, setIsDirectRequestEnabled] = useState(false);
  const [isCreateOrder, setIsCreateOrder] = useState(false);
  const [isReceivesView, setIsReceivesView] = useState(false);
  const [isUpdateStatus, setIsUpdateStatus] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [permissionInfo, setPermissionInfo] = useState({});
  const [isEnableWhatsapp, setIsEnableWhatsapp] = useState(false);
  const [intentSettings, setIntentSettings] = useState({});
  const [intentNotification, setIntentNotification] = useState({});
  const [selectedStore, setSelectedStore] = useRecoilState(currentStoreId);
  const [selectedTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);
  const audioRefs = useRef([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [isOpenStoreDialog, setIsOpenStoreDialog] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [whatsappDetails, setWhatsappDetails] = useState({});
  const [isOpenWhatsappDialog, setIsOpenWhatsappDialog] = useState(false);

  const handleUpdateWhatsapp = async (whatsappNumber) => {
    const formattedNumbers = map(whatsappNumber, (num) => `91${num}`);
    try {
      const options = {
        intentSetting: {
          ...intentSettings,
          whatsappRequest: {
            isActive: true,
            ...(!isEmpty(whatsappNumber) ? { whatsappNumber: formattedNumbers } : {}),
          },
        },
      };
      await INTENT_API.addPurchaseSettings(options);
      setIsEnableWhatsapp(true);
      getIntentConfig();
      setIsOpenWhatsappDialog(false);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleAudioPlay = (index) => {
    if (playingAudio !== null && playingAudio !== index) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }
    setPlayingAudio(index);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    handlePostNotification('intentSoundNotification', `${event.target.value}`);
  };

  const getIntentConfig = async () => {
    try {
      const response = await INTENT_API.getIntentConfig({
        storeId: selectedStore,
        terminalId: selectedTerminal,
      });
      setIntentSettings(response?.data[0]?.intentSetting);
      setIsIntentAutoRequest(response?.data[0]?.intentSetting?.requestStatus || false);
      // setIsDirectRequestEnabled(response?.data[0]?.intentSetting?.isDirectRequestEnabled || false);
      setIsEnableWhatsapp(response?.data[0]?.intentSetting?.whatsappRequest?.isActive || false);
      setPermissionInfo(response?.data[0]?.intentSetting?.intentPermissions || {});
      setIsIntentViewEnabled(
        response?.data[0]?.intentSetting?.intentPermissions?.isIntentViewEnabled || false
      );
      setIsDirectRequestEnabled(
        response?.data[0]?.intentSetting?.intentPermissions?.isDirectRequest || false
      );
      setIsCreateOrder(response?.data[0]?.intentSetting?.intentPermissions?.isCreateOrder || false);
      setIsReceivesView(
        response?.data[0]?.intentSetting?.intentPermissions?.isReceivesView || false
      );
      setIsUpdateStatus(
        response?.data[0]?.intentSetting?.intentPermissions?.isUpdateStatus || false
      );
      setIsNotificationEnabled(response?.data[0]?.intentSetting?.Notifiacations?.isActive || false);
      setIntentNotification(response?.data[0]?.intentSetting?.Notifiacations || {});
      setWhatsappDetails(response?.data[0]?.intentSetting?.whatsappRequest || {});
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (currentStoreId && currentTerminalId) {
      getIntentConfig();
    }
  }, [selectedStore, selectedTerminal]);

  const handleOpenDefaultStoreDialog = () => {
    setIsOpenStoreDialog(true);
  };

  const handleCloseDefaultStoreDialog = () => {
    setIsOpenStoreDialog(false);
  };

  const handlePostOrderRequest = async () => {
    try {
      setIsIntentAutoRequest(!isIntentAutoRequest);
      const options = {
        intentSetting: { ...intentSettings, requestStatus: !isIntentAutoRequest },
      };
      await INTENT_API.addPurchaseSettings(options);
      getIntentConfig();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handlePostNotificationEnable = async () => {
    try {
      const options = {
        intentSetting: { ...intentSettings, Notifiacations: { isActive: !isNotificationEnabled } },
      };

      await INTENT_API.addPurchaseSettings(options);
      getIntentConfig();

      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handlePostWhatsappEnable = async () => {
    try {
      if (isEnableWhatsapp) {
        const options = {
          intentSetting: {
            ...intentSettings,
            whatsappRequest: { isActive: !isEnableWhatsapp },
          },
        };
        await INTENT_API.addPurchaseSettings(options);
        setIsEnableWhatsapp(false);

        getIntentConfig();
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      } else {
        setIsOpenWhatsappDialog(true);
      }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handlePostNotification = async (key, value) => {
    try {
      const options = {
        intentSetting: {
          ...intentSettings,
          Notifiacations: { ...intentNotification, [key]: value },
        },
      };
      await INTENT_API.addPurchaseSettings(options);
      getIntentConfig();

      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const handlePostPermissions = async (key, value) => {
    try {
      const options = {
        intentSetting: {
          ...intentSettings,
          intentPermissions: { ...permissionInfo, [key]: value },
        },
      };

      await INTENT_API.addPurchaseSettings(options);
      getIntentConfig();

      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  return (
    <>
      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '20px', pb: 2 }}>
        Store request configurations
      </Typography>
      <Stack flexDirection={'row'} justifyContent={'space-between'}>
        <Grid container gap={2}>
          <Grid
            xs={12}
            sm={6}
            md={12}
            sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
          >
            {' '}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Intent purchase order view
              </Typography>
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={isIntentViewEnabled}
                onChange={() => handlePostPermissions('isIntentViewEnabled', !isIntentViewEnabled)}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '300' }}>
              Enable to show purchase store order view in staff app
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={5.9}
            sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Whatsapp message
              </Typography>
              {isEnableWhatsapp && (
                <Button
                  sx={{ ml: 2 }}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setIsOpenWhatsappDialog(true);
                  }}
                >
                  Edit
                </Button>
              )}
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={isEnableWhatsapp}
                onChange={handlePostWhatsappEnable}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '300' }}>
              Enable to send order request in whatsapp
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={5.9}
            sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
          >
            <Stack
              className="settingConfigStep8"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                  Store settings
                </Typography>

                <Typography variant="body2">Select stores to intent features</Typography>
              </Box>
              <Stack
                flexDirection={'column'}
                sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
              >
                <Button
                  sx={{ ml: 2 }}
                  size="small"
                  variant="contained"
                  onClick={handleOpenDefaultStoreDialog}
                >
                  Manage Store List
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={7.6}
            sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Staff request raise manager approval
              </Typography>
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={isIntentAutoRequest}
                onChange={handlePostOrderRequest}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '300' }}>
              If enabled, request will be send to manager.
            </Typography>

            <Stack pt={2} pb={1}>
              <Divider />
            </Stack>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '20px', pb: 2, pt: 2 }}>
              Staff app intent permissions
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Create order request
              </Typography>
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={isCreateOrder}
                onChange={() => handlePostPermissions('isCreateOrder', !isCreateOrder)}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '300' }}>
              Enable to give access for order request raise
            </Typography>
            <Stack pt={2} pb={1}>
              <Divider />
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Order request recieves
              </Typography>
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                  // mx: 1.35,
                }}
                checked={isReceivesView}
                onChange={() => handlePostPermissions('isReceivesView', !isReceivesView)}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '300' }}>
              Enable to show order request recieves
            </Typography>
            <Stack pt={2} pb={1}>
              <Divider />
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Update order request status
              </Typography>
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={isUpdateStatus}
                onChange={() => handlePostPermissions('isUpdateStatus', !isUpdateStatus)}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '300' }}>
              Enable to update order request status
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={4.2}
            sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '20px', pb: 3 }}>
              Notification Configurations
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                Notification Sound in staff app
              </Typography>
              <Switch
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.light,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
                checked={isNotificationEnabled}
                onChange={handlePostNotificationEnable}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: '300', pb: 2 }}>
              Enable to play sound in staff app while receive request
            </Typography>
            <FormControl fullWidth>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="1"
                value={selectedValue || intentNotification?.intentSoundNotification || '1'}
                name="radio-buttons-group"
              >
                {[1, 2, 3, 4, 5].map((item, index) => {
                  return (
                    <FormControlLabel
                      value={item}
                      control={<Radio disabled={!isNotificationEnabled} />}
                      onChange={handleChange}
                      sx={{ width: '100%', margin: '0' }}
                      label={
                        <audio
                          ref={(el) => (audioRefs.current[index] = el)}
                          controls
                          controlsList="nodownload noremoteplayback nofullscreen"
                          onPlay={() => handleAudioPlay(index)}
                        >
                          <source
                            src={`https://audio-pos.s3.ap-south-1.amazonaws.com/ringtone-${item}.mp3`}
                            type="audio/mpeg"
                          />
                          Your browser does not support the audio element.
                        </audio>
                      }
                    ></FormControlLabel>
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>

        {isOpenStoreDialog && (
          <SelectStoreDialog
            open={isOpenStoreDialog}
            handleClose={handleCloseDefaultStoreDialog}
            initialFetch={getIntentConfig}
            intentSettings={intentSettings}
          />
        )}
        {isOpenWhatsappDialog && (
          <WhatsappNumberDialog
            open={isOpenWhatsappDialog}
            handleClose={() => {
              setIsOpenWhatsappDialog(false);
            }}
            endShiftConfig={{
              isActive: isEnableWhatsapp,
              contactList: get(whatsappDetails, 'whatsappNumber', false),
            }}
            handleSubmit={handleUpdateWhatsapp}
            dailySummary={2}
          />
        )}
      </Stack>
    </>
  );
};

export default Intent;
