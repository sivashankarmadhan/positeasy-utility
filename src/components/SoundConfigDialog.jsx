import { AddBox } from '@mui/icons-material';
import { Box, Card, Dialog, Divider, FormControl, FormControlLabel, Grid, IconButton, Radio, RadioGroup, Stack, Switch, Typography, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { SOUND_CONFIG_ARRAY } from 'src/constants/AppConstants';
import DialogComponent from 'src/sections/WhatsappCredits/Dialog';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import { get, isEqual } from 'lodash';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import { useRecoilValue } from 'recoil';
import { currentStoreId } from 'src/global/recoilState';
import { SuccessConstants } from 'src/constants/SuccessConstants';


export default function SoundConfigDialog({ soundEnableDialog, setSoundEnableDialog, soundConfiguration, getStoresDetails, storesDetails }) {
  const audioRefs = useRef([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundCheck, setIsoundCheck] = useState(true);
  const [selectedValue, setSelectedValue] = useState('1');
  const [playingAudio, setPlayingAudio] = useState(null);
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);


  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  useEffect(() => {
    const options = {
      isActive: isSoundEnabled,
      soundKeyValue: selectedValue,
    };
    setIsoundCheck(isEqual(options, soundConfiguration));
  }, [isSoundEnabled, selectedValue]);

  useEffect(() => {
    if(get(storesDetails, 'soundConfig.isActive')) {
      setIsSoundEnabled(get(storesDetails, 'soundConfig.isActive'))
      setSelectedValue(get(storesDetails, 'soundConfig.soundKeyValue'))
    }
  }, [storesDetails]);

  const handleAudioPlay = (index) => {
    if (playingAudio !== null && playingAudio !== index) {
      audioRefs.current[playingAudio].pause();
      audioRefs.current[playingAudio].currentTime = 0;
    }
    setPlayingAudio(index);
  };

  

  const handleSubmit = async (data) => {
  
    try {
        setIsLoading(true)
      const response = await ONLINE_STORES.createSoundConfig({
        soundConfig : {
            isActive: isSoundEnabled,
            soundKeyValue: selectedValue,
        },
        storeId: currentStore,
      });
      if (response) {
        setIsLoading(false)
        getStoresDetails()
        console.log('response', response );
        setSoundEnableDialog(false)
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }
    } catch (err) {
        setIsLoading(false)

      console.log(err);
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  return (
    <Dialog
    maxWidth={'md'}
      open={soundEnableDialog}
      onClose={() => {
        setSoundEnableDialog(false);
      }}
    >
         <Stack
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <Stack sx={{ width: '100%' }}>
          <Stack
            sx={{ width: '100%' }}
            flexDirection="row"
            alignItems="flex-end"
            justifyContent="space-between"
            pb={0.5}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
          Sound configurations
            </Typography>
   
              <IconButton sx={{ color: '#7C7C7C' }} onClick={()=> setSoundEnableDialog(false)}>
                <CloseIcon />
              </IconButton>
   
          </Stack>

          <Divider sx={{ border: '0.9px dashed #A6A6A6' }} />
        </Stack>
        <>
        <Grid item xs={12}>
          <Stack
            sx={{
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
           
            <Grid container gap={2}>
              <Grid
                item
                xs={12}
                sm={6}
                md={5}
                sx={{ border: '1px solid #DEDEDE', borderRadius: '6px', gap: 2, p: 2 }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Sound play</Typography>
                  <Switch
                    checked={isSoundEnabled}
                    onChange={() => {
                      setIsSoundEnabled(!isSoundEnabled);
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.light,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.light,
                      },
                      mx: 1.35,
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: '300' }}>
                  Enable to play sound in swiggy and zomato order
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                md={6}
              >
                <FormControl fullWidth>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="1"
                    value={selectedValue}
                    name="radio-buttons-group"
                  >
                    {SOUND_CONFIG_ARRAY.map((item, index) => {
                      return (
                        <FormControlLabel
                          value={item}
                          control={<Radio disabled={!isSoundEnabled} />}
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
          </Stack>
        </Grid>
        <Stack
          sx={{ ml: 'auto' }}
          flexDirection="row"
          alignItems="center"
          justifyContent="flex-end"
          gap={2}
          mr={3}
        >
         
          <LoadingButton
            size="large"
            variant="contained"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={isSoundCheck}
          >
            Submit
          </LoadingButton>
        
        </Stack>
      </>
      </Stack>
    
    </Dialog>
  );
}
